import React, { ReactElement, useEffect } from 'react';
import { useRouter } from 'next/router';
import { saveToken } from '../utility/storage';
import { clearCache } from '../utility/api';

const Logout = (): ReactElement => {
  const router = useRouter();

  useEffect(() => {
    saveToken(null);
    clearCache();
    router.push('/login');
  }, []);

  return (
    <div />
  );
};

export default Logout;

