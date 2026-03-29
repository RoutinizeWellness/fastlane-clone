const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const db = new Database(path.join(__dirname, 'fastlane.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    plan TEXT DEFAULT 'pro',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS brand_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE,
    website TEXT DEFAULT '',
    brand_name TEXT DEFAULT '',
    industry TEXT DEFAULT '',
    description TEXT DEFAULT '',
    tone TEXT DEFAULT 'casual',
    colors TEXT DEFAULT '["#FF6B35","#1a1a1a"]',
    pillars TEXT DEFAULT '["Education","Entertainment","Inspiration"]',
    audience TEXT DEFAULT '{}',
    onboarding_complete INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS content_library (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type TEXT NOT NULL,
    platform TEXT NOT NULL,
    title TEXT,
    content_json TEXT NOT NULL,
    thumbnail_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS scheduled_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    content_id INTEGER,
    platform TEXT,
    caption TEXT,
    scheduled_at DATETIME,
    status TEXT DEFAULT 'scheduled',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS analytics_daily (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    date TEXT,
    platform TEXT,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    followers INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS brand_analysis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    website_url TEXT,
    brand_name TEXT,
    product_type TEXT,
    industry TEXT,
    tone TEXT,
    target_audience TEXT,
    key_terms TEXT,
    tagline TEXT,
    brand_colors TEXT,
    analyzed_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS bookmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    content_id INTEGER NOT NULL,
    content_type TEXT,
    caption TEXT,
    thumbnail_url TEXT,
    content_data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, content_id)
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    platform TEXT DEFAULT 'tiktok',
    caption TEXT,
    content_json TEXT,
    thumbnail_url TEXT,
    status TEXT DEFAULT 'draft',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Seed demo user
const existing = db.prepare('SELECT id FROM users WHERE email = ?').get('demo@fastlane.ai');
if (!existing) {
  const hash = bcrypt.hashSync('demo1234', 10);
  const info = db.prepare('INSERT INTO users (email, password_hash, name, plan) VALUES (?, ?, ?, ?)').run('demo@fastlane.ai', hash, 'Alex Rivera', 'pro');
  const userId = info.lastInsertRowid;
  db.prepare('INSERT INTO brand_config (user_id, brand_name, industry, tone) VALUES (?, ?, ?, ?)').run(userId, 'Alex Creates', 'Content Creation', 'casual');

  // Seed 90 days analytics
  const platforms = ['tiktok', 'instagram', 'youtube', 'linkedin'];
  const stmt = db.prepare('INSERT INTO analytics_daily (user_id, date, platform, views, likes, comments, shares, followers) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  for (let i = 90; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    for (const p of platforms) {
      const base = 500 + (90 - i) * 80;
      const v = Math.round(base + Math.random() * 500);
      stmt.run(userId, dateStr, p, v, Math.round(v * 0.08), Math.round(v * 0.02), Math.round(v * 0.01), 1000 + (90 - i) * 15 + Math.round(Math.random() * 20));
    }
  }
}

// Add website_url column to brand_config if not exists
try {
  db.exec(`ALTER TABLE brand_config ADD COLUMN website_url TEXT DEFAULT ''`);
} catch (e) {
  // Column already exists, ignore
}

module.exports = db;
