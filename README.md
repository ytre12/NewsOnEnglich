# News in Levels scraper

Node.js scraper for `https://www.newsinlevels.com/`.

The scraper groups Level 1, Level 2 and Level 3 pages into one JSON record per story and writes the result to `data/news.json`.

## JSON shape

```json
[
  {
    "id": "who-does-basmati-rice-belong-to",
    "title": "Who does Basmati rice belong to?",
    "date": "02-10-2026 15:00",
    "levels": {
      "1": {
        "title": "Who does Basmati rice belong to?",
        "date": "02-10-2026 15:00",
        "content": "...",
        "url": "https://www.newsinlevels.com/products/who-does-basmati-rice-belong-to-level-1/"
      },
      "2": {
        "title": "Who does Basmati rice belong to?",
        "date": "02-10-2026 15:00",
        "content": "...",
        "url": "https://www.newsinlevels.com/products/who-does-basmati-rice-belong-to-level-2/"
      },
      "3": {
        "title": "Who does Basmati rice belong to?",
        "date": "02-10-2026 15:00",
        "content": "...",
        "url": "https://www.newsinlevels.com/products/who-does-basmati-rice-belong-to-level-3/"
      }
    },
    "scrapedAt": "2026-10-02T00:00:00.000Z"
  }
]
```

## Local run

```bash
npm install
npm run scrape
```

Recent mode is the default and scrapes the first 3 listing pages:

```bash
SCRAPE_MODE=recent RECENT_PAGES=3 node scraper.js
```

For the whole archive:

```bash
SCRAPE_MODE=full node scraper.js
```

The scheduled GitHub Action uses `recent`, while `workflow_dispatch` lets you choose `recent` or `full` manually.
