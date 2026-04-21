import { google } from 'googleapis';

import { loadTokens } from './tokenStore';
import { REDIRECT_URI } from './config';

export type AuthClient = InstanceType<typeof google.auth.OAuth2>;

function getEnvCredentials(): { clientId: string; clientSecret: string } {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error(
      JSON.stringify({
        error:
          'GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are not set.\n' +
          'Add them to your ~/.zshrc:\n' +
          '  export GOOGLE_CLIENT_ID="your-client-id"\n' +
          '  export GOOGLE_CLIENT_SECRET="your-client-secret"',
      })
    );
    process.exit(1);
  }

  return { clientId, clientSecret };
}

export function getAuthClient(): AuthClient {
  const { clientId, clientSecret } = getEnvCredentials();
  const tokens = loadTokens();

  if (!tokens) {
    console.error(
      JSON.stringify({
        error: 'Not logged in. Run `gtools-cli login` first.',
      })
    );
    process.exit(1);
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);
  oauth2Client.setCredentials(tokens);

  return oauth2Client;
}
