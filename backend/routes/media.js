const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const pexels = require('../services/pexels');
const axios = require('axios');

router.get('/trending', auth, async (req, res) => {
  const videos = await pexels.getTrendingVideos();
  res.json({ videos });
});

router.get('/ugc-avatars', auth, async (req, res) => {
  try {
    const [usersRes, videos] = await Promise.all([
      axios.get('https://randomuser.me/api/?results=12&nat=us,gb,ca,au&inc=name,picture,email'),
      pexels.searchVideos('content creator vlog talking camera selfie', 12)
    ]);
    const niches = ['Lifestyle', 'Tech', 'Finance', 'Fitness', 'Food', 'Travel', 'Fashion', 'Gaming', 'Beauty', 'Business', 'Motivation', 'Comedy'];
    const avatars = usersRes.data.results.map((u, i) => {
      const vid = videos[i % videos.length];
      return {
        id: i + 1,
        name: `${u.name.first} ${u.name.last}`,
        photo: u.picture.large,
        niche: niches[i],
        followers: `${(Math.random() * 900 + 100).toFixed(0)}K`,
        engagement: `${(Math.random() * 8 + 2).toFixed(1)}%`,
        demoVideo: vid?.url || null,         // URL .mp4 real
        demoThumb: vid?.thumbnail || null    // thumbnail preview
      };
    });
    res.json({ avatars });
  } catch (e) {
    res.json({ avatars: getMockAvatars() });
  }
});

router.get('/stock-images', auth, async (req, res) => {
  const { query = 'business success', n = 6 } = req.query;
  const photos = await pexels.searchPhotos(query, parseInt(n));
  res.json({ photos });
});

router.get('/stock-videos', auth, async (req, res) => {
  const { query = 'social media content', n = 6 } = req.query;
  const videos = await pexels.searchVideos(query, parseInt(n));
  res.json({ videos });
});

function getMockAvatars() {
  const niches = ['Lifestyle', 'Tech', 'Finance', 'Fitness', 'Food', 'Travel', 'Fashion', 'Gaming', 'Beauty', 'Business', 'Motivation', 'Comedy'];
  return niches.map((niche, i) => ({
    id: i + 1,
    name: ['Alex Rivera', 'Sam Chen', 'Jordan Kim', 'Morgan Lee', 'Taylor Swift', 'Casey Jones', 'Riley Park', 'Drew Smith', 'Avery Brown', 'Blake Davis', 'Quinn Wilson', 'Sage Martin'][i],
    photo: `https://i.pravatar.cc/300?img=${i + 10}`,
    niche,
    followers: `${(Math.random() * 900 + 100).toFixed(0)}K`,
    engagement: `${(Math.random() * 8 + 2).toFixed(1)}%`,
    demoVideo: null,
    demoThumb: null
  }));
}

module.exports = router;
