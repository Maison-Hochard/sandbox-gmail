const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/gmail.compose'];
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

const {Command} = require('commander');
const program = new Command();

program
    .usage('[options]')
    .option('-t, --to <to>', 'To email address')
    .option('-s, --subject <subject>', 'Subject')
    .option('-b, --body <body>', 'Body')
    .parse(process.argv);

const options = program.opts();

async function loadSavedCredentialsIfExist() {
    try {
        const content = await fs.readFile(TOKEN_PATH);
        const credentials = JSON.parse(content);
        return google.auth.fromJSON(credentials);
    } catch (err) {
        return null;
    }
}

async function saveCredentials(client) {
    const content = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
        type: 'authorized_user',
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(TOKEN_PATH, payload);
}

async function authorize() {
    let client = await loadSavedCredentialsIfExist();
    if (client) {
        return client;
    }
    client = await authenticate({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
    });
    if (client.credentials) {
        await saveCredentials(client);
    }
    return client;
}

async function sendMail(auth) {
    const gmail = google.gmail({version: 'v1', auth});
    const message = btoa(
        "To: " + options.to + "\r\n" +
        "Subject: " + options.subject + "\r\n\r\n" +
        options.body);
    const res = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
            raw: message,
        },
    });
    console.log(res.data);
}

authorize().then(sendMail).catch(console.error);