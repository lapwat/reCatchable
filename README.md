# Website to ebook

Turn a website into a book.

## Install

```sh
git clone https://gitlab.com/lapwat/website2ebook.git
cd website2ebook
yarn
```

## Usage

```sh
Usage: ./index.js [options]

Options:
      --help      Show help                                                                                              [boolean]
      --version   Show version number                                                                                    [boolean]
  -b, --base-url  Base url of the website, without trailing slash                                              [string] [required]
  -s, --selector  HTML selector for links on the HOME page to build the table of content                       [string] [required]
  -h, --home      Path  of the website where the table of content is located, with leading slash           [string] [default: "/"]
  -o, --out-dir   Folder where final.html will be downloaded                                             [string] [default: "out"]

Examples:
  ./index.js -b https://wiki.polkadot.network -h /docs/en/getting-started -s .navItem
  ./index.js -b https://dev.to -s 'a[id*="article-link-"]'
```

Output directory should not exist.

## Use calibre to convert the resulting HTML to epub

In Calibre,

Click **Add books** and select `out/final.html`.

Click **Convert books**, go to **Structure Detection** tab and set _Detect Chapters_ and _Insert page breaks_ value to `//h:h1[re:test(@class, "chapter", "i")]`.

Click **Ok**.

## Todo

- [ ] Trim urls
