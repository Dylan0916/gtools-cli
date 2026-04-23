import { runLoginFlow, type LoginOptions } from '@/oauth';
import { saveTokens } from '@/tokenStore';

export async function runLogin(options: LoginOptions = {}): Promise<void> {
  try {
    const tokens = await runLoginFlow(options);
    saveTokens(tokens);
    const scopeNote = options.writeAccess ? ' (with read+write scopes)' : '';
    console.log(`Successfully logged in to Google services${scopeNote}.`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(JSON.stringify({ error: `Login failed: ${message}` }));
    process.exit(1);
  }
}
