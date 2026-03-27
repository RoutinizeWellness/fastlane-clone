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

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// --- MOCK SLIDESHOW SETS ---
// placeholder: kept as factory functions so topic can be injected
const MOCK_SLIDESHOWS = [
  // ... filled below
];

function buildMockSlideshows(topic) {
  return [
    // 1 - Productivity
    [
      { slide: 1, title: '5 Productivity Hacks That Changed My Life', body: `I used to waste 4 hours a day before discovering these ${topic} principles. Here's the exact system I now use.`, emoji: '🔥' },
      { slide: 2, title: 'Time-Block Everything', body: 'Assign every 30-min slot a task. No open-ended "work sessions." Your calendar is your boss now.', emoji: '📅' },
      { slide: 3, title: 'The 2-Minute Rule', body: `If a task takes under 2 minutes, do it immediately. This alone cleared 60% of my ${topic} backlog.`, emoji: '⚡' },
      { slide: 4, title: 'Batch Similar Tasks', body: 'Email at 10am and 3pm only. Content creation in one block. Context-switching is a productivity killer.', emoji: '🧠' },
      { slide: 5, title: 'Energy > Time Management', body: `Track your energy peaks. Do ${topic} deep work during high-energy windows, admin during lulls.`, emoji: '💡' },
      { slide: 6, title: 'Save This For Later! →', body: `Follow for daily ${topic} and productivity tips that actually work!`, emoji: '❤️', cta: true }
    ],
    // 2 - Social Media Growth
    [
      { slide: 1, title: 'How I Gained 50K Followers in 90 Days', body: `No ads. No luck. Just a repeatable ${topic} system anyone can copy.`, emoji: '📈' },
      { slide: 2, title: 'Post at Peak Hours', body: 'TikTok: 7-9am, 12pm, 7-9pm. Instagram: 11am-1pm, 7-9pm. LinkedIn: 7-8am Tues-Thurs. Timing is half the battle.', emoji: '⏰' },
      { slide: 3, title: 'Hook in 1.5 Seconds', body: `Your first line determines everything. Use curiosity gaps, bold claims, or unexpected stats related to ${topic}.`, emoji: '🎣' },
      { slide: 4, title: 'Engage Before You Post', body: 'Spend 15 minutes commenting on others\' posts before you publish. The algorithm notices reciprocity.', emoji: '💬' },
      { slide: 5, title: 'Repurpose Ruthlessly', body: `One ${topic} video = 1 carousel + 1 text post + 3 tweets + 1 newsletter. Work smarter.`, emoji: '♻️' },
      { slide: 6, title: 'Want More Growth Tips? →', body: `Follow me for daily ${topic} strategies that actually move the needle!`, emoji: '🚀', cta: true }
    ],
    // 3 - Startup Tips
    [
      { slide: 1, title: 'Startup Lessons That Cost Me $200K', body: `I made every mistake so you don't have to. Here are the ${topic} truths VCs won't tell you.`, emoji: '💸' },
      { slide: 2, title: 'Talk to Users, Not Investors', body: `Your first 100 conversations should be with customers. ${topic} validation beats pitch decks every time.`, emoji: '🗣️' },
      { slide: 3, title: 'Launch Ugly, Launch Fast', body: 'Your MVP should embarrass you slightly. If it doesn\'t, you waited too long. Speed > polish at this stage.', emoji: '🏃' },
      { slide: 4, title: 'Revenue > Fundraising', body: `A dollar from a customer is worth more than $10 from an investor. Build ${topic} revenue from day one.`, emoji: '💰' },
      { slide: 5, title: 'Hire Slow, Fire Fast', body: `One bad hire in a 5-person ${topic} startup can destroy your culture in weeks. Protect your team at all costs.`, emoji: '🛡️' },
      { slide: 6, title: 'Building a Startup? Follow Me! →', body: `I share raw, unfiltered ${topic} startup advice daily. No fluff.`, emoji: '🔥', cta: true }
    ],
    // 4 - Fitness
    [
      { slide: 1, title: 'The Fitness Routine That Actually Sticks', body: `Forget complicated plans. This simple ${topic} approach got me in the best shape of my life.`, emoji: '💪' },
      { slide: 2, title: 'Progressive Overload is King', body: `Add 2.5lbs or 1 rep each week. Small gains compound. In 6 months of ${topic} training, you won't recognize yourself.`, emoji: '👑' },
      { slide: 3, title: 'Protein at Every Meal', body: 'Aim for 0.8-1g per lb of bodyweight. Prioritize whole foods: eggs, chicken, fish, Greek yogurt, legumes.', emoji: '🥚' },
      { slide: 4, title: 'Sleep is the Secret Weapon', body: `7-9 hours. Non-negotiable. Your ${topic} progress happens during recovery, not in the gym.`, emoji: '😴' },
      { slide: 5, title: 'Track What You Measure', body: 'Use a simple notebook or app. Log weights, reps, bodyweight weekly. Data beats feelings every time.', emoji: '📊' },
      { slide: 6, title: 'Want the Full Program? →', body: `Follow for daily ${topic} and fitness tips backed by science, not bro-science!`, emoji: '❤️', cta: true }
    ],
    // 5 - Personal Branding
    [
      { slide: 1, title: 'Your Personal Brand is Your Superpower', body: `In 2024, obscurity is a bigger risk than failure. Here's how to build a ${topic} brand that opens doors.`, emoji: '✨' },
      { slide: 2, title: 'Pick One Platform, Go Deep', body: `Master one channel before expanding. 90 days of consistent ${topic} content on one platform beats scattered posting everywhere.`, emoji: '🎯' },
      { slide: 3, title: 'Document, Don\'t Create', body: 'Share your journey, failures, and lessons. Authenticity outperforms polished content 10x in the long run.', emoji: '📱' },
      { slide: 4, title: 'Your Bio = Your Billboard', body: `State WHO you help, WHAT you do, and WHY they should care. Keep it under 150 characters for ${topic} discoverability.`, emoji: '📝' },
      { slide: 5, title: 'Collaborate Weekly', body: 'Go live with others. Guest on podcasts. Do collabs. Borrowed audiences accelerate growth faster than any algorithm hack.', emoji: '🤝' },
      { slide: 6, title: 'Ready to Build Your Brand? →', body: `Follow for daily ${topic} personal branding strategies!`, emoji: '🚀', cta: true }
    ],
    // 6 - Investing
    [
      { slide: 1, title: 'Investing 101: What I Wish I Knew at 20', body: `${topic} advice from someone who lost money first. These 5 principles would have saved me thousands.`, emoji: '📉' },
      { slide: 2, title: 'Start With Index Funds', body: 'S&P 500 index funds have averaged ~10% annually for 100 years. Don\'t try to beat the market — join it.', emoji: '📊' },
      { slide: 3, title: 'Emergency Fund First', body: `Before investing a single dollar in ${topic}, save 3-6 months of expenses. This prevents panic-selling during dips.`, emoji: '🏦' },
      { slide: 4, title: 'Dollar-Cost Average', body: 'Invest the same amount every month regardless of market conditions. Time in the market beats timing the market.', emoji: '⏳' },
      { slide: 5, title: 'Avoid Lifestyle Inflation', body: `When your income goes up, keep expenses flat. Invest the difference. This is the real ${topic} wealth hack.`, emoji: '🧠' },
      { slide: 6, title: 'Want More Money Tips? →', body: `Follow for daily ${topic} and investing wisdom you can actually use!`, emoji: '💰', cta: true }
    ],
    // 7 - Content Creation
    [
      { slide: 1, title: 'The Content System That Posts Itself', body: `I create 30 days of ${topic} content in one afternoon. Here's the exact process.`, emoji: '🗓️' },
      { slide: 2, title: 'Batch Film on Sundays', body: 'Record 8-10 videos in one session. Change shirts between takes. One setup, two hours, a month of content.', emoji: '🎬' },
      { slide: 3, title: 'Use a Content Matrix', body: `4 pillars × 3 formats = 12 unique ${topic} ideas. Rotate weekly. You'll never run out of content.`, emoji: '🧩' },
      { slide: 4, title: 'Repurpose Everything', body: 'Long video → short clips → carousel → text post → email → tweet thread. One idea, 6+ pieces of content.', emoji: '♻️' },
      { slide: 5, title: 'Schedule & Forget', body: `Use scheduling tools to queue everything. Spend your week engaging, not stressing about ${topic} posting.`, emoji: '😌' },
      { slide: 6, title: 'Steal My System! →', body: `Follow for more ${topic} content creation frameworks that save you hours!`, emoji: '🔥', cta: true }
    ],
    // 8 - Relationship Tips
    [
      { slide: 1, title: '5 Communication Skills That Saved My Relationship', body: `Relationships fail from poor communication, not lack of love. These ${topic} principles changed everything.`, emoji: '❤️' },
      { slide: 2, title: 'Listen to Understand, Not Reply', body: 'Put your phone down. Make eye contact. Repeat back what they said. Most arguments stem from feeling unheard.', emoji: '👂' },
      { slide: 3, title: 'The 5:1 Ratio', body: `Research shows healthy relationships need 5 positive interactions for every negative one. Track your ${topic} ratio.`, emoji: '⚖️' },
      { slide: 4, title: 'Schedule Quality Time', body: 'Weekly date nights aren\'t cheesy — they\'re essential. Put them in the calendar like any important meeting.', emoji: '📅' },
      { slide: 5, title: 'Fight the Problem, Not Each Other', body: `Sit on the same side of the table (literally). Frame it as "us vs. the problem." This ${topic} mindset shift is powerful.`, emoji: '🤝' },
      { slide: 6, title: 'Send This to Your Partner! →', body: `Follow for more ${topic} relationship and communication tips!`, emoji: '💕', cta: true }
    ],
    // 9 - Money / Side Hustle
    [
      { slide: 1, title: 'Side Hustles That Actually Pay in 2024', body: `Forget dropshipping. These ${topic} income streams are proven, low-risk, and you can start tonight.`, emoji: '💵' },
      { slide: 2, title: 'Freelance Your Existing Skills', body: `Copywriting, design, bookkeeping, coding — someone will pay you TODAY for skills you already have. Check Upwork and Fiverr.`, emoji: '💻' },
      { slide: 3, title: 'Digital Products Scale', body: `Create once, sell forever. Templates, courses, ebooks — digital ${topic} products have near-zero marginal cost.`, emoji: '📦' },
      { slide: 4, title: 'Content Monetization', body: 'Build an audience of 1,000 true fans. Sponsorships, affiliates, and your own offers can replace a full-time salary.', emoji: '🎙️' },
      { slide: 5, title: 'Invest Your Side Income', body: `Don't spend side hustle money on lifestyle. Funnel 80% into investments. Let ${topic} compound do the heavy lifting.`, emoji: '📈' },
      { slide: 6, title: 'Want the Full Breakdown? →', body: `Follow for daily ${topic} money and business tips!`, emoji: '🔥', cta: true }
    ]
  ];
}

