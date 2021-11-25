import React, { ReactElement, useState, useEffect } from 'react';
import api from '../utility/api';

export const teamContext = React.createContext(null);

export interface TeamProviderProps {
  children: any;
}

const teamSettingsDefaults = {
};

const TeamProvider = (props): ReactElement => {
  const [team, setTeam] = useState({ name: 'loading', generation: 0, settings: teamSettingsDefaults, members: [], teams: [], });

  const updateTeam = () => {
    api('get', '/team', undefined, true).then((t) => {
      const teamApi = t.data.data;
      const newTeam = {
        ...teamApi.team,
        teams: teamApi.teams,
        settings: teamApi.team.settings ? {
          ...teamSettingsDefaults,
          ...teamApi.team.settings,
        } : teamSettingsDefaults,
      };
      console.log(newTeam);
      setTeam(newTeam);
    });
  }

  useEffect(() => {
    updateTeam();
  }, []);

  return (
    <teamContext.Provider value={{ team, setTeam, updateTeam }}>
    {props.children}
    </teamContext.Provider>
  )
};

export default TeamProvider;

