const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../db');

// Add website and onboarding_complete columns if they don't exist
try {
  db.exec(`ALTER TABLE brand_config ADD COLUMN website TEXT DEFAULT ''`);
} catch (e) { /* column already exists */ }
try {
  db.exec(`ALTER TABLE brand_config ADD COLUMN onboarding_complete INTEGER DEFAULT 0`);
} catch (e) { /* column already exists */ }

router.get('/', auth, (req, res) => {
  const config = db.prepare('SELECT * FROM brand_config WHERE user_id = ?').get(req.user.id);
  if (!config) return res.json({});
  res.json({
    ...config,
    colors: JSON.parse(config.colors || '[]'),
    pillars: JSON.parse(config.pillars || '[]'),
    audience: JSON.parse(config.audience || '{}')
  });
});

router.put('/', auth, (req, res) => {
  const { brand_name, industry, description, tone, colors, pillars, audience, website, onboarding_complete } = req.body;
  const existing = db.prepare('SELECT id FROM brand_config WHERE user_id = ?').get(req.user.id);
  if (existing) {
    db.prepare(`UPDATE brand_config SET brand_name=?, industry=?, description=?, tone=?, colors=?, pillars=?, audience=?, website=?, onboarding_complete=?, updated_at=CURRENT_TIMESTAMP WHERE user_id=?`)
      .run(brand_name, industry, description, tone, JSON.stringify(colors || []), JSON.stringify(pillars || []), JSON.stringify(audience || {}), website || '', onboarding_complete ? 1 : 0, req.user.id);
  } else {
    db.prepare('INSERT INTO brand_config (user_id, brand_name, industry, description, tone, colors, pillars, audience, website, onboarding_complete) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(req.user.id, brand_name, industry, description, tone, JSON.stringify(colors || []), JSON.stringify(pillars || []), JSON.stringify(audience || {}), website || '', onboarding_complete ? 1 : 0);
  }
  res.json({ message: 'Brand config saved' });
});

// Mock URL analysis endpoint
router.post('/analyze-url', auth, (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  // Extract domain info for mock data generation
  let domain = url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  const domainName = domain.split('.')[0];
  const brandName = domainName.charAt(0).toUpperCase() + domainName.slice(1);

  // Generate realistic mock data based on domain name
  const industryMap = {
    shop: 'E-commerce & Retail',
    store: 'E-commerce & Retail',
    buy: 'E-commerce & Retail',
    tech: 'Technology & Software',
    dev: 'Technology & Software',
    code: 'Technology & Software',
    ai: 'Artificial Intelligence',
    fit: 'Health & Fitness',
    gym: 'Health & Fitness',
    health: 'Health & Wellness',
    food: 'Food & Beverage',
    eat: 'Food & Beverage',
    cook: 'Food & Beverage',
    learn: 'Education & Training',
    edu: 'Education & Training',
    finance: 'Financial Services',
    money: 'Financial Services',
    travel: 'Travel & Hospitality',
    trip: 'Travel & Hospitality',
    style: 'Fashion & Beauty',
    beauty: 'Fashion & Beauty',
    game: 'Gaming & Entertainment',
    play: 'Gaming & Entertainment',
    home: 'Home & Living',
    design: 'Design & Creative',
    art: 'Design & Creative',
    music: 'Music & Audio',
    photo: 'Photography',
    market: 'Marketing & Advertising',
    build: 'Construction & Real Estate',
    auto: 'Automotive',
    pet: 'Pets & Animals',
    green: 'Sustainability & Environment',
    law: 'Legal Services',
    med: 'Healthcare & Medical',
  };

  let industry = 'Technology & SaaS';
  for (const [key, val] of Object.entries(industryMap)) {
    if (domainName.toLowerCase().includes(key)) {
      industry = val;
      break;
    }
  }

  const toneOptions = ['Professional', 'Casual & Fun', 'Educational', 'Inspirational', 'Bold & Direct'];
  const tone = toneOptions[Math.floor(Math.random() * 3)]; // bias toward first 3

  const descriptions = {
    'Technology & SaaS': `${brandName} is a modern technology platform that empowers businesses to streamline their workflows and scale faster with intelligent automation.`,
    'E-commerce & Retail': `${brandName} is a curated online marketplace offering premium products with a focus on quality, sustainability, and exceptional customer experience.`,
    'Health & Fitness': `${brandName} provides personalized fitness and wellness solutions designed to help individuals achieve their health goals through science-backed programs.`,
    'Food & Beverage': `${brandName} is a culinary brand that brings fresh, quality ingredients and innovative recipes to food lovers everywhere.`,
    'Education & Training': `${brandName} is an educational platform that makes learning accessible, engaging, and effective for students and professionals alike.`,
    'Financial Services': `${brandName} simplifies personal and business finance with smart tools, insights, and expert guidance for every financial stage.`,
    'Artificial Intelligence': `${brandName} leverages cutting-edge AI to solve complex problems and automate workflows, making intelligent technology accessible to every team.`,
  };

  const description = descriptions[industry] || `${brandName} is a forward-thinking brand dedicated to delivering exceptional value and innovative solutions in the ${industry.toLowerCase()} space.`;

  const audienceMap = {
    'Technology & SaaS': { demographic: 'Tech-savvy professionals, 25-45', interests: 'Productivity, automation, SaaS tools', painPoints: 'Manual workflows, scaling challenges, tool fragmentation' },
    'E-commerce & Retail': { demographic: 'Online shoppers, 22-40', interests: 'Quality products, deals, trends', painPoints: 'Product discovery, trust, shipping speed' },
    'Health & Fitness': { demographic: 'Health-conscious adults, 20-45', interests: 'Workouts, nutrition, mental wellness', painPoints: 'Consistency, motivation, reliable guidance' },
    'Financial Services': { demographic: 'Professionals & young adults, 25-50', interests: 'Investing, saving, financial literacy', painPoints: 'Complex jargon, lack of transparency, planning' },
    'Artificial Intelligence': { demographic: 'Tech professionals & founders, 25-45', interests: 'AI/ML, automation, data', painPoints: 'Implementation complexity, cost, accuracy' },
  };

  const targetAudience = audienceMap[industry] || { demographic: 'Professionals and consumers, 22-45', interests: `${industry}, innovation, quality`, painPoints: 'Finding reliable solutions, value for money' };

  const keyBenefits = [
    `Streamlined ${industry.split(' ')[0].toLowerCase()} experience`,
    'Intuitive and easy to use',
    'Trusted by thousands of users',
    'Fast results with minimal effort',
  ];

  // Store the website URL
  const existing = db.prepare('SELECT id FROM brand_config WHERE user_id = ?').get(req.user.id);
  if (existing) {
    db.prepare('UPDATE brand_config SET website=?, updated_at=CURRENT_TIMESTAMP WHERE user_id=?').run(url, req.user.id);
  } else {
    db.prepare('INSERT INTO brand_config (user_id, website) VALUES (?, ?)').run(req.user.id, url);
  }

  res.json({
    brand_name: brandName,
    industry,
    description,
    tone,
    target_audience: targetAudience,
    key_benefits: keyBenefits,
    website: url,
    domain,
  });
});

module.exports = router;