// --- MOCK WALL-OF-TEXT POSTS ---
function buildMockWallPosts(topic) {
  return [
    `The ${topic} advice no one tells you:\n\n→ Start before you're ready\n→ Done > perfect\n→ Show your process, not just results\n\nI spent 2 years waiting to be "good enough."\n\nDon't make my mistake.\n\nThe algorithm rewards consistency more than perfection.\n\nPost ugly. Post scared. Post anyway.\n\nThe people winning at ${topic} aren't smarter than you.\n\nThey just started.\n\n---\n\nWhat's stopping YOU from starting with ${topic}? Drop it below 👇`,

    `Hot take: Most ${topic} "gurus" are lying to you. 🔥\n\nThey show the highlight reel.\nThey hide the 847 failed attempts.\nThey sell you a shortcut that doesn't exist.\n\nHere's what actually works:\n\n1. Pick ONE thing related to ${topic}\n2. Do it every day for 90 days\n3. Ignore everything else\n\nThat's it. That's the secret.\n\nNo course. No funnel. No $997 masterclass.\n\nJust reps.\n\nThe boring stuff IS the strategy.\n\nSave this. Screenshot it. Tattoo it if you have to. 😤\n\nWho's committing to 90 days with me? Comment "90" 👇`,

    `I lost everything 18 months ago.\n\nMy business failed. My savings were gone.\nI had to move back in with my parents at 29.\n\nHere's what ${topic} taught me during rock bottom:\n\n→ Your network is your net worth (cliché but TRUE)\n→ Skills pay the bills, not credentials\n→ Embarrassment is temporary, regret is forever\n\nFast forward to today:\n✅ 6-figure business rebuilt from scratch\n✅ 100K+ community\n✅ Doing what I love daily\n\nThe comeback is ALWAYS greater than the setback.\n\nIf you're in a tough spot with ${topic} right now — keep going.\n\nThis post is your sign. 🙌\n\nShare this with someone who needs to hear it today ❤️`,

    `Stop saying you don't have time for ${topic}.\n\nYou have the same 24 hours as everyone else.\n\nYou just haven't made it a priority yet.\n\n🔹 Wake up 1 hour earlier\n🔹 Replace Netflix with learning\n🔹 Use commute time for podcasts\n🔹 Batch your tasks on weekends\n\nI built my entire ${topic} brand in 1 hour a day.\n\nBefore work. While my coffee brewed. During lunch breaks.\n\nSmall pockets of time compound into massive results.\n\n📊 1 hour/day = 365 hours/year = 9 full work weeks\n\nThat's enough time to:\n- Build a side business\n- Write a book\n- Transform your body\n- Master ${topic}\n\nStop making excuses. Start making progress.\n\nWhat will YOU use your extra hour for? 💬👇`,

    `Unpopular opinion about ${topic}:\n\nYou don't need:\n❌ A perfect strategy\n❌ Expensive equipment\n❌ A massive following\n❌ Anyone's permission\n\nYou DO need:\n✅ The courage to start\n✅ The humility to suck at first\n✅ The discipline to keep going\n✅ A genuine desire to help people\n\nEvery expert was once a beginner.\nEvery viral post started with 0 views.\nEvery successful ${topic} brand started with 0 followers.\n\nYour future audience is waiting for you to hit "post."\n\nDon't keep them waiting.\n\n🔔 Follow me for more raw, no-BS ${topic} advice.`,

    `The ${topic} framework that 10x'd my results:\n\nI call it the P.O.S.T. method:\n\n𝗣 - Problem (lead with a pain point)\n𝗢 - Outcome (show what's possible)\n𝗦 - Steps (give actionable value)\n𝗧 - Transformation (paint the after picture)\n\nBefore P.O.S.T.: 200 views per post. Crickets.\nAfter P.O.S.T.: 50K+ views consistently. DMs flooding in.\n\nIt works because human brains are wired for stories.\n\nProblem → Solution → Result.\n\nUse this for ${topic} and watch your engagement explode. 💥\n\nBookmark this. You'll thank me in 30 days.\n\nDrop a 🔥 if you're going to try this today!`,

    `"How do you stay consistent with ${topic}?"\n\nI get this question daily. Here's my honest answer:\n\nI don't rely on motivation. It's unreliable.\n\nInstead, I built SYSTEMS:\n\n📌 Monday: Film 3 videos\n📌 Tuesday: Write 5 captions\n📌 Wednesday: Engage for 30 min\n📌 Thursday: Design 2 carousels\n📌 Friday: Review analytics\n📌 Weekend: Rest & brainstorm\n\nTotal time: ~5 hours/week for ${topic}.\n\nThat's less than most people spend scrolling.\n\nThe difference between creators who make it and those who don't?\n\nSystems > willpower.\n\nEvery. Single. Time.\n\nSteal my schedule. Adapt it. Make it yours.\n\nComment "SYSTEM" and I'll DM you the full template 📩`,

    `3 years ago I knew nothing about ${topic}.\n\nToday it generates $15K/month for me.\n\nHere are the 7 books that changed everything:\n\n📚 "Atomic Habits" — Systems thinking\n📚 "Building a StoryBrand" — Clear messaging\n📚 "$100M Offers" — Irresistible value props\n📚 "Show Your Work" — Content creation\n📚 "Influence" — Psychology of persuasion\n📚 "The Lean Startup" — Iterate fast\n📚 "Deep Work" — Focus in a distracted world\n\nI didn't read them all at once.\nOne per month. Applied immediately.\n\nKnowledge without action is just entertainment.\n\nWhich one are you reading first? Comment below 📖👇`,

    `I'm going to say something controversial about ${topic}:\n\nFollower count doesn't matter.\n\nI know creators with 500K followers making $0.\nAnd creators with 5K followers making $20K/month.\n\nThe difference?\n\n→ TRUST over reach\n→ DEPTH over breadth\n→ COMMUNITY over audience\n\n1,000 people who genuinely care about your ${topic} message is worth more than 1M passive scrollers.\n\nStop chasing vanity metrics.\nStart building real connections.\n\nReply with your niche — I'll tell you exactly how to build your 1,000 true fans ⬇️`,

    `This will sound weird but...\n\nThe best ${topic} decision I ever made was quitting.\n\nI quit:\n🚫 Comparing myself to others\n🚫 Posting what I "should" post\n🚫 Chasing trends I didn't care about\n🚫 Trying to please everyone\n\nAnd started:\n✅ Sharing MY actual opinions\n✅ Being unapologetically myself\n✅ Creating content I'd want to consume\n✅ Serving one specific person\n\nThe irony? That's when ${topic} actually started working.\n\nPeople don't follow perfect brands.\nThey follow real humans.\n\nBe the real human. 🫶\n\nDouble-tap if this hit different ❤️`,

    `Your ${topic} content isn't getting views?\n\nIt's probably one of these 5 mistakes:\n\n1️⃣ Weak hook — you have 1.5 seconds. Lead with SHOCK, CURIOSITY, or PAIN.\n2️⃣ Too long — trim 30% ruthlessly. If it doesn't add value, cut it.\n3️⃣ No clear CTA — tell people what to DO (save, share, comment, follow).\n4️⃣ Wrong timing — post when your audience is online, not when it's convenient for you.\n5️⃣ Inconsistency — the algorithm forgets you after 48 hours of silence.\n\nFix these 5 things and your ${topic} reach will skyrocket. I guarantee it.\n\nWhich mistake are you guilty of? Be honest 👇😅`
  ];
}

