import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';

import { TOKEN_DIR, TOKEN_PATH } from './config';

export interface StoredTokens {
  access_token?: string | null;
  refresh_token?: string | null;
  expiry_date?: number | null;
  token_type?: string | null;
  id_token?: string | null;
  scope?: string;
}

export function loadTokens(): StoredTokens | null {
  if (!existsSync(TOKEN_PATH)) {
    return null;
  }
  try {
    const content = readFileSync(TOKEN_PATH, 'utf-8');
    return JSON.parse(content) as StoredTokens;
  } catch {
    return null;
  }
}

export function saveTokens(tokens: StoredTokens): void {
  if (!existsSync(TOKEN_DIR)) {
    mkdirSync(TOKEN_DIR, { recursive: true });
  }
  writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
}
