import { describe, it, expect, afterEach } from 'bun:test';

describe('getAuth', () => {
  const originalEnv = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
    } else {
      process.env.GOOGLE_APPLICATION_CREDENTIALS = originalEnv;
    }
  });

  it('returns a GoogleAuth instance when credentials path is set', async () => {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = '/fake/path.json';
    const { getAuth } = await import('../src/auth');
    const auth = getAuth();
    expect(auth).toBeDefined();
    expect(typeof auth.getClient).toBe('function');
  });

  it('prints error JSON and exits when GOOGLE_APPLICATION_CREDENTIALS is not set', async () => {
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS;

    const originalExit = process.exit;
    const originalError = console.error;
    let exitCode: number | undefined;
    let errorOutput = '';

    process.exit = ((code: number) => { exitCode = code; }) as never;
    console.error = (msg: string) => { errorOutput = msg; };

    const { getAuth } = await import('../src/auth');
    getAuth();

    process.exit = originalExit;
    console.error = originalError;

    expect(exitCode).toBe(1);
    const parsed = JSON.parse(errorOutput);
    expect(parsed.error).toContain('GOOGLE_APPLICATION_CREDENTIALS');
  });
});