// --- MOCK VIDEO HOOKS ---
function buildMockVideoHooks(topic) {
  return [
    `[HOOK - 0:00-0:03]: "Stop scrolling — this ${topic} tip is worth $10,000."\n\n[SETUP - 0:03-0:10]: "I spent 3 years and $50K learning this the hard way. You're getting it in 60 seconds."\n\n[POINT 1 - 0:10-0:25]: "The biggest mistake with ${topic} is trying to do everything at once. Pick ONE channel, ONE format, and go all in for 90 days. That's how every big creator started."\n\n[POINT 2 - 0:25-0:40]: "Second — steal like an artist. Find 3 accounts crushing ${topic}, study their hooks, their format, their posting schedule. Model what works, add your unique spin."\n\n[CTA - 0:40-0:60]: "Follow me for more ${topic} cheat codes. I drop one every single day. And comment 'MORE' — I'll send you my full strategy guide."\n\nCAPTION: This ${topic} tip alone changed everything for me 🤯 Save for later!\n\nHASHTAGS: #${topic.replace(/\s/g, '')} #growthhacks #contentcreator #viral #learnontiktok`,

    `[HOOK - 0:00-0:03]: "Nobody talks about THIS side of ${topic}..."\n\n[SETUP - 0:03-0:10]: "Everyone shows the wins. The followers. The revenue. But no one shows you what it actually takes behind the scenes."\n\n[POINT 1 - 0:10-0:25]: "The truth about ${topic}? It's 80% boring work. Writing captions at midnight. Filming takes 5 through 12. Staring at analytics wondering why post #47 flopped."\n\n[POINT 2 - 0:25-0:40]: "But here's the thing — that boring 80% is what separates the top 1% from everyone else. They don't have more talent. They have more tolerance for the grind."\n\n[CTA - 0:40-0:60]: "If you're in the grind right now with ${topic} — keep going. Follow for the real, unfiltered truth about this game."\n\nCAPTION: The truth about ${topic} nobody shows you 😤 (watch till the end)\n\nHASHTAGS: #${topic.replace(/\s/g, '')} #realtalk #entrepreneur #hardwork #motivation`,

    `[HOOK - 0:00-0:03]: "What if I told you ${topic} is a lie?"\n\n[SETUP - 0:03-0:10]: "Well, not exactly. But the way most people approach it? Completely backwards. Let me explain."\n\n[POINT 1 - 0:10-0:25]: "Most people start with ${topic} strategy. Wrong. Start with your AUDIENCE. Who are they? What keeps them up at night? What do they scroll past vs. save? Strategy without audience clarity is noise."\n\n[POINT 2 - 0:25-0:40]: "Once you know your audience, ${topic} becomes easy. You're just answering their questions, solving their problems, and entertaining them along the way."\n\n[CTA - 0:40-0:60]: "Want me to break down exactly how to find your audience? Comment 'AUDIENCE' and follow — I'll post the full framework tomorrow."\n\nCAPTION: ${topic} is easier than you think when you flip the script 🔄\n\nHASHTAGS: #${topic.replace(/\s/g, '')} #audiencegrowth #marketingtips #socialmedia #strategy`,

    `[HOOK - 0:00-0:03]: "I grew from 0 to 100K using this one ${topic} trick."\n\n[SETUP - 0:03-0:10]: "And no, it's not 'post consistently' or 'use trending audio.' It's way more specific than that."\n\n[POINT 1 - 0:10-0:25]: "The trick is the LOOP. End your video with something that makes people rewatch. A reveal. A payoff to the hook. A visual that only makes sense the second time. Replays DESTROY the algorithm in ${topic}."\n\n[POINT 2 - 0:25-0:40]: "My average watch time went from 40% to 115% using loops. That single metric change got me pushed to 2M+ views on three videos in one month."\n\n[CTA - 0:40-0:60]: "Save this and try it on your next ${topic} video. Then come back and tell me your results. Follow for more algorithm hacks!"\n\nCAPTION: The loop technique is INSANE for ${topic} 🔁🔥 Try it today\n\nHASHTAGS: #${topic.replace(/\s/g, '')} #algorithmhack #viralvideo #contentcreation #tiktokgrowth`,

    `[HOOK - 0:00-0:03]: "3 ${topic} tools I can't live without — and they're all free."\n\n[SETUP - 0:03-0:10]: "I've tested over 50 tools this year. These 3 made the biggest difference and didn't cost me a dime."\n\n[POINT 1 - 0:10-0:25]: "Tool 1: CapCut for editing — it's free, powerful, and has auto-captions that actually work. Tool 2: Canva free tier for thumbnails and carousels — templates save hours."\n\n[POINT 2 - 0:25-0:40]: "Tool 3: Google Trends for ${topic} ideas. Type in your niche, see what's rising, create content around those topics BEFORE they peak. Early = viral."\n\n[CTA - 0:40-0:60]: "Comment 'TOOLS' and I'll DM you my full ${topic} tech stack — including 10 more free tools I use daily. Don't forget to follow!"\n\nCAPTION: Free tools that feel illegal to know about 🤫🔧 #${topic.replace(/\s/g, '')}\n\nHASHTAGS: #${topic.replace(/\s/g, '')} #freetools #contentcreator #techstack #productivity`,

    `[HOOK - 0:00-0:03]: "Your ${topic} content is boring. Here's how to fix it."\n\n[SETUP - 0:03-0:10]: "I don't say that to be mean. I say it because I was boring too. Until I learned this framework."\n\n[POINT 1 - 0:10-0:25]: "It's called the EDGE formula. E = Emotion — make them FEEL something. D = Data — back it up with a surprising stat. G = Give — provide real, actionable value. E = Entertain — keep it fun, fast, and visual."\n\n[POINT 2 - 0:25-0:40]: "Most ${topic} content only hits 1 of these 4. Hit all 4 in one post and you're basically guaranteed engagement. It's the difference between scroll-past and save."\n\n[CTA - 0:40-0:60]: "Try the EDGE formula on your next post and tag me — I'll give you feedback! Follow for more ${topic} frameworks."\n\nCAPTION: If your ${topic} content isn't hitting, try this 📐🔥\n\nHASHTAGS: #${topic.replace(/\s/g, '')} #contentframework #socialmediatips #engagement #creatoreconomy`,

    `[HOOK - 0:00-0:03]: "POV: You just discovered the ${topic} cheat code"\n\n[SETUP - 0:03-0:10]: "Everyone overcomplicates this. The people winning keep it stupidly simple. Watch."\n\n[POINT 1 - 0:10-0:25]: "Step 1: Find ONE post that went viral in your ${topic} niche. Step 2: Don't copy it — IMPROVE it. Add your experience, better examples, cleaner delivery."\n\n[POINT 2 - 0:25-0:40]: "Step 3: Post it at peak time. Step 4: Engage with every comment for 30 minutes. This is the exact playbook I used to go from 500 to 50K in ${topic}."\n\n[CTA - 0:40-0:60]: "Want the full playbook? It's in my bio. Follow for daily ${topic} drops that actually work."\n\nCAPTION: The ${topic} cheat code nobody gatekeeps 🎮💰\n\nHASHTAGS: #${topic.replace(/\s/g, '')} #cheatcode #growthhack #viral #trending`,

    `[HOOK - 0:00-0:03]: "Delete this before ${topic} gurus see it 😂"\n\n[SETUP - 0:03-0:10]: "I'm about to expose the entire playbook they charge $997 for. Ready? It's actually embarrassingly simple."\n\n[POINT 1 - 0:10-0:25]: "The secret: Talk about ONE thing. Pick a micro-niche within ${topic}. Be the go-to person for THAT thing. Not 'social media tips' — 'Instagram Reels hooks for fitness coaches.' THAT specific."\n\n[POINT 2 - 0:25-0:40]: "When you niche down, the algorithm knows exactly who to show your content to. Your ${topic} audience finds you faster. And your conversion rate goes through the roof because you're speaking directly to them."\n\n[CTA - 0:40-0:60]: "Comment your niche and I'll tell you how to micro-niche it. Follow for more free ${topic} game!"\n\nCAPTION: They're going to be mad I posted this about ${topic} 🫢🔥\n\nHASHTAGS: #${topic.replace(/\s/g, '')} #nichdown #exposed #freetips #growthmindset`
  ];
}

