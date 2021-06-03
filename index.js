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
  const book = scraper.getBook(options.home.origin, options.home.pathname, options.selector, options.homeHtml);
  if (options.title) book.setTitle(options.title);

  const chapters = book.getChapters(options.limit);

  console.log(`Found ${chapters.length} pages in the table of content.`);
  console.log(`Downloading ${book.title}...`);

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cachable-')) + '/out';
  await scraper.downloadUrls(chapters, tmpDir);

  if (fs.existsSync(`${tmpDir}/images`))
    console.log('Warning: Found /images in content folder, images inside this directory may be redownloaded by epub-gen.');

  console.log(`Extracting clean content from HTML sources...`);
  for (const [index, chapter] of chapters.entries()) {
    const { title, content } = scraper.getContent(chapter, tmpDir);

    console.log(`+ Chapter ${index + 1}: ${title}`);
    chapter.setContent(title, content);
  }
  fs.rmSync(tmpDir, { recursive: true, force: true });

  console.log(`Creating book...`);

  const bookFile = `${book.title}.epub`;
  const epubOptions = {
    title: book.title,
    author: options.author,
    publisher: 'Unknown',
    content: chapters.map(chapter => ({ title: chapter.title, data: chapter.content })),
  };

  await new Epub(epubOptions, bookFile).promise;

  console.log(`+ Book saved to ${bookFile}`);

  if (options.upload) {
    try {
      await remarkable.uploadEpub(book.title, bookFile, options.tokenFile);
      console.log('Book uploaded.');
    } catch (err) {
      console.log('Could not upload book, book name may already exists.', err);
    }
  }
}

exports.default = run;
