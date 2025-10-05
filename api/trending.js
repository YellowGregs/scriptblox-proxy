import { promises as fs } from 'fs';
import path from 'path';

const last_trending = new Map();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
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
    return res.status(403).json({ message: 'Access forbidden from this domain.' });
  }

  const delay = 1000;
  const ip_address = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const now = Date.now();
  const last_request = last_trending.get(ip_address) || 0;
  if (now - last_request < delay) {
    return res.status(429).json({ message: 'Too many requests. Please try again later.' });
  }
  last_trending.set(ip_address, now);

  try {
    const fetch_lib = (await import('node-fetch')).default;

    // The trending endpoint accepts "no parameters"
    const api_url = 'https://scriptblox.com/api/script/trending';
    const response = await fetch_lib(api_url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return res.status(response.status).json({
        message: errorData?.message || 'Failed to fetch trending scripts',
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching trending scripts:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
