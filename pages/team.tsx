import React, { ReactElement, useEffect, useState } from 'react';
import axios from 'axios';
import api from '../utility/api';
import type { PokemonType } from '../db/Pokemon';
import TextField from '@mui/material/TextField';
import DefaultLayout from '../components/DefaultLayout';
import Grid from '@mui/material/Grid';
import PokemonCard from '../components/PokemonCard';
import TeamMemberInformation from '../components/TeamMemberInformation';
import { teamContext } from '../context/Team';
import { hasCaughtPokemon } from '../utility/pokemon';
import { getSavedToken } from '../utility/storage';

const Pokedex = (): ReactElement => {
  const [pokemons, setPokemons] = useState<Array<object>>([]);
  const [currentPokemon, setCurrentPokemon] = useState<null | PokemonType>(null);
  const [visiblePokemons, setVisiblePokemons] = useState<Array<object>>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api('get', '/pokemon').then(({ data }) => {
      const newPokemons = (data.data.sort((a, b) => a.id < b.id ? -1 : 1));
      setPokemons(newPokemons);
      setVisiblePokemons(newPokemons);
    });
  }, []);

  const handleSearchChange = (e) => {
    const newSearch = String(e.target.value).toLowerCase();
    setSearch(newSearch);
    if (newSearch === '') {
      setVisiblePokemons(pokemons);
    } else {
      setVisiblePokemons(pokemons.filter((pokemon) => {
        let shouldShow = false;
        if (String(pokemon.id).indexOf(newSearch) !== -1) {
          shouldShow = true;
        }
        if (pokemon.name.indexOf(newSearch) !== -1) {
          shouldShow = true;
        }
        return shouldShow;
      }));
    }
  };

  return (
    <DefaultLayout loading={pokemons.length <= 0}>
    <Grid container spacing={2} sx={{ padding: 2 }}>
    <Grid item xs={12}>
    <TextField 
    id="pokemon-search"
    label="Search for Pokemon"
    variant="filled"
    fullWidth
    value={search}
    onChange={handleSearchChange}
    />
    </Grid>
    <teamContext.Consumer>
    {({ team }) => {
      return visiblePokemons.map((vp) => {
        return {
          pokemon: vp,
          member: team.members.find((member) => member.id === vp.id),
        };
      }).filter((p) => p.member != null).map(({ pokemon, member }) => {
        return (
          <PokemonCard
          onClick={() => setCurrentPokemon({pokemon, member})}
          key={member.name}
          id={pokemon.id}
          name={member.name}
          image={pokemon.image}
          />
        );
      });
    }}
    </teamContext.Consumer>
    </Grid>
    {currentPokemon && (<TeamMemberInformation
    pokemon={currentPokemon.pokemon}
    member={currentPokemon.member}
    onOpen={() => {}}
    onClose={() => setCurrentPokemon(null)}
    open={!!currentPokemon}
    />
    )}
    </DefaultLayout>
  );
};

export default Pokedex;

