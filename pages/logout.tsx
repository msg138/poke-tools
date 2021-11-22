import React, { ReactElement, useEffect } from 'react';
import { useRouter } from 'next/router';
import { saveToken } from '../utility/storage';

const Logout = (): ReactElement => {
    const router = useRouter();

    useEffect(() => {
        saveToken(null);
        router.push('/login');
    }, []);

    return (
        <div />
    );
};

export default Logout;

