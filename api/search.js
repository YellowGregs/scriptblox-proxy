import { promises as fs } from 'fs';
import path from 'path';

const lastSearches = new Map();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const blacklistPath = path.join(process.cwd(), 'api', 'blacklist.json');
  let blacklistedDomains = [];
  try {
    const blacklistData = await fs.readFile(blacklistPath, 'utf-8');
    blacklistedDomains = JSON.parse(blacklistData).blacklisted_domains || [];
  } catch (error) {
    console.error('Error loading blacklist:', error);
  }

  const origin = req.headers.origin || req.headers.referer || "";
  if (blacklistedDomains.some(domain => origin.includes(domain))) {
    console.warn(`Blocked request from blacklisted domain: ${origin}`);
    return res.status(403).json({ error: 'Access forbidden from this domain.' });
  }

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q, page, scriptName, mode, ...otherParams } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  const delay = 1000;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const now = Date.now();
  const lastSearch = lastSearches.get(ip) || 0;
  if (now - lastSearch < delay) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }
  lastSearches.set(ip, now);

  try {
    const fetch = (await import('node-fetch')).default;
    const queryParams = new URLSearchParams(otherParams);

    if (page) {
      queryParams.set('page', page);
    }
    if (scriptName) queryParams.set('script name', scriptName);
    if (mode) queryParams.set('mode', mode);

    const apiUrl = `https://scriptblox.com/api/script/search?q=${encodeURIComponent(q)}&${queryParams.toString()}`;
    
    const response = await fetch(apiUrl);
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
