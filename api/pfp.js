const axios = require('axios');

module.exports = async (req, res) => {
  const { username } = req.query;
  
  if (!username) {
    return res.status(400).json({ error: 'Username query parameter is required.' });
  }
  
  const url = `https://scriptblox.com/api/user/info/${username}`;
  
  try {
    const { data } = await axios.get(url);
    
    if (!data.user || !data.user.profilePicture) {
      return res.status(404).json({ error: 'User profile not found or no profile picture available.' });
    }
    
    const pfpPath = data.user.profilePicture;
    const imageUrl = `https://scriptblox.com${pfpPath}`;
    
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    
    const contentType = pfpPath.endsWith('.png') ? 'image/png' : 'image/jpeg';
    
    res.set('Content-Type', contentType);
    return res.status(200).send(imageResponse.data);
  } catch (error) {
    console.error('Error fetching user profile picture:', error.message);
    return res.status(500).json({ error: 'Failed to fetch user profile picture.' });
  }
};
