const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const SECRET = process.env.JWT_SECRET || 'fastlane-secret';

router.post('/signup', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) return res.status(400).json({ error: 'All fields required' });
  try {
    const hash = bcrypt.hashSync(password, 10);
    const info = db.prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)').run(email, hash, name);
    db.prepare('INSERT INTO brand_config (user_id) VALUES (?)').run(info.lastInsertRowid);
    const token = jwt.sign({ id: info.lastInsertRowid, email, name }, SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: info.lastInsertRowid, email, name, plan: 'pro' } });
  } catch (e) {
    if (e.message.includes('UNIQUE')) return res.status(409).json({ error: 'Email already in use' });
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash))
    return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, SECRET, { expiresIn: '30d' });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, plan: user.plan } });
});

router.get('/me', require('../middleware/auth'), (req, res) => {
  const user = db.prepare('SELECT id, email, name, plan, created_at FROM users WHERE id = ?').get(req.user.id);
  res.json(user);
});

module.exports = router;
