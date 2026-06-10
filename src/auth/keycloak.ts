import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL ?? window.location.origin,
  realm: import.meta.env.VITE_KEYCLOAK_REALM ?? 'divedata',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID ?? 'divedata-ui-client',
  pkceMethod: false,
});

// Memoize init so React 18 StrictMode's double-effect (and any other caller)
// can't trigger "A 'Keycloak' instance can only be initialized once."
let initPromise: Promise<boolean> | null = null;

export function initKeycloak(): Promise<boolean> {
  if (!initPromise) {
    initPromise = keycloak.init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
      // The app (localhost:3000) and Keycloak (192.168.1.167) are different sites,
      // so Keycloak's session cookie is third-party and the silent-iframe SSO check
      // is blocked by the browser. Allow the fallback to a top-level redirect check
      // (first-party, prompt=none) so the session survives a page refresh.
      silentCheckSsoFallback: true,
      checkLoginIframe: false,
      // Request profile/email so the token carries the `name` and `email` claims.
      scope: 'profile email',
    });
  }
  return initPromise;
}

export default keycloak;
