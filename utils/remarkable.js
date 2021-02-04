const fs = require('fs');
const readline = require('readline-sync');

const { v5: uuidv5 } = require('uuid');
const { Remarkable } = require('remarkable-typescript');

const CATCHABLE_NAMESPACE = '5bb23635-bb75-4db7-b95a-c90972f89869';

const getToken = async (tokenFile) => {
  if (fs.existsSync(tokenFile)) {
    console.log(`Token found in ${tokenFile}!`);

    const deviceToken = fs.readFileSync(tokenFile).toString();
    return deviceToken;
  }

  console.log(`Token not found in ${tokenFile}. Initiating connection process...`);

  const code = readline.question('Enter one-time code displayed at https://my.remarkable.com/connect/desktop: ');

  console.log('Attempting connection...');

  const client = new Remarkable(); 
  const deviceToken = await client.register({ code });
  
  console.log('Connection succeeded!');

  fs.writeFileSync(tokenFile, deviceToken);

  console.log(`Saved token into ${tokenFile} file for further uploads.`);

  return deviceToken;
}

const getClient = async (tokenFile) => {
  const deviceToken = await getToken(tokenFile);
  const client = new Remarkable({ deviceToken });
  await client.refreshToken();

  return client;
}

exports.uploadEpub = async (title, filename, tokenFile) => {
  const uuid = uuidv5(filename, CATCHABLE_NAMESPACE);
  const stream = fs.createReadStream(filename);
  const client = await getClient(tokenFile);

  await client.uploadEPUB(title, uuid, stream);
}
