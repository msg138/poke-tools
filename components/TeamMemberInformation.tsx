import React, { ReactElement, useMemo, useContext, useState, useEffect } from 'react';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
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
import TypeChip from './TypeChip';
import api from '../utility/api';
import { teamContext } from '../context/Team';
import type { TeamMemberType } from '../db/User';
import type { TypeType } from '../db/Type';
import type { PokemonType } from '../db/Pokemon';

export interface PokemonInformationProps {
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
  pokemon?: PokemonType;
  member?: TeamMemberType;
}

const defaultEvs = {
  hp: 0,
  attack: 0,
  defense: 0,
  specialAttack: 0,
  specialDefense: 0,
  speed: 0,
};

const evEnhancement = [
  {
    name: 'Power Weight',
    img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/power-weight.png',
    ev: (evs) => {
      return {
        ...evs,
        hp: evs.hp + 4,
      }
    },
  },
  {
    name: 'Power Bracer',
    img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/power-bracer.png',
    ev: (evs) => {
      return {
        ...evs,
        attack: evs.attack + 4,
      }
    },
  },
  {
    name: 'Power Belt',
    img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/power-belt.png',
    ev: (evs) => {
      return {
        ...evs,
        defense: evs.defense + 4,
      }
    },
  },
  {
    name: 'Power Lens',
    img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/power-lens.png',
    ev: (evs) => {
      return {
        ...evs,
        specialAttack: evs.specialAttack + 4,
      }
    },
  },
  {
    name: 'Power Band',
    img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/power-band.png',
    ev: (evs) => {
      return {
        ...evs,
        specialDefense: evs.specialDefense + 4,
      }
    },
  },
  {
    name: 'Power Anklet',
    img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/power-anklet.png',
    ev: (evs) => {
      return {
        ...evs,
        speed: evs.speed + 4,
      }
    },
  },
  {
    name: 'Macho Brace',
    img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/macho-brace.png',
    ev: (evs) => {
      const newEvs = { ...evs };
      Object.keys(evs).forEach((ev) => {
        newEvs[ev] = evs[ev] * 2;
      });
      return newEvs;
    },
  },
];

const encounterDescriptionMap = {
  walk: 'Walking',
  gift: 'Gifted',
};

