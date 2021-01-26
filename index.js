#!/usr/bin/env node

// imports
const fs = require('fs');
const path = require('path');
const JSDOM = require('jsdom').JSDOM;
const { Readability } = require('@mozilla/readability');
const request = require('sync-request');
const scrape = require('website-scraper');
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

// parse args
const options = yargs(hideBin(process.argv))
  .usage('Usage: ./$0 [options]')
  .example('./$0 -b https://wiki.polkadot.network -h /docs/en/getting-started -s .navItem')
  .example('./$0 -b https://dev.to -s \'a[id*="article-link-"]\'')
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
    description: 'Path  of the website where the table of content is located, with leading slash',
  })
  .option('out-dir', {
    alias: 'o',
    type: 'string',
    default: 'out',
    description: 'Folder where final.html will be downloaded',
  })
  .strict()
  .wrap(130)
  .argv

// retrieve table of content
const body = request('GET', options.baseUrl + options.home).getBody();
const dom = new JSDOM(body);
const title = dom.window.document.querySelector('title').textContent;
const tableOfContent = dom.window.document.querySelectorAll(options.selector);
const absoluteOutFile = path.join(options.outDir, 'final.html')

// prepare urls
let urls = []
for (const item of tableOfContent) {
  urls.push({
    url: options.baseUrl + item.href,
    filename: path.basename(item.href),
  });
}

if (options.verbose)
  console.log(`Links in table of content: ${urls.length}`);

(async () => {
  await scrape({
    urls,
    urlFilter: url => url.startsWith(options.baseUrl),
    directory: options.outDir,
  });

  fs.appendFileSync(absoluteOutFile, `<title>${title}</title>`);
 
  for (const url of urls) {
    const absoluteFilename = path.join(options.outDir, `${url.filename}.html`);
    const body = fs.readFileSync(absoluteFilename);
    const dom = new JSDOM(body);
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    fs.appendFileSync(path.join(options.outDir, 'final.html'), `<h1 class="chapter">${article.title}</h1>${article.content}`);
  }  

})();
