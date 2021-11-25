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
    <Grid item xs={6} sm={4} md={3}>
    <Link href="/pokedex">
    <Card sx={{ padding: 2, cursor: 'pointer' }}>
    <CatchingPokemonTwoToneIcon sx={{ width: '100%', height: 100 }} />
    <Typography variant="h6" component="div" align="center">
    PokeDex
    </Typography>
    </Card>
    </Link>
    </Grid>
    {/* Team Link */}
    <Grid item xs={6} sm={4} md={3}>
    <Link href="/team">
    <Card sx={{ padding: 2, cursor: 'pointer' }}>
    <GroupIcon sx={{ width: '100%', height: 100 }} />
    <Typography variant="h6" component="div" align="center">
    My Team
    </Typography>
    </Card>
    </Link>
    </Grid>
    {/* Shiny Hunt Link */}
    <Grid item xs={6} sm={4} md={3}>
    <Link href="/shiny">
    <Card sx={{ padding: 2, cursor: 'pointer' }}>
    <FlareIcon sx={{ width: '100%', height: 100 }} />
    <Typography variant="h6" component="div" align="center">
    Shiny Hunt
    </Typography>
    </Card>
    </Link>
    </Grid>
    </Grid>
    </DefaultLayout>
  );
}

export default Home
