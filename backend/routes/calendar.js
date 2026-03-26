const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../db');

router.get('/', auth, (req, res) => {
  const posts = db.prepare('SELECT sp.*, cl.type, cl.platform as content_platform, cl.title FROM scheduled_posts sp LEFT JOIN content_library cl ON sp.content_id = cl.id WHERE sp.user_id = ? ORDER BY sp.scheduled_at ASC').all(req.user.id);
  res.json({ posts });
});

router.post('/schedule', auth, (req, res) => {
  const { content_id, platform, caption, scheduled_at } = req.body;
  const info = db.prepare('INSERT INTO scheduled_posts (user_id, content_id, platform, caption, scheduled_at) VALUES (?, ?, ?, ?, ?)')
    .run(req.user.id, content_id || null, platform, caption || '', scheduled_at);
  res.json({ id: info.lastInsertRowid, message: 'Scheduled' });
});

router.delete('/:id', auth, (req, res) => {
  db.prepare('DELETE FROM scheduled_posts WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
