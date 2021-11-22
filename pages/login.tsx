import React, { useState, ReactElement } from 'react';
import { useRouter } from 'next/router';
import Link from '@mui/material/Link';
import NextLink from 'next/link';
import axios from 'axios';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { saveToken } from '../utility/storage';
import useAuthentication from '../utility/hooks/useAuthentication';

const Login = (): ReactElement => {
    const router = useRouter();
    useAuthentication(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const login = (e) => {
        e.preventDefault();
        axios.post('/api/login', {
            username,
            password,
        }).then(({ data: { token  }}) => {
            if (token) {
                saveToken(token);
                router.push('/');
            }
        });
    };

    return (
        <Box sx={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box
                sx={{ 
                    width: 300,
                    backgroundColor: 'white',
                    borderWidth: '1px',
                    borderColor: 'primary.light',
                    borderStyle: 'solid',
                    borderRadius: '3px',
                    padding: 3,
                }}
            >
                <form onSubmit={login}>
                    <TextField
                        label="Username"
                        variant="outlined"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        fullWidth
                        sx={{
                            marginBottom: '10px'
                        }}
                    />
                    <TextField
                        label="Password"
                        type="password"
                        variant="outlined"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        fullWidth
                        sx={{
                            marginBottom: '10px'
                        }}
                    />
                    <Button
                        variant="contained"
                        fullWidth
                        type="submit"
                        sx={{
                            marginBottom: '10px',
                        }}
                    >
                        Login
                    </Button>
                    <Link color="primary" href="/register" component={NextLink} underline="hover">
                        Don&apos;t have an account? Register here.
                    </Link>
                </form>
            </Box>
        </Box>
    );
};

export default Login;

