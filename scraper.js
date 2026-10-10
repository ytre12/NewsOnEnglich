import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';

const BASE_URL = 'https://www.newsinlevels.com/';
const DATA_FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), 'data', 'news.json');

const MODE = process.env.SCRAPE_MODE || 'recent';
const RECENT_PAGES = Number(process.env.RECENT_PAGES || 3);
const CONCURRENCY = Number(process.env.CONCURRENCY || (MODE === 'full' ? 4 : 6));
const REQUEST_TIMEOUT_MS = Number(process.env.REQUEST_TIMEOUT_MS || 25000);
const RETRIES = Number(process.env.RETRIES || 3);
const USER_AGENT =
  process.env.USER_AGENT ||
  'Mozilla/5.0 (compatible; NewsInLevelsEducationalScraper/1.0; +https://github.com/)';

const DATE_RE = /\b(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2})\b/;
const LEVEL_URL_RE = /\/products\/(.+)-level-(1|2|3)\/?$/i;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function absoluteUrl(href, baseUrl = BASE_URL) {
  try {
    return new URL(href, baseUrl).href;
  } catch {
    return null;
  }
}

function cleanText(value) {
  return value
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\s*\n\s*/g, ' ')
    .trim();
}

function cleanTitle(title) {
  return title
    .replace(/\s*[–—-]\s*level\s*[123]\s*$/i, '')
    .trim();
}

function slugFromLevelUrl(url) {
  const pathname = new URL(url).pathname.replace(/\/$/, '');
  const match = pathname.match(LEVEL_URL_RE);
  return match ? match[1] : null;
}

function levelFromUrl(url) {
  const pathname = new URL(url).pathname.replace(/\/$/, '');
  const match = pathname.match(LEVEL_URL_RE);
  return match ? Number(match[2]) : null;
}

// Stable numeric ID generated from the article slug.
// The same article always gets the same ID, even after another full scrape.
function numericIdFromSlug(slug) {
  let hash = 2166136261;

  for (let i = 0; i < slug.length; i += 1) {
    hash ^= slug.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function parseDateToTimestamp(dateText) {
  if (!dateText) return 0;
  const match = dateText.match(DATE_RE);
  if (!match) return 0;

  const [, day, month, year, hour, minute] = match;
  return Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute)
  );
}

async function fetchHtml(url) {
  let lastError;

  for (let attempt = 0; attempt <= RETRIES; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          'user-agent': USER_AGENT,
          accept: 'text/html,application/xhtml+xml',
        },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (response.ok) {
        return await response.text();
      }

      const error = new Error(`HTTP ${response.status} for ${url}`);
      const retryable = response.status === 429 || response.status >= 500;

      if (!retryable) throw error;
      throw error;
    } catch (error) {
      lastError = error;

      if (attempt === RETRIES) break;

      const delay = Math.min(8000, 500 * 2 ** attempt + Math.floor(Math.random() * 300));
      console.warn(`Retry ${attempt + 1}/${RETRIES}: ${url} (${error.message})`);
      await sleep(delay);
    }
  }

  throw lastError;
}

async function mapWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;

  async function runWorker() {
    while (true) {
      const index = cursor;
      cursor += 1;

      if (index >= items.length) return;

      try {
        results[index] = await worker(items[index], index);
      } catch (error) {
        console.error(`Worker failed for item ${index}: ${error.message}`);
        results[index] = null;
      }
    }
  }

  const workerCount = Math.min(limit, items.length);
  await Promise.all(Array.from({ length: workerCount }, runWorker));
  return results;
}

function parseListingPage(html, pageUrl) {
  const $ = cheerio.load(html);
  const articles = new Map();

  $('a[href*="/products/"]').each((_, element) => {
    const href = $(element).attr('href');
    if (!href) return;

    const url = absoluteUrl(href, pageUrl);
    if (!url) return;

    const level = levelFromUrl(url);
    const slug = slugFromLevelUrl(url);
    if (!level || !slug) return;

    const current = articles.get(slug) || {
      slug,
      title: cleanTitle($(element).text()),
      urls: {},
    };

    current.urls[String(level)] = url;

    if (!current.title) {
      current.title = cleanTitle($(element).text());
    }

    articles.set(slug, current);
  });

  let nextUrl = null;

  const relNext = $('a[rel="next"]').attr('href');
  if (relNext) {
    nextUrl = absoluteUrl(relNext, pageUrl);
  }

  if (!nextUrl) {
    $('a').each((_, element) => {
      const text = cleanText($(element).text());
      if (text !== '›') return;

      const href = $(element).attr('href');
      const candidate = href ? absoluteUrl(href, pageUrl) : null;
      if (candidate) nextUrl = candidate;
    });
  }

  return {
    articles: [...articles.values()],
    nextUrl,
  };
}

