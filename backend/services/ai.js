const Groq = require('groq-sdk');
const axios = require('axios');

let groq = null;
if (process.env.GROQ_API_KEY) {
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
}

async function callAI(systemPrompt, userPrompt) {
  if (groq) {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.85,
      max_tokens: 3000
    });
    return completion.choices[0].message.content;
  }
  // Mock fallback
  return null;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildBrandLine(brandContext) {
  if (!brandContext) return '';
  const parts = [];
  if (brandContext.brand_name) parts.push(`Brand: ${brandContext.brand_name}`);
  if (brandContext.website_url) parts.push(`Website: ${brandContext.website_url}`);
  if (brandContext.industry) parts.push(`Industry: ${brandContext.industry}`);
  if (brandContext.product_type) parts.push(`Product type: ${brandContext.product_type}`);
  if (brandContext.description) parts.push(`About: ${brandContext.description}`);
  if (brandContext.tone) parts.push(`Preferred tone: ${brandContext.tone}`);
  if (brandContext.target_audience) parts.push(`Target audience: ${brandContext.target_audience}`);
  if (brandContext.key_terms) {
    try {
      const kt = typeof brandContext.key_terms === 'string' ? JSON.parse(brandContext.key_terms) : brandContext.key_terms;
      if (Array.isArray(kt) && kt.length > 0) parts.push(`Key terms/topics: ${kt.join(', ')}`);
    } catch {}
  }
  if (brandContext.tagline) parts.push(`Tagline: ${brandContext.tagline}`);
  if (brandContext.pillars) {
    try {
      const p = typeof brandContext.pillars === 'string' ? JSON.parse(brandContext.pillars) : brandContext.pillars;
      if (Array.isArray(p)) parts.push(`Content pillars: ${p.join(', ')}`);
    } catch {}
  }
  if (brandContext.audience) {
    try {
      const a = typeof brandContext.audience === 'string' ? JSON.parse(brandContext.audience) : brandContext.audience;
      if (a && typeof a === 'object' && Object.keys(a).length > 0) parts.push(`Target audience demographics: ${JSON.stringify(a)}`);
    } catch {}
  }
  return parts.length ? `\n\nBRAND CONTEXT (personalize ALL content to this specific brand and its business — reference their actual products, audience, and industry):\n${parts.join('\n')}` : '';
}

