/**
 * Brand context utilities for adapting content to a user's business.
 */

/**
 * Replaces generic product references in a caption with the user's brand/product name.
 * @param {string} caption - The original caption text.
 * @param {object} brand - The brand object from the store.
 * @returns {string} The adapted caption.
 */
export function adaptCaption(caption, brand) {
  if (!caption || !brand) return caption || ''
  let result = caption

  const placeholders = getBrandPlaceholders(brand)

  // Replace common generic references with brand-specific terms
  const genericTerms = [
    { pattern: /\byour product\b/gi, replacement: placeholders.productName || placeholders.brandName || 'your product' },
    { pattern: /\bour product\b/gi, replacement: placeholders.productName || placeholders.brandName || 'our product' },
    { pattern: /\bthe product\b/gi, replacement: placeholders.productName || placeholders.brandName || 'the product' },
    { pattern: /\byour brand\b/gi, replacement: placeholders.brandName || 'your brand' },
    { pattern: /\bour brand\b/gi, replacement: placeholders.brandName || 'our brand' },
    { pattern: /\bthe brand\b/gi, replacement: placeholders.brandName || 'the brand' },
    { pattern: /\byour business\b/gi, replacement: placeholders.brandName || 'your business' },
    { pattern: /\byour audience\b/gi, replacement: placeholders.targetAudience || 'your audience' },
    { pattern: /\byour customers\b/gi, replacement: placeholders.targetAudience || 'your customers' },
  ]

  for (const { pattern, replacement } of genericTerms) {
    result = result.replace(pattern, replacement)
  }

  return result
}

/**
 * Generates a content creation prompt adapted to the user's business.
 * @param {string} contentType - e.g. 'slideshow', 'wall-of-text', 'video-hook-and-demo', 'green-screen-meme'
 * @param {object} brand - The brand object from the store.
 * @returns {string} A prompt string tailored to the brand.
 */
export function generatePrompt(contentType, brand) {
  if (!brand) return ''

  const p = getBrandPlaceholders(brand)
  const name = p.brandName || p.productName || 'your product'
  const audience = p.targetAudience || 'your target audience'
  const industry = p.industry || 'your industry'
  const tone = p.tone || 'engaging'
  const benefits = p.benefits || 'key benefits'

  const prompts = {
    'slideshow': `Create a ${tone} slideshow for ${name} targeting ${audience} in the ${industry} space. Highlight ${benefits}. Use punchy, scroll-stopping text on each slide.`,
    'wall-of-text': `Write a ${tone} wall-of-text post for ${name} that speaks directly to ${audience}. Focus on ${benefits} and why ${name} stands out in ${industry}.`,
    'video-hook-and-demo': `Write a compelling hook + demo script for ${name}. The hook should grab ${audience} in under 3 seconds. Then demonstrate ${benefits} in a ${tone} way.`,
    'green-screen-meme': `Create a relatable meme for ${audience} in ${industry}. Reference ${name} naturally. Keep it ${tone} and shareable. Top text sets up the joke, bottom text delivers the punchline.`,
  }

  return prompts[contentType] || `Create ${tone} content for ${name} targeting ${audience}. Highlight ${benefits}.`
}

/**
 * Returns key-value pairs for template replacement based on brand data.
 * @param {object} brand - The brand object from the store.
 * @returns {object} Key-value pairs of brand placeholders.
 */
export function getBrandPlaceholders(brand) {
  if (!brand) return {}

  return {
    brandName: brand.brandName || '',
    productName: brand.productName || brand.brandName || '',
    industry: brand.industry || '',
    description: brand.description || '',
    targetAudience: brand.targetAudience || '',
    tone: brand.tone || '',
    benefits: brand.benefits || '',
    tagline: brand.tagline || '',
    website: brand.website || '',
  }
}
