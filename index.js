#!/usr/bin/env node

// core
const os = require('os');
const fs = require('fs');
const path = require('path');

// librairies
const Epub = require('epub-gen');

// utils
const options = require('./utils/cli');
const scraper = require('./utils/scraper');
const remarkable = require('./utils/remarkable');

(async () => {
  await run(options);
})();

async function run(options) {
  let { title, chapterUrls } = scraper.getBookStructure(options.home.origin, options.home.pathname, options.selector, options.homeHtml);

  title = options.title || title;
  chapterUrls = options.limit ? chapterUrls.slice(0, options.limit) : chapterUrls;

  console.log(`Found ${chapterUrls.length} pages in the table of content.`);
  console.log(`Downloading ${title}...`);

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cachable-')) + '/out';
  await scraper.downloadUrls(chapterUrls, tmpDir);

  if (fs.existsSync(`${tmpDir}/images`))
    console.log('Warning: Found /images in content folder, images inside this directory may be redownloaded by epub-gen.');

  console.log(`Extracting clean content from HTML sources...`);
  const chapters = scraper.getPagesContent(chapterUrls, tmpDir);
  fs.rmSync(tmpDir, { recursive: true, force: true });

  console.log(`Creating book...`);

  const bookFile = `${title}.epub`;
  const epubOptions = {
    title,
    author: options.author,
    publisher: 'Unknown',
    content: chapters.map(c => ({ title: c.title, data: c.content })),
  };

  await new Epub(epubOptions, bookFile).promise;

  console.log(`+ Book saved to ${bookFile}`);

  if (options.upload) {
    try {
      await remarkable.uploadEpub(title, bookFile, options.tokenFile);
      console.log('Book uploaded.');
    } catch (err) {
      console.log('Could not upload book, book name may already exists.', err);
    }
  }
}

exports.default = run;
