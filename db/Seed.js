const axios = require('axios');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('./Connection');
const Pokemon = require('./Pokemon').default;
const Type = require('./Type').default;

const api = (path)=> `https://pokeapi.co/api/v2${path}`;
const onlyGeneration = 9;

const cacheRequests = fs.existsSync(path.join(process.cwd(), 'cache.json')) ?
  JSON.parse(fs.readFileSync(path.join(process.cwd(), 'cache.json'), 'utf8')): {};

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
  cacheRequests[url] = {
    data: results.data,
  };
  requestOccuring = false;
  return results;
};

try {
  (async () => {
    // Check for pokemon with id 1. It should ALWAYS exist
    const firstPokemon = await new Promise((resolve) => {
      Pokemon.findOne({ id: 1 }, (err, result) => {
        if (err) {
          console.error(err);
          resolve(null);
        } else {
          resolve(result);
        }
      });
    })
    if (firstPokemon && !process.argv.find(arg => arg === 'force')) {
      console.log('Already seeded db. Not going further. To force seed, run with force argument');
      process.exit(0);
      return;
    } else {
      await Pokemon.deleteMany({});
      await Type.deleteMany({});
    }
    const generations = (await request(api('/generation'))).data.results;
    let index = 0;
    for (const generation of generations) {
      const generation = (await request(api(`/generation/${index + 1}`))).data;

      // Seed Types and effectiveness.
      const allTypes = (await request(api('/type'))).data.results;
      for (const type of allTypes) {
        const typeInfo = (await request(api(`/type/${type.name}`))).data;
        const typeModel = new Type({
          generation: index + 1,
          name: typeInfo.name,
          attackSuperEffective: typeInfo.damage_relations.double_damage_to.map(({ name }) => name),
          attackResistance: typeInfo.damage_relations.half_damage_to.map(({ name }) => name),
          attackImmune: typeInfo.damage_relations.no_damage_to.map(({ name }) => name),
          defenseSuperEffective: typeInfo.damage_relations.double_damage_from.map(({ name }) => name),
          defenseResistance: typeInfo.damage_relations.half_damage_from.map(({ name }) => name),
          defenseImmune: typeInfo.damage_relations.no_damage_from.map(({ name }) => name),
        });
        await typeModel.save();
      }

      // Seed pokedexes / Pokemon
      const pokedexes = [];
      for (const vg of generation.version_groups) {
        const versionGroup = ((await request(api(`/version-group/${vg.name}`))).data);
        for (const pokedex of versionGroup.pokedexes) {
          if (!pokedexes.find((pk) => pk.name === pokedex.name)) {
            pokedexes.push((await request(api(`/pokedex/${pokedex.name}`))).data)
            console.log('Will query Pokemon for pokedex:', pokedex.name);
          }
        }
      }

      const species = [];
      for (const pokedex of pokedexes) {
        pokedex.pokemon_entries.forEach((entry) => {
          if (!species.find((sp) => sp.name === entry.pokemon_species.name)) {
            species.push(entry.pokemon_species);
          }
        });
      }

      console.log('Seeding Generation', index + 1);
      for (const specie of species) {
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
            learnLevel: moveVersion.level_learned_at || 0,
          };
        }));

        const encountersApi = (await request(api(`/pokemon/${pokemon.id}/encounters`))).data;

        const encounters = [];
        for (const encounter of encountersApi) {
          let versionGroup = null;
          for (const versionDetail of encounter.version_details) {
            const version = (await request(api(`/version/${versionDetail.version.name}`))).data;
            const vg = generation.version_groups.find((vd) => vd.name === version.version_group.name);
            if (vg) {
              versionGroup = versionDetail;
              break;
            }
          }
          if (versionGroup) {
            for (const encounterType of versionGroup.encounter_details) {
              const conditions = [];
              const location = (await request(api(`/location-area/${encounter.location_area.name}`))).data;
              for (const conditionValue of encounterType.condition_values) {
                const conditionDetails = (await request(api(`/encounter-condition-value/${conditionValue.name}`))).data;
                conditions.push(conditionDetails.name);
              }
              encounters.push({
                minLevel: encounterType.min_level,
                maxLevel: encounterType.max_level,
                chance: encounterType.chance,
                maxChance: versionGroup.max_chance,
                location: {
                  id: location.id,
                  keyName: location.name,
                  name: location.names.find((l) => l.language === 'en')?.name || location.name,
                },
                method: encounterType.method.name,
                generation: index + 1,
                conditions,
              });
            }
          }
        }

        let pokemonModel = new Pokemon({
          id: pokemon.id,
          name: pokemon.name,
          generation: index + 1,
          baseExperience: pokemon.base_experience,
          height: pokemon.height,
          order: pokemon.order,
          weight: pokemon.weight,
          image: {
            art: pokemon.sprites.other['official-artwork'].front_default,
            default: pokemon.sprites.front_default,
            shiny: pokemon.sprites.front_shiny,
          },
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
            stat: stat.stat.name === 'special-attack' ? 'specialAttack' : stat.stat.name === 'special-defense' ? 'specialDefense' : stat.stat.name,
          })),
          types: pokemonTypes,
          moves: pokemonMoves,
          encounters,
        });
        await pokemonModel.save();
        console.log('Seeded', pokemon.name);
      }
      index += 1;
      if (index >= onlyGeneration) {
        break;
      }
    }
    console.log('Fin');
    fs.writeFileSync(path.join(process.cwd(), 'cache.json'), JSON.stringify(cacheRequests));
    console.log('Wrote cache.');
  })()
} catch (e) {
  console.error(e);
}
