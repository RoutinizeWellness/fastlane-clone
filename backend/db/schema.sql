-- Fastlane Clone: PostgreSQL / Supabase Migration
-- Run this in the Supabase SQL Editor to create all tables.

-- ============================================================
-- 1. TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  plan TEXT DEFAULT 'pro',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS brand_config (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id),
  website TEXT DEFAULT '',
  website_url TEXT DEFAULT '',
  brand_name TEXT DEFAULT '',
  industry TEXT DEFAULT '',
  description TEXT DEFAULT '',
  tone TEXT DEFAULT 'casual',
  colors TEXT DEFAULT '["#FF6B35","#1a1a1a"]',
  pillars TEXT DEFAULT '["Education","Entertainment","Inspiration"]',
  audience TEXT DEFAULT '{}',
  onboarding_complete INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_library (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  type TEXT NOT NULL,
  platform TEXT NOT NULL,
  title TEXT,
  content_json TEXT NOT NULL,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scheduled_posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  content_id INTEGER,
  platform TEXT,
  caption TEXT,
  scheduled_at TIMESTAMPTZ,
  status TEXT DEFAULT 'scheduled',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics_daily (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  date TEXT,
  platform TEXT,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  followers INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS brand_analysis (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  website_url TEXT,
  brand_name TEXT,
  product_type TEXT,
  industry TEXT,
  tone TEXT,
  target_audience TEXT,
  key_terms TEXT,
  tagline TEXT,
  brand_colors TEXT,
  analyzed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookmarks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  content_id INTEGER NOT NULL,
  content_type TEXT,
  caption TEXT,
  thumbnail_url TEXT,
  content_data TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  type TEXT NOT NULL,
  platform TEXT DEFAULT 'tiktok',
  caption TEXT,
  content_json TEXT,
  thumbnail_url TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_templates (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  layout_json TEXT NOT NULL,
  timing_json TEXT NOT NULL,
  uses_background_video INTEGER DEFAULT 0,
  background_color TEXT DEFAULT '#1a1a2e',
  is_default INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS brand_styles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id),
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
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  template_id INTEGER REFERENCES content_templates(id),
  type TEXT NOT NULL,
  state TEXT DEFAULT 'generated',
  composition_json TEXT NOT NULL,
  render_url TEXT,
  render_id TEXT,
  source_trend_id TEXT,
  source_caption TEXT,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. SEED DEFAULT CONTENT TEMPLATES
-- ============================================================

INSERT INTO content_templates (name, type, layout_json, timing_json, uses_background_video, background_color, is_default)
SELECT 'Classic Slideshow', 'slideshow',
  '{"blocks":[{"role":"brand_watermark","x":540,"y":80,"maxWidth":900,"alignment":"center","fontSizeRole":"caption","maxChars":40},{"role":"title","x":540,"y":760,"maxWidth":900,"alignment":"center","fontSizeRole":"headline","maxChars":60},{"role":"body","x":540,"y":1000,"maxWidth":900,"alignment":"center","fontSizeRole":"body","maxChars":120},{"role":"slide_counter","x":540,"y":1700,"maxWidth":200,"alignment":"center","fontSizeRole":"caption","maxChars":10}]}',
  '{"durationPerBeat":105,"fps":30}',
  0, '#6C3CE1', 1
WHERE NOT EXISTS (SELECT 1 FROM content_templates WHERE name = 'Classic Slideshow');

INSERT INTO content_templates (name, type, layout_json, timing_json, uses_background_video, background_color, is_default)
SELECT 'Wall of Text', 'wall-of-text',
  '{"blocks":[{"role":"body","x":540,"y":960,"maxWidth":950,"alignment":"center","fontSizeRole":"headline","maxChars":300},{"role":"brand_watermark","x":540,"y":1800,"maxWidth":400,"alignment":"center","fontSizeRole":"caption","maxChars":40}]}',
  '{"durationPerBeat":240,"fps":30}',
  0, '#1a1a2e', 1
WHERE NOT EXISTS (SELECT 1 FROM content_templates WHERE name = 'Wall of Text');

INSERT INTO content_templates (name, type, layout_json, timing_json, uses_background_video, background_color, is_default)
SELECT 'Hook + Demo', 'video-hook-and-demo',
  '{"blocks":[{"role":"hook_badge","x":50,"y":70,"maxWidth":120,"alignment":"left","fontSizeRole":"caption","maxChars":6},{"role":"hook","x":540,"y":960,"maxWidth":900,"alignment":"center","fontSizeRole":"headline","maxChars":80},{"role":"body","x":540,"y":960,"maxWidth":920,"alignment":"center","fontSizeRole":"body","maxChars":200},{"role":"brand_watermark","x":540,"y":1800,"maxWidth":400,"alignment":"center","fontSizeRole":"caption","maxChars":40}]}',
  '{"hookFrames":90,"fps":30}',
  1, '#6C3CE1', 1
WHERE NOT EXISTS (SELECT 1 FROM content_templates WHERE name = 'Hook + Demo');

INSERT INTO content_templates (name, type, layout_json, timing_json, uses_background_video, background_color, is_default)
SELECT 'Green Screen Meme', 'green-screen-meme',
  '{"blocks":[{"role":"meme_badge","x":40,"y":50,"maxWidth":120,"alignment":"left","fontSizeRole":"caption","maxChars":6},{"role":"top_text","x":540,"y":350,"maxWidth":1000,"alignment":"center","fontSizeRole":"headline","maxChars":60},{"role":"bottom_text","x":540,"y":1550,"maxWidth":1000,"alignment":"center","fontSizeRole":"headline","maxChars":60},{"role":"brand_watermark","x":540,"y":1850,"maxWidth":400,"alignment":"center","fontSizeRole":"caption","maxChars":40}]}',
  '{"durationPerBeat":180,"fps":30}',
  1, '#00B894', 1
WHERE NOT EXISTS (SELECT 1 FROM content_templates WHERE name = 'Green Screen Meme');

-- ============================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on user-owned tables
ALTER TABLE brand_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;

-- content_templates is global (no user_id), so no RLS needed
-- users table: only allow users to read/update their own row
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policies: service_role bypasses RLS, so the backend (using service key) works as-is.
-- These policies are for when anon/authenticated clients query directly.

CREATE POLICY "Users can view own row" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own row" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can manage own brand_config" ON brand_config
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own content_library" ON content_library
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own scheduled_posts" ON scheduled_posts
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own analytics" ON analytics_daily
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own brand_analysis" ON brand_analysis
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own bookmarks" ON bookmarks
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own posts" ON posts
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own brand_styles" ON brand_styles
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own content_items" ON content_items
  FOR ALL USING (auth.uid()::text = user_id::text);

-- content_templates: readable by everyone
CREATE POLICY "Templates are public" ON content_templates
  FOR SELECT USING (true);
