export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n?.toString() || '0'
}

export function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function timeAgo(d) {
  const s = Math.floor((Date.now() - new Date(d)) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s/60)}m ago`
  if (s < 86400) return `${Math.floor(s/3600)}h ago`
  return `${Math.floor(s/86400)}d ago`
}

export const PLATFORMS = [
  { id: 'tiktok', name: 'TikTok', color: '#000000', icon: '📱' },
  { id: 'instagram', name: 'Instagram', color: '#E1306C', icon: '📸' },
  { id: 'youtube', name: 'YouTube', color: '#FF0000', icon: '▶️' },
  { id: 'linkedin', name: 'LinkedIn', color: '#0077B5', icon: '💼' },
  { id: 'twitter', name: 'Twitter/X', color: '#1DA1F2', icon: '🐦' },
]

export const TONES = ['Educational', 'Entertaining', 'Viral', 'Professional', 'Inspirational', 'Funny']

export const HOOK_TYPES = ['Question', 'Bold Statement', 'Controversy', 'Story', 'How-To', 'List']
