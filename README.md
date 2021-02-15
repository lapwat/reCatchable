# reCatchable

Turn a site into a book. Upload it to your reMarkable.

## Install

```sh
❯ git clone https://gitlab.com/lapwat/reCatchable.git
❯ cd reCatchable
❯ yarn # or npm install
```

## Usage

```sh
❯ ./index.js --help
Usage: ./index.js [options]

Options:
      --help        Show help                                                              [boolean]
      --version     Show version number                                                    [boolean]
  -h, --home        Home page url                                                [string] [required]
      --home-html   Html of the home page                                                   [string]
  -s, --selector    Table of content HTML selector                                          [string]
  -l, --limit       Limit the number of pages downloaded                                    [number]
  -n, --title       Title, defaults to Home page title                                      [string]
  -a, --author      Author                                             [string] [default: "Unknown"]
  -u, --upload      Upload book to reMarkable                             [boolean] [default: false]
  -t, --token-file  File to read/write reMarkable token       [string] [default: "remarkable.token"]

Examples:
  ./index.js -h https://www.halfbakedharvest.com/category/recipes -s .recipe-block
  ./index.js -h https://wiki.polkadot.network/docs/en/getting-started -s .navItem
  ./index.js -h https://dev.to -s 'a[id*="article-link-"]' -u
```

`--home-html` On some websites, the table of content is not present in the original HTML and is loaded later with JavaScript asynchronous queries. You can use this option to specify an HTML file for the Home page. 

## Dependencies

- [`website-scraper`](https://github.com/website-scraper/node-website-scraper) Download pages
- [`readability`](https://github.com/mozilla/readability) Extract content from pages
- [`epub-gen`](https://github.com/cyrilis/epub-gen) Convert HTML to EPUB
- [`reMarkable-typescript`](https://github.com/Ogdentrod/reMarkable-typescript) Upload EPUB to reMarkable

## Todo

- [ ] Exclude images option
