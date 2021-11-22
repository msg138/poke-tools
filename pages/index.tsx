import type { NextPage } from 'next'
import { useEffect } from 'react';
import axios from 'axios';
import DefaultLayout from '../components/DefaultLayout';
import useAuthentication from '../utility/hooks/useAuthentication';

const Home: NextPage = () => {
    useAuthentication();

    return (
        <DefaultLayout>
            Poke Tools Home
        </DefaultLayout>
    );
}

export default Home