// --- MOCK SLIDESHOW SETS ---
// placeholder: filled below
function buildMockSlideshows(topic) {
  return [
    // 1 - SaaS founder sharing growth tips
    [
      { slide: 1, title: 'things i wish i knew before starting my saas', body: `i burned through $40k before figuring out ${topic}. here's what actually moved the needle (not what twitter gurus told me).`, emoji: '🫠' },
      { slide: 2, title: 'talk to users before writing code', body: `literally just DM 50 people in your niche. ask what they struggle with. i built 3 features nobody wanted bc i skipped this step with ${topic}.`, emoji: '💬' },
      { slide: 3, title: 'charge from day one', body: `free users give you vanity metrics. paying users give you real feedback. even $9/mo filters out people who won't help you improve ${topic}.`, emoji: '💸' },
      { slide: 4, title: 'your landing page matters more than your product', body: `spent 6 months on features, 2 hours on the landing page. conversion was 0.3%. rewrote the copy in one afternoon, jumped to 4.2%.`, emoji: '📝' },
      { slide: 5, title: 'distribution > product every time', body: `the best ${topic} product with no distribution loses to a mid product with great distribution. build your audience while you build your thing.`, emoji: '📣' },
      { slide: 6, title: 'save this if you\'re building something', body: `follow for more raw ${topic} startup lessons — no fluff, just stuff that actually worked for me`, emoji: '🔖', cta: true }
    ],
    // 2 - E-commerce brand tips
    [
      { slide: 1, title: 'how i went from 0 to $10k/mo selling online', body: `no dropshipping. no guru courses. just ${topic} fundamentals that nobody talks about bc they're not sexy.`, emoji: '📦' },
      { slide: 2, title: 'stop running ads before you fix this', body: `your product photos are probably mid. i switched to UGC-style content for ${topic} and my ROAS went from 1.2x to 4.8x overnight.`, emoji: '📸' },
      { slide: 3, title: 'email is still king tbh', body: `40% of my revenue comes from email. set up a welcome flow, abandoned cart, and post-purchase sequence. that's literally it for ${topic}.`, emoji: '📧' },
      { slide: 4, title: 'the pricing trick that changed everything', body: `added a "most popular" tier at 2x my original price. suddenly the original felt like a steal. anchoring is real for ${topic}.`, emoji: '🏷️' },
      { slide: 5, title: 'returns are a feature not a bug', body: `offered free returns, return rate only went up 2% but conversion jumped 23%. people just need to feel safe buying ${topic} stuff online.`, emoji: '🔄' },
      { slide: 6, title: 'follow for more e-comm tips that actually work', body: `i share what's working in my ${topic} store every week — the real numbers, not the highlight reel`, emoji: '🛒', cta: true }
    ],
    // 3 - Fitness app / coach
    [
      { slide: 1, title: 'things that actually helped me get in shape', body: `not a "fitness influencer" just someone who finally figured out ${topic} after years of overcomplicating it. here's what stuck.`, emoji: '💪' },
      { slide: 2, title: 'protein is boring but non-negotiable', body: `stopped trying to hit macros perfectly. just made sure every meal had a palm-sized protein source. game changer for ${topic} results.`, emoji: '🍗' },
      { slide: 3, title: 'walking > HIIT for most people', body: `i was doing intense workouts 6x/week and burning out. switched to lifting 3x + daily walks. better results, way more sustainable for ${topic}.`, emoji: '🚶' },
      { slide: 4, title: 'sleep is literally a performance enhancer', body: `tracked my lifts on 6hrs vs 8hrs sleep. the difference was insane. your ${topic} gains happen in bed, not in the gym.`, emoji: '😴' },
      { slide: 5, title: 'the best program is the one you actually do', body: `stop program hopping. pick something reasonable and do it for 12 weeks minimum. consistency with ${topic} beats optimization.`, emoji: '📋' },
      { slide: 6, title: 'save this & send to someone who needs it', body: `follow for more no-bs ${topic} fitness content from someone who's still figuring it out too`, emoji: '❤️', cta: true }
    ],
    // 4 - Beauty brand / skincare
    [
      { slide: 1, title: 'skincare mistakes i made so you don\'t have to', body: `spent hundreds on ${topic} products before learning that most of my routine was actually making things worse. let me save you the money.`, emoji: '🧴' },
      { slide: 2, title: 'you probably don\'t need 10 steps', body: `cleanser, moisturizer, SPF. that's it for most people starting out with ${topic}. add actives slowly or your skin will freak out (ask me how i know).`, emoji: '✨' },
      { slide: 3, title: 'spf every single day no exceptions', body: `even if you're inside. even if it's cloudy. UV damage is the #1 cause of premature aging. this is the ${topic} hill i will die on.`, emoji: '☀️' },
      { slide: 4, title: 'retinol changed my skin but start slow', body: `started with 0.025% twice a week. took 3 months to see results but my texture is completely different now with ${topic}.`, emoji: '🌙' },
      { slide: 5, title: 'expensive ≠ better', body: `my holy grail moisturizer is $12. the $80 one did the exact same thing. don't let ${topic} marketing convince you otherwise.`, emoji: '💰' },
      { slide: 6, title: 'follow for honest skincare content', body: `no sponsorships influencing my recs — just sharing what actually works for ${topic} after years of trial and error`, emoji: '🫶', cta: true }
    ],
    // 5 - Finance / money tips
    [
      { slide: 1, title: 'money habits that actually built my savings', body: `not "stop buying lattes" advice. actual ${topic} systems that helped me save $30k in a year on a normal salary.`, emoji: '💵' },
      { slide: 2, title: 'automate everything', body: `set up auto-transfers the day you get paid. if the money never hits your checking account, you don't miss it. ${topic} on autopilot.`, emoji: '🤖' },
      { slide: 3, title: 'the 50/30/20 rule is a starting point not gospel', body: `adjust the ratios to your life. i do 60/20/20 bc my rent is high. the point is having ANY system for ${topic}.`, emoji: '📊' },
      { slide: 4, title: 'high yield savings changed the game', body: `moved my emergency fund to a HYSA earning 5%. that's literally free money just sitting there. why did nobody tell me about this ${topic} trick sooner.`, emoji: '🏦' },
      { slide: 5, title: 'invest boring, live exciting', body: `i just buy index funds every month and don't look at them. no meme stocks. no crypto gambling. boring ${topic} strategy, fun life.`, emoji: '📈' },
      { slide: 6, title: 'save this for when you need a money reset', body: `follow for real ${topic} finance tips from someone who used to be terrible with money`, emoji: '🔖', cta: true }
    ],
    // 6 - Content creator tips
    [
      { slide: 1, title: 'how i actually come up with content ideas', body: `spoiler: it's not staring at a blank screen for 2 hours. here's my ${topic} system that gives me 30+ ideas in 20 minutes.`, emoji: '🧠' },
      { slide: 2, title: 'screenshot everything', body: `comments, DMs, reddit threads, tweets that make you think. dump them all in a notes folder. that's your ${topic} content goldmine.`, emoji: '📱' },
      { slide: 3, title: 'steal the structure not the content', body: `find a viral post in a completely different niche. use the same format/structure but apply it to ${topic}. this is how most viral posts are actually made.`, emoji: '🔄' },
      { slide: 4, title: 'one idea = five posts minimum', body: `take one ${topic} concept. make it a carousel, a talking head video, a story, a meme, and a text post. that's a week of content from one idea.`, emoji: '♻️' },
      { slide: 5, title: 'your flops teach you more than your wins', body: `go look at your worst performing ${topic} post. figure out why it flopped. that insight is worth more than any course.`, emoji: '📉' },
      { slide: 6, title: 'follow for creator tips that aren\'t recycled', body: `sharing what actually works in ${topic} content creation — the real stuff, updated for what's working rn`, emoji: '🔥', cta: true }
    ],
    // 7 - Relationship / soft skills
    [
      { slide: 1, title: 'communication skills that lowkey saved my relationship', body: `not therapy advice. just ${topic} things i learned the hard way that made a huge difference in how we handle conflict.`, emoji: '💛' },
      { slide: 2, title: 'validate before you problem-solve', body: `"that sounds really frustrating" hits different than "well have you tried..." most arguments aren't about finding a solution with ${topic}.`, emoji: '👂' },
      { slide: 3, title: 'the repair attempt is everything', body: `it's not about never fighting. it's about how fast you can de-escalate. a well-timed joke or "can we start over" changes everything in ${topic}.`, emoji: '🤝' },
      { slide: 4, title: 'say the thing you\'re afraid to say', body: `"i felt hurt when..." is scary to say but it prevents weeks of passive-aggressive energy. directness is kindness in ${topic}.`, emoji: '🗣️' },
      { slide: 5, title: 'schedule the hard conversations', body: `don't ambush people. "hey can we talk about something tonight?" gives them time to prepare. way better outcomes for ${topic} topics.`, emoji: '📅' },
      { slide: 6, title: 'send this to someone you care about', body: `follow for more ${topic} real talk about relationships and communication`, emoji: '💕', cta: true }
    ],
    // 8 - Side hustle / freelancing
    [
      { slide: 1, title: 'the side hustle that actually pays (not dropshipping)', body: `tried 6 different things before finding what works with ${topic}. most "passive income" advice is a scam. here's what isn't.`, emoji: '💼' },
      { slide: 2, title: 'freelance the skill you already have', body: `you don't need to learn a new thing. whatever you do at your 9-5, someone will pay you directly for it. ${topic} freelancing is underrated.`, emoji: '💻' },
      { slide: 3, title: 'your first client is always the hardest', body: `do one project at 50% of your target rate. get the testimonial. use it to land the next 5 at full price. ${topic} social proof > everything.`, emoji: '🎯' },
      { slide: 4, title: 'productize your service', body: `don't sell "hours." sell a specific outcome at a fixed price. "i'll build your ${topic} landing page for $2k" > "$50/hour web dev."`, emoji: '📦' },
      { slide: 5, title: 'reinvest before you lifestyle creep', body: `first $1k goes back into ${topic}. better tools, a course that's actually good, or hiring help. compound your side hustle like an investment.`, emoji: '📈' },
      { slide: 6, title: 'follow if you\'re building on the side', body: `sharing my ${topic} side hustle journey — the real numbers and what's actually working`, emoji: '🚀', cta: true }
    ],
    // 9 - Mental health / self-improvement
    [
      { slide: 1, title: 'things that helped my mental health more than "just meditate"', body: `meditation is great but ${topic} taught me these were the actual game changers nobody talks about.`, emoji: '🧘' },
      { slide: 2, title: 'morning phone-free hour', body: `first hour of the day, phone stays in another room. the difference in my anxiety levels was noticeable within a week of this ${topic} habit.`, emoji: '📵' },
      { slide: 3, title: 'the brain dump before bed', body: `spend 5 min writing every thought down. doesn't need to make sense. just get it out of your head. sleep quality improved dramatically with ${topic}.`, emoji: '📝' },
      { slide: 4, title: 'one hard conversation > months of journaling', body: `journaling helped me understand my feelings. but actually telling someone how i felt? that's where ${topic} real healing happened.`, emoji: '💬' },
      { slide: 5, title: 'movement isn\'t about fitness', body: `i don't work out to look good. i work out bc 30 min of walking completely resets my brain. ${topic} mental health hack that costs $0.`, emoji: '🚶' },
      { slide: 6, title: 'save this for a bad day', body: `follow for more ${topic} mental health content that's actually realistic and not toxic positivity`, emoji: '💛', cta: true }
    ]
  ];
}

