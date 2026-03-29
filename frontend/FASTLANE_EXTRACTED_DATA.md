# Fastlane App - Extracted Media URLs and Content Data

Source: `https://app.usefastlane.ai/assets/index-Bj0W_O15.js` (2.97MB bundle)
CSS: `https://app.usefastlane.ai/assets/index-DVzoG_Pv.css` (no media URLs found)

---

## 1. MEDIA / VIDEO URLs

### Media CDN Base URL
```
https://media.aftermark.ai
```

### Tutorial Videos (via `/tutorials/` path)
| Title | URL |
|-------|-----|
| Introduction | `https://media.aftermark.ai/tutorials/compressed-intro-homepage-guide.mov` |
| Blitz Mode Demo | `https://media.aftermark.ai/tutorials/compressed-blitz-guide.mov` |
| Blitz Mode | `https://media.aftermark.ai/tutorials/blitz-demo.mp4` |
| Manual Creation Demo | `https://media.aftermark.ai/tutorials/manual-creation-demo.mp4` |
| Green Screen Meme, Posting and Library | `https://media.aftermark.ai/tutorials/2-green-screen.mp4` |
| Wall of Text | `https://media.aftermark.ai/tutorials/3-wall-of-text.mp4` |
| Hook Demo | `https://media.aftermark.ai/tutorials/4-hook-demo.mp4` |
| Slideshows | `https://media.aftermark.ai/tutorials/5-slideshows.mp4` |
| Calendar, Library, Company Profile and Feedback | `https://media.aftermark.ai/tutorials/6-calendar-library.mp4` |

### Tutorial Arrays in Code
**Sidebar tutorials (`lF`):**
- Blitz Mode: "Generate and schedule content at scale with AI" -> `blitz-demo.mp4`
- Manual Creation: "Create and customize content step by step" -> `manual-creation-demo.mp4`

**Guide page tutorials (`XYe`):**
- Blitz Mode Demo -> `compressed-blitz-guide.mov`
- Manual Creation Demo -> `manual-creation-demo.mp4`
- Green Screen Meme, Posting and Library -> `2-green-screen.mp4`
- Wall of Text -> `3-wall-of-text.mp4`
- Hook Demo -> `4-hook-demo.mp4`
- Slideshows -> `5-slideshows.mp4`
- Calendar, Library, Company Profile and Feedback -> `6-calendar-library.mp4`

**Introduction video (`_V`):**
- `compressed-intro-homepage-guide.mov`

---

## 2. IMAGE URLs

### Hardcoded Images
| Description | URL |
|-------------|-----|
| Default slideshow placeholder / Pinterest image | `https://i.pinimg.com/1200x/33/04/18/330418dacabe4b566cccffa2aa9dc307.jpg` |
| User avatars (dynamic) | `https://unavatar.io/x/${username}` |

### No `media.aftermark.workers.dev` URLs found in the bundle.

---

## 3. THUMBNAIL HANDLING

Thumbnails are dynamically loaded from the backend (not hardcoded). The code references:
- `thumbnailUrl` property on content objects
- Components: `vBe` (video with thumbnail), `CN` (content player with thumbnail)
- Used in library grid views, content cards, and calendar views

---

## 4. CONTENT TYPES AND STATE STRUCTURES

### Content Type Route Mapping (`Pne`)
```js
{
  "green-screen": "/content/green-screen-meme",
  "wall-of-text": "/content/wall-of-text",
  "video-hook": "/content/video-hook-and-demo",
  "slideshow": "/content/slideshow"
}
```

### Content Type -> Storage Key Mapping (`Rne`)
```js
{
  "green-screen": "green-screen-remix",
  "wall-of-text": "wall-of-text-remix",
  "video-hook": "hook-and-demo-remix",
  "slideshow": "image-slideshow-remix"
}
```

### Storage Key -> Route Mapping (`kBe`)
```js
{
  "green-screen":  { storageKey: "green-screen-remix",       route: "/content/green-screen-meme" },
  "wall-of-text":  { storageKey: "wall-of-text-remix",       route: "/content/wall-of-text" },
  "video-hook":    { storageKey: "hook-and-demo-remix",      route: "/content/video-hook-and-demo" },
  "slideshow":     { storageKey: "image-slideshow-remix",    route: "/content/slideshow" }
}
```

---

## 5. CONTENT STATE STRUCTURES

### Green Screen Remix State
```
selectedMode, prompt, shouldPromoteBusiness, selectedTrendingContent,
selectedVideo, selectedImage, renderedText, previewVideoUrl,
previewImageUrl, textPosition, fontStyling, videoTransform
```
- Uses: `correspondingContentR2Key`, `contentPosition`, `textPosition`
- Uses: `matchingVideoUrls`, `matchingBackgroundUrls`

