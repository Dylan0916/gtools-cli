import { google } from 'googleapis';

export function getAuth(): InstanceType<typeof google.auth.GoogleAuth> {
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (!credentialsPath) {
    console.error(
      JSON.stringify({
        error:
          'GOOGLE_APPLICATION_CREDENTIALS is not set.\n' +
          'Add the following line to your ~/.zshrc:\n' +
          'export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your-service-account.json"',
      })
    );
    process.exit(1);
  }

  return new google.auth.GoogleAuth({
    keyFile: credentialsPath,
    scopes: ['https://www.googleapis.com/auth/tagmanager.readonly'],
  });
}