// --- MOCK GREEN SCREEN MEMES ---
function buildMockGreenScreens(topic) {
  return [
    `BACKGROUND_SEARCH: success celebration party\nTOP_TEXT: ME EXPLAINING ${topic.toUpperCase()}\nBOTTOM_TEXT: MY FRIENDS PRETENDING TO CARE\nREACTION_TEXT: "Wait... this actually works??"\nCAPTION: The ${topic} pipeline hits different when it actually works 😭🔥\nHASHTAGS: #${topic.replace(/\s/g, '')} #relatable #foryou #viral #contentcreator`,

    `BACKGROUND_SEARCH: dumpster fire chaos\nTOP_TEXT: MY ${topic.toUpperCase()} STRATEGY\nBOTTOM_TEXT: WEEK 1 VS WEEK 12\nREACTION_TEXT: "It's called a learning curve, okay?"\nCAPTION: The glow-up is real if you survive the cringe phase 😂📈\nHASHTAGS: #${topic.replace(/\s/g, '')} #glowup #relatable #funny #creator`,

    `BACKGROUND_SEARCH: rocket launch explosion\nTOP_TEXT: POSTING ${topic.toUpperCase()} CONTENT\nBOTTOM_TEXT: AT 3AM WITH ZERO FOLLOWERS\nREACTION_TEXT: "This is fine. The algorithm will find me... right?"\nCAPTION: POV: You're posting into the void but the delusion is strong 🚀😤\nHASHTAGS: #${topic.replace(/\s/g, '')} #smallcreator #delusional #foryoupage #grind`,

    `BACKGROUND_SEARCH: money cash raining\nTOP_TEXT: WHEN YOUR ${topic.toUpperCase()} POST\nBOTTOM_TEXT: FINALLY GOES VIRAL\nREACTION_TEXT: "MOM I MADE IT. Well... 47 cents in ad revenue but STILL"\nCAPTION: First viral moment with ${topic} and I'm already planning my retirement 💰😭\nHASHTAGS: #${topic.replace(/\s/g, '')} #viral #money #creator #firstviralpost`,

    `BACKGROUND_SEARCH: confused math calculation\nTOP_TEXT: ME CALCULATING MY ${topic.toUpperCase()}\nBOTTOM_TEXT: ROI AT 3 IN THE MORNING\nREACTION_TEXT: "If I get 10 more followers per day... carry the 2... I'll be famous by 2047"\nCAPTION: The math ain't mathing but we keep going 📊🧮😂\nHASHTAGS: #${topic.replace(/\s/g, '')} #math #roi #funny #entrepreneurlife`,

    `BACKGROUND_SEARCH: gym workout motivation\nTOP_TEXT: ${topic.toUpperCase()} GRIND\nBOTTOM_TEXT: DAY 47 NO RESULTS YET\nREACTION_TEXT: "They said consistency is key. WHERE IS THE DOOR"\nCAPTION: Still waiting for ${topic} compound growth to kick in 💪😩\nHASHTAGS: #${topic.replace(/\s/g, '')} #grind #consistency #noresults #keepgoing`,

    `BACKGROUND_SEARCH: person sleeping desk\nTOP_TEXT: "I'LL JUST MAKE ONE ${topic.toUpperCase()} POST"\nBOTTOM_TEXT: 4 HOURS LATER STILL EDITING\nREACTION_TEXT: "Perfectionism is my love language and my biggest enemy"\nCAPTION: When one ${topic} post turns into a 4-hour editing session 😴✨\nHASHTAGS: #${topic.replace(/\s/g, '')} #perfectionism #editing #creatorlife #relatable`,

    `BACKGROUND_SEARCH: detective investigation magnifying glass\nTOP_TEXT: ME STUDYING WHY MY ${topic.toUpperCase()} POST\nBOTTOM_TEXT: GOT 3 VIEWS (ALL FROM ME)\nREACTION_TEXT: "The algorithm is clearly broken. I demand a recount."\nCAPTION: Analytics said 3 views and I know 2 were my alt accounts 🔍😭\nHASHTAGS: #${topic.replace(/\s/g, '')} #analytics #lowviews #funny #algorithm`,

    `BACKGROUND_SEARCH: stock market trading screen\nTOP_TEXT: TREATING ${topic.toUpperCase()}\nBOTTOM_TEXT: LIKE A FULL-TIME JOB\nREACTION_TEXT: "My boss doesn't know I've been editing reels since 9am"\nCAPTION: Corporate by day, ${topic} creator by... also day 📉💼🎬\nHASHTAGS: #${topic.replace(/\s/g, '')} #sidehustle #corporate #doubllife #escapingthe9to5`
  ];
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
  // Rich mock fallback - pick a random set
  const sets = buildMockSlideshows(topic);
  return pickRandom(sets);
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

  const posts = buildMockWallPosts(topic);
  return pickRandom(posts);
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

  const scripts = buildMockVideoHooks(topic);
  return pickRandom(scripts);
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

  const memes = buildMockGreenScreens(topic);
  return pickRandom(memes);
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
