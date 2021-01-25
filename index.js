const fs = require('fs');
const path = require('path');
const JSDOM = require('jsdom').JSDOM;
const { Readability } = require('@mozilla/readability');
const request = require('sync-request');
const scrape = require('website-scraper');

const myArgs = process.argv.slice(2);
const domain = myArgs[0]; 
const index = myArgs[1]; 
const navSelector = myArgs[2]; 
const outDir = myArgs[3];
const absoluteOutFile = path.join(outDir, 'final.html')
const body = request('GET', domain + index).getBody();
const dom = new JSDOM(body);
const title = dom.window.document.querySelector('title').textContent;
const tableOfContent = dom.window.document.querySelectorAll(navSelector);

let urls = []
for (const item of tableOfContent) {
  urls.push({
    url: domain + item.href,
    filename: path.basename(item.href),
  });
}

console.log(`Links in table of content: ${urls.length}`);

(async () => {
  await scrape({
    urls,
    urlFilter: url => url.startsWith(domain),
    directory: outDir,
  });

  fs.appendFileSync(absoluteOutFile, `<title>${title}</title>`);
 
  for (const url of urls) {
    const absoluteFilename = path.join(outDir, `${url.filename}.html`);
    const body = fs.readFileSync(absoluteFilename);
    const dom = new JSDOM(body);
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    fs.appendFileSync(path.join(outDir, 'final.html'), `<h1 class="chapter">${article.title}</h1>${article.content}`);
  }  

})();
