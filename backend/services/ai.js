const Groq = require('groq-sdk');
const axios = require('axios');

let groq = null;
if (process.env.GROQ_API_KEY) {
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
}

async function callAI(systemPrompt, userPrompt) {
  if (groq) {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.85,
      max_tokens: 2000
    });
    return completion.choices[0].message.content;
  }
  // Mock fallback
  return null;
}

async function generateSlideshow({ topic, platform, tone }) {
  const system = `You are a viral social media content expert. Generate engaging carousel/slideshow content. Always respond with valid JSON only, no markdown.`;
  const prompt = `Create a 6-slide carousel for ${platform} about "${topic}".
Tone: ${tone}. Make it viral and engaging.
Return ONLY this JSON format:
[
  {"slide": 1, "title": "Hook title (max 8 words)", "body": "2-3 sentences of value", "emoji": "🔥"},
  {"slide": 2, "title": "Point 1 title", "body": "Explanation with actionable insight", "emoji": "💡"},
  {"slide": 3, "title": "Point 2 title", "body": "Explanation with actionable insight", "emoji": "⚡"},
  {"slide": 4, "title": "Point 3 title", "body": "Explanation with actionable insight", "emoji": "🎯"},
  {"slide": 5, "title": "Bonus tip", "body": "The secret most people miss", "emoji": "✨"},
  {"slide": 6, "title": "Save this! →", "body": "Follow for daily ${topic} tips!", "emoji": "❤️", "cta": true}
]`;

  const raw = await callAI(system, prompt);
  if (raw) {
    try {
      const match = raw.match(/\[[\s\S]*\]/);
      if (match) return JSON.parse(match[0]);
    } catch {}
  }
  // Mock
  return [
    { slide: 1, title: `${topic}: The Complete Guide`, body: `Most people get ${topic} wrong. Here's what actually works in 2024.`, emoji: '🔥' },
    { slide: 2, title: 'Step 1: Foundation', body: `Before anything else, you need to understand the core principles of ${topic}. This changes everything.`, emoji: '💡' },
    { slide: 3, title: 'Step 2: Strategy', body: `The strategy that top creators use for ${topic} — and it's simpler than you think.`, emoji: '⚡' },
    { slide: 4, title: 'Step 3: Execute', body: `Consistency beats perfection. Apply these ${topic} principles daily for 30 days.`, emoji: '🎯' },
    { slide: 5, title: 'The Secret No One Tells You', body: `The #1 mistake people make with ${topic} is overthinking it. Start messy, refine later.`, emoji: '✨' },
    { slide: 6, title: 'Save This! →', body: `Follow for daily tips on ${topic} and content creation!`, emoji: '❤️', cta: true }
  ];
}

async function generateWallOfText({ topic, platform, hookStyle }) {
  const maxWords = platform === 'twitter' ? 280 : platform === 'linkedin' ? 1300 : 500;
  const system = `You are a viral ${platform} copywriter. Write posts that stop the scroll. Use frequent line breaks. Be direct and punchy.`;
  const prompt = `Write a ${platform} post about "${topic}".
Hook style: ${hookStyle || 'bold statement'}
Max length: ${maxWords} characters
Rules:
- First line must make people stop scrolling (no "I" at the start)
- Short sentences. White space. Easy to read.
- Use emojis strategically (not every line)
- End with a strong CTA (question or call to follow)
- Make it feel real, not AI-generated`;

  const raw = await callAI(system, prompt);
  if (raw) return raw;

  return `The ${topic} advice no one tells you:\n\n→ Start before you're ready\n→ Done > perfect\n→ Show your process, not just results\n\nI spent 2 years waiting to be "good enough."\n\nDon't make my mistake.\n\nThe algorithm rewards consistency more than perfection.\n\nPost ugly. Post scared. Post anyway.\n\nThe people winning at ${topic} aren't smarter than you.\n\nThey just started.\n\n---\n\nWhat's stopping YOU from starting with ${topic}? Drop it below 👇`;
}

async function generateVideoHook({ topic, platform, hookType }) {
  const system = `You are a viral short-form video script writer for ${platform}. Create scripts that hook viewers in the first 3 seconds.`;
  const prompt = `Write a 60-second video script about "${topic}" for ${platform}.
Hook type: ${hookType || 'question'}

Format exactly like this:
[HOOK - 0:00-0:03]: (3-second grabber)
[SETUP - 0:03-0:10]: (quick context)
[POINT 1 - 0:10-0:25]: (main value)
[POINT 2 - 0:25-0:40]: (supporting value)
[CTA - 0:40-0:60]: (call to action)

CAPTION: (post caption with emojis)
HASHTAGS: #hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5`;

  const raw = await callAI(system, prompt);
  if (raw) return raw;

  return `[HOOK - 0:00-0:03]: "Stop scrolling. I'm about to save you 6 months on ${topic}."

[SETUP - 0:03-0:10]: "I made every mistake possible with ${topic}. So you don't have to."

[POINT 1 - 0:10-0:25]: "First thing: ${topic} isn't about what you think. Most people focus on [wrong thing]. The real key is [right approach]."

[POINT 2 - 0:25-0:40]: "Second: Consistency beats quality every time. Post 3x per week minimum. The algorithm rewards frequency."

[CTA - 0:40-0:60]: "Follow me for more ${topic} tips. I post every day. Let's grow together."

CAPTION: POV: You just found the ${topic} cheat code 🔥 Save this for later!

HASHTAGS: #${topic.replace(/\s/g, '')} #contentcreator #socialmediatips #growthhacks #viral`;
}

async function generateGreenScreen({ topic, platform, trend }) {
  const system = `You are a meme and viral content creator. Create green screen meme scripts that are funny, relatable, and shareable.`;
  const prompt = `Create a green screen meme about "${topic}" for ${platform}.
Trend/format: ${trend || 'reaction meme'}

Format:
BACKGROUND_SEARCH: (2-3 words to search for background video, e.g. "stock market crash" or "party celebration")
TOP_TEXT: (MAX 5 WORDS IN CAPS)
BOTTOM_TEXT: (MAX 6 WORDS IN CAPS)  
REACTION_TEXT: (what the person on screen says/reacts, 1 sentence)
CAPTION: (post caption with emojis)
HASHTAGS: #hashtag1 #hashtag2 #hashtag3`;

  const raw = await callAI(system, prompt);
  if (raw) return raw;

  return `BACKGROUND_SEARCH: success celebration party
TOP_TEXT: ME EXPLAINING ${topic.toUpperCase()} TO MY FRIENDS
BOTTOM_TEXT: THEM ACTUALLY TRYING IT
REACTION_TEXT: "Wait... this actually works??"
CAPTION: The ${topic} pipeline hits different when it actually works 😭🔥
HASHTAGS: #${topic.replace(/\s/g, '')} #relatable #foryou #viral #contentcreator`;
}

async function generateBlitz({ topic, platforms, count }) {
  const results = [];
  const types = ['slideshow', 'walloftext', 'videohook', 'greenscreen'];
  for (let i = 0; i < Math.min(count, platforms.length); i++) {
    const platform = platforms[i];
    const type = types[i % types.length];
    let content;
    if (type === 'slideshow') content = await generateSlideshow({ topic, platform, tone: 'engaging' });
    else if (type === 'walloftext') content = await generateWallOfText({ topic, platform });
    else if (type === 'videohook') content = await generateVideoHook({ topic, platform });
    else content = await generateGreenScreen({ topic, platform });
    results.push({ type, platform, content });
  }
  return results;
}

module.exports = { generateSlideshow, generateWallOfText, generateVideoHook, generateGreenScreen, generateBlitz };