// --- MOCK WALL-OF-TEXT POSTS ---
function buildMockWallPosts(topic) {
  return [
    `ngl the ${topic} advice on this app is wild rn\n\neveryone's out here saying "just be consistent" like that's some groundbreaking revelation\n\nbut nobody talks about what to do when you've been consistent for 6 months and nothing's happening\n\nso here's what actually worked for me:\n\ni stopped posting what i thought would go viral\nand started posting what i genuinely cared about\n\nsounds dumb right?\n\nbut the algorithm can literally tell when you're forcing it\n\nmy most viral post ever was a rant i almost didn't publish bc i thought it was "too personal"\n\n47k views. from being real.\n\nthe ${topic} game isn't about hacks\nit's about being the one person who's not faking it\n\ntbh that's harder than any strategy\n\nwhat's one thing you're afraid to post about? drop it below 👇`,

    `ok i need to talk about something with ${topic} that's been bothering me\n\nthis whole "hustle 24/7" narrative is genuinely harmful\n\ni tried it. for 18 months.\n\nhere's what i got:\n→ burned out so bad i couldn't get out of bed\n→ lost relationships bc i was "always working"\n→ my content got WORSE not better\n→ my ${topic} results actually flatlined\n\nwhat actually moved the needle:\n\nworking 5 focused hours instead of 12 scattered ones\n\ntaking weekends completely off\n\nsaying no to opportunities that didn't excite me\n\nmy revenue went UP when i worked less\n\nbc burnt out people make bad decisions\n\nif you're running on empty rn... this is your permission to rest\n\nrest is productive. i'll die on this hill. 🤷`,

    `tbh i almost quit ${topic} last month\n\n3 months of posting every day\n\nfollowers barely moving\n\nengagement was mid at best\n\ni was THIS close to deleting everything\n\nthen one post hit\n\nnot even my best work honestly\n\njust me being frustrated and real about the ${topic} struggle\n\n200k views in 48 hours\n\nand here's what i learned:\n\nthe posts where you're most vulnerable\nthe ones you almost don't publish\nthose are the ones that connect\n\nbc everyone else is posting polished perfect content\n\nand people are starving for someone who's just... real\n\nif you're in the "nothing is working" phase rn\n\nkeep going\n\nyour breakout post is probably the next one you're scared to make\n\nwho else is in the grind phase? 🙋`,

    `unpopular ${topic} opinion incoming:\n\nyou don't need a niche\n\nthere i said it\n\nevery guru says "niche down" like it's gospel\n\nbut some of the biggest creators i know post about whatever they want\n\nthe niche is YOU\n\nyour perspective. your humor. your way of explaining things.\n\ni spent months trying to be a "${topic} expert account" and it felt so forced\n\nswitched to just sharing what i find interesting + my honest takes\n\nand engagement went 📈\n\nbc people follow people not topics\n\nnow that said... if niching down works for you, amazing. keep doing it.\n\nbut if you're struggling bc you feel boxed in?\n\nmaybe the box is the problem\n\nnot you\n\nimo the best content comes from curiosity not strategy\n\nthoughts? agree or disagree? 💬`,

    `real talk: the ${topic} content you're consuming is probably holding you back\n\nnot bc it's bad advice necessarily\n\nbut bc you're spending 2 hours a day learning\nand 0 hours doing\n\ni used to watch every youtube video about ${topic}\nread every thread\nsave every carousel\n\nand then do... nothing with it\n\nbc i was stuck in "research mode"\n\nhere's the uncomfortable truth:\n\nyou already know enough to start\n\nlike right now\n\nyou don't need one more course\none more strategy breakdown\none more "ultimate guide"\n\nyou need to post something imperfect today\n\nand then do it again tomorrow\n\nbc the gap between where you are and where you want to be with ${topic}?\n\nit's not a knowledge gap\n\nit's an action gap\n\nclose the app. go make something. come back and tell me you did it 🔥`,

    `something wild happened with my ${topic} this week and i have to share\n\ngot a DM from someone saying my content helped them start their business\n\nthey literally quit their job\n\nand here's the thing... i have less than 5k followers\n\nwe get so caught up in numbers\n\n"i only have 200 followers"\n"my post only got 50 views"\n\nbut those are REAL PEOPLE\n\n50 views = 50 humans who stopped scrolling to listen to you\n\nthat's more people than fit in most classrooms\n\nif you're making ${topic} content for a small audience rn\n\nyou're not small\n\nyou're early\n\nand the people watching now are going to be your day ones when you blow up\n\nkeep showing up for them 💛`,

    `the ${topic} strategy that nobody's talking about bc it's too simple:\n\nreply to every single comment\n\nnot with "thanks!" or a heart emoji\n\nwith a genuine thoughtful response\n\ni know it sounds basic but hear me out\n\nwhen someone comments and you actually engage?\n→ they feel seen\n→ they come back\n→ the algorithm notices the conversation\n→ other people see the replies and want to join\n\ni went from 2% to 11% engagement rate just from this\n\nno fancy tools\nno scheduling software\njust being a human who talks to other humans\n\nthe irony of ${topic} social media is that being genuinely social is the biggest competitive advantage\n\nand almost nobody does it bc it doesn't scale\n\nbut honestly? it doesn't need to scale yet\n\nbe unscalable. it's a superpower rn. 🫡`,

    `ok storytime about ${topic} bc this was a turning point for me\n\n6 months ago i was posting the "right" way\n\ntrending audios ✓\noptimal posting times ✓\nhashtag research ✓\nperfect thumbnails ✓\n\nresult: crickets\n\nthen one day i was having a terrible day and just ranted on camera for 90 seconds about how ${topic} is harder than people make it look\n\ndidn't edit it\ndidn't add captions\ndidn't even fix my hair\n\nthat video outperformed my last 30 posts COMBINED\n\nbc the algorithm doesn't reward perfect content\n\nit rewards content that makes people FEEL something\n\nand raw unfiltered honesty makes people feel more than any polished carousel ever will\n\nstop trying to be perfect\nstart trying to be real\n\nthat's the whole strategy tbh`,

    `hot take: if your ${topic} content isn't getting views it's probably bc your hooks are mid\n\nnot your content\nnot your editing\nnot the algorithm\n\njust your first line\n\nbc nobody sees your amazing insight on slide 4 if slide 1 doesn't stop the scroll\n\nhere's what works rn:\n\n→ "nobody talks about this" (curiosity gap)\n→ "i was wrong about..." (pattern interrupt)\n→ "stop doing X" (negative command)\n→ "this is embarrassing but..." (vulnerability)\n→ "here's what $X taught me about ${topic}" (specificity)\n\nspend 50% of your creation time on the hook\n\nthat's not an exaggeration\n\nthe hook IS the content in 2025\n\neverything else is just payoff for getting them to stay\n\nsave this list for the next time you sit down to create 📌`
  ];
}

