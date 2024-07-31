let lastFetch = 0;

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const now = Date.now();
    const rateLimitDelay = 1000; // 1 second

    if (now - lastFetch < rateLimitDelay) {
        return res.status(429).json({ error: 'Too many requests, please try again later.' });
    }

    lastFetch = now;

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
