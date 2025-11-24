const { google } = require('googleapis');
const readline = require('readline');

// Instructions for the user
console.log('--- Google Drive Refresh Token Generator ---');
console.log('You need a Client ID and Client Secret from the Google Cloud Console.');
console.log('1. Go to https://console.cloud.google.com/apis/credentials');
console.log('2. Create credentials -> OAuth client ID -> Web application');
console.log('3. Set "Authorized redirect URIs" to: https://developers.google.com/oauthplayground');
console.log('--------------------------------------------\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter your Client ID: ', (clientId) => {
  rl.question('Enter your Client Secret: ', (clientSecret) => {
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      'https://developers.google.com/oauthplayground' // Use OAuth Playground as the redirect handler for simplicity
    );

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/drive.file'],
    });

    console.log('\nAuthorize this app by visiting this url:');
    console.log(authUrl);
    console.log('\nAfter authorizing, you will be redirected to the OAuth Playground.');
    console.log('Copy the "Authorization code" from the left panel (step 2) or the URL, and paste it here.');

    rl.question('\nEnter the Authorization Code: ', (code) => {
      oauth2Client.getToken(code, (err, token) => {
        if (err) return console.error('Error retrieving access token', err);

        console.log('\n--- SUCCESS! ---');
        console.log('Add the following to your .env file:');
        console.log(`GOOGLE_DRIVE_CLIENT_ID=${clientId}`);
        console.log(`GOOGLE_DRIVE_CLIENT_SECRET=${clientSecret}`);
        console.log(`GOOGLE_DRIVE_REFRESH_TOKEN=${token.refresh_token}`);
        console.log('----------------');

        rl.close();
      });
    });
  });
});