async function collectArticleLinks() {
  const collected = new Map();
  let currentUrl = BASE_URL;
  let pageCount = 0;
  const maxPages = MODE === 'full' ? Number.POSITIVE_INFINITY : RECENT_PAGES;
  const visited = new Set();

  while (currentUrl && pageCount < maxPages) {
    if (visited.has(currentUrl)) break;
    visited.add(currentUrl);

    pageCount += 1;
    console.log(`Listing page ${pageCount}: ${currentUrl}`);

    const html = await fetchHtml(currentUrl);
    const { articles, nextUrl } = parseListingPage(html, currentUrl);

    for (const article of articles) {
      const existing = collected.get(article.slug) || article;
      existing.title = existing.title || article.title;
      existing.urls = { ...existing.urls, ...article.urls };
      collected.set(article.slug, existing);
    }

    console.log(`  found ${articles.length} article entries, ${collected.size} unique stories total`);

    currentUrl = nextUrl;
  }

  return [...collected.values()];
}

function extractDate($) {
  const bodyText = cleanText($('body').text());
  return bodyText.match(DATE_RE)?.[0] || null;
}

function isWordsBlockText(text) {
  return /^Difficult words\s*:/i.test(cleanText(text));
}

// Keep readable HTML formatting from the words block.
// We preserve <strong> and <b>, keep all text, but remove links and unrelated attributes.
function serializeWordsNode($, node) {
  if (node.type === 'text') {
    return node.data || '';
  }

  if (node.type !== 'tag') return '';

  const tag = node.name.toLowerCase();
  const inner = $(node)
    .contents()
    .toArray()
    .map((child) => serializeWordsNode($, child))
    .join('');

  if (tag === 'strong' || tag === 'b') {
    return `<${tag}>${inner}</${tag}>`;
  }

  // Preserve useful inline emphasis too, without attributes.
  if (tag === 'em' || tag === 'i') {
    return `<${tag}>${inner}</${tag}>`;
  }

  if (tag === 'br') return '\n';

  return inner;
}

function cleanWordsHtml(html) {
  if (!html) return null;

  const $ = cheerio.load(`<div id="words-root">${html}</div>`, null, false);
  const root = $('#words-root');
  let result = serializeWordsNode($, root.get(0));

  result = result
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .trim();

  // Store only the actual list, not the site label itself.
  result = result.replace(/^Difficult words\s*:\s*/i, '').trim();

  return result || null;
}

function extractWords($) {
  let words = null;

  // The current site renders the dictionary as a paragraph beginning with "Difficult words:".
  $('p').each((_, element) => {
    if (words) return;

    const text = cleanText($(element).text());
    if (!isWordsBlockText(text)) return;

    words = cleanWordsHtml($(element).html());
  });

  // Fallback for a future layout where the block is not a <p>.
  if (!words) {
    $('body *').each((_, element) => {
      if (words) return;

      const text = cleanText($(element).text());
      if (!isWordsBlockText(text)) return;
      if ($(element).children().length > 0 && $(element).find('p').length > 0) return;

      words = cleanWordsHtml($(element).html());
    });
  }

  return words;
}

function extractContent($) {
  const h1 = $('h1').first();
  if (!h1.length) {
    throw new Error('No H1 found');
  }

  const content = [];
  let afterTitle = false;
  let stopped = false;

  $('h1, h2, h3, h4, h5, p').each((_, element) => {
    if (stopped) return;

    const tag = element.tagName.toLowerCase();
    const text = cleanText($(element).text());
    if (!text) return;

    if (!afterTitle) {
      if (element === h1.get(0)) afterTitle = true;
      return;
    }

    if (DATE_RE.test(text)) return;

    if (isWordsBlockText(text)) {
      stopped = true;
      return;
    }

    if (/^You can watch (?:the )?(?:original )?video/i.test(text)) {
      stopped = true;
      return;
    }

    if (tag !== 'p') {
      if (
        /^(?:learn|test|reading|listening|writing|speaking|how to improve)/i.test(text) ||
        text.endsWith('?')
      ) {
        stopped = true;
      }
      return;
    }

    content.push(text);
  });

  return content.join('\n\n').trim();
}

