#!/usr/bin/env node

// imports
const os = require('os');
const fs = require('fs');
const path = require('path');
const JSDOM = require('jsdom').JSDOM;
const { Readability } = require('@mozilla/readability');
const request = require('sync-request');
const scrape = require('website-scraper');
const Epub = require('epub-gen');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cachable-')) + '/out';

class ScraperPlugin {
  apply(registerAction) {
    registerAction('getReference', ({resource, parentResource, originalReference, utils}) => {
      if (!resource)
        return {reference: parentResource.url + originalReference}
      return {reference: resource.url};
    });
  }
}

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
  .option('out', {
    alias: 'o',
    type: 'string',
    description: 'Name of the epub file',
  })
  .strict()
  .wrap(130)
  .argv

// retrieve table of content
const body = request('GET', options.baseUrl + options.home).getBody();
const dom = new JSDOM(body);
const title = dom.window.document.querySelector('title').textContent;
const tableOfContent = dom.window.document.querySelectorAll(options.selector);
options.out = options.out || `${title}.epub`

// prepare urls
let urls = []
for (const item of tableOfContent) {
  urls.push({
    url: options.baseUrl + item.href,
    filename: path.basename(item.href) || 'index',
  });
}

console.log(`Found ${urls.length} pages in the table of content`);
console.log(`Downloading...`);

(async () => {
  await scrape({
    urls,
    urlFilter: url => url.startsWith(options.baseUrl),
    directory: tmpDir,
    sources: [{ selector:'img', attr:'src' }],
    plugins: [ new ScraperPlugin() ],
  });

  console.log(`Book: ${title}`);

  const chapters = [];
  for (const url of urls) {
    const absoluteFilename = path.join(tmpDir, `${url.filename}.html`);
    const body = fs.readFileSync(absoluteFilename);
    const dom = new JSDOM(body);
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    console.log(`Chapter: ${article.title}...`);

    chapters.push({ title: article.title, data: article.content });
  }

  const epubOptions = {
    title,
    author: "Unknown",
    publisher: 'Unknown',
    content: chapters,
  };

  console.log(`Generating epub...`);
  new Epub(epubOptions, options.out);

})();
