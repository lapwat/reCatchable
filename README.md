# reCatchable

Turn a site into a book. Upload it to your reMarkable.

## Install

```sh
❯ git clone https://gitlab.com/lapwat/reCatchable.git
❯ cd website2ebook
❯ yarn # or npm install
```

## Usage

```sh
❯ ./index.js --help
Usage: ./index.js [options]

Options:
      --help        Show help                                                                                            [boolean]
      --version     Show version number                                                                                  [boolean]
  -b, --base-url    Base url of the website, without trailing slash                                            [string] [required]
  -s, --selector    HTML selector for links on the HOME page to build the table of content                     [string] [required]
  -h, --home        Path to the page containing the table of content, with leading slash                   [string] [default: "/"]
  -n, --title       Title of the book, defaults to Home page title                                                        [string]
  -u, --upload      Upload book to reMarkable                                                           [boolean] [default: false]
  -t, --token-file  File to read/write reMarkable token                                     [string] [default: "remarkable.token"]

Examples:
  ./index.js -b https://wiki.polkadot.network -h /docs/en/getting-started -s .navItem
  ./index.js -b https://dev.to -s 'a[id*="article-link-"]' -u
```

## Dependencies

- [`website-scraper`](https://github.com/website-scraper/node-website-scraper) Download pages
- [`readability`](https://github.com/mozilla/readability) Extract content from pages
- [`epub-gen`](https://github.com/cyrilis/epub-gen) Convert HTML to EPUB
- [`reMarkable-typescript`](https://github.com/Ogdentrod/reMarkable-typescript) Upload EPUB to reMarkable
