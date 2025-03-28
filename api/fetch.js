import { promises as fs } from 'fs';
import path from 'path';

let last_fetch = 0;
const blocked_log_times = new Map(); 
const LOG_INTERVAL = 15 * 60 * 1000; // 15 minutes

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const blacklist_path = path.join(process.cwd(), 'api', 'blacklist.json');

  let blacklisted_domains = [];
  try {
    const blacklist_data = await fs.readFile(blacklist_path, 'utf-8');
    blacklisted_domains = JSON.parse(blacklist_data).blacklisted_domains || [];
  } catch (error) {
    console.error('Error loading blacklist:', error);
  }

  const req_origin = req.headers.origin || req.headers.referer || "";

  if (blacklisted_domains.some(domain => req_origin.includes(domain))) {
    const last_log_time = blocked_log_times.get(req_origin) || 0;
    const now = Date.now();

    if (now - last_log_time > LOG_INTERVAL) {
      console.warn(`Blocked request from blacklisted domain: ${req_origin}`);
      blocked_log_times.set(req_origin, now);
    }

    return res.status(403).json({ error: 'Access forbidden from this domain.' });
  }

  const now = Date.now();
  const rate_limit_delay = 1000; // 1 second

  if (now - last_fetch < rate_limit_delay) {
    return res.status(429).json({ error: 'Too many requests, please try again later.' });
  }

  last_fetch = now;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const fetch_lib = (await import('node-fetch')).default;
    const { page, filters } = req.query;
    const params = new URLSearchParams();

    if (page) {
      params.set('page', page);
    }

    // the legacy filters to new the parameters.
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

    const base_url = use_trending_endpoint 
      ? 'https://scriptblox.com/api/script/trending' 
      : 'https://scriptblox.com/api/script/fetch';
    const api_url = `${base_url}?${params.toString()}`;

    const response = await fetch_lib(api_url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    if (!data.result || !data.result.scripts) {
      return res.status(500).json({ error: 'Unexpected API response structure' });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}
