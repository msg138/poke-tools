import React, { ReactElement } from 'react';
import Chip from '@mui/material/Chip';
import capitalize from '@mui/utils/capitalize';

export interface TypeChipProps {
  type: string;
}

const typeStyleMap: Record<string, object> = {
  normal: { backgroundColor: '#666666', color: 'white' },
  fire: { backgroundColor: '#c43400', color: 'white' },
  water: { backgroundColor: '#0080c4', color: 'white' },
  grass: { backgroundColor: '#0a7300', color: 'white' },
  electric: { backgroundColor: '#c4b400', color: 'white' },
  ice: { backgroundColor: '#4dfff9', color: 'black' },
  fighting: { backgroundColor: '#960d00', color: 'white' },
  poison: { backgroundColor: '#5800b5', color: 'white' },
  ground: { backgroundColor: '#945e00', color: 'white' },
  flying: { backgroundColor: '#b2ced1', color: 'black' },
  psychic: { backgroundColor: '#c66ad9', color: 'white' },
  bug: { backgroundColor: '#9bcc39', color: 'black' },
  rock: { backgroundColor: '#6b5b36', color: 'white' },
  ghost: { backgroundColor: '#bfbfbf', color: 'black' },
  dark: { backgroundColor: '#424242', color: 'white' },
  dragon: { backgroundColor: '#003d7d', color: 'white' },
  steel: { backgroundColor: '#545a61', color: 'white' },
  fairy: { backgroundColor: '#f3c1f5', color: 'black' },
};

const TypeChip = (props: TypeChipProps) => {
  return (
    <Chip sx={typeStyleMap[props.type]} label={capitalize(props.type)} />
  )
};

export default TypeChip;

