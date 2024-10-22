const axios = require('axios');

module.exports = async (req, res) => {
    const { username } = req.query;
    const url = `https://scriptblox.com/api/user/info/${username}`;

    try {
        const response = await axios.get(url);
        res.status(200).json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch this user info...' });
    }
};
