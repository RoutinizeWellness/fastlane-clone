const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../db');

router.get('/overview', auth, (req, res) => {
  const rows = db.prepare(`SELECT date, platform, views, likes, comments, shares, followers FROM analytics_daily WHERE user_id = ? ORDER BY date DESC LIMIT 120`).all(req.user.id);
  const platforms = ['tiktok', 'instagram', 'youtube', 'linkedin'];
  const totals = {};
  platforms.forEach(p => { totals[p] = { views: 0, likes: 0, comments: 0, shares: 0, followers: 0 }; });
  rows.forEach(r => {
    if (totals[r.platform]) {
      totals[r.platform].views += r.views;
      totals[r.platform].likes += r.likes;
      totals[r.platform].comments += r.comments;
      totals[r.platform].shares += r.shares;
      totals[r.platform].followers = Math.max(totals[r.platform].followers, r.followers);
    }
  });
  const totalViews = Object.values(totals).reduce((s, p) => s + p.views, 0);
  const totalFollowers = Object.values(totals).reduce((s, p) => s + p.followers, 0);
  const totalEngagement = Object.values(totals).reduce((s, p) => s + p.likes + p.comments + p.shares, 0);
  const engagementRate = totalViews > 0 ? ((totalEngagement / totalViews) * 100).toFixed(1) : 0;
  
  // Group by date for charts
  const byDate = {};
  rows.forEach(r => {
    if (!byDate[r.date]) byDate[r.date] = { date: r.date, views: 0, followers: 0 };
    byDate[r.date].views += r.views;
    byDate[r.date].followers += r.followers;
  });
  const chartData = Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date)).slice(-30);

  res.json({
    summary: { totalViews, totalFollowers, engagementRate: parseFloat(engagementRate), postsThisWeek: 12 },
    byPlatform: totals,
    chartData
  });
});

module.exports = router;