// --- MOCK VIDEO HOOKS ---
function buildMockVideoHooks(topic) {
  return [
    `[HOOK - 0:00-0:03]: "ok so... nobody's gonna tell you this about ${topic} so i will."\n\n[SETUP - 0:03-0:10]: "i literally spent like a year doing this wrong and the fix was so stupidly simple i'm almost embarrassed to share it."\n\n[POINT 1 - 0:10-0:25]: "here's the thing... everyone says you need to post more. post consistently. post every day. and like... yeah sure. but what they don't tell you is that one really good ${topic} post outperforms 30 mid ones. i had a month where i posted 4 times total and grew more than the month i posted 30 times."\n\n[POINT 2 - 0:25-0:40]: "so instead of asking 'how do i post more' ask 'how do i make something someone would actually send to their friend.' that's the real ${topic} metric. not views. shares."\n\n[CTA - 0:40-0:60]: "if this was helpful save it bc i'm gonna break down exactly how to make shareable content in my next post. follow so you don't miss it."\n\nCAPTION: the ${topic} advice i needed to hear a year ago tbh\n\nHASHTAGS: #${topic.replace(/\s/g, '')} #creatortips #realtalk #growthhacks #learnontiktok`,

    `[HOOK - 0:00-0:03]: "stop... do not spend money on ${topic} until you watch this."\n\n[SETUP - 0:03-0:10]: "i wasted like $3k on courses and tools before realizing everything i needed was free. literally free. let me save you the money real quick."\n\n[POINT 1 - 0:10-0:25]: "first thing — you don't need canva pro. the free version does like 90% of what you need for ${topic}. second — capcut is free and it's better than most paid editors. third — google trends is free and it tells you exactly what people are searching for right now."\n\n[POINT 2 - 0:25-0:40]: "the expensive thing isn't tools it's TIME. and the biggest time waste in ${topic} is creating content nobody asked for. so before you make anything... go to reddit, go to quora, look at the questions people actually ask. then answer them. that's it."\n\n[CTA - 0:40-0:60]: "comment 'FREE' and i'll drop my full list of free ${topic} tools that i use every single day. and follow bc i make these every week."\n\nCAPTION: saved myself $3k with this ${topic} realization ngl\n\nHASHTAGS: #${topic.replace(/\s/g, '')} #freetools #savemoney #creatortips #tiktokgrowth`,

    `[HOOK - 0:00-0:03]: "i need to be honest about ${topic} for a second."\n\n[SETUP - 0:03-0:10]: "everyone on here makes it look easy right? like they just wake up, post content, money appears. i'm gonna show you what it actually looks like behind the scenes."\n\n[POINT 1 - 0:10-0:25]: "my screen time last week was 9 hours a day. not scrolling... working. editing, engaging, replying to DMs, researching ${topic} trends, writing captions at midnight. the 'passive income' everyone talks about? there's nothing passive about it in the beginning."\n\n[POINT 2 - 0:25-0:40]: "but here's what keeps me going... i talked to a 9-5 version of me. that person was putting in 8 hours a day making someone else's dream happen. at least now every hour i put into ${topic} compounds for ME. and that changes everything."\n\n[CTA - 0:40-0:60]: "if you're in the trenches rn... you're not alone. drop a '🫡' if you're grinding right now and follow for the unfiltered ${topic} journey."\n\nCAPTION: the part of ${topic} nobody shows you 🫡\n\nHASHTAGS: #${topic.replace(/\s/g, '')} #behindthescenes #honestcreator #grindmode #realtalk`,

    `[HOOK - 0:00-0:03]: "this ${topic} hack is actually insane and takes 5 minutes."\n\n[SETUP - 0:03-0:10]: "ok so i tested this for 30 days and my engagement literally doubled. and it's so simple you're gonna be mad you weren't doing it already."\n\n[POINT 1 - 0:10-0:25]: "right before you post... go spend 10 minutes genuinely engaging with other people's content in your ${topic} niche. not spam comments like 'great post!' — actually thoughtful replies. the algorithm sees you being active and it's like 'oh this person is here, let's show their stuff too.'"\n\n[POINT 2 - 0:25-0:40]: "i went from getting pushed to like 200 people to consistently hitting 2-3k on every ${topic} post. same content quality. the only variable i changed was this pre-posting engagement routine. it sounds too simple to work but... it just does."\n\n[CTA - 0:40-0:60]: "try this before your next post and come tell me if it worked. follow for more ${topic} stuff that actually moves numbers."\n\nCAPTION: tried this for 30 days and honestly wow 🤯\n\nHASHTAGS: #${topic.replace(/\s/g, '')} #engagementhack #algorithmtip #growthtips #creatortok`,

    `[HOOK - 0:00-0:03]: "your ${topic} content is not the problem. i promise."\n\n[SETUP - 0:03-0:10]: "i've looked at hundreds of accounts that are stuck and it's almost never the content quality. it's almost always one of these three things."\n\n[POINT 1 - 0:10-0:25]: "number one... your hooks are boring. like genuinely nobody is reading past your first slide or watching past second three bc your opening doesn't create curiosity. number two... you're not telling people what to DO. no CTA means no engagement means the ${topic} algorithm ignores you."\n\n[POINT 2 - 0:25-0:40]: "and number three — this is the big one — you're not posting enough to even give the algorithm data to work with. like... three posts and you're discouraged? the algorithm needs at least 20-30 ${topic} posts to figure out who to show your stuff to."\n\n[CTA - 0:40-0:60]: "so here's your homework. go fix your hooks on your last 3 posts, add CTAs, and commit to 30 days. follow me and i'll check in on your progress."\n\nCAPTION: hard truth but someone had to say it about ${topic} 🎯\n\nHASHTAGS: #${topic.replace(/\s/g, '')} #hardtruth #contentcreation #growthadvice #tiktokcoach`,

    `[HOOK - 0:00-0:03]: "wait... you're still doing ${topic} like this?"\n\n[SETUP - 0:03-0:10]: "ok i'm not judging but if you're spending more than 30 minutes making a single post you need to hear this. there's a faster way and it actually performs better."\n\n[POINT 1 - 0:10-0:25]: "it's called batch creating and honestly it changed my life. i pick one day — usually sunday — and i make all my ${topic} content for the week. same setup, same lighting, just change shirts between videos. in 2 hours i have 5-7 pieces ready to go."\n\n[POINT 2 - 0:25-0:40]: "the rest of the week? i just engage. reply to comments, network in DMs, actually enjoy social media instead of stressing about what to post for ${topic}. and weirdly my content got BETTER bc i'm not creating from a place of panic anymore."\n\n[CTA - 0:40-0:60]: "if you want my exact sunday batch workflow save this and follow. i'll break down the whole system step by step this week."\n\nCAPTION: this changed how i do ${topic} content forever ngl\n\nHASHTAGS: #${topic.replace(/\s/g, '')} #batchcreating #productivityhack #creatortips #contentworkflow`,

    `[HOOK - 0:00-0:03]: "the ${topic} strategy that feels like cheating tbh"\n\n[SETUP - 0:03-0:10]: "ok so this isn't actually cheating but it works so well it feels wrong. and i almost don't want to share it bc then everyone will do it. but whatever here you go."\n\n[POINT 1 - 0:10-0:25]: "go to your competitor's most viral post. look at the comments. those comments are telling you EXACTLY what content to make next. 'omg can you do a video on X?' — that's your next ${topic} video. 'wait how does Y work?' — that's a carousel. the audience is literally giving you the content calendar."\n\n[POINT 2 - 0:25-0:40]: "i've been doing this for 3 months and my ${topic} content ideas went from 'idk what to post' to having more ideas than i can actually create. and they perform well bc the demand is already proven. you're not guessing anymore."\n\n[CTA - 0:40-0:60]: "go try this right now. pick your biggest competitor and read their comments. then follow me bc i share frameworks like this every week."\n\nCAPTION: this feels illegal but it's just smart ${topic} strategy 🤫\n\nHASHTAGS: #${topic.replace(/\s/g, '')} #competitorresearch #contentstrategy #cheatcode #viralcontent`,

    `[HOOK - 0:00-0:03]: "POV: you finally understand how ${topic} actually works"\n\n[SETUP - 0:03-0:10]: "took me embarrassingly long to figure this out but here's the thing nobody explains properly about how the algorithm works in 2025."\n\n[POINT 1 - 0:10-0:25]: "the algorithm doesn't care about YOU. it cares about watch time and shares. that's basically it for ${topic}. so every piece of content you make needs to answer two questions: will someone watch this to the end? and will someone send this to a friend? if the answer to both is yes... you'll grow."\n\n[POINT 2 - 0:25-0:40]: "so how do you get watch time? storytelling. open a loop in the first 3 seconds and don't close it until the end. how do you get shares? make something that makes someone think 'omg this is SO my friend' or 'i need to remember this.' that's the whole ${topic} game."\n\n[CTA - 0:40-0:60]: "save this bc you're gonna want to rewatch it. and follow for more breakdowns of how this stuff actually works behind the scenes."\n\nCAPTION: took me way too long to learn this about ${topic} 😅\n\nHASHTAGS: #${topic.replace(/\s/g, '')} #algorithmexplained #howtogoviral #contentcreation #2025strategy`
  ];
}

