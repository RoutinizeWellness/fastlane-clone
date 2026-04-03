/**
 * Brand Style service — manages per-user visual identity (fonts, colors, sizes).
 * These styles override template defaults when rendering content.
 */
const db = require('../db');

const DEFAULTS = {
  font_headline: 'system-ui, -apple-system, sans-serif',
  font_body: 'system-ui, -apple-system, sans-serif',
  color_text_primary: '#FFFFFF',
  color_accent: '#6C3CE1',
  color_background: '#1a1a2e',
  color_secondary: '#E84393',
  font_size_headline: 76,
  font_size_body: 48,
  font_size_caption: 28,
  font_weight_headline: 800,
  font_weight_body: 400,
};

function getBrandStyle(userId) {
  const row = db.prepare('SELECT * FROM brand_styles WHERE user_id = ?').get(userId);
  if (row) return row;
  return { user_id: userId, ...DEFAULTS };
}

function upsertBrandStyle(userId, data) {
  const existing = db.prepare('SELECT id FROM brand_styles WHERE user_id = ?').get(userId);
  const fields = Object.keys(DEFAULTS);
  if (existing) {
    const sets = [];
    const vals = [];
    for (const f of fields) {
      if (data[f] !== undefined) {
        sets.push(`${f} = ?`);
        vals.push(data[f]);
      }
    }
    if (sets.length) {
      sets.push('updated_at = CURRENT_TIMESTAMP');
      vals.push(userId);
      db.prepare(`UPDATE brand_styles SET ${sets.join(', ')} WHERE user_id = ?`).run(...vals);
    }
  } else {
    const merged = { ...DEFAULTS };
    for (const f of fields) {
      if (data[f] !== undefined) merged[f] = data[f];
    }
    db.prepare(`INSERT INTO brand_styles (user_id, font_headline, font_body, color_text_primary, color_accent, color_background, color_secondary, font_size_headline, font_size_body, font_size_caption, font_weight_headline, font_weight_body) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      userId, merged.font_headline, merged.font_body, merged.color_text_primary,
      merged.color_accent, merged.color_background, merged.color_secondary,
      merged.font_size_headline, merged.font_size_body, merged.font_size_caption,
      merged.font_weight_headline, merged.font_weight_body
    );
  }
  return getBrandStyle(userId);
}

/**
 * Extract brand style from website analysis data (called during onboarding).
 */
function extractFromAnalysis(analysisData) {
  const style = {};
  if (analysisData.brand_colors) {
    let colors = analysisData.brand_colors;
    if (typeof colors === 'string') {
      try { colors = JSON.parse(colors); } catch { colors = []; }
    }
    if (colors.length >= 1) style.color_accent = colors[0];
    if (colors.length >= 2) style.color_background = colors[1];
    if (colors.length >= 3) style.color_secondary = colors[2];
  }
  if (analysisData.tone) {
    const tone = (analysisData.tone || '').toLowerCase();
    if (tone.includes('bold') || tone.includes('energetic')) {
      style.font_weight_headline = 900;
    } else if (tone.includes('elegant') || tone.includes('minimal')) {
      style.font_weight_headline = 600;
      style.font_weight_body = 300;
    }
  }
  return style;
}

module.exports = { getBrandStyle, upsertBrandStyle, extractFromAnalysis, DEFAULTS };
