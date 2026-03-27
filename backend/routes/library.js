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

router.post('/bookmark', auth, (req, res) => {
  const { id, contentType, caption, thumbnail, data } = req.body;
  try {
    db.prepare('INSERT OR REPLACE INTO bookmarks (user_id, content_id, content_type, caption, thumbnail_url, content_data) VALUES (?, ?, ?, ?, ?, ?)').run(req.user.id, id, contentType || '', caption || '', thumbnail || '', JSON.stringify(data || {}));
    res.json({ message: 'Bookmarked!' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/bookmarks', auth, (req, res) => {
  const bookmarks = db.prepare('SELECT * FROM bookmarks WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json({ bookmarks: bookmarks.map(b => ({ ...b, data: JSON.parse(b.content_data || '{}') })) });
});

router.delete('/bookmark/:contentId', auth, (req, res) => {
  db.prepare('DELETE FROM bookmarks WHERE content_id = ? AND user_id = ?').run(req.params.contentId, req.user.id);
  res.json({ message: 'Removed' });
});

router.get('/export/:id', auth, (req, res) => {
  const item = db.prepare('SELECT * FROM content_library WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="content-${item.id}.json"`);
  res.json({ ...item, content_json: JSON.parse(item.content_json) });
});

router.get('/export-all', auth, (req, res) => {
  const items = db.prepare('SELECT * FROM content_library WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="all-content-export.json"');
  res.json({ items: items.map(i => ({ ...i, content_json: JSON.parse(i.content_json) })) });
});

module.exports = router;