const PokemonInformation = (props: PokemonInformationProps): ReactElement => {
  const [pokemonInformation, setPokemonInformation] = useState<PokemonType | null>(null);
  const [allPokemon, setAllPokemon] = useState<Array<PokemonType>>([]);
  const [expandedLocation, setExpandedLocation] = useState<number | false>(false);
  const [allTypes, setAllTypes] = useState<TypeType[]>([]);
  const { updateTeam, team } = useContext(teamContext);
  const [defeatPokemonText, setDefeatPokemonText] = useState(null);
  const [pokerus, setPokerus] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);

  const handleChangeExpandedLocation = (index: number) => (event, isExpanded) => {
    setExpandedLocation(isExpanded ? index : false)
  };

  useEffect(() => {
    api('get', '/pokemon').then(({ data }) => {
      setAllPokemon(data.data);
    });
  }, []);

  useEffect(() => {
    if (props.pokemon) {
      api('get', `/pokemon/${props.pokemon.id}`).then(({ data }) => {
        setPokemonInformation(data.data);
      });
    }
    api('get', '/type').then(({ data }) => {
      setAllTypes(data.data);
    });
  }, [props.pokemon]);

  const handleClose = () => {
    setPokemonInformation(null);
    props.onClose();
  }

  const pokemonSelectOptions = useMemo(() => {
    return allPokemon.map((pokemon) => ({
      label: capitalize(pokemon.name),
      id: pokemon.id,
    }));
  }, [allPokemon]);

  if (!pokemonInformation) {
    return null;
  }

  const member = team.members.find((m) => m.id === props.member.id && m.name === props.member.name);

  if (!member) {
    return null;
  }

  const releasePokemon = () => {
    console.log('Requesting with', props.member);
    api('delete', '/team/pokemon', {
      id: props.member.id,
      name: props.member.name,
    }).then(() => {
      props.onClose();
    });
  };

  const updateEv = (name: string, amount: number) => () => {
    console.log('Updating ', name, 'by', amount);
    api('put', '/team/pokemon', {
      id: props.member.id,
      name: props.member.name,
      evStat: name,
      evChange: amount,
    }).then(updateTeam);
  };

  const calculateEvGain = async (pokemonId: number) => {
    const pokemonDetails = (await api('get', `/pokemon/${pokemonId}`)).data.data;
    let evs = {
      hp: 0,
      attack: 0,
      defense: 0,
      specialAttack: 0,
      specialDefense: 0,
      speed: 0,
    };
    pokemonDetails.stats.forEach((stat) => {
      if(stat.effort > 0) {
        evs[stat.stat] += stat.effort;
      }
    });
    console.log('before', evs);
    evEnhancement.forEach((enhancement) => {
      if (currentItem === enhancement.name) {
        evs = enhancement.ev(evs);
      }
    });
    if (pokerus) {
      Object.keys(evs).forEach((ev) => {
        evs[ev] = evs[ev] * 2;
      });
    }
    console.log('after', evs);
    await Promise.all(Object.keys(evs).map((ev) => {
      if (evs[ev] === 0) {
        return;
      }
      return updateEv(ev, evs[ev])();
    }));
    setDefeatPokemonText(null);
  };

  const defeatPokemon = () => {
    if (!defeatPokemonText) {
      return;
    }
    const pokemon = allPokemon.find(({ id }) => id === defeatPokemonText.id);
    if (pokemon) {
      return calculateEvGain(pokemon.id);
    }
  };

  const typeObjects = allTypes.filter((type) => {
    return (pokemonInformation && pokemonInformation.types && pokemonInformation.types.find((t) => t.type === type.name));
  });

  let superEffectiveTypes = typeObjects.reduce((current, typeObject) => {
    return [...current, ...typeObject.defenseSuperEffective];
  }, []);
  let resistantTypes = typeObjects.reduce((current, typeObject) => {
    return [...current, ...typeObject.defenseResistance];
  }, []);
  let immuneTypes = typeObjects.reduce((current, typeObject) => {
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

  superEffectiveTypes = superEffectiveTypes.filter((type, position) => {
    return superEffectiveTypes.indexOf(type) === position;
  });
  resistantTypes = resistantTypes.filter((type, position) => {
    return resistantTypes.indexOf(type) === position;
  });
  immuneTypes = immuneTypes.filter((type, position) => {
    return immuneTypes.indexOf(type) === position;
  });

  return (
    <>
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
    {capitalize(props.member?.name)}
    </Typography>
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
    <Button color="secondary" variant="contained" onClick={releasePokemon}>Release</Button>
    </Box>
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
          <TypeChip
          key={type.slot}
          type={type.type}
          />
        );
      })
    }
    {superEffectiveTypes.length > 0 && (<><Typography gutterBottom variant="h6" component="div">
    Super Effective Against This
    </Typography>
    {superEffectiveTypes.map((type) => {
      return (
        <TypeChip type={type} key={type} />
      );
    })}</>)
    }

    {resistantTypes.length > 0 && (<><Typography gutterBottom variant="h6" component="div">
    Resistant Against This
    </Typography>
    {resistantTypes.map((type) => {
      return (
        <TypeChip type={type} key={type} />
      );
    })}</>)
    }

    {immuneTypes.length > 0 && (<><Typography gutterBottom variant="h6" component="div">
    Immune Against This
    </Typography>
    {immuneTypes.map((type) => {
      return (
        <TypeChip type={type} key={type} />
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
    <Typography gutterBottom variant="h6" component="div">
    EV Spread
    </Typography>
    <List>
    {Object.keys(member.ev || defaultEvs).filter((key) => key !== '_id').map((evStat) => {
      const value = member.ev ? member.ev[evStat] : defaultEvs[evStat];
      return (
        <ListItem key={evStat}>
        <ListItemText primary={`${evStat}: ${value}`} />
        <ButtonGroup variant="contained">
        <Button disabled={value === 0} onClick={updateEv(evStat, -1)}><RemoveIcon /></Button>
        <Button disabled={value === 255} onClick={updateEv(evStat, 1)}><AddIcon /></Button>
        </ButtonGroup>
        </ListItem>
      );
    })}
    </List>
    <Typography gutterBottom variant="body1" component="div">
    EV Enhancements
    </Typography>
    <ToggleButtonGroup value={pokerus} onChange={(_, newPoke) => setPokerus(newPoke)}>
    <ToggleButton value="pokerus" sx={{ marginRight: 2, color: '#9b11a0' }}>
    PokeRus
    </ToggleButton>
    </ToggleButtonGroup>
    <ToggleButtonGroup exclusive value={currentItem} onChange={(_, newItem) => setCurrentItem(newItem)}>
    {evEnhancement.map((evEnhancer) => {
      return (
        <ToggleButton key={evEnhancer.name} value={evEnhancer.name}>
        <img src={evEnhancer.img} />
        {evEnhancer.name}
        </ToggleButton>
      );
    })}
    </ToggleButtonGroup>
    <Typography gutterBottom variant="body1" component="div">
    Defeat Pokemon (Auto EV)
    </Typography>
    <Autocomplete
    disablePortal
    options={pokemonSelectOptions}
    isOptionEqualToValue={(option, value) => option.id === value.id}
    renderInput={(params) => (
      <TextField {...params} label="Pokemon"  variant="outlined" />
    )}
    value={defeatPokemonText}
    onChange={(e, newValue) => setDefeatPokemonText(newValue)}
    />
    <Button disabled={!defeatPokemonText} color="primary" variant="contained" fullWidth onClick={defeatPokemon}>Defeat</Button>
    </Paper>
    </Grid>
    </Grid>
    </Box>
    </SwipeableDrawer>
    </>
  );
};

export default PokemonInformation;

