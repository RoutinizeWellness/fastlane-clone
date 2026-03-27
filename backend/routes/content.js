const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ai = require('../services/ai');
const pexels = require('../services/pexels');
const db = require('../db');

// Helper: fetch the user's brand config for personalized AI generation
function getBrandContext(userId) {
  try {
    const row = db.prepare('SELECT brand_name, industry, description, tone, pillars, audience FROM brand_config WHERE user_id = ?').get(userId);
    return row || null;
  } catch {
    return null;
  }
}

router.post('/slideshow', auth, async (req, res) => {
  try {
    const { topic, platform, tone } = req.body;
    const brandContext = getBrandContext(req.user.id);
    const slides = await ai.generateSlideshow({ topic, platform, tone, brandContext });
    const slidesWithImages = await pexels.getPhotosBySlide(slides);
    res.json({ slides: slidesWithImages, topic, platform });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Generation failed' });
  }
});

router.post('/wall-of-text', auth, async (req, res) => {
  try {
    const { topic, platform, hookStyle } = req.body;
    const brandContext = getBrandContext(req.user.id);
    const content = await ai.generateWallOfText({ topic, platform, hookStyle, brandContext });
    res.json({ content, topic, platform });
  } catch (e) {
    res.status(500).json({ error: 'Generation failed' });
  }
});

router.post('/video-hook-and-demo', auth, async (req, res) => {
  try {
    const { topic, platform, hookType } = req.body;
    const brandContext = getBrandContext(req.user.id);
    const content = await ai.generateVideoHook({ topic, platform, hookType, brandContext });
    res.json({ content, topic, platform });
  } catch (e) {
    res.status(500).json({ error: 'Generation failed' });
  }
});

router.post('/green-screen-meme', auth, async (req, res) => {
  try {
    const { topic, platform, trend } = req.body;
    const brandContext = getBrandContext(req.user.id);
    const content = await ai.generateGreenScreen({ topic, platform, trend, brandContext });
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
    const brandContext = getBrandContext(req.user.id);
    const results = await ai.generateBlitz({ topic, platforms, count, brandContext });
    res.json({ results, topic });
  } catch (e) {
    res.status(500).json({ error: 'Generation failed' });
  }
});

module.exports = router;
