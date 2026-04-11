import { describe, it, expect, afterEach, beforeEach } from 'bun:test';
import { existsSync, unlinkSync, mkdirSync, writeFileSync } from 'fs';
import { TOKEN_PATH, TOKEN_DIR } from '../src/config';

describe('getAuthClient', () => {
  const originalClientId = process.env.GOOGLE_CLIENT_ID;
  const originalClientSecret = process.env.GOOGLE_CLIENT_SECRET;

  const testTokens = {
    access_token: 'test-access-token',
    refresh_token: 'test-refresh-token',
    expiry_date: Date.now() + 3600 * 1000,
    token_type: 'Bearer',
  };

  beforeEach(() => {
    // Create a test token file before tests that need it
    if (!existsSync(TOKEN_DIR)) {
      mkdirSync(TOKEN_DIR, { recursive: true });
    }
    writeFileSync(TOKEN_PATH, JSON.stringify(testTokens));
  });

  afterEach(() => {
    // Restore env vars
    if (originalClientId === undefined) {
      delete process.env.GOOGLE_CLIENT_ID;
    } else {
      process.env.GOOGLE_CLIENT_ID = originalClientId;
    }
    if (originalClientSecret === undefined) {
      delete process.env.GOOGLE_CLIENT_SECRET;
    } else {
      process.env.GOOGLE_CLIENT_SECRET = originalClientSecret;
    }

    // Clean up test token file
    if (existsSync(TOKEN_PATH)) {
      unlinkSync(TOKEN_PATH);
    }
  });

  it('returns an OAuth2 client when credentials and token file are present', async () => {
    process.env.GOOGLE_CLIENT_ID = 'test-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';

    const { getAuthClient } = await import('../src/auth');
    const client = getAuthClient();

    expect(client).toBeDefined();
    expect(typeof client.getAccessToken).toBe('function');
    expect(typeof client.setCredentials).toBe('function');
  });

  it('exits with error when GOOGLE_CLIENT_ID is not set', async () => {
    delete process.env.GOOGLE_CLIENT_ID;
    process.env.GOOGLE_CLIENT_SECRET = 'test-secret';

    const originalExit = process.exit;
    const originalError = console.error;
    let exitCode: number | undefined;
    let errorOutput = '';

    process.exit = ((code: number) => { exitCode = code; }) as never;
    console.error = (msg: string) => { errorOutput = msg; };

    const { getAuthClient } = await import('../src/auth');
    getAuthClient();

    process.exit = originalExit;
    console.error = originalError;

    expect(exitCode).toBe(1);
    const parsed = JSON.parse(errorOutput);
    expect(parsed.error).toContain('GOOGLE_CLIENT_ID');
  });

  it('exits with error when token file does not exist', async () => {
    process.env.GOOGLE_CLIENT_ID = 'test-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';

    // Remove the token file created in beforeEach
    if (existsSync(TOKEN_PATH)) {
      unlinkSync(TOKEN_PATH);
    }

    const originalExit = process.exit;
    const originalError = console.error;
    let exitCode: number | undefined;
    let errorOutput = '';

    process.exit = ((code: number) => { exitCode = code; }) as never;
    console.error = (msg: string) => { errorOutput = msg; };

    const { getAuthClient } = await import('../src/auth');
    getAuthClient();

    process.exit = originalExit;
    console.error = originalError;

    expect(exitCode).toBe(1);
    const parsed = JSON.parse(errorOutput);
    expect(parsed.error).toContain('gtm-cli login');
  });
});
