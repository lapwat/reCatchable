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
      const absoluteSrc = getAbsoluteUrl(url, src);
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

// https://www.generacodice.com/en/articolo/2933389/javascript:-regex-to-change-all-relative-urls-to-absolute
function getAbsoluteUrl(location, url) {
  /* Only accept commonly trusted protocols:
   * Only data-image URLs are accepted, Exotic flavours (escaped slash,
   * html-entitied characters) are not supported to keep the function fast */
  if (/^(https?|file|ftps?|mailto|javascript|data:image\/[^;]{2,9};):/i.test(url))
    return url; //Url is already absolute

  var base_url = location.href.match(/^(.+)\/?(?:#.+)?$/)[0] + "/";
  if (url.substring(0, 2) == "//")
    return location.protocol + url;
  else if (url.charAt(0) == "/")
    return location.protocol + "//" + location.host + url;
  else if (url.substring(0, 2) == "./")
    url = "." + url;
  else if (/^\s*$/.test(url))
    return ""; //Empty = Return nothing
  else url = "../" + url;

  url = base_url + url;
  var i = 0
  while (/\/\.\.\//.test(url = url.replace(/[^\/]+\/+\.\.\//g, "")));

  /* Escape certain characters to prevent XSS */
  url = url.replace(/\.$/, "").replace(/\/\./g, "").replace(/"/g, "%22")
    .replace(/'/g, "%27").replace(/</g, "%3C").replace(/>/g, "%3E");
  return url;
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
    const absoluteUrl = getAbsoluteUrl(url, aTag.href);
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
