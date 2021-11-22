import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getSavedToken } from '../storage';

const useAuthentication = (requireAuthentication = true): null => {
    const router = useRouter();
    const [authenticated] = useState(() => {
        return typeof window !== 'undefined' && typeof getSavedToken() === 'string';
    });
    
    useEffect(() => {
        if (!authenticated && requireAuthentication) {
            router.push('/login');
        } else if (authenticated && !requireAuthentication) {
            router.push('/');
        }
    }, [authenticated])

    return authenticated;
};

export default useAuthentication;

