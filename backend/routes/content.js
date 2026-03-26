const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ai = require('../services/ai');
const pexels = require('../services/pexels');
const db = require('../db');

router.post('/slideshow', auth, async (req, res) => {
  try {
    const { topic, platform, tone } = req.body;
    const slides = await ai.generateSlideshow({ topic, platform, tone });
    const slidesWithImages = await pexels.getPhotosBySlide(slides);
    res.json({ slides: slidesWithImages, topic, platform });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Generation failed' });
  }
});

router.post('/walloftext', auth, async (req, res) => {
  try {
    const { topic, platform, hookStyle } = req.body;
    const content = await ai.generateWallOfText({ topic, platform, hookStyle });
    res.json({ content, topic, platform });
  } catch (e) {
    res.status(500).json({ error: 'Generation failed' });
  }
});

router.post('/videohook', auth, async (req, res) => {
  try {
    const { topic, platform, hookType } = req.body;
    const content = await ai.generateVideoHook({ topic, platform, hookType });
    res.json({ content, topic, platform });
  } catch (e) {
    res.status(500).json({ error: 'Generation failed' });
  }
});

router.post('/greenscreen', auth, async (req, res) => {
  try {
    const { topic, platform, trend } = req.body;
    const content = await ai.generateGreenScreen({ topic, platform, trend });
    // Get background video from Pexels
    const bgQuery = content.match(/BACKGROUND_SEARCH: (.+)/)?.[1] || topic;
    const videos = await pexels.searchVideos(bgQuery, 3);
    res.json({ content, bgVideo: videos[0] || null, topic, platform });
  } catch (e) {
    res.status(500).json({ error: 'Generation failed' });
  }
});

router.post('/blitz', auth, async (req, res) => {
  try {
    const { topic, platforms, count } = req.body;
    const results = await ai.generateBlitz({ topic, platforms, count });
    res.json({ results, topic });
  } catch (e) {
    res.status(500).json({ error: 'Generation failed' });
  }
});

module.exports = router;
