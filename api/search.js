import { promises as fs } from 'fs';
import path from 'path';

const last_searches = new Map();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q, page, scriptName, mode, filters, ...other_params } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  const delay = 1000;
  const ip_address = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const now = Date.now();
  const last_search = last_searches.get(ip_address) || 0;
  if (now - last_search < delay) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }
  last_searches.set(ip_address, now);

  try {
    const fetch_lib = (await import('node-fetch')).default;
    const params = new URLSearchParams();

    // Required query.
    params.set('q', q);
    if (page) {
      params.set('page', page);
    }
    if (scriptName) {
      params.set('scriptName', scriptName);
    }

    // legacy filters.
    let use_trending_endpoint = false;
    if (filters) {
      switch (filters) {
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

    if (mode) {
      params.set('mode', mode);
    }

    for (const [key, value] of Object.entries(other_params)) {
      params.set(key, value);
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
    res.status(500).json({ error: 'Error fetching data' });
  }
}
