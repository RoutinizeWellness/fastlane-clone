// Save & Download utilities for content cards
import api from './api'

/**
 * Save a viral content item to the library (backend + localStorage fallback)
 */
export async function saveToLibrary(video) {
  const typeMap = {
    'slideshow': 'slideshow',
    'wall-of-text': 'walloftext',
    'video-hook': 'videohook',
    'green-screen': 'greenscreen',
  }
  const payload = {
    type: typeMap[video.contentType] || video.contentType || 'slideshow',
    platform: 'tiktok',
    title: video.caption || 'Saved content',
    content_json: {
      id: video.id,
      caption: video.caption,
      thumbnail: video.thumbnail,
      videoUrl: video.videoUrl,
      slides: video.slides || null,
      textOverlay: video.textOverlay || null,
      hookText: video.hookText || null,
      topText: video.topText || null,
      bottomText: video.bottomText || null,
      tags: video.tags || [],
      num_likes: video.num_likes,
      num_views: video.num_views,
    },
    thumbnail_url: video.thumbnail || '',
  }

  try {
    await api.post('/library/save', payload)
    return { ok: true, message: 'Saved to Library!' }
  } catch {
    // Fallback: save to localStorage
    const saved = JSON.parse(localStorage.getItem('fl_saved_content') || '[]')
    if (!saved.find(s => s.id === video.id)) {
      saved.unshift({ ...payload, id: Date.now(), created_at: new Date().toISOString() })
      localStorage.setItem('fl_saved_content', JSON.stringify(saved))
    }
    return { ok: true, message: 'Saved locally!' }
  }
}

/**
 * Download content based on type
 */
export async function downloadContent(video, slideIdx = 0) {
  const ct = video.contentType

  if (ct === 'slideshow' && video.slides?.length > 0) {
    // Download current slide image
    const slide = video.slides[slideIdx] || video.slides[0]
    await downloadImage(slide.imageUrl, `slideshow-${video.id}-slide-${slideIdx + 1}.jpg`)
  } else if (ct === 'wall-of-text') {
    // Download text content as .txt
    const text = video.textOverlay || video.caption || ''
    downloadText(text, `wall-of-text-${video.id}.txt`)
  } else if (ct === 'video-hook') {
    // Download hook script as .txt
    const text = [video.hookText, video.demoText, video.caption].filter(Boolean).join('\n\n---\n\n')
    downloadText(text, `video-hook-${video.id}.txt`)
  } else if (ct === 'green-screen') {
    // Download meme text + image
    const text = `TOP TEXT: ${video.topText || ''}\nBOTTOM TEXT: ${video.bottomText || ''}\n\nCaption: ${video.caption || ''}`
    downloadText(text, `green-screen-meme-${video.id}.txt`)
    // Also download the thumbnail
    if (video.thumbnail) {
      await downloadImage(video.thumbnail, `green-screen-${video.id}.jpg`)
    }
  } else if (video.thumbnail) {
    await downloadImage(video.thumbnail, `content-${video.id}.jpg`)
  }
}

async function downloadImage(url, filename) {
  try {
    const resp = await fetch(url)
    const blob = await resp.blob()
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
  } catch {
    // Fallback: open in new tab
    window.open(url, '_blank')
  }
}

function downloadText(text, filename) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}
