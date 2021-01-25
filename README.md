# Website to ebook

Turn a website into a book.

## Install

```sh
git clone https://gitlab.com/lapwat/website2ebook.git
cd website2ebook
yarn
```

## Usage

Run this command.

```sh
node index.js BASE_URL HOME_PATH NAVITEM_SELECTOR OUT_DIR
# i.e. node index.js https://wiki.polkadot.network /docs/en/getting-started .navItem out
# i.e. node index.js https://dev.to / 'a[id*="article-link-"]' out
```

- `BASE_URL` Base url of the website, without trailing slash
- `HOME_PATH` Path  of the website where the table of content is located, with leading slash
- `NAVITEM_SELECTOR` Selector for links on the HOME_PAGE to build the table of content
- `OUT_DIR` Where the downloaded sources will be located

Then import $OUT_DIR/final.html into Calibre by clicking **Add books**.

Click **Convert books**, go to **Structure Detection** tab and set _Detect Chapters_ and _Insert page breaks_ value to `//h:h1[re:test(@class, "chapter", "i")]`.

## Todo

- [ ] Default values for arguments
- [ ] Named arguments
- [ ] Trim urls