### Wall of Text Remix State
```
selectedMode, prompt, shouldPromoteBusiness, selectedTrendingContent,
selectedVideo, selectedAudio, selectedStyle, renderedText,
previewVideoUrl, previewAudioUrl, textPosition, fontStyling
```
- Uses: `matchingVideoUrls`, `matchingAudioUrls`

### Hook and Demo Remix State
```
selectedMode, prompt, shouldPromoteBusiness, selectedTrendingContent,
selectedVideo, selectedDemoVideo, selectedAudio, renderedText,
previewVideoUrl, previewDemoVideoUrl, previewAudioUrl,
textPosition, fontStyling, videoTransform, hookVideoTrimStart, hookVideoTrimEnd
```
- Uses: `matchingVideoUrls`, `matchingAudioUrls`

### Image Slideshow Remix State
```
selectedMode, prompt, shouldPromoteBusiness, selectedTrendingContent,
selectedImageSet, selectedStyle, displayedSet, slideTextBoxes,
aspectRatio, fontStyling
```
- Uses: `matchingSetNames`, `slideUrls`, `slideTextBoxes`

---

## 6. R2 STORAGE KEY REFERENCES

```
correspondingContentR2Key  (maps trending content to R2 object)
r2Key                      (individual content R2 key)
r2Keys                     (multiple keys)
matchingVideosR2Keys       (video R2 keys for trending content)
matchingBackgroundsR2Keys  (background R2 keys)
matchingAudiosR2Keys       (audio R2 keys)
getMediaByR2Key            (API/function to fetch media by key)
```

---

## 7. DEFAULT TEXT/FONT STYLING CONFIG

```js
// Default font styling (mV)
{
  fontWeight: 500,
  fontColor: "#FFFFFF",
  strokeWidth: 3,
  strokeColor: "#000000",
  fontSize: 18
}

// Aspect ratios (pV)
{ "1:1": 1, "4:5": 0.8, "3:4": 0.75, "9:16": 0.5625 }

// Canvas dimensions (rYe)
{
  "1:1":  { width: 1080, height: 1080 },
  "4:5":  { width: 864,  height: 1080 },
  "3:4":  { width: 810,  height: 1080 },
  "9:16": { width: 608,  height: 1080 }
}

// Font weight stepping
{ 300: 400, 400: 500, 500: 600, 600: 700, 700: 800 }
```

---

## 8. TESTIMONIALS / SOCIAL PROOF

| Handle | Quote | URL |
|--------|-------|-----|
| @MichieltheKing | "You should check what Fastlane AI built. Automatic stitching and slideshows + posting. Gamechanger in terms of value created." | https://x.com/MichieltheKing/status/2028121587426451768 |
| @joncphillips | "Simply put. I'm a fan and use the product." | https://x.com/joncphillips/status/2007854609868689415 |
| @TimJayas | "Saturday night. Kids are asleep. Wife is at a work function..." | https://x.com/TimJayas/status/1999604868609376270 |
| @HyperM0nkey1 | "For a little under 2 months I was testing out the pre-release..." (3,800% increase in page viewership) | https://x.com/HyperM0nkey1/status/2024314162101571950 |
| @brightstartapp | "Quick appreciation to the team at Fastlane AI, we got 100 users..." | https://x.com/brightstartapp/status/2026472564244230353 |
| @Dev__Vishwajeet | "Just 3.5 years ago this was impossible..." | https://x.com/Dev__Vishwajeet/status/2014287919830438272 |
| @Ayo_copy | "It's impressive how you turned content into income..." | https://x.com/Ayo_copy/status/2016807726819528805 |
| @lorenzo_noya | "bruhhh, i just found this website and it's so crazy!..." | https://x.com/lorenzo_noya/status/2024379398913478701 |
| @_dngi | "Struggling with marketing? Fastlane AI just deleted your excuses" | https://x.com/_dngi/status/2023172974019514615 |
| @harjjotsinghh | "Congrats Gaurav! The platform is a banger!" | https://x.com/harjjotsinghh/status/2024031976445862353 |
| @0xGorri | "Guys have no idea how to code but make $300 instantly after launching SaaS..." | https://x.com/0xGorri/status/2024358541578874939 |
| @joncphillips | (second tweet) | https://x.com/joncphillips/status/2023970800353632529 |
| @HyperM0nkey1 | (second tweet) | https://x.com/HyperM0nkey1/status/2025785919450845584 |
| @Aevmorfop | "Simple and intuitive interface for content creation..." | https://x.com/Aevmorfop/status/2026211833514697069 |
| @julestriolo | "The distribution machine we've been asking for..." | https://x.com/julestriolo/status/2029085563354005994 |
| @NimishaChanda | "First three video posted on instagram using Fastlane did pretty great!" | https://x.com/NimishaChanda/status/2032497885896679452 |
| @madsmadsdk | "Slowly building SEO, and Tiktok. For Tiktok I am using Fastlane..." | https://x.com/madsmadsdk/status/2032923502810960020 |
| @mrgriggio | "Usefastlane.ai does wonders for conversions!" | https://x.com/mrgriggio/status/2035232250011291748 |

