import React, { ReactElement, useRef, useState, useEffect } from 'react';
import Head from 'next/head';
import AppBar from '@mui/material/AppBar';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import GroupIcon from '@mui/icons-material/Group';
import FlareIcon from '@mui/icons-material/Flare';
import CatchingPokemonTwoToneIcon from '@mui/icons-material/CatchingPokemonTwoTone';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { useRouter } from 'next/router';
import useToggle from '../utility/hooks/useToggle';
import TeamProvider, { teamContext } from '../context/Team';

export interface DefaultLayoutProps {
  children: any;
  loading?: boolean;
}

const pathValueMap = {
  '/': 0,
  '/pokedex': 1,
  '/team': 2,
  '/shiny': 3,
};

const DefaultLayout = (props: DefaultLayoutProps): ReactElement => {
  const [menuOpen, toggleMenu, openMenu, closeMenu] = useToggle();
  const [currentAlert, setCurrentAlert] = useState<string | null>(null);
  const [alerts, setAlerts] = useState([]);
  const alertTimeout = useRef();
  const router = useRouter();

  const navigate = (location: string) => () => {
    closeMenu();
    router.push(location);
  };

  useEffect(() => {
    window.queueAlert = (alert) => {
      console.log('Queing', alert);
      setAlerts((al) => {
        return al.concat(alert)
      });
    };
  }, [setAlerts]);

  useEffect(() => {
    if (alerts.length === 0) {
      setCurrentAlert(null);
      return;
    }

    alertTimeout.current = window.setTimeout(() => {
      nextAlert();
    }, 5000);
    const newAlert = alerts[0];
    setCurrentAlert(newAlert);

    return () => {
      if (alertTimeout.current) {
        window.clearTimeout(alertTimeout.current);
      }
    };
  }, [alerts, alerts.length]);

  const nextAlert = () => {
    if (alertTimeout.current) {
      window.clearTimeout(alertTimeout.current);
      alertTimeout.current = null;
    }
    setAlerts((al) => al.slice(1));
  };

  return (
    <div style={{ paddingTop: 100, }}>
    <Head>
    <link rel="manifest" href="/manifest.json" />
    </Head>
    <TeamProvider>
    <AppBar>
    <Toolbar>
    <IconButton
    size="large"
    edge="start"
    color="inherit"
    aria-label="menu"
    onClick={toggleMenu}
  >
    <MenuIcon />
    </IconButton>
    <teamContext.Consumer>
    {({ team }) => (
      <Typography sx={{ marginLeft: 3 }} variant="h6" component="div">
      Team: {team.name} - G{team.generation}
      </Typography>
    )}
    </teamContext.Consumer>
    </Toolbar>
    </AppBar>
    <SwipeableDrawer
    anchor="left"
    open={menuOpen}
    onOpen={openMenu}
    onClose={closeMenu}
  >
    <List sx={{ width: 250 }}>
    <ListItem button onClick={navigate('/')}>
    <ListItemText primary="Home" />
    </ListItem>
    <Divider />
    <ListItem button onClick={navigate('/pokedex')}>
    <ListItemText primary="PokeDex" />
    </ListItem>
    <Divider />
    <ListItem button onClick={navigate('/team')}>
    <ListItemText primary="My Team" />
    </ListItem>
    <Divider />
    <ListItem button onClick={navigate('/shiny')}>
    <ListItemText primary="Shiny Hunt" />
    </ListItem>
    <Divider />
    <ListItem button onClick={navigate('/about')}>
    <ListItemText primary="About" />
    </ListItem>
    <Divider />
    <ListItem button onClick={navigate('/logout')}>
    <ListItemText primary="Logout" />
    </ListItem>
    </List>
    </SwipeableDrawer>
    {props.loading 
      ? (
        <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
        </Box>
      )
      : props.children
    }
    </TeamProvider>
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
    <BottomNavigation
    showLabels
    value={pathValueMap[router.pathname]}
    >
    <BottomNavigationAction onClick={navigate('/')} label="Home" icon={<HomeIcon />} />
    <BottomNavigationAction onClick={navigate('/pokedex')} label="PokeDex" icon={<CatchingPokemonTwoToneIcon />} />
    <BottomNavigationAction onClick={navigate('/team')} label="Team" icon={<GroupIcon />} />
    <BottomNavigationAction onClick={navigate('/shiny')} label="Shiny Hunt" icon={<FlareIcon />} />
    </BottomNavigation>
    </Paper>
    {currentAlert && (
      <Snackbar open onClose={nextAlert}>
      <Alert elevation={6} variant="filled" onClose={nextAlert} severity="error" sx={{ width: '100%' }}>
      {currentAlert}
      </Alert>
      </Snackbar>
    )}
    </div>
  );
};

export default DefaultLayout;

