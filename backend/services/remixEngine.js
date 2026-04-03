const Groq = require('groq-sdk');

let groq = null;
if (process.env.GROQ_API_KEY) {
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
}

// --- AI helpers ---

async function callAI(systemPrompt, userPrompt, temperature = 0.85, maxTokens = 3000) {
  if (!groq) return null;
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature,
      max_tokens: maxTokens,
    });
    return completion.choices[0].message.content;
  } catch (err) {
    console.error('[remixEngine] AI call failed:', err.message);
    return null;
  }
}

function parseJSON(raw) {
  if (!raw) return null;
  try {
    // Strip markdown fences
    let cleaned = raw.replace(/```(?:json)?\s*/gi, '').replace(/```\s*/g, '');
    // Try direct parse
    return JSON.parse(cleaned.trim());
  } catch {
    // Try extracting first JSON object or array
    const objMatch = raw.match(/\{[\s\S]*\}/);
    const arrMatch = raw.match(/\[[\s\S]*\]/);
    for (const m of [objMatch, arrMatch]) {
      if (m) {
        try { return JSON.parse(m[0]); } catch { /* continue */ }
      }
    }
    return null;
  }
}

function buildBrandSummary(ctx) {
  if (!ctx) return 'No brand context provided.';
  const lines = [];
  if (ctx.brand_name) lines.push(`Brand: ${ctx.brand_name}`);
  if (ctx.industry) lines.push(`Industry: ${ctx.industry}`);
  if (ctx.description) lines.push(`Description: ${ctx.description}`);
  if (ctx.tone) lines.push(`Tone: ${ctx.tone}`);
  if (ctx.target_audience) lines.push(`Target audience: ${ctx.target_audience}`);
  if (ctx.tagline) lines.push(`Tagline: ${ctx.tagline}`);
  if (ctx.value_proposition) lines.push(`Value proposition: ${ctx.value_proposition}`);
  if (ctx.key_terms) {
    try {
      const kt = typeof ctx.key_terms === 'string' ? JSON.parse(ctx.key_terms) : ctx.key_terms;
      if (Array.isArray(kt) && kt.length) lines.push(`Key terms: ${kt.join(', ')}`);
    } catch { /* skip */ }
  }
  if (ctx.pillars) {
    try {
      const p = typeof ctx.pillars === 'string' ? JSON.parse(ctx.pillars) : ctx.pillars;
      if (Array.isArray(p) && p.length) lines.push(`Content pillars: ${p.join(', ')}`);
    } catch { /* skip */ }
  }
  return lines.join('\n') || 'No brand context provided.';
}

// --- Fallback structure when AI is unavailable ---

const FALLBACK_PATTERNS = {
  slideshow: {
    pattern: 'hook-list-cta',
    segments: [
      { role: 'hook', text: '', technique: 'curiosity-gap' },
      { role: 'list-item', text: '', technique: 'value-stacking' },
      { role: 'cta', text: '', technique: 'aspiration' },
    ],
    hooks: ['curiosity-gap'],
    tone: 'casual-authoritative',
    pacing: 'rapid-fire',
    sentenceStructure: 'short-punchy',
  },
  'wall-of-text': {
    pattern: 'pain-realization-contrarian-payoff',
    segments: [
      { role: 'hook', text: '', technique: 'pattern-interrupt' },
      { role: 'pain-point', text: '', technique: 'relatability' },
      { role: 'realization', text: '', technique: 'insight' },
      { role: 'contrarian', text: '', technique: 'authority' },
      { role: 'payoff', text: '', technique: 'aspiration' },
    ],
    hooks: ['bold-claim', 'relatability'],
    tone: 'raw-authentic',
    pacing: 'slow-build',
    sentenceStructure: 'short-punchy',
  },
  'video-hook-and-demo': {
    pattern: 'hook-setup-points-cta',
    segments: [
      { role: 'hook', text: '', technique: 'pattern-interrupt' },
      { role: 'setup', text: '', technique: 'relatability' },
      { role: 'point', text: '', technique: 'value-stacking' },
      { role: 'cta', text: '', technique: 'urgency' },
    ],
    hooks: ['curiosity-gap', 'bold-claim'],
    tone: 'conversational',
    pacing: 'crescendo',
    sentenceStructure: 'mixed',
  },
  'green-screen-meme': {
    pattern: 'setup-punchline',
    segments: [
      { role: 'setup', text: '', technique: 'relatability' },
      { role: 'punchline', text: '', technique: 'subversion' },
    ],
    hooks: ['relatability'],
    tone: 'humorous-sarcastic',
    pacing: 'rapid-fire',
    sentenceStructure: 'short-punchy',
  },
};

