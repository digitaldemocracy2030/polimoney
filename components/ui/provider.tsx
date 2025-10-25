'use client';

import { Auth0Provider } from '@auth0/auth0-react';
import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

const system = createSystem(defaultConfig, {});

export function Provider({ children }: { children: React.ReactNode }) {
  const [redirectUri, setRedirectUri] = useState<string>();

  useEffect(() => {
    setRedirectUri(window.location.origin);
  }, []);

  if (!redirectUri) return null;

  return (
    <ChakraProvider value={system}>
      <Auth0Provider
        domain="dev-587pfdcuktck0mos.us.auth0.com"
        clientId="yOAB0paScfw1XkOcLbi91LljTspELiYT"
        cacheLocation="localstorage"
        authorizationParams={{
          redirect_uri: redirectUri,
        }}
      >
        {children}
      </Auth0Provider>
    </ChakraProvider>
  );
}
