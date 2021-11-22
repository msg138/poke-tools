import React, { ReactElement, useState, useContext } from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Slider from '@mui/material/Slider';
import capitalize from '@mui/utils/capitalize';
import { teamContext } from '../context/Team';
import api from '../utility/api';

export interface CaughtModalProps {
  open: boolean;
  onClose: () => {};
  pokemonId: string | number;
  pokemonName: string;
}

const CaughtModal = (props: CaughtModalProps) => {
  const [currentName, setCurrentName] = useState('');
  const [currentLevel, setCurrentLevel] = useState(1);
  const { updateTeam } = useContext(teamContext);

  const catchPokemon = () => {
    api('post', '/team/pokemon', {
      id: props.pokemonId,
      name: currentName,
      level: currentLevel,
    }).then(updateTeam).then(props.onClose);
  };

  return (
    <Modal
    open={props.open}
    onClose={props.onClose}
    >
    <Box sx={{ backgroundColor: 'white' }}>
    <Typography gutterBottom variant="h5" component="div">
    Caught {capitalize(props.pokemonName)}
    </Typography>
    <TextField label="Name" value={currentName} onChange={(e) => setCurrentName(e.target.value)} />
    <Typography gutterBottom variant="h6" component="div">
    Level {currentLevel}
    </Typography>
    <Slider min={1} max={100} value={currentLevel} onChange={(e) => setCurrentLevel(e.target.value)} />
    <Button color="primary" variant="contained" onClick={catchPokemon}>
    Catch
    </Button>
    <Button color="secondary" variant="outlined" onClick={props.onClose}>
    Cancel 
    </Button>
    </Box>
    </Modal>
  );
};

export default CaughtModal;

