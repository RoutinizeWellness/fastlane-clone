const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ai = require('../services/ai');

const MOCK_COMMENTS = [
  { id: 1, platform: 'tiktok', username: '@sarah_creates', avatar: 'https://i.pravatar.cc/40?img=1', text: 'This is so helpful! Can you make more content like this?', time: '2h ago', replied: false },
  { id: 2, platform: 'instagram', username: '@mikejohnson', avatar: 'https://i.pravatar.cc/40?img=2', text: 'Love your content! Been following for 6 months 🔥', time: '3h ago', replied: true },
  { id: 3, platform: 'tiktok', username: '@growthhacker99', avatar: 'https://i.pravatar.cc/40?img=3', text: 'What tools do you use to create these videos?', time: '5h ago', replied: false },
  { id: 4, platform: 'youtube', username: 'ContentKing', avatar: 'https://i.pravatar.cc/40?img=4', text: 'Subscribed! This is exactly what I needed.', time: '6h ago', replied: false },
  { id: 5, platform: 'instagram', username: '@nina_lifestyle', avatar: 'https://i.pravatar.cc/40?img=5', text: 'Saved! Watching this 10 times 😭', time: '8h ago', replied: true },
  { id: 6, platform: 'linkedin', username: 'James Peterson', avatar: 'https://i.pravatar.cc/40?img=6', text: 'Great insights! Applied this to my team and saw 30% improvement.', time: '1d ago', replied: false },
  { id: 7, platform: 'tiktok', username: '@viral_tips', avatar: 'https://i.pravatar.cc/40?img=7', text: 'Ngl this changed my whole strategy', time: '1d ago', replied: false },
  { id: 8, platform: 'instagram', username: '@creativestudio', avatar: 'https://i.pravatar.cc/40?img=8', text: 'Can we collab? DM me!', time: '2d ago', replied: false },
];

router.get('/comments', auth, (req, res) => {
  const { platform, replied } = req.query;
  let comments = [...MOCK_COMMENTS];
  if (platform) comments = comments.filter(c => c.platform === platform);
  if (replied !== undefined) comments = comments.filter(c => c.replied === (replied === 'true'));
  res.json({ comments });
});

router.post('/reply', auth, async (req, res) => {
  const { comment, context } = req.body;
  const system = 'You are a friendly, authentic social media creator. Write a genuine reply to a comment. Be warm, concise (1-2 sentences), and encourage engagement. No hashtags. Sound human.';
  const prompt = `Reply to this comment: "${comment}"${context ? ` Context: ${context}` : ''}`;
  const reply = await ai.generateWallOfText({ topic: prompt, platform: 'reply' }).catch(() => 'Thank you so much for this! It really means a lot 🙏 Drop a follow for more!');
  res.json({ reply: reply.split('\n')[0] || reply });
});

module.exports = router;