// --- MOCK GREEN SCREEN MEMES ---
function buildMockGreenScreens(topic) {
  return [
    `BACKGROUND_SEARCH: chaotic office meeting\nTOP_TEXT: ME EXPLAINING ${topic.toUpperCase()}\nBOTTOM_TEXT: TO MY FAMILY AT DINNER\nREACTION_TEXT: "no bc why are their eyes glazing over i'm literally changing the game rn"\nCAPTION: they'll understand when the bag arrives ngl 💰 tag someone who doesn't get your ${topic} vision\nHASHTAGS: #${topic.replace(/\s/g, '')} #delusional #entrepreneur #foryou`,

    `BACKGROUND_SEARCH: person crying happy tears\nTOP_TEXT: FIRST ${topic.toUpperCase()} SALE\nBOTTOM_TEXT: IT'S $4.99\nREACTION_TEXT: "somebody call forbes. no actually call my mom first she said this wouldn't work"\nCAPTION: the first dollar hits different when everyone said you were delulu 😭 #${topic.replace(/\s/g, '')} #smallwins #maindcharacterenergy\nHASHTAGS: #${topic.replace(/\s/g, '')} #firstsale #entrepreneurlife #delulu`,

    `BACKGROUND_SEARCH: tornado destruction chaos\nTOP_TEXT: MY ${topic.toUpperCase()} STRATEGY\nBOTTOM_TEXT: VS MY ACTUAL EXECUTION\nREACTION_TEXT: "the vision is there the skills are just loading give me a sec"\nCAPTION: it's giving 'fake it til you make it' but the faking part is going really well 🌪️ #relatable\nHASHTAGS: #${topic.replace(/\s/g, '')} #expectationvsreality #creatorlife #chaotic`,

    `BACKGROUND_SEARCH: red carpet celebrity arrival\nTOP_TEXT: ME POSTING ${topic.toUpperCase()} CONTENT\nBOTTOM_TEXT: TO MY 47 FOLLOWERS\nREACTION_TEXT: "good evening everyone yes i prepared remarks. thank you to my 3 loyal commenters you know who you are"\nCAPTION: serving main character energy to a very exclusive audience 💅 #smallcreator\nHASHTAGS: #${topic.replace(/\s/g, '')} #smallcreator #maincharacter #delulu #foryoupage`,

    `BACKGROUND_SEARCH: stock market crash screen\nTOP_TEXT: ME CHECKING MY ${topic.toUpperCase()}\nBOTTOM_TEXT: ANALYTICS AT 3AM\nREACTION_TEXT: "ok the reach is down but the VIBES are up and that's what matters right... right??"\nCAPTION: the algorithm and i are in a toxic relationship and i keep coming back 📉😭\nHASHTAGS: #${topic.replace(/\s/g, '')} #analytics #toxicrelationship #creatorproblems`,

    `BACKGROUND_SEARCH: astronaut floating space\nTOP_TEXT: MY ${topic.toUpperCase()} CONTENT\nBOTTOM_TEXT: FLOATING IN THE VOID\nREACTION_TEXT: "houston we have a problem... nobody is engaging and i put a whole 4 hours into this"\nCAPTION: posting into the void but the void is starting to feel like home tbh 🚀 #creatortok\nHASHTAGS: #${topic.replace(/\s/g, '')} #contentcreator #thevoid #noviews #relatable`,

    `BACKGROUND_SEARCH: cooking kitchen fire disaster\nTOP_TEXT: MY FIRST ${topic.toUpperCase()} LAUNCH\nBOTTOM_TEXT: VS WHAT I PLANNED\nREACTION_TEXT: "this is fine. everything is fine. the smoke is just... ambiance"\nCAPTION: the launch plan was immaculate the execution was giving dumpster fire 🔥🗑️ #launchday\nHASHTAGS: #${topic.replace(/\s/g, '')} #productlaunch #thisisfire #startuplife #chaos`,

    `BACKGROUND_SEARCH: detective magnifying glass searching\nTOP_TEXT: ME LOOKING FOR THE\nBOTTOM_TEXT: ${topic.toUpperCase()} ALGORITHM HACK\nREACTION_TEXT: "i've read 47 threads and 12 ebooks and i think the secret is... just posting?? no that can't be right"\nCAPTION: spent 6 hours researching hacks when i could've just made 6 posts 🔍🤡\nHASHTAGS: #${topic.replace(/\s/g, '')} #algorithmhack #overthinking #clownmoment`,

    `BACKGROUND_SEARCH: puppy dog looking sad cute\nTOP_TEXT: ME WAITING FOR ${topic.toUpperCase()}\nBOTTOM_TEXT: RESULTS AFTER ONE POST\nREACTION_TEXT: "it's been 4 hours where is my viral moment i was promised immediate success"\nCAPTION: patience is a virtue that i simply do not possess 🐶 tag a friend who gives up after 1 post\nHASHTAGS: #${topic.replace(/\s/g, '')} #impatient #nopatience #newcreator #relatable`,

    `BACKGROUND_SEARCH: gym weightlifting heavy\nTOP_TEXT: THE ${topic.toUpperCase()} GRIND\nBOTTOM_TEXT: AT MONTH 6 ZERO RESULTS\nREACTION_TEXT: "they said compound growth kicks in at month 3... it's month 6 and the only thing compounding is my doubt"\nCAPTION: still waiting for the compound effect to compound 💪😩 no but fr when does it get easier\nHASHTAGS: #${topic.replace(/\s/g, '')} #grindset #compoundeffect #stillwaiting #realcreator`
  ];
}

