import { promises as fs } from 'fs';
import path from 'path';

const last_searches = new Map();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const blacklist_path = path.join(process.cwd(), 'api', 'blacklist.json');
  let blacklisted_domains = [];
  try {
    const blacklist_raw = await fs.readFile(blacklist_path, 'utf-8');
    blacklisted_domains = JSON.parse(blacklist_raw).blacklisted_domains || [];
  } catch (error) {
    console.error('Error loading blacklist:', error);
  }

  const req_origin = req.headers.origin || req.headers.referer || "";
  if (blacklisted_domains.some(domain => req_origin.includes(domain))) {
    console.warn(`Blocked request from blacklisted domain: ${req_origin}`);
    return res.status(403).json({ error: 'Access forbidden from this domain.' });
  }

  const delay = 1000;
  const ip_address = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const now = Date.now();
  const last_search = last_searches.get(ip_address) || 0;
  if (now - last_search < delay) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }
  last_searches.set(ip_address, now);

  // --- Parse query parameters ---
  const {
    q,                 // required
    page,
    max,
    mode,              // free | paid
    patched,           // 1 | 0
    key,               // 1 | 0
    universal,         // 1 | 0
    verified,          // 1 | 0
    sortBy,            // views | likeCount | createdAt | updatedAt | dislikeCount | accuracy
    order,             // asc | desc
    strict,            // true | false
    filters,           // legacy
    ...other_params
  } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Query parameter "q" is required.' });
  }

  try {
    const fetch_lib = (await import('node-fetch')).default;
    const params = new URLSearchParams();

    params.set('q', q);

    if (page) params.set('page', page);
    if (max) params.set('max', max);
    if (mode) params.set('mode', mode);
    if (patched) params.set('patched', patched);
    if (key) params.set('key', key);
    if (universal) params.set('universal', universal);
    if (verified) params.set('verified', verified);
    if (sortBy) params.set('sortBy', sortBy);
    if (order) params.set('order', order);
    if (strict) params.set('strict', strict);

    // --- Handle legacy `filters` alias (for compatibility) ---
    let use_trending_endpoint = false;
    if (filters) {
      switch (filters.toLowerCase()) {
        case 'free':
          params.set('mode', 'free');
          break;
        case 'paid':
          params.set('mode', 'paid');
          break;
        case 'verified':
          params.set('verified', '1');
          break;
        case 'unverified':
          params.set('verified', '0');
          break;
        case 'newest':
          params.set('sortBy', 'createdAt');
          params.set('order', 'desc');
          break;
        case 'oldest':
          params.set('sortBy', 'createdAt');
          params.set('order', 'asc');
          break;
        case 'mostviewed':
          params.set('sortBy', 'views');
          params.set('order', 'desc');
          break;
        case 'leastviewed':
          params.set('sortBy', 'views');
          params.set('order', 'asc');
          break;
        case 'hot':
          use_trending_endpoint = true;
          break;
        default:
          break;
      }
    }

    for (const [key, value] of Object.entries(other_params)) {
      if (!params.has(key)) {
        params.set(key, value);
      }
    }

    const base_url = use_trending_endpoint
      ? 'https://scriptblox.com/api/script/trending'
      : 'https://scriptblox.com/api/script/search';

    const api_url = `${base_url}?${params.toString()}`;

    const response = await fetch_lib(api_url);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error fetching data.' });
  }
}
