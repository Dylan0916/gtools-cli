import { homedir } from 'os';
import { join } from 'path';

export const OAUTH_PORT = 4242;
export const REDIRECT_URI = `http://localhost:${OAUTH_PORT}/callback`;
export const SCOPES = [
  'https://www.googleapis.com/auth/tagmanager.edit.containers',
  'https://www.googleapis.com/auth/documents.readonly',
];
export const TOKEN_DIR = join(homedir(), '.config', 'gtools-cli');
export const TOKEN_PATH = join(TOKEN_DIR, 'token.json');
