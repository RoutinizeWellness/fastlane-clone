const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const unsplash = require('../services/unsplash');

/**
 * GET /api/unsplash/search?query=...&page=1&perPage=20&orientation=landscape
 */
router.get('/search', auth, async (req, res) => {
  try {
    const { query, page = 1, perPage = 20, orientation, color } = req.query;
    if (!query) return res.status(400).json({ success: false, error: 'query is required' });

    const data = await unsplash.searchPhotos({
      query,
      page: parseInt(page),
      perPage: parseInt(perPage),
      orientation: orientation || null,
      color: color || null,
    });

    res.json({ success: true, ...data });
  } catch (err) {
    console.error('Unsplash search error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/unsplash/random?query=...&orientation=...&count=1
 */
router.get('/random', auth, async (req, res) => {
  try {
    const { query, orientation, count = 1 } = req.query;
    const data = await unsplash.getRandomPhoto({
      query: query || null,
      orientation: orientation || null,
      count: parseInt(count),
    });

    res.json({ success: true, data });
  } catch (err) {
    console.error('Unsplash random error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/unsplash/photo/:id
 */
router.get('/photo/:id', auth, async (req, res) => {
  try {
    const data = await unsplash.getPhoto(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    console.error('Unsplash photo error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/unsplash/editorial?page=1&perPage=20&orderBy=popular
 */
router.get('/editorial', auth, async (req, res) => {
  try {
    const { page = 1, perPage = 20, orderBy = 'popular' } = req.query;
    const data = await unsplash.listEditorialPhotos({
      page: parseInt(page),
      perPage: parseInt(perPage),
      orderBy,
    });

    res.json({ success: true, data });
  } catch (err) {
    console.error('Unsplash editorial error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/unsplash/topics?page=1&perPage=10&orderBy=featured
 */
router.get('/topics', auth, async (req, res) => {
  try {
    const { page = 1, perPage = 10, orderBy = 'featured' } = req.query;
    const data = await unsplash.listTopics({ page: parseInt(page), perPage: parseInt(perPage), orderBy });
    res.json({ success: true, data });
  } catch (err) {
    console.error('Unsplash topics error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/unsplash/topics/:slug/photos?page=1&perPage=20&orientation=landscape
 */
router.get('/topics/:slug/photos', auth, async (req, res) => {
  try {
    const { page = 1, perPage = 20, orientation } = req.query;
    const data = await unsplash.getTopicPhotos(req.params.slug, {
      page: parseInt(page),
      perPage: parseInt(perPage),
      orientation: orientation || null,
    });

    res.json({ success: true, data });
  } catch (err) {
    console.error('Unsplash topic photos error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