---

## 9. FEATURE DESCRIPTIONS (Landing/Onboarding)

- **Generate Trending Content**: "Create slideshows, wall of text, hook & demo, and green screen videos."
- **500+ Trending Videos**: "Remix proven viral videos directly with your business context."
- **Most Realistic UGC Avatars**: "Lifelike AI avatars that deliver your message like a real creator would."
- **Multi-Platform Posting**: "Publish directly to TikTok and Instagram from one place."
- **Track Performance**: "Monitor your views and engagement across every channel."

---

## 10. APPLICATION ROUTES

```
/home, /blitz, /content, /calendar, /library, /analytics, /engagement,
/brand, /settings, /feedback, /roadmap, /guide, /upgrade,
/login, /signup, /logout, /onboarding,
/content/green-screen-meme, /content/wall-of-text,
/content/video-hook-and-demo, /content/slideshow,
/engagement/actions, /engagement/insights,
/auth/instagram/callback, /auth/tiktok/callback,
/auth/reddit/callback, /auth/youtube/callback, /auth/sso-callback,
/admin, /admin/analytics, /admin/analytics/content,
/admin/analytics/distributions, /admin/analytics/leads,
/admin/analytics/system, /admin/analytics/top-users,
/admin/analytics/users, /admin/companies, /admin/design-system,
/admin/feedback, /admin/roadmap, /admin/version, /admin/analysis
```

---

## 11. BACKEND / INFRASTRUCTURE

- **Convex backends**: `https://aromatic-caribou-889.convex.cloud`, `https://happy-otter-123.convex.cloud`
- **PostHog key**: `phc_FGWXzDuZMOH4mXFtWwt7u9mWQhU3DwsgiCMx7DbhDGZ`
- **PostHog endpoint**: `https://us.i.posthog.com`
- **Instagram OAuth Client ID**: `1533811694576544`
- **Clerk auth** (implied by `clerk.com` references)
- **Feedback**: `https://calendly.com/hello-fastlane/feedback`
- **Discord**: `https://discord.gg/aaAQ9VzQ6j`
- **Lovable app**: `https://chat-whisperer-287.lovable.app`

---

## 12. ADMIN WHITELIST EMAILS

```
explosiongaurav6@gmail.com
jastechrnd@gmail.com
worldman474@gmail.com
anisharma2103@gmail.com
leagueofminecraftswag@gmail.com
app.aftermark.ai
hello@aftermark.ai
app.usefastlane.ai
hello@usefastlane.ai
hello@getcassius.ai
```

---

## 13. ERROR CODES

```
CONTENT_BUILDING_LIMIT_EXCEEDED
CONTENT_CAPTION_GENERATION_LIMIT_EXCEEDED
CONTENT_COPY_GENERATION_LIMIT_EXCEEDED
CONTENT_LIMIT_REACHED
ONBOARDING_RESET_LIMIT_EXCEEDED
RATE_LIMITED / RATE_LIMIT_EXCEEDED
USER_INFO_FETCH_FAILED / USER_NOT_FOUND
WORKSPACE_ACCESS_DENIED / WORKSPACE_ALREADY_DELETED
WORKSPACE_DELETED / WORKSPACE_LIMIT_EXCEEDED / WORKSPACE_MISMATCH
```

---

## 14. VIDEO TYPE DETECTION

The app classifies content as video when:
- Content type is one of: `video-hook`, `green-screen`, `wall-of-text`
- File extension is one of: `.mp4`, `.webm`, `.ogg`, `.mov`, `.avi`

---

## 15. LOCAL STORAGE KEYS

```
aftermark_onboarding_data      (onboarding state)
aftermark_content_state_*      (content creation state prefix)
aftermark_content_tab_id       (browser tab ID for state isolation)
green-screen-remix             (green screen draft)
wall-of-text-remix             (wall of text draft)
hook-and-demo-remix            (hook & demo draft)
image-slideshow-remix          (slideshow draft)
```