async function generateSlideshow({ topic, platform, tone, brandContext }) {
  const brandLine = buildBrandLine(brandContext);
  const system = `You are a TikTok/Instagram creator who makes viral carousels. Write in a casual, lowercase voice like a real person sharing tips — not a marketing robot. Think "things that helped me grow my business" not "5 Things That Will Transform Your Business." Use natural language, slang where appropriate, and make each slide feel like something a 25-year-old creator would actually post. Keep titles short and punchy (lowercase ok). Body text should be conversational and specific, not generic advice.${brandLine}

Always respond with valid JSON only, no markdown.`;
  const prompt = `Create a 6-slide carousel for ${platform} about "${topic}".
Tone: ${tone}. Make it feel like a real creator sharing from experience, not a listicle.
Return ONLY this JSON format:
[
  {"slide": 1, "title": "hook that stops the scroll (casual voice)", "body": "2-3 sentences, conversational, specific", "emoji": "relevant emoji"},
  {"slide": 2, "title": "first real tip", "body": "explain like you're telling a friend", "emoji": "emoji"},
  {"slide": 3, "title": "second tip", "body": "specific example or personal story", "emoji": "emoji"},
  {"slide": 4, "title": "third tip", "body": "actionable and relatable", "emoji": "emoji"},
  {"slide": 5, "title": "the one most people skip", "body": "surprising or counterintuitive insight", "emoji": "emoji"},
  {"slide": 6, "title": "save this for later", "body": "casual CTA, follow for more", "emoji": "emoji", "cta": true}
]`;

  const raw = await callAI(system, prompt);
  if (raw) {
    try {
      const match = raw.match(/\[[\s\S]*\]/);
      if (match) return JSON.parse(match[0]);
    } catch {}
  }
  const sets = buildMockSlideshows(topic);
  return pickRandom(sets);
}

