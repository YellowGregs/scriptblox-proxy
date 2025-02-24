import { promises as fs } from 'fs';
import path from 'path';

let lastfetch = 0;
const blocked_log_times = new Map(); 
const LOG_INTERVAL = 15 * 60 * 1000; // 15 minutes

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const bpath = path.join(process.cwd(), 'api', 'blacklist.json');

    let blacklist_domain = [];
    try {
        const blacklistData = await fs.readFile(bpath, 'utf-8');
        blacklist_domain = JSON.parse(blacklistData).blacklisted_domains || [];
    } catch (error) {
        console.error('Error loading blacklist:', error);
    }

    const origin = req.headers.origin || req.headers.referer || "";

    if (blacklist_domain.some(domain => origin.includes(domain))) {
        const lastLogTime = blocked_log_times.get(origin) || 0;
        const now = Date.now();

        if (now - lastLogTime > LOG_INTERVAL) {
            console.warn(`Blocked request from blacklisted domain: ${origin}`);
            blocked_log_times.set(origin, now);
        }

        return res.status(403).json({ error: 'Access forbidden from this domain.' });
    }

    const now = Date.now();
    const rate_limit_delay = 1000; // 1 second

    if (now - lastfetch < rate_limit_delay) {
        return res.status(429).json({ error: 'Too many requests, please try again later.' });
    }

    lastfetch = now;

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const fetch = (await import('node-fetch')).default;
        const page = req.query.page || 1;
        const response = await fetch(`https://scriptblox.com/api/script/fetch?page=${page}`);

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
