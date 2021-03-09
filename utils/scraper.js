const fs = require('fs');
const path = require('path');

const request = require('sync-request');
const JSDOM = require('jsdom').JSDOM;
const { Readability } = require('@mozilla/readability');
const scrape = require('website-scraper');

class WebsiteScraperPlugin {
  apply(registerAction) {
    registerAction('getReference', ({ parentResource, originalReference }) => {
      let absoluteReference = null;

      if (originalReference.startsWith('https://') || originalReference.startsWith('http://')) {
        // image url is already absolute
        absoluteReference = originalReference;
      } else {
        const url = new URL(parentResource.url);
        absoluteReference = getAbsoluteUrl(url.origin, url.pathname, originalReference);
      }

      console.log('Setting absolute reference for image:', originalReference);
      console.log('->', absoluteReference);

      return { reference: absoluteReference };
    });
  }
}

class Book {
  constructor(title) {
    this.title = title;
    this.chapters = [];
  }

  getChapters(limit = null) {
    if (limit) return this.chapters.slice(0, limit);

    return this.chapters;
  }

  setTitle(title) {
    this.title = title;
  }

  addChapter(chapter) {
    this.chapters.push(chapter);
  }
}

class Chapter {
  constructor(origin, pathname, href) {
    this.url = getAbsoluteUrl(origin, pathname, href);
    this.filename = getFilename(href);
  }

  setContent(title, content) {
    this.title = title;
    this.content = content;
  }
}

getAbsoluteUrl = (origin, pathname, href) => {
  // href is already absolute
  if (href.startsWith('https://') || href.startsWith('http://')) return href;

  // exclude emails
  if (href.startsWith('mailto:')) return null;

  // prepend origin to href
  if (href.startsWith('/')) return origin + href;

  const dirname = path.dirname(pathname);
  return `${origin}${dirname}/${href}`;
}

getFilename = (href) => {
  let basename = path.basename(href);

  // replace ambiguous characters
  basename = basename.replace('?', '_')

  // empty filename
  if (!basename) return 'index.html';

  // check filename ends with .html
  if (!basename.endsWith('.html')) return `${basename}.html`;

  return basename;
}

getTableOfContentSelector = (document) => {
  // count a tag classes
  const links = document.querySelectorAll('a');
  const classes = R.countBy(l => l.className)(links);
  delete classes[''];

  // return max
  const classMax = Object.keys(classes).reduce((a, b) => classes[a] > classes[b] ? a : b);

  return '.' + classMax;
}

exports.getBook = (origin, pathname, selector, html = null) => {
  const body = html || request('GET', origin + pathname).getBody();
  const dom = new JSDOM(body);
  const title = dom.window.document.querySelector('title').textContent;
  const tableOfContent = dom.window.document.querySelectorAll(selector);

  const book = new Book(title);

  if (!selector) {
    console.log('No selector specified, inserting home page only.');

    book.addChapter(new Chapter(origin, pathname));

    return book;
  }

  for (const item of tableOfContent)
    book.addChapter(new Chapter(origin, pathname, item.href));

  return book;
}

exports.downloadUrls = async (urls, directory) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];

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
    plugins: [new WebsiteScraperPlugin()],
  });
}

exports.getContent = (chapter, contentDirectory) => {
  const filePath = path.join(contentDirectory, chapter.filename);

  const body = fs.readFileSync(filePath);
  const dom = new JSDOM(body);
  const { title, content } = new Readability(dom.window.document).parse();

  return { title, content };
}