async function generateWallOfText({ topic, platform, hookStyle, brandContext }) {
  const maxWords = platform === 'twitter' ? 280 : platform === 'linkedin' ? 1300 : 500;
  const brandLine = buildBrandLine(brandContext);
  const system = `You are a real content creator writing an authentic ${platform} caption. Write like an actual person — use natural line breaks, casual abbreviations (bc, rn, ngl, tbh, imo, lowkey), and genuine emotion. This should feel like someone sitting down and typing out their real thoughts, not copywriting. Mix in vulnerability, humor, and strong opinions. Use lowercase freely. Break lines often for readability. Don't overuse emojis — sprinkle them naturally. The vibe is "real person sharing something they care about" not "brand posting content."${brandLine}`;
  const prompt = `Write a ${platform} caption about "${topic}".
Hook style: ${hookStyle || 'bold statement'}
Max length: ${maxWords} characters
Rules:
- First line must be a scroll-stopper (not starting with "I")
- Write like you're texting a friend who asked for advice
- Use abbreviations naturally (bc, rn, ngl, tbh, imo)
- Line breaks after almost every sentence for readability
- Raw emotion > polished copywriting
- End with something that makes people want to comment
- NO hashtag stuffing at the end — max 3 hashtags woven in naturally`;

  const raw = await callAI(system, prompt);
  if (raw) return raw;

  const posts = buildMockWallPosts(topic);
  return pickRandom(posts);
}

