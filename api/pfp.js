const axios = require('axios');

module.exports = async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: 'Missing username query parameter' });
  }

  const url = `https://scriptblox.com/api/user/info/${username}`;

  try {
    const userResponse = await axios.get(url);
    const userData = userResponse.data?.user;

    if (!userData || !userData.profilePicture) {
      return res.status(404).json({ error: 'User or profile picture not found' });
    }

    const profilePicturePath = userData.profilePicture;
    const imageUrl = `https://scriptblox.com${profilePicturePath}`;

    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });

    let contentType = imageResponse.headers['content-type'];
    if (!contentType) {
      contentType = profilePicturePath.endsWith('.png') ? 'image/png' : 'image/jpeg';
    }

    res.set('Content-Type', contentType);
    res.status(200).send(imageResponse.data);
  } catch (error) {
    console.error('Error fetching user profile picture:', error.message);
    res.status(500).json({ error: 'Failed to fetch user profile picture' });
  }
};
