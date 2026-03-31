const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../db');
const { analyzeWebsite, saveBrandAnalysis } = require('../services/websiteAnalyzer');

// Add website and onboarding_complete columns if they don't exist
try {
  db.exec(`ALTER TABLE brand_config ADD COLUMN website TEXT DEFAULT ''`);
} catch (e) { /* column already exists */ }
try {
  db.exec(`ALTER TABLE brand_config ADD COLUMN onboarding_complete INTEGER DEFAULT 0`);
} catch (e) { /* column already exists */ }

// GET brand config
router.get('/', auth, (req, res) => {
  const config = db.prepare('SELECT * FROM brand_config WHERE user_id = ?').get(req.user.id);
  if (!config) return res.json({});
  res.json({
    ...config,
    colors: JSON.parse(config.colors || '[]'),
    pillars: JSON.parse(config.pillars || '[]'),
    audience: JSON.parse(config.audience || '{}')
  });
});

// PUT brand config
router.put('/', auth, (req, res) => {
  const { brand_name, industry, description, tone, colors, pillars, audience, website, website_url, onboarding_complete } = req.body;
  const siteUrl = website || website_url || '';
  const existing = db.prepare('SELECT id FROM brand_config WHERE user_id = ?').get(req.user.id);
  if (existing) {
    db.prepare(`UPDATE brand_config SET brand_name=?, industry=?, description=?, tone=?, colors=?, pillars=?, audience=?, website=?, onboarding_complete=?, updated_at=CURRENT_TIMESTAMP WHERE user_id=?`)
      .run(brand_name, industry, description, tone, JSON.stringify(colors || []), JSON.stringify(pillars || []), JSON.stringify(audience || {}), siteUrl, onboarding_complete ? 1 : 0, req.user.id);
  } else {
    db.prepare('INSERT INTO brand_config (user_id, brand_name, industry, description, tone, colors, pillars, audience, website, onboarding_complete) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(req.user.id, brand_name, industry, description, tone, JSON.stringify(colors || []), JSON.stringify(pillars || []), JSON.stringify(audience || {}), siteUrl, onboarding_complete ? 1 : 0);
  }
  res.json({ message: 'Brand config saved' });
});

// POST analyze-url
router.post('/analyze-url', auth, async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    const data = await analyzeWebsite(url);
    saveBrandAnalysis(req.user.id, url, data);

    // Also update brand_config with extracted data
    const existing = db.prepare('SELECT id FROM brand_config WHERE user_id = ?').get(req.user.id);
    const brandName = data.brand_name || '';
    const industry = data.industry || '';
    const description = data.tagline || '';
    const tone = data.tone || 'professional';
    const brandColors = data.brand_colors || [];

    if (existing) {
      db.prepare('UPDATE brand_config SET brand_name=?, industry=?, description=?, tone=?, colors=?, website=?, updated_at=CURRENT_TIMESTAMP WHERE user_id=?')
        .run(brandName, industry, description, tone, JSON.stringify(brandColors), url, req.user.id);
    } else {
      db.prepare('INSERT INTO brand_config (user_id, brand_name, industry, description, tone, colors, website) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(req.user.id, brandName, industry, description, tone, JSON.stringify(brandColors), url);
    }

    res.json({ analysis: data });
  } catch (err) {
    console.error('Brand analyze-url error:', err);
    res.status(500).json({ error: err.message || 'Failed to analyze website' });
  }
});

// GET analysis
router.get('/analysis', auth, (req, res) => {
  const analysis = db.prepare('SELECT * FROM brand_analysis WHERE user_id = ? ORDER BY analyzed_at DESC LIMIT 1').get(req.user.id);
  if (!analysis) return res.json(null);
  res.json({
    ...analysis,
    key_terms: JSON.parse(analysis.key_terms || '[]'),
    brand_colors: JSON.parse(analysis.brand_colors || '[]')
  });
});

module.exports = router;
