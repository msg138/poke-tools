import React, { ReactElement, useState, useEffect } from 'react';
import api from '../utility/api';

export const teamContext = React.createContext(null);

export interface TeamProviderProps {
  children: any;
}

const teamSettingsDefaults = {
  showNationalDex: false,
};

const TeamProvider = (props): ReactElement => {
  const [team, setTeam] = useState({ name: 'loading', generation: 0, settings: teamSettingsDefaults });

  const updateTeam = () => {
    api('get', '/team', undefined, true).then((t) => {
      const teamApi = t.data.data;
      setTeam({
        ...teamApi,
        settings: teamApi.settings ? {
          ...teamSettingsDefaults,
          ...teamApi.settings,
        } : teamSettingsDefaults,
      });
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

