const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../db');

// Get all posts
router.get('/', auth, (req, res) => {
  const posts = db.prepare('SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json({ posts: posts.map(p => ({ ...p, content_json: p.content_json ? JSON.parse(p.content_json) : null })) });
});

// Create a post
router.post('/', auth, (req, res) => {
  const { type, platform, caption, content_json, thumbnail_url, status } = req.body;
  const info = db.prepare('INSERT INTO posts (user_id, type, platform, caption, content_json, thumbnail_url, status) VALUES (?, ?, ?, ?, ?, ?, ?)').run(req.user.id, type || 'slideshow', platform || 'tiktok', caption || '', JSON.stringify(content_json || {}), thumbnail_url || '', status || 'draft');
  res.json({ id: info.lastInsertRowid, message: 'Post created' });
});

// Update a post
router.put('/:id', auth, (req, res) => {
  const { caption, status, content_json } = req.body;
  const updates = [];
  const params = [];
  if (caption !== undefined) { updates.push('caption = ?'); params.push(caption); }
  if (status !== undefined) { updates.push('status = ?'); params.push(status); }
  if (content_json !== undefined) { updates.push('content_json = ?'); params.push(JSON.stringify(content_json)); }
  updates.push('updated_at = CURRENT_TIMESTAMP');
  params.push(req.params.id, req.user.id);
  db.prepare(`UPDATE posts SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`).run(...params);
  res.json({ message: 'Updated' });
});

// Delete a post
router.delete('/:id', auth, (req, res) => {
  db.prepare('DELETE FROM posts WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
