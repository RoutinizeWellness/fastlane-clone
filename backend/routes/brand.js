const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../db');

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

router.put('/', auth, (req, res) => {
  const { brand_name, industry, description, tone, colors, pillars, audience } = req.body;
  const existing = db.prepare('SELECT id FROM brand_config WHERE user_id = ?').get(req.user.id);
  if (existing) {
    db.prepare('UPDATE brand_config SET brand_name=?, industry=?, description=?, tone=?, colors=?, pillars=?, audience=?, updated_at=CURRENT_TIMESTAMP WHERE user_id=?')
      .run(brand_name, industry, description, tone, JSON.stringify(colors || []), JSON.stringify(pillars || []), JSON.stringify(audience || {}), req.user.id);
  } else {
    db.prepare('INSERT INTO brand_config (user_id, brand_name, industry, description, tone, colors, pillars, audience) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(req.user.id, brand_name, industry, description, tone, JSON.stringify(colors || []), JSON.stringify(pillars || []), JSON.stringify(audience || {}));
  }
  res.json({ message: 'Brand config saved' });
});

module.exports = router;
