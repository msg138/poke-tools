import React, { ReactElement, useContext } from 'react';
import Grid from '@mui/material/Grid';
import capitalize from '@mui/utils/capitalize';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import { teamContext } from '../context/Team';
import { hasCaughtPokemon } from '../utility/pokemon';

export interface PokemonCardProps {
  name: string;
  image: string;
  id: number | string;
  onClick?: () => void;
}

const PokemonCard = (props: PokemonCardProps): ReactElement => {
  const { team }= useContext(teamContext);
  const caught = team.settings.hideUncaughtImage ? hasCaughtPokemon(team, props.id as number) : true;

  return (
    <Grid item xs={6} sm={4} md={3}>
    <Card sx={{ width: '100%' }} onClick={props.onClick}>
    <CardHeader
    avatar={
      <Avatar aria-label="pokemon id">
      {props.id}
      </Avatar>
    }
    title={capitalize(props.name)}
    />
    <CardMedia
    component="img"
    height="140"
    image={caught ? props.image?.art : undefined}
    sx={{ backgroundColor: caught ? 'transparent' : 'black' }}
    alt={props.name}
    />
    </Card>
    </Grid>
  );
};

export default PokemonCard;

