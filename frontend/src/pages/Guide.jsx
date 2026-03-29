import { useState, useRef } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const GUIDE_VIDEOS = [
  {
    section: 'Getting Started',
    videos: [
      { title: 'Intro & Homepage Guide', url: 'https://media.aftermark.ai/tutorials/compressed-intro-homepage-guide.mov' },
    ]
  },
  {
    section: 'Blitz Mode',
    videos: [
      { title: 'Blitz Guide', url: 'https://media.aftermark.ai/tutorials/compressed-blitz-guide.mov' },
      { title: 'Blitz Demo', url: 'https://media.aftermark.ai/tutorials/blitz-demo.mp4' },
    ]
  },
  {
    section: 'Manual Creation',
    videos: [
      { title: 'Manual Creation Demo', url: 'https://media.aftermark.ai/tutorials/manual-creation-demo.mp4' },
    ]
  },
  {
    section: 'Green Screen',
    videos: [
      { title: 'Green Screen Tutorial', url: 'https://media.aftermark.ai/tutorials/2-green-screen.mp4' },
    ]
  },
  {
    section: 'Wall of Text',
    videos: [
      { title: 'Wall of Text Tutorial', url: 'https://media.aftermark.ai/tutorials/3-wall-of-text.mp4' },
    ]
  },
  {
    section: 'Hook & Demo',
    videos: [
      { title: 'Hook & Demo Tutorial', url: 'https://media.aftermark.ai/tutorials/4-hook-demo.mp4' },
    ]
  },
  {
    section: 'Slideshows',
    videos: [
      { title: 'Slideshows Tutorial', url: 'https://media.aftermark.ai/tutorials/5-slideshows.mp4' },
    ]
  },
  {
    section: 'Calendar & Library',
    videos: [
      { title: 'Calendar & Library Tutorial', url: 'https://media.aftermark.ai/tutorials/6-calendar-library.mp4' },
    ]
  },
]

