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
  -u, --url         Home page url                                                [string] [required]
  -s, --selector    Table of content HTML selector                                          [string]
  -l, --limit       Limit the number of pages downloaded                                    [number]
  -d, --delay       Delay between each page download.                       [number] [default: null]
  -n, --name        Book name, defaults to Home page title                                  [string]
  -a, --author      Author                                      [string] [default: "Unknown author"]
      --upload      Upload book to reMarkable                             [boolean] [default: false]
  -t, --token-file  File to read/write reMarkable token       [string] [default: "remarkable.token"]

Examples:
  ./index.js -u https://www.halfbakedharvest.com/category/recipes -s 'h2 > a'
  ./index.js -u https://dev.to/ -s 'a[id*="article-link-"]' --upload
  ./index.js -u https://vitalik.ca/ -s '.post-link' -l 3 -d 5
```

## Dependencies

- [`readability`](https://github.com/mozilla/readability) Extract content from pages
- [`epub-gen`](https://github.com/cyrilis/epub-gen) Convert HTML to EPUB
- [`reMarkable-typescript`](https://github.com/Ogdentrod/reMarkable-typescript) Upload EPUB to reMarkable

## Todo

- [ ] Export to MOBI
- [ ] Send to Kindle
