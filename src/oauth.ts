import { createServer, type IncomingMessage, type ServerResponse } from 'http';
import { spawn } from 'child_process';
import { google } from 'googleapis';

import { OAUTH_PORT, REDIRECT_URI, SCOPES } from './config';
import type { StoredTokens } from './tokenStore';

function getEnvCredentials(): { clientId: string; clientSecret: string } {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error(
      JSON.stringify({
        error:
          'GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set.\n' +
          'Add them to your ~/.zshrc:\n' +
          '  export GOOGLE_CLIENT_ID="your-client-id"\n' +
          '  export GOOGLE_CLIENT_SECRET="your-client-secret"',
      })
    );
    process.exit(1);
  }

  return { clientId, clientSecret };
}

function openBrowser(url: string): void {
  const platform = process.platform;

  if (platform === 'darwin') {
    spawn('open', [url], { detached: true, stdio: 'ignore' });
  } else if (platform === 'win32') {
    spawn('cmd', ['/c', 'start', url], { detached: true, stdio: 'ignore' });
  } else {
    spawn('xdg-open', [url], { detached: true, stdio: 'ignore' });
  }
}

function sendHtml(res: ServerResponse, html: string): void {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
}

export async function runLoginFlow(): Promise<StoredTokens> {
  const { clientId, clientSecret } = getEnvCredentials();
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    // Force consent screen so we always receive a refresh_token
    prompt: 'consent',
  });

  return new Promise((resolve, reject) => {
    const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
      const rawUrl = req.url ?? '';
      const url = new URL(rawUrl, `http://localhost:${OAUTH_PORT}`);

      if (url.pathname !== '/callback') {
        res.writeHead(404);
        res.end('Not found');
        return;
      }

      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');

      // Stop accepting new requests after receiving the callback
      server.close();

      if (error !== null || code === null) {
        sendHtml(res, '<html><body><h1>Login failed.</h1><p>You may close this tab.</p></body></html>');
        reject(new Error(`OAuth error: ${error ?? 'No authorization code received'}`));
        return;
      }

      try {
        const { tokens } = await oauth2Client.getToken(code);
        resolve(tokens as StoredTokens);
        sendHtml(
          res,
          '<html><body><h1>Login successful!</h1><p>You may close this tab and return to the terminal.</p></body></html>'
        );
      } catch (err) {
        sendHtml(res, '<html><body><h1>Token exchange failed.</h1><p>You may close this tab.</p></body></html>');
        reject(err);
      }
    });

    server.listen(OAUTH_PORT, 'localhost', () => {
      console.log('Opening browser for Google OAuth login...');
      console.log(`If the browser does not open automatically, visit:\n${authUrl}`);
      openBrowser(authUrl);
    });

    server.on('error', reject);
  });
}
