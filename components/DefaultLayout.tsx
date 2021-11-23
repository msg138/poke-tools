import React, { ReactElement, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Typography from '@mui/material/Typography';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
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

const DefaultLayout = (props: DefaultLayoutProps): ReactElement => {
  const [menuOpen, toggleMenu, openMenu, closeMenu] = useToggle();
  const router = useRouter();

  const navigate = (location: string) => () => {
    closeMenu();
    router.push(location);
  };

  return (
    <div style={{ paddingTop: 100, }}>
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
    <Typography variant="h6" component="div">
    Poke Tools
    </Typography>
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
    </div>
  );
};

export default DefaultLayout;

