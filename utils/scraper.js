const fs = require('fs');
const path = require('path');

const request = require('sync-request');
const JSDOM = require('jsdom').JSDOM;
const { Readability } = require('@mozilla/readability');
const scrape = require('website-scraper');

class WebsiteScraperPlugin {
  apply(registerAction) {
    registerAction('getReference', ({ resource, parentResource, originalReference }) => {
      if (!resource)
        return { reference: parentResource.url + originalReference };
      return { reference: resource.url };
    });
  }
}

exports.getBookStructure = (origin, pathname, selector, html = null) => {
  const body = html || request('GET', origin + pathname).getBody();
  const dom = new JSDOM(body);
  const title = dom.window.document.querySelector('title').textContent;
  const tableOfContent = dom.window.document.querySelectorAll(selector);

  if (!selector) {
    console.log('No selector specified, inserting home page only.');

    return {
      title,
      chapterUrls: [{ url: origin + pathname, filename: 'index' }],
    };
  }

  let chapterUrls = []
  for (const item of tableOfContent) {
    const url = item.href.startsWith('/') ? origin + item.href : item.href;
    const filename = path.basename(item.href).replace('?', '_') || 'index';

    chapterUrls.push({ url, filename });
  }

  return { title, chapterUrls };
}

exports.downloadUrls = async (urls, origin, directory) => {
  await scrape({
    urls,
    urlFilter: url => url.startsWith(origin),
    directory,
    sources: [{ selector: 'img', attr: 'src' }],
    plugins: [ new WebsiteScraperPlugin() ],
  });
}

exports.getPagesContent = (urls, downloadDirectory) => {
  const pages = [];

  for (const [ index, url ] of urls.entries()) {
    const filename = /\.html?$/.test(url.filename)
      ? url.filename
      : `${url.filename}.html`;
    const absoluteFilename = path.join(downloadDirectory, filename);
    const body = fs.readFileSync(absoluteFilename);
    const dom = new JSDOM(body);
    const reader = new Readability(dom.window.document);
    const { title, content } = reader.parse();
                                                                        
    console.log(`+ Page ${index+1}: ${title}`);
    pages.push({ title, content });
  }

  return pages;
}
