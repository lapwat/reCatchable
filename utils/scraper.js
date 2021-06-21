import path from 'path'

import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import * as R from 'ramda';

export async function getChapter(url) {
  const response = await fetch(url.href);
  const body = await response.text();
  const document = new JSDOM(body).window.document;

  // replace images src with absolute references inplace
  const images = document.querySelectorAll('img');
  for (const image of images) {
    const src = image.getAttribute('src');
    try {
      const absoluteSrc = getAbsoluteUrl(url.origin, url.pathname, src);
      image.setAttribute('src', absoluteSrc);
    } catch {
      image.setAttribute('src', '');
    }
  }

  const reader = new Readability(document);
  const { title, content } = reader.parse();
  const words = new JSDOM(content).window.document.body.textContent.split(/\s+/).length;

  return { name: title, content, words };
}

function getAbsoluteUrl(origin, pathname, href) {
  // href is already absolute
  if (href.startsWith('https://') || href.startsWith('http://')) return href;

  if (href.startsWith('//')) {
    const protocol = href.startsWith('https://') ? 'https:' : 'http:';
    return protocol + href;
  }

  // exclude emails
  if (href.startsWith('mailto:')) return null;

  // prepend origin to href
  if (href.startsWith('/')) return origin + href;

  if (pathname.endsWith('index.html')) // pandas doc
    return `${origin}${path.dirname(pathname)}/${href}`;

  if (href.startsWith('..')) // for l'histoire de france
    return `${origin}${href.substring(2)}`;

  return `${origin}${pathname}${href}`; // nginx, based cooking
}

export async function getTableOfContent(url, selector = null) {
  const response = await fetch(url);
  const contentType = response.headers.get('content-type');
  const body = await response.text();

  if (selector) return getTableOfContentFromHTML(body, new URL(url), selector);

  if (contentType.includes("text/html")) {
    // const urlRSS = await guessRSSFeed(new URL(url));
    // if (urlRSS) return await getBookSkeleton(urlRSS);

    return getTableOfContentFromHTML(body, new URL(url), selector);
  }

  // if (contentType.includes("xml"))
  //   return await getBookSkeleton(url);

  throw new Error("Unknown content type.");
}

export async function getBookSkeleton(url, selector = null) {
  const response = await fetch(url);
  const body = await response.text();
  const document = new JSDOM(body).window.document;

  const name = document.querySelector('title').textContent;
  const aTags = document.querySelectorAll(selector || guessSelector(document));

  const chapters = [];
  for (const aTag of aTags) {
    const absoluteUrl = getAbsoluteUrl(url.origin, url.pathname, aTag.href);
    chapters.push({
      name: aTag.textContent,
      url: absoluteUrl,
    });
  }

  return {
    name,
    chapters,
  };
}

function guessSelector(document) {
  const links = document.querySelectorAll('a');
  const classes = R.countBy(l => l.className)(links);
  delete classes[''];
  const classMax = Object.keys(classes).reduce((a, b) => classes[a] > classes[b] ? a : b);

  return '.' + classMax;
}
