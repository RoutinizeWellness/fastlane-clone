/**
 * Content Items API — full lifecycle: generate → edit → approve → schedule → publish.
 * Each content item stores a composition document (template + brand style + AI copy).
 */
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../db');
const ai = require('../services/ai');
const brandStyleService = require('../services/brandStyle');
const compositionEngine = require('../services/compositionEngine');
const { renderVideo, renderFromComposition } = require('../services/videoRenderer');

// Helper: get user's brand context (reused from content.js)
function getBrandContext(userId) {
  try {
    const config = db.prepare('SELECT brand_name, industry, description, tone, pillars, audience, website FROM brand_config WHERE user_id = ?').get(userId);
    const analysis = db.prepare('SELECT brand_name, product_type, industry, tone, target_audience, key_terms, tagline, brand_colors FROM brand_analysis WHERE user_id = ? ORDER BY analyzed_at DESC LIMIT 1').get(userId);
    if (!config && !analysis) return null;
    return {
      brand_name: config?.brand_name || analysis?.brand_name || '',
      industry: config?.industry || analysis?.industry || '',
      description: config?.description || analysis?.tagline || '',
      tone: config?.tone || analysis?.tone || '',
      target_audience: analysis?.target_audience || '',
      tagline: analysis?.tagline || '',
    };
  } catch { return null; }
}

// Valid state transitions
const VALID_TRANSITIONS = {
  generated: ['edited', 'approved'],
  edited: ['approved', 'edited'],
  approved: ['scheduled', 'edited'],
  scheduled: ['published', 'approved'],
  published: [],
};

