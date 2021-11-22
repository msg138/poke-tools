import React, { ReactElement } from 'react';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Select from '@mui/material/Select';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Switch from '@mui/material/Switch';
import DefaultLayout from '../components/DefaultLayout';
import { teamContext } from '../context/Team';
import api from '../utility/api';

const Profile = (): ReactElement => {
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

  return (
    <DefaultLayout>
    <teamContext.Consumer>
    {({ team, updateTeam }) => {
      const handleGenerationChange = (e) => {
        updateGeneration(e.target.value).then(updateTeam);
      };

      const handleUpdateSettings = (setting: string, newValue: any) => {
        updateSettings({
          ...team.settings,
          [setting]: newValue,
        }).then(updateTeam);
      };

      return (
        <Box>
        <List>
        <ListItem>
        <FormControl>
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
        <FormControlLabel label="Hide Uncaught Pokemon Images" control={<Switch checked={!!team.settings.hideUncaughtImage} onChange={(e) => handleUpdateSettings('hideUncaughtImage', e.target.checked)} />} />
        </ListItem>
        </List>
        </Box>
      );
    }}
    </teamContext.Consumer>
    </DefaultLayout>
  );
};

export default Profile;