// --- Core functions ---

async function analyzeStructure(content, contentType) {
  const text = typeof content === 'string' ? content : JSON.stringify(content);
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  const systemPrompt = `You are a viral content structure analyst. Given a piece of social media content, analyze its structural pattern and return a JSON object with these exact fields:
- pattern: string identifying the structure (e.g. "pain-realization-contrarian-payoff", "hook-list-cta", "story-twist-lesson", "setup-punchline")
- segments: array of {role, text, technique} where role is the structural role (hook, pain-point, realization, contrarian, payoff, list-item, cta, setup, punchline, point, twist, lesson), text is the relevant excerpt, and technique is one of: pattern-interrupt, relatability, insight, authority, aspiration, curiosity-gap, value-stacking, urgency, subversion, social-proof, scarcity
- hooks: array of hook techniques detected (curiosity-gap, bold-claim, relatability, pattern-interrupt, question, controversy)
- tone: detected tone (raw-authentic, casual-authoritative, conversational, humorous-sarcastic, inspirational, educational)
- pacing: one of slow-build, rapid-fire, crescendo
- sentenceStructure: one of short-punchy, flowing, mixed

Respond with ONLY valid JSON, no markdown fences, no explanation.`;

  const userPrompt = `Content type: ${contentType || 'unknown'}\n\nContent:\n${text}`;

  const raw = await callAI(systemPrompt, userPrompt, 0.3, 2000);
  const parsed = parseJSON(raw);

  if (parsed && parsed.pattern && Array.isArray(parsed.segments)) {
    return { ...parsed, wordCount };
  }

  // Fallback
  const fallback = FALLBACK_PATTERNS[contentType] || FALLBACK_PATTERNS['wall-of-text'];
  return { ...fallback, wordCount };
}

async function deepRemix(originalContent, contentType, brandContext, options = {}) {
  const { intensity = 'medium', userPrompt: extraInstructions, mentionBusiness = true } = options;
  const text = typeof originalContent === 'string' ? originalContent : JSON.stringify(originalContent);

  // Step 1: Analyze structure
  const structure = await analyzeStructure(originalContent, contentType);

  // Step 2: Dispatch to content-type-specific helper
  let remixed;
  try {
    if (contentType === 'slideshow') {
      remixed = await remixSlideshow(text, brandContext, structure, options);
    } else if (contentType === 'wall-of-text') {
      remixed = await remixWallOfText(text, brandContext, structure, options);
    } else if (contentType === 'video-hook-and-demo') {
      remixed = await remixVideoHook(text, brandContext, structure, options);
    } else if (contentType === 'green-screen-meme') {
      remixed = await remixGreenScreen(text, brandContext, structure, options);
    } else {
      remixed = await remixGeneric(text, brandContext, structure, options);
    }
  } catch (err) {
    console.error('[remixEngine] Remix failed, using fallback:', err.message);
    remixed = { content: text, fallback: true };
  }

  return {
    ...remixed,
    contentType,
    structure,
    intensity,
    brandName: brandContext?.brand_name || 'unknown',
  };
}

