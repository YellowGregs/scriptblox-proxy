let lastSearch = 0;

export default async function Handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed. Use GET only.' });
    }

    const { q, scriptName, mode, ...params } = req.query;

    if (!q) {
        return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const delay = 1000; // 1-second delay
    const now = Date.now();
    if (now - lastSearch < delay) {
        return res.status(429).json({ error: 'Too many requests. Please wait 1 second before retrying.' });
    }
    lastSearch = now;

    try {
        const fetch = (await import('node-fetch')).default;

        const queryParams = new URLSearchParams({ q, ...params });
        
        if (scriptName) queryParams.append('scriptName', scriptName);
        if (mode) queryParams.append('mode', mode);

        // const apiUrl = `https://scriptblox.com/api/script/search?q=${encodeURIComponent(q)}&${queryParams.toString()}`;
        const apiUrl = `https://scriptblox.com/api/script/search?${queryParams.toString()}`;

        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`Scriptblox API error: ${response.status}`);
        }

        const data = await response.json();

        return res.status(200).json({
            success: true,
            result: data, // Passes the API's result directly
        });
    } catch (error) {
        console.error('API Error:', error.message);
        return res.status(500).json({ error: 'Internal Server Error: Unable to fetch scripts.' });
    }
}
