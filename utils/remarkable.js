import fs from 'fs';
import readline from 'readline-sync';

import { v5 } from 'uuid';
import { Remarkable } from 'remarkable-typescript';

const CATCHABLE_NAMESPACE = '5bb23635-bb75-4db7-b95a-c90972f89869';

async function getToken (tokenFile) {
  if (fs.existsSync(tokenFile)) {
    console.log(`Token found in ${tokenFile}!`);

    const deviceToken = fs.readFileSync(tokenFile).toString();
    return deviceToken;
  }

  console.log(`Token not found in ${tokenFile}. Initiating connection process...`);

  const code = readline.question('Enter one-time code displayed at https://my.remarkable.com/device/connect/desktop: ');

  console.log('Attempting connection...');

  const client = new Remarkable();
  const deviceToken = await client.register({ code });

  console.log('Connection succeeded!');

  fs.writeFileSync(tokenFile, deviceToken);

  console.log(`Saved token into ${tokenFile} file for further uploads.`);

  return deviceToken;
}

async function getClient(tokenFile) {
  const deviceToken = await getToken(tokenFile);
  const client = new Remarkable({ deviceToken });
  await client.refreshToken();

  return client;
}

export default async (title, filename, tokenFile) => {
  const uuid = v5(filename, CATCHABLE_NAMESPACE);
  const stream = fs.createReadStream(filename);
  const client = await getClient(tokenFile);

  console.log('Uploading...');

  await client.uploadEPUB(title, uuid, stream);
}
