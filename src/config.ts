import { homedir } from 'os';
import { join } from 'path';

export const OAUTH_PORT = 4242;
export const REDIRECT_URI = `http://localhost:${OAUTH_PORT}/callback`;
export const READ_ONLY_SCOPES = [
  'https://www.googleapis.com/auth/tagmanager.edit.containers',
  'https://www.googleapis.com/auth/documents.readonly',
  'https://www.googleapis.com/auth/spreadsheets.readonly',
];

export const WRITE_SCOPES = [
  'https://www.googleapis.com/auth/tagmanager.edit.containers',
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/spreadsheets',
];

// Kept as an alias for backward compatibility with any external importers.
export const SCOPES = READ_ONLY_SCOPES;
export const TOKEN_DIR = join(homedir(), '.config', 'gtools-cli');
export const TOKEN_PATH = join(TOKEN_DIR, 'token.json');
