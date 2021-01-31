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
  let { title, chapterUrls } = scraper.getBookStructure(options.baseUrl, options.home, options.selector);
  title = options.title || title;
  
  console.log(`Found ${chapterUrls.length} pages in the table of content`);
  console.log(`Downloading ${title}...`);

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cachable-')) + '/out';
  await scraper.downloadUrls(chapterUrls, options.baseUrl, tmpDir);
  const chapters = scraper.getPagesContent(chapterUrls, tmpDir);  

  const bookFile = `${title}.epub`;
  const epubOptions = {
    title,
    author: "Unknown",
    publisher: 'Unknown',
    content: chapters.map(c => ({ title: c.title, data: c.content })),
  };
  await new Epub(epubOptions, bookFile).promise;

  console.log(`+ Book saved to ${bookFile}`);

  if (options.upload) {
    console.log(`Uploading to reMarkable...`);

    try {
      await remarkable.uploadEpub(title, bookFile, options.tokenFile);
    } catch (err) {
      console.log('Could not upload book, book name may already exists.', err);
    }
  }

})();
