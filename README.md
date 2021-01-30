# Site2book

Turn a site into a book.

Website (HTML) to Ebook (EPUB). Uses Mozilla Reader View library to extract the pages content.

## Install

```sh
git clone https://gitlab.com/lapwat/website2ebook.git
cd website2ebook
yarn
# or npm install
```

## Usage

```sh
❯ ./index.js --help
Usage: ./index.js [options]

Options:
      --help      Show help                                                                                              [boolean]
      --version   Show version number                                                                                    [boolean]
  -b, --base-url  Base url of the website, without trailing slash                                              [string] [required]
  -s, --selector  HTML selector for links on the HOME page to build the table of content                       [string] [required]
  -h, --home      Path to the page containing the table of content, with leading slash                     [string] [default: "/"]
  -o, --out       Epub filename, defaults to Home page title                                                              [string]

Examples:
  ./index.js -b https://wiki.polkadot.network -h /docs/en/getting-started -s .navItem
  ./index.js -b https://dev.to -s 'a[id*="article-link-"]'
```

## Todo

- [ ] Trim urls
