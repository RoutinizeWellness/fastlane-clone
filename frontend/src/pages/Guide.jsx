import { useState, useRef } from 'react'
import { ChevronDown, ChevronUp, Play, Rocket, Palette, Settings } from 'lucide-react'

const GUIDE_SECTIONS = [
  {
    section: 'Getting Started',
    icon: 'Rocket',
    description: 'Learn the basics of navigating Fastlane, using Blitz mode for rapid content creation, and creating content manually.',
    videos: [
      { title: 'Introduction', description: 'A full walkthrough of the homepage and core navigation.', url: 'https://media.aftermark.ai/tutorials/compressed-intro-homepage-guide.mov' },
      { title: 'Blitz Mode Guide', description: 'How to use Blitz mode to generate content in seconds.', url: 'https://media.aftermark.ai/tutorials/compressed-blitz-guide.mov' },
      { title: 'Manual Creation', description: 'Step-by-step guide to creating content manually with full control.', url: 'https://media.aftermark.ai/tutorials/manual-creation-demo.mp4' },
      { title: 'Blitz Demo', description: 'Watch Blitz mode in action from start to finish.', url: 'https://media.aftermark.ai/tutorials/blitz-demo.mp4' },
    ]
  },
  {
    section: 'Content Types',
    icon: 'Palette',
    description: 'Explore each content format available in Fastlane and learn how to make the most of every style.',
    videos: [
      { title: 'Green Screen Meme', description: 'Create viral green screen memes with trending backgrounds.', url: 'https://media.aftermark.ai/tutorials/2-green-screen.mp4' },
      { title: 'Wall of Text', description: 'Bold text overlays that stop the scroll and deliver instant value.', url: 'https://media.aftermark.ai/tutorials/3-wall-of-text.mp4' },
      { title: 'Hook & Demo', description: 'Pair a viral hook with your product demo for maximum impact.', url: 'https://media.aftermark.ai/tutorials/4-hook-demo.mp4' },
      { title: 'Slideshows', description: 'Image carousels that tell a story and drive engagement.', url: 'https://media.aftermark.ai/tutorials/5-slideshows.mp4' },
    ]
  },
  {
    section: 'Features',
    icon: 'Settings',
    description: 'Manage your content calendar, organise your media library, and stay on top of your posting schedule.',
    videos: [
      { title: 'Calendar & Library', description: 'Schedule posts and manage your media library in one place.', url: 'https://media.aftermark.ai/tutorials/6-calendar-library.mp4' },
    ]
  },
]

const SECTION_ICONS = { Rocket, Palette, Settings }

function GuideVideo({ video }) {
  const ref = useRef(null)
  return (
    <div style={{
      borderRadius: 14, overflow: 'hidden', background: '#000',
      border: '1px solid #E5E7EB', width: 260, flexShrink: 0,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
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
      <div style={{ padding: '10px 14px', background: 'white' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 2 }}>{video.title}</div>
        {video.description && (
          <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>{video.description}</div>
        )}
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
      {GUIDE_SECTIONS.map(section => {
        const Icon = SECTION_ICONS[section.icon]
        return (
          <div key={section.section} style={{ marginBottom: 36 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              {Icon && (
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Icon size={16} color="#EA580C" />
                </div>
              )}
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: 0 }}>{section.section}</h3>
            </div>
            {section.description && (
              <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 14px', paddingLeft: 42, lineHeight: 1.5 }}>{section.description}</p>
            )}
            <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8, scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}>
              {section.videos.map(vid => (
                <div key={vid.url} style={{ scrollSnapAlign: 'start' }}>
                  <GuideVideo video={vid} />
                </div>
              ))}
            </div>
          </div>
        )
      })}

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
