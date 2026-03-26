const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const tiktok = require('../services/tiktok');

/**
 * GET /api/tiktok/trends
 * Get all TikTok trends (hashtags + sounds + videos + creators)
 */
router.get('/trends', auth, async (req, res) => {
  try {
    const {
      countryCode = 'US',
      timeRange = '7',
      resultsPerPage = 30,
    } = req.query;

    const items = await tiktok.scrapeAllTrends({
      countryCode,
      timeRange: String(timeRange),
      resultsPerPage: parseInt(resultsPerPage),
    });

    res.json({ success: true, data: items, count: items.length });
  } catch (err) {
    console.error('TikTok trends error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/tiktok/hashtags
 * Get trending TikTok hashtags
 */
router.get('/hashtags', auth, async (req, res) => {
  try {
    const {
      countryCode = 'US',
      timeRange = '7',
      resultsPerPage = 100,
    } = req.query;

    const items = await tiktok.scrapeTrendingHashtags({
      countryCode,
      timeRange: String(timeRange),
      resultsPerPage: parseInt(resultsPerPage),
    });

    res.json({ success: true, data: items, count: items.length });
  } catch (err) {
    console.error('TikTok hashtags error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/tiktok/sounds
 * Get trending TikTok sounds
 */
router.get('/sounds', auth, async (req, res) => {
  try {
    const {
      countryCode = 'US',
      timeRange = '7',
      resultsPerPage = 100,
    } = req.query;

    const items = await tiktok.scrapeTrendingSounds({
      countryCode,
      timeRange: String(timeRange),
      resultsPerPage: parseInt(resultsPerPage),
    });

    res.json({ success: true, data: items, count: items.length });
  } catch (err) {
    console.error('TikTok sounds error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/tiktok/videos
 * Get trending TikTok videos
 */
router.get('/videos', auth, async (req, res) => {
  try {
    const {
      countryCode = 'US',
      timeRange = '7',
      resultsPerPage = 100,
      sortBy = 'vv',
    } = req.query;

    const items = await tiktok.scrapeTrendingVideos({
      countryCode,
      timeRange: String(timeRange),
      resultsPerPage: parseInt(resultsPerPage),
      sortBy,
    });

    res.json({ success: true, data: items, count: items.length });
  } catch (err) {
    console.error('TikTok videos error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/tiktok/creators
 * Get trending TikTok creators
 */
router.get('/creators', auth, async (req, res) => {
  try {
    const {
      countryCode = 'US',
      timeRange = '7',
      resultsPerPage = 100,
      sortBy = 'follower',
    } = req.query;

    const items = await tiktok.scrapeTrendingCreators({
      countryCode,
      timeRange: String(timeRange),
      resultsPerPage: parseInt(resultsPerPage),
      sortBy,
    });

    res.json({ success: true, data: items, count: items.length });
  } catch (err) {
    console.error('TikTok creators error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