async function scrapeLevel(url, level, articleTitle) {
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);

  const pageTitle = cleanText($('h2').first().text());
  const rawTitle = cleanText(articleTitle || pageTitle || $('h1').first().text());
  const title = cleanTitle(rawTitle);
  const date = extractDate($);
  const content = extractContent($);
  const words = extractWords($);

  if (!title) throw new Error(`No title found for level ${level}: ${url}`);
  if (!content) throw new Error(`No article content found for level ${level}: ${url}`);
  if (!words) throw new Error(`No words section found for level ${level}: ${url}`);

  return {
    title,
    date,
    content,
    words,
    url,
  };
}

async function readExistingData() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

function normalizeExistingItem(item) {
  // Migrate the previous slug/string ID format to the new stable numeric ID format.
  const sourceSlug =
    typeof item.slug === 'string'
      ? item.slug
      : typeof item.id === 'string'
        ? item.id
        : null;

  const migratedId =
    typeof item.id === 'number'
      ? item.id
      : sourceSlug
        ? numericIdFromSlug(sourceSlug)
        : item.id;

  const normalizedLevels = {};
  for (const [level, value] of Object.entries(item.levels || {})) {
    if (!value || typeof value !== 'object') continue;

    normalizedLevels[level] = {
      title: cleanTitle(value.title || ''),
      date: value.date || null,
      content: value.content || '',
      words: value.words || null,
      url: value.url || null,
    };
  }

  return {
    ...item,
    id: migratedId,
    title: cleanTitle(item.title || ''),
    date: item.date || null,
    levels: normalizedLevels,
  };
}

function mergeArticle(existing, scraped) {
  if (!existing) return scraped;

  return {
    ...existing,
    ...scraped,
    levels: {
      ...(existing.levels || {}),
      ...(scraped.levels || {}),
    },
  };
}

async function scrapeArticle(article) {
  const urls = {
    1: article.urls['1'] || `${BASE_URL}products/${article.slug}-level-1/`,
    2: article.urls['2'] || `${BASE_URL}products/${article.slug}-level-2/`,
    3: article.urls['3'] || `${BASE_URL}products/${article.slug}-level-3/`,
  };

  const levels = {};

  for (const level of [1, 2, 3]) {
    try {
      console.log(`  ${article.slug} -> level ${level}`);
      levels[String(level)] = await scrapeLevel(urls[level], level, article.title);
      await sleep(120);
    } catch (error) {
      console.error(`  Failed level ${level} for ${article.slug}: ${error.message}`);
    }
  }

  // Level 1 is shown on every news card, so do not publish stories without it.
  if (!levels['1']?.words) return null;

  const firstAvailable = levels['1'] || levels['2'] || levels['3'];

  return {
    id: numericIdFromSlug(article.slug),
    title: cleanTitle(firstAvailable.title || article.title),
    date: firstAvailable.date || null,
    levels,
    scrapedAt: new Date().toISOString(),
  };
}

async function main() {
  console.log(`Mode: ${MODE}`);
  console.log(`Concurrency: ${CONCURRENCY}`);

  if (!['recent', 'full'].includes(MODE)) {
    throw new Error(`SCRAPE_MODE must be "recent" or "full", got: ${MODE}`);
  }

  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });

  const existing = (await readExistingData()).map(normalizeExistingItem);
  const existingById = new Map(existing.map((item) => [item.id, item]));

  const articleLinks = await collectArticleLinks();
  console.log(`Stories to fetch: ${articleLinks.length}`);

  const scraped = await mapWithConcurrency(articleLinks, CONCURRENCY, scrapeArticle);

  let successCount = 0;
  for (let i = 0; i < scraped.length; i += 1) {
    const item = scraped[i];
    if (!item) continue;

    const previous = existingById.get(item.id);
    existingById.set(item.id, mergeArticle(previous, item));
    successCount += 1;
  }

  const output = [...existingById.values()]
    .filter((item) => typeof item.levels?.['1']?.words === 'string' && item.levels['1'].words.trim())
    .sort((a, b) => {
    return parseDateToTimestamp(b.date) - parseDateToTimestamp(a.date);
  });

  await fs.writeFile(DATA_FILE, JSON.stringify(output, null, 2) + '\n', 'utf8');

  console.log(`Successful story fetches: ${successCount}`);
  console.log(`JSON records: ${output.length}`);
  console.log(`Written: ${DATA_FILE}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
