/**
 * Composition Engine — takes template + brand style + LLM output → composition document.
 * The composition doc is a fully-resolved spec that Remotion compositions can render directly.
 */
const db = require('../db');

/**
 * Get a default template for a content type.
 */
function getDefaultTemplate(type) {
  const row = db.prepare('SELECT * FROM content_templates WHERE type = ? AND is_default = 1 LIMIT 1').get(type);
  if (!row) return null;
  return {
    ...row,
    layout: JSON.parse(row.layout_json),
    timing: JSON.parse(row.timing_json),
  };
}

function getTemplateById(id) {
  const row = db.prepare('SELECT * FROM content_templates WHERE id = ?').get(id);
  if (!row) return null;
  return { ...row, layout: JSON.parse(row.layout_json), timing: JSON.parse(row.timing_json) };
}

/**
 * Calculate font size based on text length and role.
 */
function calcFontSize(text, role, brandStyle) {
  const baseSize = role === 'headline'
    ? (brandStyle.font_size_headline || 76)
    : role === 'caption'
    ? (brandStyle.font_size_caption || 28)
    : (brandStyle.font_size_body || 48);

  const len = (text || '').length;
  // Scale down for long text
  if (len > 100) return Math.max(28, Math.round(baseSize * 0.7));
  if (len > 60) return Math.max(32, Math.round(baseSize * 0.85));
  return baseSize;
}

/**
 * Truncate text to maxChars with ellipsis.
 */
function truncate(text, maxChars) {
  if (!text) return '';
  if (!maxChars || text.length <= maxChars) return text;
  return text.slice(0, maxChars - 1) + '\u2026';
}

/**
 * Compose a full composition document.
 *
 * @param {object} template - From getDefaultTemplate() or getTemplateById()
 * @param {object} brandStyle - From brandStyle.getBrandStyle()
 * @param {object} content - Structured LLM output: { hook, title, body, bullets, cta, slides, topText, bottomText }
 * @param {object} options - { backgroundVideoUrl, sourceTrendId, sourceCaption }
 * @returns {object} Composition document
 */
function compose(template, brandStyle, content, options = {}) {
  const type = template.type;
  const layout = template.layout;

  // Map Remotion composition IDs
  const compositionIdMap = {
    'slideshow': 'Slideshow',
    'wall-of-text': 'WallOfText',
    'video-hook-and-demo': 'VideoHook',
    'green-screen-meme': 'GreenScreenMeme',
  };

  // Resolve text blocks from layout + content + brand style
  const textBlocks = [];
  for (const block of layout.blocks || []) {
    const resolved = resolveBlock(block, content, brandStyle);
    if (resolved) textBlocks.push(resolved);
  }

  // Calculate total frames
  let totalFrames;
  if (type === 'slideshow') {
    const slideCount = (content.slides || []).length || 1;
    totalFrames = slideCount * (template.timing.durationPerBeat || 105);
  } else if (type === 'video-hook-and-demo') {
    const hookFrames = template.timing.hookFrames || 90;
    const bodyLen = (content.body || '').length;
    const bodySecs = Math.max(5, Math.min(bodyLen / 20, 12));
    totalFrames = hookFrames + Math.round(bodySecs * (template.timing.fps || 30));
  } else {
    const textLen = (content.body || content.text || '').length;
    const secs = Math.max(8, Math.min(textLen / 15, 20));
    totalFrames = Math.round(secs * (template.timing.fps || 30));
  }

  const doc = {
    compositionId: compositionIdMap[type] || 'WallOfText',
    template: { id: template.id, type, name: template.name },
    backgroundVideoUrl: options.backgroundVideoUrl || null,
    backgroundColor: brandStyle.color_background || template.background_color || '#1a1a2e',
    accentColor: brandStyle.color_accent || '#6C3CE1',
    secondaryColor: brandStyle.color_secondary || '#E84393',
    textBlocks,
    timing: {
      fps: template.timing.fps || 30,
      totalFrames,
      durationPerBeat: template.timing.durationPerBeat || totalFrames,
    },
    brandWatermark: {
      text: content.brandName || '',
      color: `${brandStyle.color_text_primary || '#FFFFFF'}40`,
      fontFamily: brandStyle.font_headline || 'system-ui, sans-serif',
    },
    // Pass-through for backward compat with existing compositions
    slides: content.slides || null,
    hook: content.hook || null,
    body: content.body || null,
    topText: content.topText || null,
    bottomText: content.bottomText || null,
    text: content.text || content.body || null,
    brandName: content.brandName || '',
  };

  return doc;
}

/**
 * Resolve a single layout block with content and brand style.
 */
function resolveBlock(block, content, brandStyle) {
  const { role, fontSizeRole, maxChars } = block;

  // Map role to content field
  let text = '';
  switch (role) {
    case 'title': text = content.title || ''; break;
    case 'hook': text = content.hook || ''; break;
    case 'body': text = content.body || content.text || ''; break;
    case 'cta': text = content.cta || ''; break;
    case 'top_text': text = content.topText || ''; break;
    case 'bottom_text': text = content.bottomText || ''; break;
    case 'brand_watermark': text = content.brandName || ''; break;
    case 'hook_badge': text = 'HOOK'; break;
    case 'meme_badge': text = 'MEME'; break;
    case 'slide_counter': text = ''; break; // Handled by Remotion
    default: text = ''; break;
  }

  if (!text && !['slide_counter', 'hook_badge', 'meme_badge'].includes(role)) return null;

  text = truncate(text, maxChars);

  const isHeadline = fontSizeRole === 'headline';
  const isCaption = fontSizeRole === 'caption';

  return {
    role,
    text,
    x: block.x,
    y: block.y,
    maxWidth: block.maxWidth,
    alignment: block.alignment || 'center',
    fontFamily: isHeadline
      ? (brandStyle.font_headline || 'system-ui, sans-serif')
      : (brandStyle.font_body || 'system-ui, sans-serif'),
    fontSize: calcFontSize(text, fontSizeRole, brandStyle),
    fontWeight: isHeadline
      ? (brandStyle.font_weight_headline || 800)
      : isCaption ? 600
      : (brandStyle.font_weight_body || 400),
    color: role === 'brand_watermark'
      ? `${brandStyle.color_text_primary || '#FFFFFF'}40`
      : role === 'hook_badge'
      ? '#FF6B6B'
      : role === 'meme_badge'
      ? '#FFD700'
      : (brandStyle.color_text_primary || '#FFFFFF'),
  };
}

module.exports = { compose, getDefaultTemplate, getTemplateById };
