const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

// Load the service account credentials
const KEYFILEPATH = path.join(__dirname, "../service-account-key.json");
const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

const driveService = google.drive({ version: "v3", auth });

// The folder ID of your Drive uploads folder
const DRIVE_FOLDER_ID = process.env.DRIVE_FOLDER_ID;

async function uploadFileToDrive(fileBuffer, fileName, mimeType) {
  try {
    const fileMetadata = {
      name: fileName,
      parents: [DRIVE_FOLDER_ID],
    };

    const media = {
      mimeType,
      body: Buffer.isBuffer(fileBuffer)
        ? require("stream").Readable.from(fileBuffer)
        : fs.createReadStream(fileBuffer),
    };

    const file = await driveService.files.create({
      resource: fileMetadata,
      media,
      fields: "id, webViewLink, webContentLink",
    });

    // Make file public
    await driveService.permissions.create({
      fileId: file.data.id,
      requestBody: { role: "reader", type: "anyone" },
    });

    // Return public links
    return {
      id: file.data.id,
      viewLink: file.data.webViewLink,
      downloadLink: file.data.webContentLink,
    };
  } catch (err) {
    console.error("❌ Google Drive upload error:", err.message);
    throw err;
  }
}

module.exports = { uploadFileToDrive };
