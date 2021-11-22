import React, { ReactElement, useState, useEffect } from 'react';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import capitalize from '@mui/utils/capitalize';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import CaughtModal from './CaughtModal';
import api from '../utility/api';
import type { TypeType } from '../db/Type';
import type { PokemonType } from '../db/Pokemon';

export interface PokemonInformationProps {
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
  pokemon?: PokemonType;
}

const encounterDescriptionMap = {
  walk: 'Walking',
  gift: 'Gifted',
};

const PokemonInformation = (props: PokemonInformationProps): ReactElement => {
  const [pokemonInformation, setPokemonInformation] = useState<PokemonType | null>(null);
  const [expandedLocation, setExpandedLocation] = useState<number | false>(false);
  const [allTypes, setAllTypes] = useState<TypeType[]>([]);
  const [catchingPokemon, setCatchingPokemon] = useState(false);

  const handleChangeExpandedLocation = (index: number) => (event, isExpanded) => {
    setExpandedLocation(isExpanded ? index : false)
  }

  useEffect(() => {
    if (props.pokemon) {
      api('get', `/pokemon/${props.pokemon.id}`).then(({ data }) => {
        setPokemonInformation(data.data);
      });
    }
    api('get', '/type').then(({ data }) => {
      setAllTypes(data.data);
      console.log('set all types', data.data);
    });
  }, [props.pokemon]);

  const handleClose = () => {
    setPokemonInformation(null);
    props.onClose();
  }

  if (!pokemonInformation) {
    return null;
  }

  const typeObjects = allTypes.filter((type) => {
    return (pokemonInformation && pokemonInformation.types && pokemonInformation.types.find((t) => t.type === type.name));
  });

  let superEffectiveTypes = typeObjects.reduce((current, typeObject) => {
    return [...current, ...typeObject.defenseSuperEffective];
  }, []);
  let resistantTypes = typeObjects.reduce((current, typeObject) => {
    return [...current, ...typeObject.defenseResistance];
  }, []);
  const immuneTypes = typeObjects.reduce((current, typeObject) => {
    return [...current, ...typeObject.defenseImmune];
  }, []);

  const superEffectiveResistant = [];
  superEffectiveTypes = superEffectiveTypes.filter((type) => {
    if (resistantTypes.find((t) => t === type)) {
      superEffectiveResistant.push(type);
      return false;
    }
    return true;
  });
  resistantTypes = resistantTypes.filter((type) => {
    return superEffectiveResistant.indexOf(type) === -1;
  });

  return (
    <>
    {pokemonInformation && (<CaughtModal open={catchingPokemon} pokemonId={pokemonInformation.id} pokemonName={pokemonInformation.name} onClose={() => setCatchingPokemon(false)} />)}
    <SwipeableDrawer
    anchor="bottom"
    open={props.open}
    onClose={handleClose}
    onOpen={props.onOpen}
  >
    <Box
    sx={{ minHeight: '80vh', padding: 1 }}
  >
    <Grid container spacing={2}>
    <Grid item xs={12}>
    <Paper sx={{ padding: 1 }}>
    <Typography variant="h3" align="center" gutterBottom component="div">
    {capitalize(pokemonInformation.name)}
    </Typography>
    <Button onClick={() => setCatchingPokemon(true)}>Catch</Button>
    </Paper>
    </Grid>
    <Grid item xs={12}>
    <Paper sx={{ padding: 1 }}>
    <Grid container spacing={1}>
    <Grid item xs={6} sx={{ alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
    <img src={pokemonInformation.image.default} />
    </Grid>
    <Grid item xs={6} sx={{ alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
    <img src={pokemonInformation.image.shiny} />
    </Grid>
    </Grid>
    </Paper>
    </Grid>
    <Grid item xs={12}>
    <Paper sx={{ padding: 1 }}>
    <Typography variant="h5" gutterBottom component="div">
    Types
    </Typography>
    {
      pokemonInformation.types.map((type) => {
        return (
          <Chip
          key={type.slot}
          label={type.type}
          />
        );
      })
    }
    {superEffectiveTypes.length > 0 && (<><Typography gutterBottom variant="h6" component="div">
    Super Effective Against This
    </Typography>
    {superEffectiveTypes.map((type) => {
      return (
        <Chip label={capitalize(type)} key={type} />
      );
    })}</>)
    }

    {resistantTypes.length > 0 && (<><Typography gutterBottom variant="h6" component="div">
    Resistant Against This
    </Typography>
    {resistantTypes.map((type) => {
      return (
        <Chip label={capitalize(type)} key={type} />
      );
    })}</>)
    }

    {immuneTypes.length > 0 && (<><Typography gutterBottom variant="h6" component="div">
    Immune Against This
    </Typography>
    {immuneTypes.map((type) => {
      return (
        <Chip label={capitalize(type)} key={type} />
      );
    })}</>)
    }
    </Paper>
    </Grid>
    <Grid item xs={12}>
    <Paper sx={{ padding: 1 }}>
    <Typography gutterBottom variant="h6" component="div">
    Base Stats
    </Typography>
    <List>
    {pokemonInformation.stats.map((stat) => {
      return (
        <ListItem key={stat.stat}>
        <ListItemText
        primary={`${capitalize(stat.stat)}: ${stat.base}${stat.effort > 0 ? ` EV+${stat.effort}` : ''}`}
        />
        </ListItem>
      );
    })}
    </List>
    </Paper>
    </Grid>
    <Grid item xs={12}>
    <Paper sx={{ padding: 1, paddingBottom: 3 }}>
    <Typography gutterBottom variant="h6" component="div">
    Locations
    </Typography>
    {
      pokemonInformation.encounters.map((encounter, index) => {
        return (
          <Accordion key={index} expanded={expandedLocation === index} onChange={handleChangeExpandedLocation(index)}>
          <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls={`${index}-content`}
          id={`${index}-header`}
        >
          <Typography>
          {encounter.location.name} - {encounterDescriptionMap[encounter.method] || encounter.method}
          </Typography>
          </AccordionSummary>
          <AccordionDetails>
          <Typography>
          Chance: {encounter.chance}
          </Typography>
          <Typography>
          Levels: {encounter.minLevel} - {encounter.maxLevel}
          </Typography>
          {encounter.conditions && (
            <Typography>
            {encounter.conditions.join('\n')}
            </Typography>
          )}
          </AccordionDetails>
          </Accordion>
        );
      })
    }
    </Paper>
    </Grid>
    </Grid>
    </Box>
    </SwipeableDrawer>
    </>
  );
};

export default PokemonInformation;

