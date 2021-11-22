const axios = require('axios');
require('./Connection');
const Pokemon = require('./Pokemon').default;

const api = (path)=> `https://pokeapi.co/api/v2${path}`;

const cacheRequests = {};

let requestOccuring = false;
const requestDelay = 100;
const request = async (url) => {
  if (cacheRequests[url]) {
    return cacheRequests[url];
  }
  while (requestOccuring) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  if (cacheRequests[url]) {
    return cacheRequests[url];
  }
  console.log('Requesting:', url);
  requestOccuring = true;
  const results = await axios.get(url);
  await new Promise((resolve) => setTimeout(resolve, requestDelay));
  cacheRequests[url] = results;
  requestOccuring = false;
  return results;
};

try {
  (async () => {

    const allPokemon = await Pokemon.find({});
    const generations = (await request(api('/generation'))).data.results;

    for (const pokemon of allPokemon) {

    }

    /** let index = 0;
    for (const generation of generations) {
      const generation = (await request(api(`/generation/${index + 1}`))).data;
      console.log('Seeding Generation', index + 1);
      for (const specie of generation.pokemon_species) {
        const pokemonSpecies = (await request(api(`/pokemon-species/${specie.name}`))).data;
        const pokemon = (await request(api(`/pokemon/${pokemonSpecies.id}`))).data;
        let pokemonTypes = pokemon.types.map((type) => ({
          slot: type.slot,
          type: type.type.name,
        }));
        pokemon.past_types.forEach((pastType) => {
          const generationIndex = generations.findIndex((generation) => generation.name === pastType.generation.name);
          if (generationIndex > index) {
            pokemonTypes = pastType.types.map((type) => ({
              slot: type.slot,
              type: type.type.name,
            }));
          }
        });
        const pokemonMoves = await Promise.all(pokemon.moves.filter((move) => {
          let canLearn = false;
          const moveVersion = move.version_group_details.find((moveVersionGroup) => {
            return generation.version_groups.find((versionGroup) => {
              return moveVersionGroup.version_group.name === versionGroup.name;
            }) !== undefined;
          });
          if (moveVersion) {
            return true;
          }
          return false;
        }).map(async (move) => {
          const pokemonMove = (await request(api(`/move/${move.move.name}`))).data;
          const moveVersion = move.version_group_details.find((moveVersionGroup) => {
            return generation.version_groups.find((versionGroup) => {
              return moveVersionGroup.version_group.name === versionGroup.name;
            }) !== undefined;
          });
          return {
            name: pokemonMove.name,
            accuracy: pokemonMove.accuracy,
            effectChance: pokemonMove.effect_chance,
            pp: pokemonMove.pp,
            priority: pokemonMove.priority,
            power: pokemonMove.power,
            damageType: pokemonMove.damage_class.name,
            meta: pokemonMove.meta,
            learnMethod: moveVersion.move_learn_method.name,
          };
        }));

        console.log('Seeding ', pokemon.name);
        let pokemonModel = new Pokemon({
          id: pokemon.id,
          name: pokemon.name,
          generation: index + 1,
          baseExperience: pokemon.base_experience,
          height: pokemon.height,
          order: pokemon.order,
          weight: pokemon.weight,
          image: pokemon.sprites.front_default,
          abilities: await Promise.all(pokemon.abilities.map(async (ability) => ({
            hidden: ability.is_hidden,
            slot: ability.slot,
            ability: {
              name: ability.ability.name,
              effects: (await request(api(`/ability/${ability.ability.name}`))).data.effect_entries.map((effect) => effect.effect),
            },
          }))),
          stats: pokemon.stats.map((stat) => ({
            base: stat.base_stat,
            effort: stat.effort,
            stat: stat.stat.name,
          })),
          types: pokemonTypes,
          moves: pokemonMoves,
        });
        pokemonModel.save();
      }
      index += 1;
    }*/
  })()
} catch (e) {
  console.error(e);
}
