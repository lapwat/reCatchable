#!/usr/bin/env node

// librairies
import cliProgress from 'cli-progress';
import Epub from 'epub-gen';

// utils
import options from './utils/cli.js';
import uploadEpub from './utils/remarkable.js';
import { getBookSkeleton, getChapter } from './utils/scraper.js';

const progress = new cliProgress.SingleBar({
  format: 'Downloading [{bar}] {percentage}% | ETA: {eta}s | {value}/{total}',
  hideCursor: true,
}, cliProgress.Presets.shades_classic);

function sleep(seconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, 1000 * seconds);
  });
};

(async () => {
  await run(options);
})();

async function run(options) {
  const skeleton = await getBookSkeleton(options.url, options.selector);
  console.log(`----- ${skeleton.name} ----- ${skeleton.chapters.length} chapters`);

  // retrieve urls from skeleton chapter list
  const limit = options.limit || skeleton.chapters.length;
  const urls = skeleton.chapters
    .slice(0, limit)
    .map(chapter => new URL(chapter.url));

  progress.start(urls.length, 0);

  const chapters = [];
  if (options.delay === null) {

    // asynchronous download
    await Promise.all(urls.map(async url => {
      chapters.push(await getChapter(url));
      progress.increment();
    }));

  } else {

    // synchronous download
    for (const url of urls) {
      chapters.push(await getChapter(url));
      progress.increment();

      // wait before downloading next chapter
      await sleep(options.delay);
    }

  }

  progress.stop();

  console.log(`+ Creating book...`);

  const book = {
    name: options.name || skeleton.name,
    chapters,
  };

  const filename = `${book.name}.epub`;
  const epubOptions = {
    title: book.name,
    author: options.author,
    publisher: 'Unknown',
    content: chapters.map(chapter => ({ title: chapter.name, data: chapter.content })),
  };

  await new Epub(epubOptions, filename).promise;

  console.log(`+ Book saved to ${filename}`);

  // upload book
  if (options.upload) {
    try {
      await uploadEpub(book.name, filename, options.tokenFile);
      console.log('Book uploaded.');
    } catch (err) {
      console.log('Could not upload book, book name may already exists. Try to specify a custom name with --name option.', err);
    }
  }
}