async function generateVideoHook({ topic, platform, hookType, brandContext }) {
  const brandLine = buildBrandLine(brandContext);
  const system = `You are a creator writing a short-form video script that sounds natural when spoken aloud. Write the way people actually talk — with pauses, filler words, conversational rhythm. Use "like," "honestly," "look," "here's the thing" naturally. The script should feel like someone talking to camera in their room, not reading a teleprompter. Include beats/pauses marked with "..." for natural delivery. References should be current (2024-2025). Relatable examples > abstract advice.${brandLine}`;
  const prompt = `Write a 60-second video script about "${topic}" for ${platform}.
Hook type: ${hookType || 'question'}

Format exactly like this:
[HOOK - 0:00-0:03]: (3-second grabber — must feel natural spoken aloud)
[SETUP - 0:03-0:10]: (quick context, conversational)
[POINT 1 - 0:10-0:25]: (main value with specific example)
[POINT 2 - 0:25-0:40]: (supporting value, relatable)
[CTA - 0:40-0:60]: (casual call to action, not salesy)

CAPTION: (authentic caption with 1-2 emojis max)
HASHTAGS: #hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5`;

  const raw = await callAI(system, prompt);
  if (raw) return raw;

  const scripts = buildMockVideoHooks(topic);
  return pickRandom(scripts);
}

async function generateGreenScreen({ topic, platform, trend, brandContext }) {
  const brandLine = buildBrandLine(brandContext);
  const system = `You are a meme creator who's extremely online. Create green screen memes that reference current trends (2024-2025), use internet slang (no cap, it's giving, slay, rent free, understood the assignment, delulu, ate and left no crumbs, main character energy), and are genuinely funny — not "fellow kids" cringe. Think the kind of meme that gets shared in group chats. Reference real cultural moments, trending sounds, and creator culture. The humor should be self-deprecating, absurdist, or painfully relatable.${brandLine}`;
  const prompt = `Create a green screen meme about "${topic}" for ${platform}.
Trend/format: ${trend || 'reaction meme'}

Format:
BACKGROUND_SEARCH: (2-3 words to search for background video, e.g. "stock market crash" or "party celebration")
TOP_TEXT: (MAX 5 WORDS IN CAPS — punchy, meme-style)
BOTTOM_TEXT: (MAX 6 WORDS IN CAPS)
REACTION_TEXT: (what the person on screen says/reacts, 1 sentence — genuinely funny, use internet slang)
CAPTION: (caption that makes people tag their friends, use current slang)
HASHTAGS: #hashtag1 #hashtag2 #hashtag3`;

  const raw = await callAI(system, prompt);
  if (raw) return raw;

  const memes = buildMockGreenScreens(topic);
  return pickRandom(memes);
}

async function generateBlitz({ topic, platforms, count, brandContext }) {
  const results = [];
  const types = ['slideshow', 'wall-of-text', 'video-hook-and-demo', 'green-screen-meme'];
  for (let i = 0; i < Math.min(count, platforms.length); i++) {
    const platform = platforms[i];
    const type = types[i % types.length];
    let content;
    if (type === 'slideshow') content = await generateSlideshow({ topic, platform, tone: 'engaging', brandContext });
    else if (type === 'wall-of-text') content = await generateWallOfText({ topic, platform, brandContext });
    else if (type === 'video-hook-and-demo') content = await generateVideoHook({ topic, platform, brandContext });
    else content = await generateGreenScreen({ topic, platform, brandContext });
    results.push({ type, platform, content });
  }
  return results;
}

module.exports = { callAI, generateSlideshow, generateWallOfText, generateVideoHook, generateGreenScreen, generateBlitz };