function buildRemixSystemPrompt(brandContext, structure, options) {
  const { intensity = 'medium', mentionBusiness = true } = options;
  const brand = buildBrandSummary(brandContext);

  const intensityGuide = {
    light: 'Keep most of the original wording intact. Swap only key references, examples, and nouns with brand-specific equivalents. Preserve the original voice exactly.',
    medium: 'Fully rewrite the content keeping the identical structural pattern, segment order, and techniques. Deeply integrate the brand — use its value proposition, audience pain points, and terminology. Do not just name-drop.',
    heavy: 'Complete creative reconstruction. Use the same structural pattern and techniques as a blueprint but write entirely new copy. Every sentence should be original while following the same emotional arc.',
  };

  return `You are an elite viral content remix engine. Your job is to reconstruct viral content for a specific brand while preserving the structural DNA that made it go viral.

BRAND CONTEXT:
${brand}

DETECTED VIRAL STRUCTURE:
- Pattern: ${structure.pattern}
- Segments: ${structure.segments.map(s => `${s.role} (${s.technique})`).join(' → ')}
- Hooks: ${(structure.hooks || []).join(', ')}
- Tone: ${structure.tone}
- Pacing: ${structure.pacing}
- Sentence style: ${structure.sentenceStructure}

INTENSITY: ${intensity}
${intensityGuide[intensity] || intensityGuide.medium}

RULES:
1. KEEP the exact same structural pattern: same number of segments in the same order
2. KEEP the same techniques (hook type, emotional triggers, CTA style)
3. KEEP the same tone (${structure.tone}) and pacing (${structure.pacing})
4. ${mentionBusiness ? 'Weave in the brand naturally — use its value proposition, not just its name' : 'Do NOT mention the business name directly — make the content feel organic'}
5. Match the original sentence structure style (${structure.sentenceStructure})
6. Use brand-specific examples, metrics, and language — not generic filler
${options.userPrompt ? `7. ADDITIONAL INSTRUCTIONS: ${options.userPrompt}` : ''}`;
}

async function remixSlideshow(slides, brandContext, structure, options) {
  const system = buildRemixSystemPrompt(brandContext, structure, options) + `

Respond with ONLY a JSON array of slide objects: [{"slide":1,"title":"...","body":"...","emoji":"..."},...]. Last slide must have "cta":true. No markdown fences.`;

  const prompt = `Original viral slideshow content:\n${slides}\n\nRemix this slideshow following the structural blueprint above. Return ONLY the JSON array.`;

  const raw = await callAI(system, prompt, 0.9, 3000);
  const parsed = parseJSON(raw);

  if (Array.isArray(parsed) && parsed.length > 0) {
    return { type: 'slideshow', slides: parsed };
  }
  // Fallback: simple substitution
  return { type: 'slideshow', slides: fallbackSlideRemix(slides, brandContext), fallback: true };
}

