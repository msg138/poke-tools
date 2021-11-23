import React, { ReactElement, useEffect, useState } from 'react';
import axios from 'axios';
import api, { clearCache } from '../utility/api';
import type { PokemonType } from '../db/Pokemon';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputLabel from '@mui/material/InputLabel';
import DefaultLayout from '../components/DefaultLayout';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import PokemonCard from '../components/PokemonCard';
import TeamMemberInformation from '../components/TeamMemberInformation';
import { teamContext } from '../context/Team';
import { hasCaughtPokemon } from '../utility/pokemon';
import { getSavedToken } from '../utility/storage';

const Pokedex = (): ReactElement => {
  const [pokemons, setPokemons] = useState<Array<object>>([]);
  const [currentTab, setCurrentTab] = useState(0);
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

  const updateGeneration = (generation: number): Promise<void> => {
    return api('put', '/team/generation', {
      generation,
    });
  };

  const updateSettings = (settings: any): Promise<void> => {
    return api('put', '/team/settings', {
      settings,
    });
  };

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
    <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
    <Tab label="Pokemon" />
    <Tab label="Settings" />
    </Tabs>
    </Grid>
    {currentTab === 0 && (<>
      <Grid item xs={12}>
      <TextField 
      id="pokemon-search"
      label="Search for Pokemon"
      variant="filled"
      fullWidth
      value={search}
      onChange={handleSearchChange}
      />
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
      <teamContext.Consumer>
      {({ updateTeam }) => {
        const closeMemberInfo = () => {
          setCurrentPokemon(null);
          updateTeam();
        };

        if (currentPokemon) {
          return (
            <TeamMemberInformation
            pokemon={currentPokemon.pokemon}
            member={currentPokemon.member}
            onOpen={() => {}}
            onClose={closeMemberInfo}
            open={!!currentPokemon}
            />
          );
        }
        return null;
      }}
      </teamContext.Consumer>
      </Grid>
      </>)}
    {currentTab === 1 && (
      <teamContext.Consumer>
      {({ team, updateTeam }) => {
        const handleGenerationChange = (e) => {
          updateGeneration(e.target.value).then(clearCache).then(updateTeam);
        };

        const handleUpdateSettings = (setting: string, newValue: any) => {
          updateSettings({
            ...team.settings,
            [setting]: newValue,
          }).then(updateTeam);
        };

        return (
          <Grid item xs={12}>
          <List>
          <ListItem>
          <FormControl sx={{ width: '100%' }}>
          <InputLabel id="generation-select-label">Generation</InputLabel>
          <Select
          labelId="generation-select-label"
          id="generation-select"
          value={team.generation}
          label="Generation"
          onChange={handleGenerationChange}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map((gen) => (
            <MenuItem key={gen} value={gen}>{gen}</MenuItem>
          ))}
          </Select>
          </FormControl>
          </ListItem>
          <ListItem>
          <FormControlLabel sx={{ width: '100%' }} label="Hide Uncaught Pokemon Images" control={<Switch checked={!!team.settings.hideUncaughtImage} onChange={(e) => handleUpdateSettings('hideUncaughtImage', e.target.checked)} />} />
          </ListItem>
          </List>
          </Grid>
        );
      }}
      </teamContext.Consumer>
    )}
    </Grid>
    </DefaultLayout>
  );
};

export default Pokedex;