function GuideVideo({ video }) {
  const ref = useRef(null)
  return (
    <div style={{
      borderRadius: 12, overflow: 'hidden', background: '#000',
      border: '1px solid #E5E7EB', maxWidth: 320
    }}>
      <video
        ref={ref}
        src={video.url}
        controls
        muted
        playsInline
        preload="metadata"
        style={{ width: '100%', aspectRatio: '9/16', objectFit: 'cover', display: 'block' }}
      />
      <div style={{ padding: '8px 12px', background: 'white' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{video.title}</span>
      </div>
    </div>
  )
}

const FAQ_SECTIONS = [
  {
    title: 'Warming up your account',
    items: [
      {
        q: 'How do I warm up my account?',
        a: 'The best warming up protocol is to behave exactly like a normal user for the first 3-5 days. Set up your profile fully with a photo and a bio, and spend around 10-20 minutes per day scrolling your For You Page, watching videos all the way through, liking content, leaving thoughtful comments, and engaging with posts in your niche. Do not post during this period. After those initial few days, begin posting 1-2 times per day while continuing to engage daily.'
      },
      {
        q: 'How do I navigate "zero view jail"?',
        a: 'Zero view jail is when a platform shows your content to no one. This often happens when an account is brand new. In the majority of cases, this is not a shadow ban—it usually just means the algorithm does not yet have enough data about your account. The good news is that it is temporary if you warm up your account and post consistently.'
      },
      {
        q: 'What should I actually do in the first few weeks?',
        a: 'Once your accounts are warmed up, we recommend posting 1-3 times per day across your platforms and scheduling content for the full week ahead. Try different formats and experiment with a few styles so you can start seeing what resonates.'
      },
    ]
  },
  {
    title: 'Why this type of content',
    items: [
      {
        q: 'Why can I only make slideshows, wall of text, hook and demo, and green screen memes?',
        a: 'These core short-form formats consistently perform very well across TikTok, Instagram and YouTube. They are fast to consume, clear in their message, and feel native to the platform. We continually update these with the latest pieces of content that are currently driving the greatest reach, traffic and revenue.'
      },
      {
        q: 'Why are slideshows so effective?',
        a: 'Slideshows provide simple, clear, and easy to consume value. Formats like "5 habits I built to accomplish X" perform so well because they are highly digestible. People naturally swipe, bookmark, and share native content that genuinely provides them value. They are also far cheaper and faster to produce than traditional video.'
      },
      {
        q: 'Why is wall of text so effective?',
        a: 'Wall of text videos work because the hook is the content. The entire value is delivered in the text overlay. These perform well because they feel native and low effort, spark curiosity immediately, and encourage full watch time because people want to read to the end.'
      },
      {
        q: 'Why are hook demo videos so effective?',
        a: 'Hook and demo videos create intrigue, highlight a pain point, and then immediately demonstrate the solution. Platforms reward this format because it keeps watch time and retention high. This format works especially well for apps, SaaS, tools, and any product that can be demonstrated visually.'
      },
      {
        q: 'Why are green screen memes so effective?',
        a: 'Green screen memes work because the meme is already viral content. The humour and familiarity are already built in. When someone sees a meme that perfectly describes their problem, they instantly connect with it. This format feels more like culture than marketing.'
      },
    ]
  },
  {
    title: 'Creating and remixing content',
    items: [
      {
        q: 'How does Remix work?',
        a: 'Remix looks at two things: the visual structure of the video and the psychology/hook structure of the post. It preserves the attention-grabbing format but adapts the content to your niche and product.'
      },
      {
        q: 'What if the trending content isn\'t in my niche?',
        a: 'This is completely fine and is actually a good strategy. The content that trends in one niche will often go on to trend in another. Focus on how the hook is written and how the value is delivered, then apply that same structure to your own business context.'
      },
      {
        q: 'Can I upload my own media/videos/images?',
        a: 'Yes. When you are prompted to select media, you can choose the My Videos option and upload your own video files. For slideshows, you can open the right toolbar and select My Images to upload your own images and swap them into the slides.'
      },
    ]
  },
  {
    title: 'Optimising your growth strategy',
    items: [
      {
        q: 'How quickly should I expect results?',
        a: 'Organic marketing is a compounding game over time. We recommend committing to at least 30 days of regular activity so the algorithm can find the right audience before evaluating performance.'
      },
      {
        q: 'How many videos should I be posting per day?',
        a: 'After your accounts have been warmed up, we recommend posting 1-3 times per day on each platform. TikTok themselves state that the recommended frequency is between 1-4 times a day.'
      },
      {
        q: 'Do I need an existing audience for this to work?',
        a: 'No. Short-form content is distributed based on the content itself, not your follower count. Even relatively new accounts can reach people in their niche if the content is engaging and posted consistently.'
      },
      {
        q: 'Should I post the same video across all platforms?',
        a: 'Yes. A great strategy is to repurpose the content and cross-post across TikTok, Instagram Reels, and YouTube Shorts. More surface area equals more opportunity.'
      },
    ]
  },
]

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid #F3F4F6' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 0', background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 14, fontWeight: 500, color: '#111827', textAlign: 'left'
        }}
      >
        {q}
        {open ? <ChevronUp size={16} color="#9CA3AF" /> : <ChevronDown size={16} color="#9CA3AF" />}
      </button>
      {open && (
        <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.7, margin: '0 0 14px', paddingRight: 24 }}>
          {a}
        </p>
      )}
    </div>
  )
}

export default function Guide() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
        <span style={{ fontSize: 24 }}>📖</span>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0 }}>Guide & FAQ</h1>
      </div>

      {/* Tutorial Video Sections */}
      {GUIDE_VIDEOS.map(section => (
        <div key={section.section} style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 12 }}>{section.section}</h3>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            {section.videos.map(vid => (
              <GuideVideo key={vid.url} video={vid} />
            ))}
          </div>
        </div>
      ))}

      {/* FAQ Sections */}
      {FAQ_SECTIONS.map(section => (
        <div key={section.title} style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 12 }}>{section.title}</h3>
          <div style={{ background: 'white', borderRadius: 14, padding: '4px 20px', border: '1px solid #E5E7EB' }}>
            {section.items.map(item => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