async function remixWallOfText(text, brandContext, structure, options) {
  const system = buildRemixSystemPrompt(brandContext, structure, options) + `

Return ONLY the remixed wall-of-text post. No JSON wrapping. No explanation. Keep the same line-break-heavy style, casual abbreviations (bc, rn, ngl, tbh), and paragraph structure.`;

  const prompt = `Original viral wall-of-text:\n"${text}"\n\nRemix this following the structural blueprint above.`;

  const raw = await callAI(system, prompt, 0.9, 3000);
  if (raw) {
    return { type: 'wall-of-text', content: raw.replace(/^["']|["']$/g, '').trim() };
  }
  return { type: 'wall-of-text', content: fallbackTextRemix(text, brandContext), fallback: true };
}

async function remixVideoHook(script, brandContext, structure, options) {
  const system = buildRemixSystemPrompt(brandContext, structure, options) + `

Respond with ONLY a JSON object: {"hook":"...","setup":"...","points":["...","..."],"cta":"...","caption":"...","hashtags":"..."}. No markdown fences.`;

  const prompt = `Original viral video script:\n"${script}"\n\nRemix this video script following the structural blueprint above. Return ONLY the JSON object.`;

  const raw = await callAI(system, prompt, 0.9, 3000);
  const parsed = parseJSON(raw);

  if (parsed && parsed.hook) {
    return { type: 'video-hook', ...parsed };
  }
  // Fallback: return as plain text
  if (raw) return { type: 'video-hook', content: raw.trim() };
  return { type: 'video-hook', content: fallbackTextRemix(script, brandContext), fallback: true };
}

async function remixGreenScreen(meme, brandContext, structure, options) {
  const system = buildRemixSystemPrompt(brandContext, structure, options) + `

Respond with ONLY a JSON object: {"topText":"...","bottomText":"...","reactionText":"...","backgroundSearch":"...","caption":"...","hashtags":"..."}. No markdown fences.`;

  const prompt = `Original viral green screen meme:\n"${meme}"\n\nRemix this meme following the structural blueprint above. Return ONLY the JSON object.`;

  const raw = await callAI(system, prompt, 0.9, 2000);
  const parsed = parseJSON(raw);

  if (parsed && (parsed.topText || parsed.bottomText)) {
    return { type: 'green-screen', ...parsed };
  }
  if (raw) return { type: 'green-screen', content: raw.trim() };
  return { type: 'green-screen', content: fallbackTextRemix(meme, brandContext), fallback: true };
}

async function remixGeneric(text, brandContext, structure, options) {
  const system = buildRemixSystemPrompt(brandContext, structure, options) + `

Return ONLY the remixed content. No wrapping, no explanation.`;

  const prompt = `Original viral content:\n"${text}"\n\nRemix this following the structural blueprint above.`;

  const raw = await callAI(system, prompt, 0.9, 3000);
  if (raw) return { type: 'generic', content: raw.replace(/^["']|["']$/g, '').trim() };
  return { type: 'generic', content: fallbackTextRemix(text, brandContext), fallback: true };
}

// --- Explanation generator ---

async function generateExplanation(originalContent, remixedContent, brandContext) {
  const brand = buildBrandSummary(brandContext);
  const origText = typeof originalContent === 'string' ? originalContent : JSON.stringify(originalContent);
  const remixText = typeof remixedContent === 'string' ? remixedContent : JSON.stringify(remixedContent);

  const system = `You are a content strategist. Given an original viral post and its brand-adapted remix, explain why the remix works. Respond with ONLY a JSON object:
{
  "bullets": ["reason 1", "reason 2", "reason 3"],
  "structureMatch": "high"|"medium"|"low",
  "brandFit": "strong"|"moderate"|"weak",
  "viralPotential": "high"|"medium"|"low"
}
No markdown fences.`;

  const prompt = `BRAND:\n${brand}\n\nORIGINAL:\n${origText.substring(0, 1500)}\n\nREMIX:\n${remixText.substring(0, 1500)}\n\nAnalyze why this remix works for the brand.`;

  const raw = await callAI(system, prompt, 0.3, 1500);
  const parsed = parseJSON(raw);

  if (parsed && Array.isArray(parsed.bullets)) {
    return parsed;
  }

  // Fallback
  const brandName = brandContext?.brand_name || 'your brand';
  return {
    bullets: [
      `Preserves the viral structural pattern from the original content`,
      `Adapts language and examples specifically for ${brandName}`,
      `Maintains the emotional arc that drove engagement on the original`,
    ],
    structureMatch: 'medium',
    brandFit: 'moderate',
    viralPotential: 'medium',
  };
}

// --- Fallback helpers (no AI) ---

function fallbackTextRemix(text, brandContext) {
  const brandName = brandContext?.brand_name || 'your brand';
  const industry = brandContext?.industry || 'business';
  let out = typeof text === 'string' ? text : JSON.stringify(text);
  out = out.replace(/my (?:saas|product|brand|store|business|app|startup)/gi, brandName);
  out = out.replace(/\b(?:saas|ecommerce|fitness|finance|content creation|skincare|tech)\b/gi, industry);
  return out;
}

function fallbackSlideRemix(slides, brandContext) {
  const brandName = brandContext?.brand_name || 'your brand';
  const industry = brandContext?.industry || 'business';
  let parsed;
  if (typeof slides === 'string') {
    try { parsed = JSON.parse(slides); } catch { parsed = null; }
  } else if (Array.isArray(slides)) {
    parsed = slides;
  }
  if (!Array.isArray(parsed)) {
    return [
      { slide: 1, title: `what i learned building ${brandName}`, body: `after months in ${industry}, here's what moved the needle.`, emoji: '🚀' },
      { slide: 2, title: 'start with the problem', body: `${brandName} grew when we focused on core pain points.`, emoji: '🎯' },
      { slide: 3, title: `follow ${brandName} for more`, body: `real ${industry} lessons — no fluff`, emoji: '🔖', cta: true },
    ];
  }
  return parsed.map(s => ({
    ...s,
    title: s.title ? s.title.replace(/my (?:saas|product|brand|store|business)/gi, brandName).replace(/\b(?:saas|ecommerce|fitness|finance)\b/gi, industry) : s.title,
    body: s.body ? s.body.replace(/my (?:saas|product|brand|store|business)/gi, brandName).replace(/\b(?:saas|ecommerce|fitness|finance)\b/gi, industry) : s.body,
  }));
}

// --- Exports ---

module.exports = {
  analyzeStructure,
  deepRemix,
  generateExplanation,
  remixSlideshow,
  remixWallOfText,
  remixVideoHook,
  remixGreenScreen,
};
