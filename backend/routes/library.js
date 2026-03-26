const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../db');

router.get('/', auth, (req, res) => {
  const { type, platform, limit = 20, offset = 0 } = req.query;
  let q = 'SELECT * FROM content_library WHERE user_id = ?';
  const params = [req.user.id];
  if (type) { q += ' AND type = ?'; params.push(type); }
  if (platform) { q += ' AND platform = ?'; params.push(platform); }
  q += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));
  const items = db.prepare(q).all(...params);
  res.json({ items: items.map(i => ({ ...i, content_json: JSON.parse(i.content_json) })) });
});

router.post('/save', auth, (req, res) => {
  const { type, platform, title, content_json, thumbnail_url } = req.body;
  const info = db.prepare('INSERT INTO content_library (user_id, type, platform, title, content_json, thumbnail_url) VALUES (?, ?, ?, ?, ?, ?)')
    .run(req.user.id, type, platform, title || '', JSON.stringify(content_json), thumbnail_url || '');
  res.json({ id: info.lastInsertRowid, message: 'Saved to library' });
});

router.delete('/:id', auth, (req, res) => {
  db.prepare('DELETE FROM content_library WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
