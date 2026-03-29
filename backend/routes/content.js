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

// ---------------------------------------------------------------------------
// GET /content/catalog — returns the full content catalog
// Currently serves hardcoded data; designed to be backed by a DB later.
// ---------------------------------------------------------------------------
const CONTENT_CATALOG = require('../data/contentCatalog');

router.get('/catalog', async (_req, res) => {
  try {
    res.json({
      content: CONTENT_CATALOG,
      total: CONTENT_CATALOG.length,
      syncedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error('Catalog fetch error:', e);
    res.status(500).json({ error: 'Failed to load content catalog' });
  }
});

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

// POST /remix — rewrite text for user's brand
router.post('/remix', auth, async (req, res) => {
  try {
    const { originalText, contentType, brandContext } = req.body;
    if (!originalText) return res.status(400).json({ error: 'originalText is required' });

    // Also pull stored brand config for the user
    const storedBrand = getBrandContext(req.user.id);
    const mergedBrand = brandContext || storedBrand;

    let brandLine = '';
    if (mergedBrand) {
      const parts = [];
      if (mergedBrand.brand_name) parts.push(`Brand: ${mergedBrand.brand_name}`);
      if (mergedBrand.industry) parts.push(`Industry: ${mergedBrand.industry}`);
      if (mergedBrand.description) parts.push(`About: ${mergedBrand.description}`);
      if (mergedBrand.tone) parts.push(`Preferred tone: ${mergedBrand.tone}`);
      if (mergedBrand.website_url) parts.push(`Website: ${mergedBrand.website_url}`);
      brandLine = parts.join('\n');
    }

    const systemPrompt = `You are an expert social media copywriter. Rewrite the given text to match the user's brand voice and business. Keep the same format, length, and energy but adapt it to their specific brand/niche. Return ONLY the rewritten text, no explanations.`;
    const userPrompt = `Original text (${contentType || 'content'}):\n"${originalText}"\n\n${brandLine ? `Brand context:\n${brandLine}` : 'Adapt this for a generic business audience.'}\n\nRewrite this text for the brand above. Keep similar length and format.`;

    const result = await ai.callAI ? ai.callAI(systemPrompt, userPrompt) : null;

    if (result) {
      res.json({ adaptedText: result.replace(/^["']|["']$/g, '').trim() });
    } else {
      // Fallback: return original with a note
      res.json({ adaptedText: originalText + ' [adapted for your brand]' });
    }
  } catch (e) {
    console.error('Remix error:', e);
    res.status(500).json({ error: 'Remix failed' });
  }
});

module.exports = router;
