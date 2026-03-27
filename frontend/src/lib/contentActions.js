// Save & Download utilities for content cards
import api from './api'

/**
 * Save a viral content item to the library (backend + localStorage fallback)
 */
export async function saveToLibrary(video) {
  const typeMap = {
    'slideshow': 'slideshow',
    'wall-of-text': 'wall-of-text',
    'video-hook-and-demo': 'video-hook-and-demo',
    'green-screen-meme': 'green-screen-meme',
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
  } else if (ct === 'video-hook-and-demo') {
    // Download hook script as .txt
    const text = [video.hookText, video.demoText, video.caption].filter(Boolean).join('\n\n---\n\n')
    downloadText(text, `video-hook-${video.id}.txt`)
  } else if (ct === 'green-screen-meme') {
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

/**
 * Bookmark a content item (backend + localStorage fallback)
 */
export async function bookmarkContent(video) {
  const payload = {
    id: video.id,
    contentType: video.contentType,
    caption: video.caption,
    thumbnail: video.thumbnail,
    data: video,
  }
  try {
    await api.post('/library/bookmark', payload)
    return { ok: true, message: 'Bookmarked!' }
  } catch {
    const bookmarks = JSON.parse(localStorage.getItem('fl_bookmarks') || '[]')
    if (!bookmarks.find(b => b.id === video.id)) {
      bookmarks.unshift({ ...payload, created_at: new Date().toISOString() })
      localStorage.setItem('fl_bookmarks', JSON.stringify(bookmarks))
    }
    return { ok: true, message: 'Bookmarked locally!' }
  }
}

/**
 * Remove a bookmark by content ID
 */
export async function removeBookmark(contentId) {
  try {
    await api.delete(`/library/bookmark/${contentId}`)
    return { ok: true }
  } catch {
    const bookmarks = JSON.parse(localStorage.getItem('fl_bookmarks') || '[]')
    const filtered = bookmarks.filter(b => b.id !== contentId)
    localStorage.setItem('fl_bookmarks', JSON.stringify(filtered))
    return { ok: true }
  }
}

/**
 * Get all bookmarks
 */
export async function getBookmarks() {
  try {
    const res = await api.get('/library/bookmarks')
    return res.data.bookmarks || res.data || []
  } catch {
    return JSON.parse(localStorage.getItem('fl_bookmarks') || '[]')
  }
}

/**
 * Export a single content item (triggers file download)
 */
export async function exportContent(id) {
  try {
    const res = await api.get(`/library/export/${id}`, { responseType: 'blob' })
    const blob = new Blob([res.data])
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `content-${id}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
    return { ok: true }
  } catch {
    return { ok: false, message: 'Export failed' }
  }
}

/**
 * Export all content (triggers file download)
 */
export async function exportAllContent() {
  try {
    const res = await api.get('/library/export-all', { responseType: 'blob' })
    const blob = new Blob([res.data])
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'all-content-export.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
    return { ok: true }
  } catch {
    return { ok: false, message: 'Export failed' }
  }
}
