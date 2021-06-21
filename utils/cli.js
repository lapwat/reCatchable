import { readFileSync } from 'fs';
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

export default yargs(hideBin(process.argv))
  .usage('Usage: ./$0 [options]')

  .option('home', {
    alias: 'h',
    type: 'string',
    required: true,
    description: 'Home page url',
  })
  .coerce('home', option => new URL(option))

  // .option('home-html', {
  //   type: 'string',
  //   description: 'Html of the home page',
  // })
  // .coerce('home-html', option => readFileSync(option))

  .option('selector', {
    alias: 's',
    type: 'string',
    description: 'Table of content HTML selector',
  })

  .option('limit', {
    alias: 'l',
    type: 'number',
    description: 'Limit the number of pages downloaded',
  })

  .option('sync', {
    type: 'boolean',
    default: false,
    description: 'Download one page at a time',
  })

  .option('delay', {
    alias: 'd',
    type: 'number',
    default: 0,
    description: 'Wait before downloading next page in seconds. Works in sync mode only.',
  })

  .option('name', {
    alias: 'n',
    type: 'string',
    description: 'Title, defaults to Home page title',
  })

  .option('author', {
    alias: 'a',
    type: 'string',
    default: 'Unknown',
    description: 'Author',
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
  .example('./$0 -h https://www.halfbakedharvest.com/category/recipes -s \'h2 > a\'')
  .example('./$0 -h https://wiki.polkadot.network/docs/en/getting-started -s .navItem')
  .example('./$0 -h https://dev.to -s \'a[id*="article-link-"]\' -u')

  .strict()
  .wrap(100)
  .argv
