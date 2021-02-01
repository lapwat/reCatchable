const os = require('os');
const fs = require('fs');
const path = require('path');

const request = require('sync-request');
const JSDOM = require('jsdom').JSDOM;
const { Readability } = require('@mozilla/readability');
const scrape = require('website-scraper');

class WebsiteScraperPlugin {
  apply(registerAction) {
    registerAction('getReference', ({resource, parentResource, originalReference, utils}) => {
      if (!resource)
        return {reference: parentResource.url + originalReference}
      return {reference: resource.url};
    });
  }
}

exports.getBookStructure = (baseUrl, home, selector) => {
  const body = request('GET', baseUrl + home).getBody();
  const dom = new JSDOM(body);
  const title = dom.window.document.querySelector('title').textContent;
  const tableOfContent = dom.window.document.querySelectorAll(selector);

  if (!selector) {
    console.log('No selector specified, inserting home page only.');

    return {
      title,
      chapterUrls: [{ url: baseUrl + home, filename: 'index' }],
    };
  }

  let chapterUrls = []
  for (const item of tableOfContent) {
    const url = item.href.startsWith('/') ? baseUrl + item.href : item.href;
    const filename = path.basename(item.href) || 'index';

    chapterUrls.push({ url, filename });
  }

  return { title, chapterUrls };
}

exports.downloadUrls = async (urls, baseUrl, directory) => {
  await scrape({
    urls,
    urlFilter: url => url.startsWith(baseUrl),
    directory,
    sources: [{ selector:'img', attr:'src' }],
    plugins: [ new WebsiteScraperPlugin() ],
  });
}

exports.getPagesContent = (urls, downloadDirectory) => {
  const pages = [];

  for (const [ index, url ] of urls.entries()) {
    const absoluteFilename = path.join(downloadDirectory, `${url.filename}.html`);
    const body = fs.readFileSync(absoluteFilename);
    const dom = new JSDOM(body);
    const reader = new Readability(dom.window.document);
    const { title, content } = reader.parse();
                                                                        
    console.log(`+ Page ${index+1}: ${title}`);
    pages.push({ title, content });
  }

  return pages;
}
