const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ai = require('../services/ai');
const pexels = require('../services/pexels');
const db = require('../db');
const remixEngine = require('../services/remixEngine');

// Helper: fetch the user's brand config + analysis for personalized AI generation
function getBrandContext(userId) {
  try {
    const config = db.prepare('SELECT brand_name, industry, description, tone, pillars, audience, website FROM brand_config WHERE user_id = ?').get(userId);
    // Also fetch rich analysis data from brand_analysis
    const analysis = db.prepare('SELECT brand_name, product_type, industry, tone, target_audience, key_terms, tagline, brand_colors FROM brand_analysis WHERE user_id = ? ORDER BY analyzed_at DESC LIMIT 1').get(userId);
    if (!config && !analysis) return null;
    // Merge: analysis data fills gaps in config
    return {
      brand_name: config?.brand_name || analysis?.brand_name || '',
      industry: config?.industry || analysis?.industry || '',
      description: config?.description || analysis?.tagline || '',
      tone: config?.tone || analysis?.tone || '',
      pillars: config?.pillars || '[]',
      audience: config?.audience || '{}',
      website_url: config?.website || '',
      product_type: analysis?.product_type || '',
      target_audience: analysis?.target_audience || '',
      key_terms: analysis?.key_terms || '[]',
      tagline: analysis?.tagline || '',
      brand_colors: analysis?.brand_colors || '[]',
    };
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

// POST /remix — deep structural remix: analyze viral structure, reconstruct for brand
router.post('/remix', auth, async (req, res) => {
  try {
    const { originalText, originalCaption, contentType, theme, catalogItemId, brandContext, intensity, userPrompt } = req.body;

    // Support both originalText (legacy) and originalCaption (new)
    const sourceText = originalCaption || originalText;
    if (!sourceText) return res.status(400).json({ error: 'originalCaption or originalText is required' });

    // Fetch stored brand config for the user
    const storedBrand = getBrandContext(req.user.id);
    const mergedBrand = brandContext || storedBrand;

    // Use the deep structural remix engine
    const remixResult = await remixEngine.deepRemix(sourceText, contentType || 'wall-of-text', mergedBrand, {
      intensity: intensity || 'medium',
      userPrompt: userPrompt || null,
    });

    // Generate "Why this works" explanation
    let explanation = null;
    try {
      explanation = await remixEngine.generateExplanation(sourceText, remixResult, mergedBrand);
    } catch (explErr) {
      console.error('[Remix] Explanation generation failed:', explErr.message);
    }

    // For slideshows, attach Pexels background images
    if (remixResult.type === 'slideshow' && remixResult.slides) {
      try {
        const slidesWithImages = await pexels.getPhotosBySlide(remixResult.slides);
        remixResult.slides = slidesWithImages;
      } catch (imgErr) {
        console.error('Pexels image fetch failed for remix slides:', imgErr);
      }
    }

    // For green-screen memes, fetch background video
    if ((remixResult.type === 'green-screen' || remixResult.type === 'green-screen-meme') && (remixResult.backgroundSearch || remixResult.content)) {
      try {
        const bgQuery = remixResult.backgroundSearch || theme || 'funny reaction';
        const videos = await pexels.searchVideos(bgQuery, 3);
        remixResult.bgVideo = videos[0] || null;
      } catch (vidErr) {
        console.error('Pexels video fetch failed for remix:', vidErr);
      }
    }

    res.json({
      ...remixResult,
      explanation,
      remixedFrom: {
        originalCaption: sourceText.substring(0, 200),
        catalogItemId: catalogItemId || null,
        theme: theme || null,
      },
      // Legacy field for backward compat
      adaptedText: remixResult.content || (remixResult.slides ? JSON.stringify(remixResult.slides) : sourceText),
    });
  } catch (e) {
    console.error('Remix error:', e);
    res.status(500).json({ error: 'Remix failed' });
  }
});

module.exports = router;
