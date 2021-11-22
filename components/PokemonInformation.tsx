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

  const typeObjects = allTypes.filter((type) => {
    return (pokemonInformation && pokemonInformation.types && pokemonInformation.types.find((t) => t.type === type.name));
  });

  const handleClose = () => {
    setPokemonInformation(null);
    props.onClose();
  }

  if (!pokemonInformation) {
    return null;
  }

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
      sx={{ minHeight: '80vh' }}
    >
      <Grid container spacing={2}>
      <Grid item xs={12}>
      <Paper>
      <Typography variant="h1" component="div">
      {capitalize(pokemonInformation.name)}
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
      <Button onClick={() => setCatchingPokemon(true)}>Catch</Button>
      </Paper>
      </Grid>
      <Grid item xs={12}>
      <Paper>
      <Typography gutterBottom variant="h6" component="div">
      Super Effective Against This
      </Typography>
      {typeObjects.map((type) => {
        return (
          <React.Fragment key={type.name}>
          {type.defenseSuperEffective.map((t) => (
            <Chip label={capitalize(t)} key={t} />
          ))}
          </React.Fragment>
        );
      })}

      <Typography gutterBottom variant="h6" component="div">
      Resistant Against This
      </Typography>
      {typeObjects.map((type) => {
        return (
          <React.Fragment key={type.name}>
          {type.defenseResistance.map((t) => (
            <Chip label={capitalize(t)} key={t} />
          ))}
          </React.Fragment>
        );
      })}

      <Typography gutterBottom variant="h6" component="div">
      Immune Against This
      </Typography>
      {typeObjects.map((type) => {
        return (
          <React.Fragment key={type.name}>
          {type.defenseImmune.map((t) => (
            <Chip label={capitalize(t)} key={t} />
          ))}
          </React.Fragment>
        );
      })}

      <Typography gutterBottom variant="h6" component="div">
      Super Effective From This
      </Typography>
      {typeObjects.map((type) => {
        return (
          <React.Fragment key={type.name}>
          {type.attackSuperEffective.map((t) => (
            <Chip label={capitalize(t)} key={t} />
          ))}
          </React.Fragment>
        );
      })}

      <Typography gutterBottom variant="h6" component="div">
      Resistant From This
      </Typography>
      {typeObjects.map((type) => {
        return (
          <React.Fragment key={type.name}>
          {type.attackResistance.map((t) => (
            <Chip label={capitalize(t)} key={t} />
          ))}
          </React.Fragment>
        );
      })}

      <Typography gutterBottom variant="h6" component="div">
      Immune From This
      </Typography>
      {typeObjects.map((type) => {
        return (
          <React.Fragment key={type.name}>
          {type.attackImmune.map((t) => (
            <Chip label={capitalize(t)} key={t} />
          ))}
          </React.Fragment>
        );
      })}
      </Paper>
      </Grid>
      <Grid item xs={12}>
      <Paper>
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
      <Paper>
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

