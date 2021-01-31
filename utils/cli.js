const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

module.exports = yargs(hideBin(process.argv))
  .usage('Usage: ./$0 [options]')
  .option('base-url', {
    alias: 'b',
    type: 'string',
    required: true,
    description: 'Base url of the website, without trailing slash',
  })
  .option('selector', {
    alias: 's',
    type: 'string',
    required: true,
    description: 'HTML selector for links on the HOME page to build the table of content',
  })
  .option('home', {
    alias: 'h',
    type: 'string',
    default: '/',
    description: 'Path to the page containing the table of content, with leading slash',
  })
  .option('title', {
    alias: 'n',
    type: 'string',
    description: 'Title of the book, defaults to Home page title',
  })
  .option('upload', {
    alias: 'u',
    type: 'boolean',
    default: false,
    description: 'Upload book to reMarkable',
  })
  .option('token-file', {
    alias: 't',
    type: 'string',
    default: 'remarkable.token',
    description: 'File to read/write reMarkable token',
  })
  .example('./$0 -b https://wiki.polkadot.network -h /docs/en/getting-started -s .navItem')
  .example('./$0 -b https://dev.to -s \'a[id*="article-link-"]\' -u')
  .strict()
  .wrap(130)
  .argv
