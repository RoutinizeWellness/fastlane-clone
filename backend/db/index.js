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

  -- Templates: layout positions per content type (font/color NOT stored here — comes from brand_styles)
  CREATE TABLE IF NOT EXISTS content_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    layout_json TEXT NOT NULL,
    timing_json TEXT NOT NULL,
    uses_background_video INTEGER DEFAULT 0,
    background_color TEXT DEFAULT '#1a1a2e',
    is_default INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Brand style: fonts, colors, sizes — applied to ALL remixes for this user
  CREATE TABLE IF NOT EXISTS brand_styles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE,
    font_headline TEXT DEFAULT 'system-ui, -apple-system, sans-serif',
    font_body TEXT DEFAULT 'system-ui, -apple-system, sans-serif',
    color_text_primary TEXT DEFAULT '#FFFFFF',
    color_accent TEXT DEFAULT '#6C3CE1',
    color_background TEXT DEFAULT '#1a1a2e',
    color_secondary TEXT DEFAULT '#E84393',
    font_size_headline INTEGER DEFAULT 76,
    font_size_body INTEGER DEFAULT 48,
    font_size_caption INTEGER DEFAULT 28,
    font_weight_headline INTEGER DEFAULT 800,
    font_weight_body INTEGER DEFAULT 400,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- Content items: full lifecycle from generated → published
  CREATE TABLE IF NOT EXISTS content_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    template_id INTEGER,
    type TEXT NOT NULL,
    state TEXT DEFAULT 'generated',
    composition_json TEXT NOT NULL,
    render_url TEXT,
    render_id TEXT,
    source_trend_id TEXT,
    source_caption TEXT,
    title TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (template_id) REFERENCES content_templates(id)
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

// Seed default content templates
const existingTemplates = db.prepare('SELECT COUNT(*) as c FROM content_templates').get();
if (existingTemplates.c === 0) {
  const insertTpl = db.prepare('INSERT INTO content_templates (name, type, layout_json, timing_json, uses_background_video, background_color, is_default) VALUES (?, ?, ?, ?, ?, ?, 1)');

  // Slideshow template
  insertTpl.run('Classic Slideshow', 'slideshow', JSON.stringify({
    blocks: [
      { role: 'brand_watermark', x: 540, y: 80, maxWidth: 900, alignment: 'center', fontSizeRole: 'caption', maxChars: 40 },
      { role: 'title', x: 540, y: 760, maxWidth: 900, alignment: 'center', fontSizeRole: 'headline', maxChars: 60 },
      { role: 'body', x: 540, y: 1000, maxWidth: 900, alignment: 'center', fontSizeRole: 'body', maxChars: 120 },
      { role: 'slide_counter', x: 540, y: 1700, maxWidth: 200, alignment: 'center', fontSizeRole: 'caption', maxChars: 10 },
    ],
  }), JSON.stringify({ durationPerBeat: 105, fps: 30 }), 0, '#6C3CE1');

  // Wall of Text template
  insertTpl.run('Wall of Text', 'wall-of-text', JSON.stringify({
    blocks: [
      { role: 'body', x: 540, y: 960, maxWidth: 950, alignment: 'center', fontSizeRole: 'headline', maxChars: 300 },
      { role: 'brand_watermark', x: 540, y: 1800, maxWidth: 400, alignment: 'center', fontSizeRole: 'caption', maxChars: 40 },
    ],
  }), JSON.stringify({ durationPerBeat: 240, fps: 30 }), 0, '#1a1a2e');

  // Video Hook & Demo template
  insertTpl.run('Hook + Demo', 'video-hook-and-demo', JSON.stringify({
    blocks: [
      { role: 'hook_badge', x: 50, y: 70, maxWidth: 120, alignment: 'left', fontSizeRole: 'caption', maxChars: 6 },
      { role: 'hook', x: 540, y: 960, maxWidth: 900, alignment: 'center', fontSizeRole: 'headline', maxChars: 80 },
      { role: 'body', x: 540, y: 960, maxWidth: 920, alignment: 'center', fontSizeRole: 'body', maxChars: 200 },
      { role: 'brand_watermark', x: 540, y: 1800, maxWidth: 400, alignment: 'center', fontSizeRole: 'caption', maxChars: 40 },
    ],
  }), JSON.stringify({ hookFrames: 90, fps: 30 }), 1, '#6C3CE1');

  // Green Screen Meme template
  insertTpl.run('Green Screen Meme', 'green-screen-meme', JSON.stringify({
    blocks: [
      { role: 'meme_badge', x: 40, y: 50, maxWidth: 120, alignment: 'left', fontSizeRole: 'caption', maxChars: 6 },
      { role: 'top_text', x: 540, y: 350, maxWidth: 1000, alignment: 'center', fontSizeRole: 'headline', maxChars: 60 },
      { role: 'bottom_text', x: 540, y: 1550, maxWidth: 1000, alignment: 'center', fontSizeRole: 'headline', maxChars: 60 },
      { role: 'brand_watermark', x: 540, y: 1850, maxWidth: 400, alignment: 'center', fontSizeRole: 'caption', maxChars: 40 },
    ],
  }), JSON.stringify({ durationPerBeat: 180, fps: 30 }), 1, '#00B894');

  console.log('  Seeded 4 default content templates');
}

// Export SQLite db as default (keeps all existing routes working)
module.exports = db;

// Also attach Supabase client + helpers for new/async code
const supabaseModule = require('./supabase');
module.exports.supabase = supabaseModule.supabase;
module.exports.supabaseQuery = supabaseModule.supabaseQuery;
module.exports.supabaseInsert = supabaseModule.supabaseInsert;
module.exports.supabaseUpdate = supabaseModule.supabaseUpdate;
module.exports.supabaseDelete = supabaseModule.supabaseDelete;
module.exports.isSupabaseConfigured = supabaseModule.isConfigured;
