const fs = require('fs');
const path = require('path');

const request = require('sync-request');
const JSDOM = require('jsdom').JSDOM;
const { Readability } = require('@mozilla/readability');
const scrape = require('website-scraper');

class WebsiteScraperPlugin {
  apply(registerAction) {
    registerAction('getReference', ({ parentResource, originalReference }) => {
      const absoluteReference = originalReference.startsWith('http')
        ? originalReference
        : parentResource.url + originalReference;

      console.log('Setting absolute reference for image:', originalReference);
      console.log('->', absoluteReference);

      return { reference: absoluteReference };
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
    const url = item.href.startsWith('/')
      ? origin + item.href
      : item.href;
    const filename = path.basename(item.href).replace('?', '_') || 'index';

    chapterUrls.push({ url, filename });
  }

  return { title, chapterUrls };
}

exports.downloadUrls = async (urls, directory) => {
  const imageExtensions = ['jpg', 'jpeg', 'png'];

  await scrape({
    urls,
    urlFilter: url => {
      url = new URL(url);
      const extension = url.pathname.split('.').pop().toLowerCase();

      if (imageExtensions.includes(extension)) {
        console.log('Skipping image:', url.pathname);
        return false;
      }

      return true;
    },
    maxRecursiveDepth: 1,
    directory,
    sources: [{ selector: 'img', attr: 'src' }],
    plugins: [ new WebsiteScraperPlugin() ],
  });
}

exports.getPagesContent = (urls, downloadDirectory) => {
  const pages = [];

  for (const [ index, url ] of urls.entries()) {
    const filename = url.filename.endsWith('.html')
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
