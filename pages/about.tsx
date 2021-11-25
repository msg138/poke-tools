import type { NextPage } from 'next'
import { useEffect } from 'react';
import axios from 'axios';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import CatchingPokemonTwoToneIcon from '@mui/icons-material/CatchingPokemonTwoTone';
import FlareIcon from '@mui/icons-material/Flare';
import GroupIcon from '@mui/icons-material/Group';
import Link from 'next/link';
import DefaultLayout from '../components/DefaultLayout';
import useAuthentication from '../utility/hooks/useAuthentication';

const Home: NextPage = () => {
  useAuthentication();

  return (
    <DefaultLayout>
    <Grid container spacing={2} sx={{ padding: 2 }}>
    <Grid item xs={12}>
    <Typography gutterBottom variant="h4" component="div" align="center">
    Poke Tools
    </Typography>
    </Grid>
    <Grid item xs={12}>
    <Card sx={{ padding: 2 }}>
    <Typography gutterBottom>
    Poke Tools is a collection of tools to augment your Pokemon gameplay experience. These are NOT designed to fit every need,
    however I try to fit most use cases for myself personally.
    </Typography>
    <Typography gutterBottom>
    With PokeTools you have the option to create Teams. These are essentially separate "play-throughs" that keep the pokemon you catch,
    shiny hunts and other gameplay specific information separate.
    </Typography>
    <Typography gutterBottom>
    I hope that you enjoy using this tool that I have made, and if you have comments, let me know at <a href="mailto:michaelg@kaspyre.com">michaelg@kaspyre.com</a>
    </Typography>
    <Typography>
    - Best Wishes, MichaelG
    </Typography>
    </Card>
    </Grid>
    </Grid>
    </DefaultLayout>
  );
}

export default Home
