const axios = require('axios');
const db = require('../db');
const { callAI } = require('./ai');

async function analyzeWebsite(url) {
  // Normalize URL
  if (!url.startsWith('http')) url = 'https://' + url;

  // 1. Fetch the page (gracefully handle failures)
  let html = '';
  let fetchError = null;
  try {
    const resp = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      maxRedirects: 5,
      validateStatus: (status) => status < 500
    });
    html = typeof resp.data === 'string' ? resp.data : '';
  } catch (err) {
    fetchError = err.message || 'Unknown error';
    // Try with http if https failed
    if (url.startsWith('https://')) {
      try {
        const resp2 = await axios.get(url.replace('https://', 'http://'), {
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          },
          maxRedirects: 5,
          validateStatus: (status) => status < 500
        });
        html = typeof resp2.data === 'string' ? resp2.data : '';
        fetchError = null;
      } catch (err2) {
        // Both failed, continue with empty HTML - mock fallback will handle it
      }
    }
  }

  // 2. Extract content from HTML
  const extracted = extractFromHTML(html);

  // 3. Send to AI for brand analysis
  const systemPrompt = `Analyze this website and extract brand information. Return JSON with: brand_name (string), product_type (e.g. SaaS, E-Commerce, Agency, Course, Blog, Marketplace), industry (string), tone (professional/casual/bold/friendly), target_audience (string describing who the product is for), key_terms (array of 5-8 keywords), tagline (string), brand_colors (array of hex colors found or suggested based on the brand). Return ONLY valid JSON, no markdown.`;

  const userPrompt = `Website URL: ${url}
Page Title: ${extracted.title}
Meta Description: ${extracted.metaDescription}
OG Title: ${extracted.ogTitle}
OG Description: ${extracted.ogDescription}
Visible Text (first 2000 chars): ${extracted.visibleText}
Colors found in styles: ${extracted.colors.join(', ') || 'none'}`;

  const raw = await callAI(systemPrompt, userPrompt);
  if (!raw) {
    throw new Error('AI service unavailable. Please configure GROQ_API_KEY in .env');
  }

  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error('AI returned an invalid response. Please try again.');
  }

  try {
    return JSON.parse(match[0]);
  } catch (e) {
    throw new Error('Failed to parse AI response. Please try again.');
  }
}

function extractFromHTML(html) {
  const result = {
    title: '',
    metaDescription: '',
    ogTitle: '',
    ogDescription: '',
    visibleText: '',
    colors: []
  };

  // Title
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch) result.title = titleMatch[1].trim();

  // Meta description
  const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i)
    || html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
  if (metaDescMatch) result.metaDescription = metaDescMatch[1].trim();

  // OG title
  const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i)
    || html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*property=["']og:title["']/i);
  if (ogTitleMatch) result.ogTitle = ogTitleMatch[1].trim();

  // OG description
  const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i)
    || html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*property=["']og:description["']/i);
  if (ogDescMatch) result.ogDescription = ogDescMatch[1].trim();

  // Extract visible text (strip tags, scripts, styles)
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  result.visibleText = text.substring(0, 2000);

  // Extract hex colors from inline styles
  const colorMatches = html.match(/#[0-9a-fA-F]{3,8}\b/g);
  if (colorMatches) {
    const unique = [...new Set(colorMatches.map(c => c.toUpperCase()))];
    result.colors = unique.filter(c => c.length === 4 || c.length === 7).slice(0, 10);
  }

  return result;
}

function saveBrandAnalysis(userId, url, data) {
  // Remove old analysis for this user+url
  db.prepare('DELETE FROM brand_analysis WHERE user_id = ? AND website_url = ?').run(userId, url);

  db.prepare(`INSERT INTO brand_analysis (user_id, website_url, brand_name, product_type, industry, tone, target_audience, key_terms, tagline, brand_colors, analyzed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`)
    .run(
      userId,
      url,
      data.brand_name || '',
      data.product_type || '',
      data.industry || '',
      data.tone || '',
      data.target_audience || '',
      JSON.stringify(data.key_terms || []),
      data.tagline || '',
      JSON.stringify(data.brand_colors || [])
    );
}

module.exports = { analyzeWebsite, saveBrandAnalysis };
