# Website to ebook

Turn a website into a book.

## Usage

```sh
node index.js BASE_URL HOME_PATH NAVITEM_SELECTOR OUT_DIR
# i.e. node index.js https://wiki.polkadot.network /docs/en/getting-started .navItem out
```

- `BASE_URL` Base url of the website, without trailing slash
- `HOME_PATH` Path  of the website where the table of content is located, with leading slash
- `NAVITEM_SELECTOR` Selector for links on the HOME_PAGE to build the table of content
- `OUT_DIR` Where the downloaded sources will be located

## Todo

- [] Add title argument
- [] Default values for arguments
- [] Named arguments
- [] Trim urls
- [] Use website title for ebook title
- [] Use subpages titles for chapters titles 
- [] Better README
