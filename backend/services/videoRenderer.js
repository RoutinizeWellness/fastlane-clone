/**
 * Remotion-based video renderer — generates real .mp4 files using React compositions.
 * Same approach as Fastlane's production stack (Remotion + React + server-side render).
 * Produces 1080x1920 (9:16 vertical) videos with animations, transitions, and brand overlays.
 */
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const RENDERED_DIR = path.join(__dirname, '..', 'rendered');
if (!fs.existsSync(RENDERED_DIR)) fs.mkdirSync(RENDERED_DIR, { recursive: true });

// Bundle cache — Remotion bundles the React project once, reuses for all renders
let bundlePromise = null;

async function getBundle() {
  if (bundlePromise) return bundlePromise;
  bundlePromise = (async () => {
    const { bundle } = await import('@remotion/bundler');
    const entryPoint = path.join(__dirname, '..', 'remotion', 'index.jsx');
    console.log('[Remotion] Bundling compositions...');
    const bundled = await bundle({
      entryPoint,
      onProgress: (p) => {
        if (p === 100) console.log('[Remotion] Bundle ready.');
      },
    });
    return bundled;
  })();
  return bundlePromise;
}

/**
 * Find Chrome binary for Remotion rendering.
 */
function findChromeBrowser() {
  const puppeteerCache = path.join(
    process.env.HOME || '/home/user',
    '.cache',
    'puppeteer',
    'chrome'
  );
  if (fs.existsSync(puppeteerCache)) {
    const versions = fs.readdirSync(puppeteerCache).sort().reverse();
    for (const v of versions) {
      const bin = path.join(puppeteerCache, v, 'chrome-linux64', 'chrome');
      if (fs.existsSync(bin)) return bin;
    }
  }
  // Fallback paths
  const fallbacks = [
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
  ];
  for (const fb of fallbacks) {
    if (fs.existsSync(fb)) return fb;
  }
  return null;
}

/**
 * Render a video using Remotion.
 * @param {string} compositionId - 'Slideshow' | 'WallOfText' | 'VideoHook' | 'GreenScreenMeme'
 * @param {object} inputProps - Props passed to the React composition
 * @returns {{ id, filePath, fileName, url }}
 */
async function renderComposition(compositionId, inputProps) {
  const { renderMedia, selectComposition } = await import('@remotion/renderer');

  const bundleLocation = await getBundle();
  const id = uuidv4();
  const outFile = path.join(RENDERED_DIR, `${id}.mp4`);

  const chromeBin = findChromeBrowser();

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: compositionId,
    inputProps,
    ...(chromeBin ? { chromiumExecutable: chromeBin } : {}),
  });

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: 'h264',
    outputLocation: outFile,
    inputProps,
    ...(chromeBin ? { chromiumExecutable: chromeBin } : {}),
    chromiumOptions: {
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  });

  return {
    id,
    filePath: outFile,
    fileName: `${compositionId.toLowerCase()}-${id.slice(0, 8)}.mp4`,
    url: `/api/render/${id}.mp4`,
  };
}

/**
 * Render directly from a composition document (new pipeline).
 * The compositionDoc already has all text, styles, timing resolved.
 * @param {object} compositionDoc - Full composition document from compositionEngine
 * @returns {{ id, filePath, fileName, url }}
 */
async function renderFromComposition(compositionDoc) {
  const compositionId = compositionDoc.compositionId;
  if (!compositionId) throw new Error('compositionDoc missing compositionId');
  return renderComposition(compositionId, { compositionDoc });
}

// ---------- Content type parsers ----------

function parseSlides(text) {
  if (!text) return [];
  const slideRegex = /(?:slide\s*\d+[:\s]*|^\d+[\.\)]\s*)/gim;
  const parts = text.split(slideRegex).filter((s) => s.trim());
  if (parts.length >= 2) {
    return parts.map((p, i) => {
      const lines = p.trim().split('\n').filter((l) => l.trim());
      return { title: lines[0] || `Slide ${i + 1}`, body: lines.slice(1).join(' ') };
    });
  }
  const sentences = text.split(/\n\n+/).filter((s) => s.trim());
  if (sentences.length >= 2) {
    return sentences.map((s) => ({ title: s.trim().slice(0, 60), body: s.trim().slice(60) }));
  }
  return [{ title: text.slice(0, 80), body: text.slice(80) }];
}

// ---------- Public API ----------

/**
 * Main render entry point.
 * @param {string} contentType - 'slideshow' | 'wall-of-text' | 'video-hook-and-demo' | 'green-screen-meme'
 * @param {object} data - Content data
 * @returns {{ id, filePath, fileName, url }}
 */
async function renderVideo(contentType, data) {
  switch (contentType) {
    case 'slideshow': {
      const slides = data.slides || parseSlides(data.text || data.content || '');
      if (!slides.length) throw new Error('No slides to render');
      return renderComposition('Slideshow', {
        slides,
        brandName: data.brandName || '',
        brandColor: data.brandColor || '#6C3CE1',
      });
    }
    case 'wall-of-text': {
      return renderComposition('WallOfText', {
        text: data.text || data.content || 'Your wall of text goes here.',
        brandName: data.brandName || '',
      });
    }
    case 'video-hook-and-demo': {
      const raw = data.body || data.demo || data.content || data.text || '';
      return renderComposition('VideoHook', {
        hook: data.hook || data.title || 'Wait for it...',
        body: raw,
        brandName: data.brandName || '',
      });
    }
    case 'green-screen-meme': {
      let topText = data.topText || '';
      let bottomText = data.bottomText || '';
      if (!topText && (data.text || data.content)) {
        const rawText = data.text || data.content || '';
        const lines = rawText.split('\n').filter((l) => l.trim());
        if (lines.length >= 2) {
          topText = lines[0];
          bottomText = lines[lines.length - 1];
        } else {
          topText = rawText.slice(0, Math.floor(rawText.length / 2));
          bottomText = rawText.slice(Math.floor(rawText.length / 2));
        }
      }
      return renderComposition('GreenScreenMeme', {
        topText: topText || 'TOP TEXT',
        bottomText: bottomText || 'BOTTOM TEXT',
        brandName: data.brandName || '',
      });
    }
    default:
      throw new Error(`Unknown content type: ${contentType}`);
  }
}

/**
 * Clean up old rendered files (older than 1 hour).
 */
function cleanupOldFiles() {
  try {
    const files = fs.readdirSync(RENDERED_DIR);
    const now = Date.now();
    for (const file of files) {
      const fp = path.join(RENDERED_DIR, file);
      const stat = fs.statSync(fp);
      if (now - stat.mtimeMs > 3600000) fs.unlinkSync(fp);
    }
  } catch (e) {
    console.error('Cleanup error:', e.message);
  }
}

setInterval(cleanupOldFiles, 1800000);

module.exports = { renderVideo, renderFromComposition, RENDERED_DIR };
