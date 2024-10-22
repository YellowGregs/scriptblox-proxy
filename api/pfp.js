const axios = require('axios');

module.exports = async (req, res) => {
    const { username } = req.query;
    const url = `https://scriptblox.com/api/user/info/${username}`;

    try {
        const response = await axios.get(url);
        const pfp = response.data.user.profilePicture;
        const imageUrl = `https://scriptblox.com${pfp}`;

        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });

        // just cheking :)
        const contentType = pfp.endsWith('.png') ? 'image/png' : 'image/jpeg';

        res.set('Content-Type', contentType);
        res.send(imageResponse.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch this user pfp image' });
    }
};