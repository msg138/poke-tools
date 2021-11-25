import type { NextPage } from 'next'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import CatchingPokemonTwoToneIcon from '@mui/icons-material/CatchingPokemonTwoTone';
import GroupIcon from '@mui/icons-material/Group';
import Link from 'next/link';
import DefaultLayout from '../components/DefaultLayout';
import useAuthentication from '../utility/hooks/useAuthentication';
import api from '../utility/api';
import { teamContext } from '../context/Team';

const Shiny: NextPage = () => {
  useAuthentication();
  const [currentShinyCount, setCurrentShinyCount] = useState<null | string>(null);
  const [newShinyCountName, setNewShinyCountName] = useState('');

  const createShinyCount = () => {
    return api('post', '/team/shiny', {
      name: newShinyCountName,
    }).then(() => {
      setNewShinyCountName('');
    });
  };

  const modifyShinyCount = (amount: number) => () => {
    if (!currentShinyCount) {
      return;
    }
    return api('put', '/team/shiny', {
      name: currentShinyCount,
      change: amount,
    });
  };

  const deleteShinyCount = (name: string) => () => {
    if (currentShinyCount) {
      return;
    }
    return api('delete', '/team/shiny', {
      name,
    });
  };

  return (
    <DefaultLayout>
    <Grid container spacing={2} sx={{ padding: 2 }}>
    {!currentShinyCount && (<teamContext.Consumer>
    {({ updateTeam }) => {
      const updateTeamAfter = (cb) => () => {
        cb().then(updateTeam);
      };

      return (
        <Grid item xs={12}>
        <Card sx={{ padding: 2 }}>
        <TextField sx={{ marginBottom: 2 }} label="New Shiny Hunt" value={newShinyCountName} onChange={(e) => setNewShinyCountName(e.target.value)} fullWidth variant="outlined" />
        <Button onClick={updateTeamAfter(createShinyCount)} fullWidth variant="contained">Create</Button>
        </Card>
        </Grid>
      );
    }}
    </teamContext.Consumer>)}
    <teamContext.Consumer>
    {({ team, updateTeam }) => {
      if (currentShinyCount) {
        return null;
      }
      const updateTeamAfter = (cb) => () => {
        cb().then(updateTeam);
      };

      if (team.settings?.shinyCount?.count && Object.keys(team.settings.shinyCount.count).length > 0) {
        return (
          <Grid item xs={12}>
          <Card sx={{ padding: 2 }}>
          <List>
          {
            Object.keys(team.settings.shinyCount.count).filter((k) => k !== '_id' && (!team.settings.shinyCount.deleted || team.settings.shinyCount.deleted.indexOf(k) === -1)).map((count) => {
              return (
                <ListItem key={count}>
                <ListItemText primary={`${count} - ${team.settings.shinyCount.count[count]}`} />
                <ButtonGroup>
                <Button onClick={() => setCurrentShinyCount(count)}>Start</Button>
                <Button onClick={updateTeamAfter(deleteShinyCount(count))} variant="contained" color="error">Delete</Button>
                </ButtonGroup>
                </ListItem>
              );
            })
          }
          </List>
          </Card>
          </Grid>
        );
      }
      return (
        <Grid item xs={12}>
        <Card sx={{ padding: 2 }}>
        <Typography variant="h5" component="div" align="center">
        No Shiny Hunts.
        </Typography>
        </Card>
        </Grid>
      );
    }}
    </teamContext.Consumer>
    {currentShinyCount && (
      <teamContext.Consumer>
      {({ updateTeam, team }) => {
        const updateTeamAfter = (cb) => () => {
          cb().then(updateTeam);
        };

        return (
          <>
          <Grid item xs={12}>
          <Card sx={{ padding: 3 }}>
          <Typography variant="h5" component="div" align="center">
          {currentShinyCount}
          </Typography>
          </Card>
          </Grid>
          <Grid item xs={4}>
          <Card sx={{ display: 'flex', justifyContent: 'center', padding: 2 }}>
          <Typography variant="h2" component="div">
          {team.settings.shinyCount.count[currentShinyCount]}
          </Typography>
          </Card>
          </Grid>
          <Grid item xs={8}>
          <Card sx={{ display: 'flex', justifyContent: 'flex-end', padding: 2 }}>
          <IconButton color="error" sx={{ width: 100, height: 100 }} onClick={updateTeamAfter(modifyShinyCount(-1))} disabled={team.settings.shinyCount.count[currentShinyCount] === 0}><RemoveIcon /></IconButton>
          <IconButton color="primary" sx={{ width: 100, height: 100 }} onClick={updateTeamAfter(modifyShinyCount(1))}><AddIcon /></IconButton>
          </Card>
          </Grid>
          <Grid item xs={12}>
          <Card sx={{ padding: 2 }}>
          <Button color="primary" variant="outlined" fullWidth onClick={() => setCurrentShinyCount(null)}>
          Go Back
          </Button>
          </Card>
          </Grid>
          </>
        );
      }}
      </teamContext.Consumer>
    )}
    </Grid>
    </DefaultLayout>
  );
}

export default Shiny;
