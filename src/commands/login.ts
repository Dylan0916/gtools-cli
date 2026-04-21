import { runLoginFlow } from '@/oauth';
import { saveTokens } from '@/tokenStore';

export async function runLogin(): Promise<void> {
  try {
    const tokens = await runLoginFlow();
    saveTokens(tokens);
    console.log('Successfully logged in to Google services.');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(JSON.stringify({ error: `Login failed: ${message}` }));
    process.exit(1);
  }
}
