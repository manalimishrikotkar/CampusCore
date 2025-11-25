const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

// Load OAuth credentials
const CREDENTIALS_PATH = path.join(__dirname, '../credentials.json'); // downloaded JSON
const TOKEN_PATH = path.join(__dirname, '../token.json');

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));

const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

// Load token if exists
if (fs.existsSync(TOKEN_PATH)) {
  const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
  oAuth2Client.setCredentials(token);
}

// Generate Auth URL (run once to get token)
// function getAuthUrl() {
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES,
//   });
//   console.log('Authorize this app by visiting this url:', authUrl);
// }

function getAuthUrl() {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',     // 👈 gives refresh token
    prompt: 'consent',          // 👈 forces Google to generate NEW token
    scope:SCOPES ,
  });
  console.log('Authorize this app by visiting:', authUrl);
  return authUrl;
}


// Save token after OAuth callback
async function saveToken(code) {
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
  console.log('Token stored to', TOKEN_PATH);
}

// Upload file to Drive
async function uploadFileToDrive(fileBuffer, fileName, mimeType, folderId) {
  const drive = google.drive({ version: 'v3', auth: oAuth2Client });
  const fileMetadata = {
    name: fileName,
    parents: folderId ? [folderId] : [],
  };
  const media = {
    mimeType,
    body: Buffer.isBuffer(fileBuffer)
      ? require('stream').Readable.from(fileBuffer)
      : fs.createReadStream(fileBuffer),
  };
  const file = await drive.files.create({
    resource: fileMetadata,
    media,
    fields: 'id, webViewLink, webContentLink',
  });

  // Make file public
  await drive.permissions.create({
    fileId: file.data.id,
    requestBody: { role: 'reader', type: 'anyone' },
  });

  return {
    id: file.data.id,
    viewLink: file.data.webViewLink,
    downloadLink: file.data.webContentLink,
  };
}

module.exports = { oAuth2Client, getAuthUrl, saveToken, uploadFileToDrive };
