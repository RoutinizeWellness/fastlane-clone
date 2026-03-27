require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Init DB
require('./db');

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/generate', require('./routes/content'));
app.use('/api/media', require('./routes/media'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/library', require('./routes/library'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/calendar', require('./routes/calendar'));
app.use('/api/engagement', require('./routes/engagement'));
app.use('/api/brand', require('./routes/brand'));
app.use('/api/tiktok', require('./routes/tiktok'));
app.use('/api/unsplash', require('./routes/unsplash'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', version: '1.0.0' }));

// Serve frontend build (static)
const FRONTEND_DIST = path.join(__dirname, '../frontend/dist');
app.use(express.static(FRONTEND_DIST));

// SPA fallback — all non-API routes serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Fastlane running on http://localhost:${PORT}`);
  console.log(`   Frontend + Backend unified on port ${PORT}`);
});