// GET /content-items — list user's items
router.get('/', auth, (req, res) => {
  try {
    const { state, type, limit = 50, offset = 0 } = req.query;
    let sql = 'SELECT id, type, state, title, render_url, source_trend_id, created_at, updated_at FROM content_items WHERE user_id = ?';
    const params = [req.user.id];
    if (state) { sql += ' AND state = ?'; params.push(state); }
    if (type) { sql += ' AND type = ?'; params.push(type); }
    sql += ' ORDER BY updated_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));
    const items = db.prepare(sql).all(...params);
    const total = db.prepare('SELECT COUNT(*) as c FROM content_items WHERE user_id = ?').get(req.user.id);
    res.json({ items, total: total.c });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /content-items/:id — single item with full composition
router.get('/:id', auth, (req, res) => {
  try {
    const item = db.prepare('SELECT * FROM content_items WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    item.composition = JSON.parse(item.composition_json || '{}');
    res.json(item);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /content-items/generate — create new content item
router.post('/generate', auth, async (req, res) => {
  try {
    const { type, topic, platform, tone, trendVideoUrl, trendCaption, templateId } = req.body;
    if (!type) return res.status(400).json({ error: 'type is required' });

    // 1. Load template
    const template = templateId
      ? compositionEngine.getTemplateById(templateId)
      : compositionEngine.getDefaultTemplate(type);
    if (!template) return res.status(400).json({ error: `No template found for type: ${type}` });

    // 2. Load brand style
    const brandStyle = brandStyleService.getBrandStyle(req.user.id);
    const brandContext = getBrandContext(req.user.id);

    // 3. Generate structured content via AI
    let structured;
    try {
      structured = await generateStructuredContent(type, {
        topic: topic || trendCaption || 'trending content',
        platform: platform || 'tiktok',
        tone: tone || brandContext?.tone || 'engaging',
        brandContext,
        trendCaption,
      });
    } catch (aiErr) {
      console.error('[ContentItems] AI generation failed:', aiErr.message);
      // Fallback: use mock structured content
      structured = buildFallbackContent(type, topic || 'your product', brandContext);
    }

    structured.brandName = brandContext?.brand_name || '';

    // 4. Compose
    const composition = compositionEngine.compose(template, brandStyle, structured, {
      backgroundVideoUrl: trendVideoUrl || null,
      sourceTrendId: req.body.sourceTrendId || null,
    });

    // 5. Save content item
    const title = structured.hook || structured.title || (structured.slides?.[0]?.title) || topic || 'Untitled';
    const info = db.prepare(
      'INSERT INTO content_items (user_id, template_id, type, state, composition_json, source_trend_id, source_caption, title) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(
      req.user.id, template.id, type, 'generated',
      JSON.stringify(composition),
      req.body.sourceTrendId || null,
      trendCaption || null,
      title.slice(0, 100)
    );

    res.json({
      id: info.lastInsertRowid,
      type,
      state: 'generated',
      title,
      composition,
    });
  } catch (e) {
    console.error('[ContentItems] Generate error:', e);
    res.status(500).json({ error: e.message });
  }
});

// POST /content-items/:id/edit — update text/style, optionally re-render
router.post('/:id/edit', auth, async (req, res) => {
  try {
    const item = db.prepare('SELECT * FROM content_items WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!item) return res.status(404).json({ error: 'Not found' });

    const composition = JSON.parse(item.composition_json);
    const { textUpdates, styleUpdates, rerender } = req.body;

    // Apply text updates: { role: newText }
    if (textUpdates) {
      // Handle textBlock roles
      if (composition.textBlocks) {
        for (const [role, newText] of Object.entries(textUpdates)) {
          if (role.startsWith('slide_')) continue; // handled below
          const block = composition.textBlocks.find(b => b.role === role);
          if (block) block.text = newText;
          // Also update pass-through fields
          if (role === 'hook') composition.hook = newText;
          if (role === 'body') { composition.body = newText; composition.text = newText; }
          if (role === 'title' && composition.slides?.[0]) composition.slides[0].title = newText;
          if (role === 'top_text') composition.topText = newText;
          if (role === 'bottom_text') composition.bottomText = newText;
          if (role === 'brand_watermark') composition.brandName = newText;
        }
      }

      // Handle slide updates: slide_title_0, slide_body_0, etc.
      if (composition.slides) {
        for (const [role, newText] of Object.entries(textUpdates)) {
          const titleMatch = role.match(/^slide_title_(\d+)$/);
          const bodyMatch = role.match(/^slide_body_(\d+)$/);
          if (titleMatch) {
            const idx = parseInt(titleMatch[1]);
            if (composition.slides[idx]) composition.slides[idx].title = newText;
          }
          if (bodyMatch) {
            const idx = parseInt(bodyMatch[1]);
            if (composition.slides[idx]) composition.slides[idx].body = newText;
          }
        }
      }
    }

    // Apply style updates: { color_accent, color_text_primary, etc. }
    if (styleUpdates) {
      if (styleUpdates.color_text_primary) {
        composition.textBlocks?.forEach(b => {
          if (!['brand_watermark', 'hook_badge', 'meme_badge'].includes(b.role)) {
            b.color = styleUpdates.color_text_primary;
          }
        });
      }
      if (styleUpdates.color_accent) composition.accentColor = styleUpdates.color_accent;
      if (styleUpdates.color_background) composition.backgroundColor = styleUpdates.color_background;
    }

    // Save
    db.prepare('UPDATE content_items SET composition_json = ?, state = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(JSON.stringify(composition), 'edited', item.id);

    let renderResult = null;
    if (rerender) {
      try {
        renderResult = composition.compositionId
          ? await renderFromComposition(composition)
          : await renderVideo(item.type, composition);
        db.prepare('UPDATE content_items SET render_url = ?, render_id = ? WHERE id = ?')
          .run(renderResult.url, renderResult.id, item.id);
      } catch (renderErr) {
        console.error('[ContentItems] Re-render failed:', renderErr.message);
      }
    }

    res.json({
      id: item.id,
      state: 'edited',
      composition,
      renderUrl: renderResult?.url || item.render_url,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /content-items/:id/render — trigger render
router.post('/:id/render', auth, async (req, res) => {
  try {
    const item = db.prepare('SELECT * FROM content_items WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!item) return res.status(404).json({ error: 'Not found' });

    const composition = JSON.parse(item.composition_json);
    const start = Date.now();
    const result = composition.compositionId
      ? await renderFromComposition(composition)
      : await renderVideo(item.type, composition);
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);

    db.prepare('UPDATE content_items SET render_url = ?, render_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(result.url, result.id, item.id);

    res.json({ ...result, renderTime: elapsed });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH /content-items/:id/state — transition state
router.patch('/:id/state', auth, (req, res) => {
  try {
    const item = db.prepare('SELECT * FROM content_items WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!item) return res.status(404).json({ error: 'Not found' });

    const { state: newState } = req.body;
    const allowed = VALID_TRANSITIONS[item.state] || [];
    if (!allowed.includes(newState)) {
      return res.status(400).json({ error: `Cannot transition from '${item.state}' to '${newState}'` });
    }

    db.prepare('UPDATE content_items SET state = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newState, item.id);
    res.json({ id: item.id, state: newState });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- AI Structured Content Generation ---

async function generateStructuredContent(type, params) {
  const { topic, platform, tone, brandContext, trendCaption } = params;
  const brandLine = brandContext
    ? `Brand: ${brandContext.brand_name || 'Unknown'}. Industry: ${brandContext.industry || 'General'}. Tone: ${brandContext.tone || tone}. Audience: ${brandContext.target_audience || 'general audience'}.`
    : '';

  const trendLine = trendCaption
    ? `\nOriginal trending content to remix: "${trendCaption.slice(0, 300)}"\nKeep the same structure/vibe but adapt ALL text for the brand above.`
    : '';

  const schemas = {
    'slideshow': '{"slides":[{"title":"slide title","body":"slide body text"}],"hook":"opening hook"}',
    'wall-of-text': '{"body":"the full wall of text content","hook":"opening hook line"}',
    'video-hook-and-demo': '{"hook":"attention-grabbing hook (under 10 words)","body":"demo/explanation text","cta":"call to action"}',
    'green-screen-meme': '{"topText":"setup line","bottomText":"punchline"}',
  };

  const systemPrompt = `You are a viral content writer. Generate content for ${platform || 'TikTok'}.
${brandLine}${trendLine}
Return ONLY valid JSON matching this schema: ${schemas[type] || schemas['wall-of-text']}
No markdown, no explanation, just the JSON object.`;

  const userPrompt = `Create ${type.replace(/-/g, ' ')} content about: ${topic}. Tone: ${tone || 'engaging'}. Make it scroll-stopping and viral.`;

  // Use the existing AI service
  const result = await ai.callAI(systemPrompt, userPrompt);

  // Parse JSON from response
  let parsed;
  try {
    // Strip markdown code fences if present
    const cleaned = result.replace(/```json?\s*/g, '').replace(/```\s*/g, '').trim();
    parsed = JSON.parse(cleaned);
  } catch {
    // Fallback: try to extract JSON object
    const match = result.match(/\{[\s\S]*\}/);
    if (match) {
      parsed = JSON.parse(match[0]);
    } else {
      throw new Error('Failed to parse AI response as JSON');
    }
  }

  return parsed;
}

function buildFallbackContent(type, topic, brandContext) {
  const brand = brandContext?.brand_name || 'Your Brand';
  switch (type) {
    case 'slideshow':
      return {
        slides: [
          { title: `Why ${brand} is different`, body: 'Here is what sets us apart' },
          { title: 'The Problem', body: `Most people struggle with ${topic}` },
          { title: 'The Solution', body: `${brand} makes it effortless` },
        ],
        hook: `Stop scrolling - ${brand} changes everything`,
      };
    case 'wall-of-text':
      return { body: `${brand} is not just another product. It is the solution you have been looking for. Stop wasting time on ${topic} and start seeing real results today.`, hook: `${brand} changes the game` };
    case 'video-hook-and-demo':
      return { hook: `Wait - this changes everything`, body: `${brand} helps you master ${topic} in seconds. No more guessing, no more wasted time.`, cta: `Try ${brand} free today` };
    case 'green-screen-meme':
      return { topText: `When you discover ${brand}`, bottomText: `And realize everything else was a waste of time` };
    default:
      return { body: `Check out ${brand} for ${topic}`, hook: 'This is it' };
  }
}

module.exports = router;
