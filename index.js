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
const body = request('GET', domain + index).getBody();
const dom = new JSDOM(body);
const tableOfContent = dom.window.document.querySelectorAll(navSelector);

const urls = []
for (const item of tableOfContent) {
  urls.push({
    url: domain + item.href,
    filename: path.basename(item.href) + '.html',
  });
  console.log(item.href)
}

(async () => {
   await scrape({
     urls,
     urlFilter: url => url.startsWith(domain),
     directory: outDir,
  });

  for (const url of urls) {
    const absoluteFilename = path.join(outDir, url.filename);
    const body = fs.readFileSync(absoluteFilename);
    const dom = new JSDOM(body);
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    fs.appendFileSync(path.join(outDir, 'final.html'), article.content);
  }  

})();


 // const body2 = request('GET', 'https://wiki.polkadot.network' + item.href).getBody();
 // const dom2 = new JSDOM(body2);
 // const reader = new Readability(dom2.window.document);
 // const article = reader.parse();

 // //fs.appendFileSync('out.html', article.content);
 // scrape({
 //   //urls: ['https://wiki.polkadot.network' + item.href],
 //   urls: ['https://wiki.polkadot.network/docs/en/getting-started',
//'//https://wiki.polkadot.network/docs/en/claims'
//,
 //   directory: 'out',
 // }).then((result) => console.log(result));
 // break;
//
