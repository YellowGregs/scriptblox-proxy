let lastSearch = 0;

export default async function Handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { q, scriptName, mode, ...params } = req.query;

    if (!q) {
        return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const delay = 1000; // 1 second
    const now = Date.now();
    if (now - lastSearch < delay) {
        return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    lastSearch = now;

    try {
        const fetch = (await import('node-fetch')).default;

        const queryParams = new URLSearchParams(params);
        
        if (scriptName) queryParams.append('script name', scriptName);
        if (mode) queryParams.append('mode', mode);

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
