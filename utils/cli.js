import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

export default yargs(hideBin(process.argv))
  .usage('Usage: ./$0 [options]')

  .option('url', {
    alias: 'u',
    type: 'string',
    required: true,
    description: 'Home page url',
  })
  .coerce('url', option => new URL(option))

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

  .option('delay', {
    alias: 'd',
    type: 'number',
    default: null,
    description: 'Delay between each page download.',
  })

  .option('name', {
    alias: 'n',
    type: 'string',
    description: 'Book name, defaults to Home page title',
  })

  .option('author', {
    alias: 'a',
    type: 'string',
    default: 'Unknown author',
    description: 'Author',
  })

  .option('upload', {
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
  .example('./$0 -u https://www.halfbakedharvest.com/category/recipes -s \'h2 > a\'')
  .example('./$0 -u https://dev.to/ -s \'a[id*="article-link-"]\' --upload')
  .example('./$0 -u https://vitalik.ca/ -s \'.post-link\' -l 3 -d 5')

  .strict()
  .wrap(100)
  .argv
