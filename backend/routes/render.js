/**
 * Routes for video rendering — generates real .mp4 files via FFmpeg.
 */
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const { renderVideo, RENDERED_DIR } = require('../services/videoRenderer');

// POST /render — trigger a video render
router.post('/', auth, async (req, res) => {
  try {
    const { contentType, data } = req.body;
    if (!contentType) return res.status(400).json({ error: 'contentType is required' });
    if (!data) return res.status(400).json({ error: 'data is required' });

    console.log(`[Render] Starting ${contentType} render...`);
    const start = Date.now();
    const result = await renderVideo(contentType, data);
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`[Render] ${contentType} done in ${elapsed}s → ${result.fileName}`);

    res.json({
      success: true,
      id: result.id,
      fileName: result.fileName,
      url: result.url,
      renderTime: elapsed,
    });
  } catch (e) {
    console.error('[Render] Error:', e.message);
    res.status(500).json({ error: e.message || 'Render failed' });
  }
});

// GET /render/:filename — serve a rendered .mp4 file
router.get('/:filename', (req, res) => {
  const filename = req.params.filename;
  // Sanitize filename to prevent path traversal
  if (filename.includes('..') || filename.includes('/')) {
    return res.status(400).json({ error: 'Invalid filename' });
  }
  const filePath = path.join(RENDERED_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  const stat = fs.statSync(filePath);
  res.setHeader('Content-Type', 'video/mp4');
  res.setHeader('Content-Length', stat.size);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  fs.createReadStream(filePath).pipe(res);
});

module.exports = router;
