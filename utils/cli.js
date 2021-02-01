const path = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

module.exports = yargs(hideBin(process.argv))
  .usage('Usage: ./$0 [options]')

  .option('base-url', {
    alias: 'b',
    type: 'string',
    required: true,
    description: 'Base url of the website',
  })
  .coerce('base-url', option => option.replace(/\/+$/, "")) // remove trailing slash

  .option('home', {
    alias: 'h',
    type: 'string',
    default: '/',
    description: 'Path to the page containing the table of content',
  })
  .coerce('home', option => option.startsWith('/') ? option : `/${option}`) // remove trailing slash

  .option('selector', {
    alias: 's',
    type: 'string',
    description: 'HTML selector for links on the Home page to build the table of content',
  })

  .option('title', {
    alias: 'n',
    type: 'string',
    description: 'Title of the book, defaults to Home page title',
  })

  .option('author', {
    alias: 'a',
    type: 'string',
    default: 'Unknown',
    description: 'Author of the book',
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
  .coerce('token-file', option => path.resolve(option)) // get absolute path

  // examples
  .example('./$0 -b https://www.halfbakedharvest.com -h /category/recipes -s .recipe-block')
  .example('./$0 -b https://wiki.polkadot.network -h /docs/en/getting-started -s .navItem')
  .example('./$0 -b https://dev.to -s \'a[id*="article-link-"]\' -u')

  .strict()
  .wrap(120)
  .argv
