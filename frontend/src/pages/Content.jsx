import { useState, useRef, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Copy, ChevronLeft, ChevronRight, RefreshCw, Edit3, Save, Bookmark, Download, Type, Palette, AlignLeft, AlignCenter, AlignRight, ArrowUp, ArrowDown, Minus } from 'lucide-react'
import api from '../lib/api'
import { VIRAL_CONTENT, CONTENT_TAGS } from '../lib/viralContent'
import { formatNumber } from '../lib/utils'
import { saveToLibrary, downloadContent } from '../lib/contentActions'
import { useStore } from '../store'

const TEXT_FONTS = [
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'Montserrat', value: 'Montserrat, sans-serif' },
  { label: 'Poppins', value: 'Poppins, sans-serif' },
  { label: 'Oswald', value: 'Oswald, sans-serif' },
  { label: 'Playfair Display', value: "'Playfair Display', serif" },
  { label: 'Roboto Mono', value: "'Roboto Mono', monospace" },
]

const DEFAULT_TEXT_STYLE = {
  fontFamily: 'Inter, sans-serif',
  color: '#ffffff',
  fontSize: 14,
  position: 'center', // top | center | bottom
  textAlign: 'center', // left | center | right
}

/* ── Brand placeholder replacement ───────────────────── */
function replaceBrandPlaceholders(text, brand) {
  if (!text || !brand) return text || ''
  return text
    .replace(/\{brandName\}/gi, brand.name || brand.brandName || 'Your Brand')
    .replace(/\{product\}/gi, brand.product || brand.mainProduct || 'your product')
    .replace(/\{benefit\}/gi, brand.benefit || brand.mainBenefit || 'amazing results')
}

/* ── Get default text for a video ────────────────────── */
function getDefaultText(video, slideIdx) {
  if (!video) return ''
  if (video.contentType === 'slideshow' && video.slides) {
    const slide = video.slides[slideIdx || 0]
    return slide?.text || video.caption || ''
  }
  if (video.contentType === 'wall-of-text') return video.textOverlay || video.caption || ''
  if (video.contentType === 'video-hook-and-demo') return video.hookText || video.caption || ''
  if (video.contentType === 'green-screen-meme') {
    const top = video.topText || video.caption?.split(' ').slice(0, Math.ceil((video.caption?.split(' ').length || 0) / 2)).join(' ') || ''
    const bottom = video.bottomText || video.caption?.split(' ').slice(Math.ceil((video.caption?.split(' ').length || 0) / 2)).join(' ') || ''
    return top + '\n---\n' + bottom
  }
  return video.caption || ''
}

/* ── Floating text edit toolbar ──────────────────────── */
function TextEditToolbar({ style, onChange, onClose }) {
  return (
    <div
      onClick={e => e.stopPropagation()}
      style={{
        position: 'absolute', top: -48, left: '50%', transform: 'translateX(-50%)',
        background: '#1F2937', borderRadius: 10, padding: '6px 8px',
        display: 'flex', alignItems: 'center', gap: 6, zIndex: 100,
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)', whiteSpace: 'nowrap',
        minWidth: 320,
      }}
    >
      {/* Font family */}
      <select
        value={style.fontFamily}
        onChange={e => onChange({ ...style, fontFamily: e.target.value })}
        style={{
          background: '#374151', color: 'white', border: 'none', borderRadius: 6,
          padding: '3px 4px', fontSize: 10, cursor: 'pointer', maxWidth: 80,
          fontFamily: style.fontFamily,
        }}
      >
        {TEXT_FONTS.map(f => (
          <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>
        ))}
      </select>

      {/* Separator */}
      <div style={{ width: 1, height: 18, background: '#4B5563' }} />

      {/* Font size */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <button onClick={() => onChange({ ...style, fontSize: Math.max(8, style.fontSize - 1) })}
          style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: 2, display: 'flex' }}>
          <Minus size={10} />
        </button>
        <span style={{ color: 'white', fontSize: 10, minWidth: 18, textAlign: 'center' }}>{style.fontSize}</span>
        <button onClick={() => onChange({ ...style, fontSize: Math.min(32, style.fontSize + 1) })}
          style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: 2, fontSize: 12, fontWeight: 700, lineHeight: 1 }}>
          +
        </button>
      </div>

      {/* Separator */}
      <div style={{ width: 1, height: 18, background: '#4B5563' }} />

      {/* Color picker */}
      <label style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
        <div style={{ width: 16, height: 16, borderRadius: 4, border: '2px solid #6B7280', background: style.color }} />
        <input
          type="color"
          value={style.color}
          onChange={e => onChange({ ...style, color: e.target.value })}
          style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
        />
      </label>

      {/* Separator */}
      <div style={{ width: 1, height: 18, background: '#4B5563' }} />

      {/* Text alignment */}
      {['left', 'center', 'right'].map(a => (
        <button key={a} onClick={() => onChange({ ...style, textAlign: a })}
          style={{
            background: style.textAlign === a ? '#4B5563' : 'none', border: 'none',
            borderRadius: 4, padding: 3, cursor: 'pointer', display: 'flex',
            color: style.textAlign === a ? 'white' : '#9CA3AF',
          }}>
          {a === 'left' ? <AlignLeft size={11} /> : a === 'center' ? <AlignCenter size={11} /> : <AlignRight size={11} />}
        </button>
      ))}

      {/* Separator */}
      <div style={{ width: 1, height: 18, background: '#4B5563' }} />

      {/* Position: top / center / bottom */}
      {['top', 'center', 'bottom'].map(p => (
        <button key={p} onClick={() => onChange({ ...style, position: p })}
          style={{
            background: style.position === p ? '#4B5563' : 'none', border: 'none',
            borderRadius: 4, padding: 3, cursor: 'pointer', display: 'flex',
            color: style.position === p ? 'white' : '#9CA3AF',
          }}
          title={`Position: ${p}`}
        >
          {p === 'top' ? <ArrowUp size={11} /> : p === 'bottom' ? <ArrowDown size={11} /> : <Type size={11} />}
        </button>
      ))}
    </div>
  )
}

/* ── Editable text overlay on content cards ──────────── */
function EditableTextOverlay({ videoId, text, textStyle, isEditing, onStartEdit, onTextChange, onStyleChange, onStopEdit, brand, contentType }) {
  const ref = useRef(null)
  const displayText = replaceBrandPlaceholders(text, brand)

  // Auto-focus the contentEditable element when editing starts
  useEffect(() => {
    if (isEditing && ref.current) {
      ref.current.focus()
      // Place cursor at end of text
      const sel = window.getSelection()
      const range = document.createRange()
      range.selectNodeContents(ref.current)
      range.collapse(false)
      sel.removeAllRanges()
      sel.addRange(range)
    }
  }, [isEditing])

  const positionStyles = {
    top: { alignItems: 'flex-start', paddingTop: 14 },
    center: { alignItems: 'center' },
    bottom: { alignItems: 'flex-end', paddingBottom: 52 },
  }

  const bgGradients = {
    top: 'linear-gradient(rgba(0,0,0,0.6) 0%, transparent 70%)',
    center: 'linear-gradient(transparent 10%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.35) 60%, transparent 90%)',
    bottom: 'linear-gradient(transparent 30%, rgba(0,0,0,0.7))',
  }

  // For green-screen, split on --- to get top/bottom
  const isGreenScreen = contentType === 'green-screen-meme'
  const parts = isGreenScreen ? displayText.split('\n---\n') : [displayText]

  if (isGreenScreen) {
    return (
      <div style={{ position: 'absolute', inset: 0, zIndex: 4, pointerEvents: 'none' }}>
        {/* Top text */}
        <div
          onClick={e => { e.stopPropagation(); onStartEdit() }}
          style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            padding: '14px 10px',
            background: 'linear-gradient(rgba(0,0,0,0.6), transparent)',
            textAlign: textStyle.textAlign || 'center',
            pointerEvents: 'auto', cursor: 'text',
          }}
        >
          <p
            ref={ref}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={e => {
              const fullText = e.currentTarget.textContent + '\n---\n' + (parts[1] || '')
              onTextChange(fullText)
              onStopEdit()
            }}
            style={{
              color: textStyle.color, fontSize: textStyle.fontSize, fontWeight: 900, lineHeight: 1.2,
              margin: 0, textTransform: 'uppercase', fontFamily: textStyle.fontFamily,
              textShadow: '2px 2px 0 #000, -1px -1px 0 #000',
              letterSpacing: 0.5, outline: 'none',
              border: isEditing ? '1px dashed rgba(255,255,255,0.5)' : 'none',
              borderRadius: 4, padding: isEditing ? 2 : 0,
            }}
          >
            {parts[0] || ''}
          </p>
        </div>
        {/* Bottom text */}
        <div
          onClick={e => { e.stopPropagation(); onStartEdit() }}
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '10px 10px 52px',
            background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
            textAlign: textStyle.textAlign || 'center',
            pointerEvents: 'auto', cursor: 'text',
          }}
        >
          <p
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={e => {
              const fullText = (parts[0] || '') + '\n---\n' + e.currentTarget.textContent
              onTextChange(fullText)
              onStopEdit()
            }}
            style={{
              color: textStyle.color, fontSize: textStyle.fontSize, fontWeight: 900, lineHeight: 1.2,
              margin: 0, textTransform: 'uppercase', fontFamily: textStyle.fontFamily,
              textShadow: '2px 2px 0 #000, -1px -1px 0 #000',
              letterSpacing: 0.5, outline: 'none',
              border: isEditing ? '1px dashed rgba(255,255,255,0.5)' : 'none',
              borderRadius: 4, padding: isEditing ? 2 : 0,
            }}
          >
            {parts[1] || ''}
          </p>
        </div>
        {isEditing && (
          <TextEditToolbar style={textStyle} onChange={onStyleChange} onClose={onStopEdit} />
        )}
      </div>
    )
  }

  // Normal single-text overlay for slideshow / wall-of-text / video-hook
  const pos = textStyle.position || 'center'
  return (
    <div
      onClick={e => { e.stopPropagation(); onStartEdit() }}
      style={{
        position: 'absolute', inset: 0, zIndex: 4,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        ...positionStyles[pos],
        padding: '14px 12px',
        background: bgGradients[pos],
        textAlign: textStyle.textAlign || 'center',
        cursor: 'text',
      }}
    >
      {contentType === 'video-hook-and-demo' && (
        <span style={{
          alignSelf: 'flex-start', marginBottom: 6,
          padding: '3px 10px', borderRadius: 9999,
          background: 'rgba(234,88,12,0.9)',
          color: 'white', fontSize: 9, fontWeight: 800, letterSpacing: 0.5,
          textTransform: 'uppercase', pointerEvents: 'none',
        }}>Hook</span>
      )}
      <p
        ref={ref}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onBlur={e => { onTextChange(e.currentTarget.textContent); onStopEdit() }}
        style={{
          color: textStyle.color,
          fontSize: textStyle.fontSize,
          fontWeight: contentType === 'wall-of-text' ? 600 : 900,
          lineHeight: contentType === 'wall-of-text' ? 1.5 : 1.3,
          margin: 0,
          fontFamily: textStyle.fontFamily,
          textShadow: '0 2px 8px rgba(0,0,0,0.7)',
          ...(isEditing ? { overflow: 'auto', maxHeight: '80%' } : { display: '-webkit-box', WebkitLineClamp: contentType === 'wall-of-text' ? 7 : 5, WebkitBoxOrient: 'vertical', overflow: 'hidden' }),
          outline: 'none',
          border: isEditing ? '1px dashed rgba(255,255,255,0.5)' : 'none',
          borderRadius: 4, padding: isEditing ? 2 : 0,
          textAlign: textStyle.textAlign || 'center',
        }}
      >
        {displayText}
      </p>
      {isEditing && (
        <TextEditToolbar style={textStyle} onChange={onStyleChange} onClose={onStopEdit} />
      )}
    </div>
  )
}

const TABS = [
  { id: 'slideshow', label: 'Slideshow', path: 'slideshow' },
  { id: 'wall-of-text', label: 'Wall of Text', path: 'wall-of-text' },
  { id: 'video-hook-and-demo', label: 'Video Hook & Demo', path: 'video-hook-and-demo' },
  { id: 'green-screen-meme', label: 'Green Screen Meme', path: 'green-screen-meme' },
]

const TAG_COLORS = {
  'B2B App': { bg: '#DBEAFE', text: '#1D4ED8' },
  'B2B SaaS/Platform': { bg: '#FEF3C7', text: '#92400E' },
  'B2C App': { bg: '#DCFCE7', text: '#15803D' },
  'Fitness': { bg: '#FCE7F3', text: '#9D174D' },
  'Finance': { bg: '#EDE9FE', text: '#5B21B6' },
  'Business': { bg: '#E0F2FE', text: '#0369A1' },
  'Lifestyle': { bg: '#FEF9C3', text: '#854D0E' },
  'Self Improvement': { bg: '#F0FDF4', text: '#166534' },
  'Productivity': { bg: '#F5F3FF', text: '#6D28D9' },
  'Health': { bg: '#FFF1F2', text: '#BE123C' },
  'Relationships': { bg: '#FDF4FF', text: '#86198F' },
  'Course/Digital Product': { bg: '#FFF7ED', text: '#C2410C' },
}

/* ── 3D stacked carousel ─────────────────────────────── */
function VideoCarousel({ videos, activeIdx, onNavigate, onRemix, slideIdxMap, onSlideNav, onSave, onDownload, textOverrides, textStyles, editingVideoId, onStartEdit, onTextChange, onStyleChange, onStopEdit, brand }) {
  const prev2 = videos[(activeIdx - 2 + videos.length) % videos.length]
  const prev1 = videos[(activeIdx - 1 + videos.length) % videos.length]
  const current = videos[activeIdx]
  const next1 = videos[(activeIdx + 1) % videos.length]
  const next2 = videos[(activeIdx + 2) % videos.length]

  const cards = [
    { video: prev2, offset: -2, scale: 0.68, z: 0, opacity: 0.3, rotate: -12 },
    { video: prev1, offset: -1, scale: 0.82, z: 1, opacity: 0.6, rotate: -6 },
    { video: current, offset: 0, scale: 1, z: 2, opacity: 1, rotate: 0 },
    { video: next1, offset: 1, scale: 0.82, z: 1, opacity: 0.6, rotate: 6 },
    { video: next2, offset: 2, scale: 0.68, z: 0, opacity: 0.3, rotate: 12 },
  ]

  return (
    <div style={{ position: 'relative', flex: 1, minHeight: 350, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      {/* Left arrow */}
      <button
        onClick={() => onNavigate(-1)}
        style={{
          position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
          zIndex: 20, width: 30, height: 30, borderRadius: '50%',
          background: 'white', border: '1px solid #E5E7EB',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
        }}
      >
        <ChevronLeft size={16} color="#374151" />
      </button>

      {/* Cards — perspective container */}
      <div style={{ position: 'relative', width: 500, height: 400, perspective: '1000px' }}>
        {cards.map(({ video, offset, scale, z, opacity, rotate }, i) => {
          if (!video) return null
          const isCenter = offset === 0
          const xPx = offset * 120

          return (
            <div
              key={`${video.id}-${offset}`}
              onClick={() => !isCenter && onNavigate(offset)}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 195,
                aspectRatio: '9/16',
                transform: `translate(-50%, -50%) translateX(${xPx}px) translateZ(${isCenter ? 40 : 0}px) scale(${scale}) rotateY(${rotate}deg)`,
                transformOrigin: 'center center',
                zIndex: z + (isCenter ? 10 : 0),
                opacity,
                borderRadius: isCenter ? 18 : 14,
                overflow: 'hidden',
                background: '#111',
                cursor: isCenter ? 'default' : 'pointer',
                transition: 'all 0.45s cubic-bezier(0.23, 1, 0.32, 1)',
                boxShadow: isCenter ? '0 16px 48px rgba(0,0,0,0.5)' : '0 4px 16px rgba(0,0,0,0.2)',
                willChange: 'transform, opacity',
              }}
            >
              {/* Slideshow image carousel */}
              {video.contentType === 'slideshow' && video.slides && video.slides.length > 0 ? (
                (() => {
                  const curSlideIdx = (slideIdxMap && slideIdxMap[video.id]) || 0
                  const slide = video.slides[curSlideIdx] || video.slides[0]
                  return (
                    <>
                      <img
                        src={isCenter ? slide.imageUrl : (video.slides[0]?.imageUrl || video.thumbnail)}
                        alt={slide.text || ''}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                      {/* Text overlay on current slide — uses EditableTextOverlay */}
                      {isCenter && (
                        (() => {
                          const textKey = `${video.id}-slide-${curSlideIdx}`
                          const currentText = textOverrides?.[textKey] ?? slide.text ?? ''
                          const currentStyle = textStyles?.[video.id] || DEFAULT_TEXT_STYLE
                          return (
                            <EditableTextOverlay
                              videoId={video.id}
                              text={currentText}
                              textStyle={currentStyle}
                              isEditing={editingVideoId === video.id}
                              onStartEdit={() => onStartEdit && onStartEdit(video.id)}
                              onTextChange={t => onTextChange && onTextChange(textKey, t)}
                              onStyleChange={s => onStyleChange && onStyleChange(video.id, s)}
                              onStopEdit={() => onStopEdit && onStopEdit()}
                              brand={brand}
                              contentType="slideshow"
                            />
                          )
                        })()
                      )}
                      {/* Prev / Next slide buttons (center card only) */}
                      {isCenter && video.slides.length > 1 && (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); onSlideNav && onSlideNav(video.id, -1) }}
                            aria-label="Previous slide"
                            style={{
                              position: 'absolute', left: 4, top: '50%', transform: 'translateY(-50%)',
                              width: 22, height: 22, borderRadius: '50%',
                              background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white',
                              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 12, zIndex: 5,
                            }}
                          >&#8249;</button>
                          <button
                            onClick={(e) => { e.stopPropagation(); onSlideNav && onSlideNav(video.id, 1) }}
                            aria-label="Next slide"
                            style={{
                              position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)',
                              width: 22, height: 22, borderRadius: '50%',
                              background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white',
                              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 12, zIndex: 5,
                            }}
                          >&#8250;</button>
                        </>
                      )}
                      {/* Slide dot indicators (center card only) */}
                      {isCenter && video.slides.length > 1 && (
                        <div style={{ position: 'absolute', bottom: 36, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 4, zIndex: 5 }}>
                          {video.slides.map((_, si) => (
                            <button
                              key={si}
                              onClick={(e) => { e.stopPropagation(); onSlideNav && onSlideNav(video.id, si, true) }}
                              aria-label={`Go to slide ${si + 1}`}
                              style={{
                                width: si === curSlideIdx ? 14 : 5, height: 5, borderRadius: 3, border: 'none', padding: 0,
                                background: si === curSlideIdx ? 'white' : 'rgba(255,255,255,0.45)',
                                cursor: 'pointer', transition: 'all 0.3s',
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  )
                })()
              ) : (
                <>
                  {video.videoUrl ? (
                    <video
                      key={video.id}
                      src={video.videoUrl}
                      poster={video.thumbnail}
                      autoPlay={isCenter}
                      muted
                      loop
                      playsInline
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  ) : video.thumbnail ? (
                    <img
                      src={video.thumbnail}
                      alt={video.caption || ''}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1a1a2e, #16213e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>No preview</span>
                    </div>
                  )}
                </>
              )}

              {/* Content-type-specific overlay (center card) — unified editable text */}
              {isCenter && video.contentType !== 'slideshow' && (() => {
                const textKey = video.id
                const currentText = textOverrides?.[textKey] ?? getDefaultText(video)
                const currentStyle = textStyles?.[video.id] || {
                  ...DEFAULT_TEXT_STYLE,
                  fontSize: video.contentType === 'wall-of-text' ? 10 : video.contentType === 'green-screen-meme' ? 14 : 13,
                  position: video.contentType === 'video-hook-and-demo' ? 'top' : video.contentType === 'wall-of-text' ? 'bottom' : 'center',
                }
                return (
                  <EditableTextOverlay
                    videoId={video.id}
                    text={currentText}
                    textStyle={currentStyle}
                    isEditing={editingVideoId === video.id}
                    onStartEdit={() => onStartEdit && onStartEdit(video.id)}
                    onTextChange={t => onTextChange && onTextChange(textKey, t)}
                    onStyleChange={s => onStyleChange && onStyleChange(video.id, s)}
                    onStopEdit={() => onStopEdit && onStopEdit()}
                    brand={brand}
                    contentType={video.contentType}
                  />
                )
              })()}

              {/* Side card label (non-center) — simplified with type indicator */}
              {!isCenter && Math.abs(offset) === 1 && video.caption && (
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  padding: '24px 8px 40px',
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.7))'
                }}>
                  {video.contentType === 'video-hook-and-demo' && (
                    <span style={{
                      display: 'inline-block', marginBottom: 3,
                      padding: '1px 6px', borderRadius: 9999,
                      background: 'rgba(234,88,12,0.8)',
                      color: 'white', fontSize: 7, fontWeight: 800,
                      textTransform: 'uppercase', letterSpacing: 0.3
                    }}>Hook</span>
                  )}
                  <p style={{
                    color: 'white', fontSize: 10, fontWeight: 700, lineHeight: 1.25,
                    margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    textTransform: video.contentType === 'green-screen-meme' ? 'uppercase' : 'none'
                  }}>
                    {video.caption}
                  </p>
                </div>
              )}

              {/* Stats (center card only) */}
              {isCenter && (
                <div style={{
                  position: 'absolute', right: 8, bottom: 56,
                  display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center'
                }}>
                  {/* Save button */}
                  {onSave && (
                    <button
                      onClick={e => { e.stopPropagation(); onSave(video) }}
                      style={{
                        width: 28, height: 28, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: 'none', cursor: 'pointer', transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(234,88,12,0.8)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.55)'}
                      title="Save to Library"
                    >
                      <Bookmark size={12} color="white" />
                    </button>
                  )}
                  {/* Download button */}
                  {onDownload && (
                    <button
                      onClick={e => { e.stopPropagation(); onDownload(video) }}
                      style={{
                        width: 28, height: 28, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: 'none', cursor: 'pointer', transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.8)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.55)'}
                      title="Download"
                    >
                      <Download size={12} color="white" />
                    </button>
                  )}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 16 }}>&#10084;&#65039;</div>
                    <span style={{ color: 'white', fontSize: 9, fontWeight: 700, display: 'block' }}>{formatNumber(video.num_likes)}</span>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 16 }}>&#128065;</div>
                    <span style={{ color: 'white', fontSize: 9, fontWeight: 700, display: 'block' }}>{formatNumber(video.num_views)}</span>
                  </div>
                </div>
              )}

              {/* Stats (adjacent cards) */}
              {!isCenter && Math.abs(offset) === 1 && (
                <div style={{ position: 'absolute', right: 6, bottom: 44, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 12 }}>&#10084;&#65039;</div>
                    <span style={{ color: 'white', fontSize: 8, fontWeight: 700, display: 'block' }}>{formatNumber(video.num_likes)}</span>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 12 }}>&#128065;</div>
                    <span style={{ color: 'white', fontSize: 8, fontWeight: 700, display: 'block' }}>{formatNumber(video.num_views)}</span>
                  </div>
                </div>
              )}

              {/* Remix btn (center) */}
              {isCenter && (
                <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemix && onRemix(video) }}
                    style={{
                      background: 'linear-gradient(135deg, #EA580C, #F97316)',
                      border: 'none', borderRadius: 9999, padding: '5px 14px',
                      color: 'white', fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                      boxShadow: '0 2px 8px rgba(234,88,12,0.5)',
                      transition: 'transform 0.15s, box-shadow 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(234,88,12,0.6)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(234,88,12,0.5)' }}
                  >
                    Remix this
                  </button>
                </div>
              )}

              {/* Remix btn (adjacent) */}
              {!isCenter && Math.abs(offset) === 1 && (
                <div style={{ position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemix && onRemix(video) }}
                    style={{
                      background: 'rgba(0,0,0,0.75)', border: 'none', borderRadius: 9999,
                      padding: '3px 10px', color: 'white', fontSize: 9, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(234,88,12,0.85)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.75)' }}
                  >
                    Remix this
                  </button>
                </div>
              )}

              {/* Dot nav (center) */}
              {isCenter && (
                <div style={{ position: 'absolute', bottom: 3, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 3 }}>
                  {[0,1,2,3,4].map(i => (
                    <div key={i} style={{
                      width: i === 2 ? 10 : 3, height: 2.5, borderRadius: 2,
                      background: i === 2 ? 'white' : 'rgba(255,255,255,0.4)',
                      transition: 'all 0.3s'
                    }} />
                  ))}
                </div>
              )}

              {/* Dot nav (adjacent) */}
              {!isCenter && Math.abs(offset) === 1 && (
                <div style={{ position: 'absolute', bottom: 2, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 2 }}>
                  {[0,1,2,3].map(i => (
                    <div key={i} style={{ width: i === 1 ? 7 : 2.5, height: 2, borderRadius: 2, background: i === 1 ? 'white' : 'rgba(255,255,255,0.4)' }} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Right arrow */}
      <button
        onClick={() => onNavigate(1)}
        style={{
          position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
          zIndex: 20, width: 30, height: 30, borderRadius: '50%',
          background: 'white', border: '1px solid #E5E7EB',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
        }}
      >
        <ChevronRight size={16} color="#374151" />
      </button>
    </div>
  )
}

/* ── Trending panel (right side) ─────────────────────── */
function TrendingPanel({ tab, onRemix, onSave, onDownload }) {
  const [activeIdx, setActiveIdx] = useState(2)
  const [activeView, setActiveView] = useState('trending')
  const [activeTag, setActiveTag] = useState(null)
  const [slideIdxMap, setSlideIdxMap] = useState({})
  const [textOverrides, setTextOverrides] = useState({})
  const [textStyles, setTextStyles] = useState({})
  const [editingVideoId, setEditingVideoId] = useState(null)
  const brand = useStore(s => s.brand)

  // Reset carousel to index 0 when tab changes
  useEffect(() => {
    setActiveIdx(0)
    setActiveTag(null)
    setSlideIdxMap({})
  }, [tab])

  const filtered = VIRAL_CONTENT.filter(v => {
    // First filter by content type matching the active tab
    if (v.contentType !== tab) return false
    // Then apply tag filter on top
    if (activeTag) return v.tags?.includes(activeTag)
    return true
  })

  const navigate = (dir) => {
    setActiveIdx(i => (i + dir + filtered.length) % filtered.length)
  }

  const handleSlideNav = (videoId, dirOrIdx, isAbsolute = false) => {
    setSlideIdxMap(prev => {
      const cur = prev[videoId] || 0
      const video = filtered.find(v => v.id === videoId)
      const maxIdx = (video?.slides?.length || 1) - 1
      if (isAbsolute) {
        return { ...prev, [videoId]: Math.max(0, Math.min(dirOrIdx, maxIdx)) }
      }
      const next = cur + dirOrIdx
      return { ...prev, [videoId]: Math.max(0, Math.min(next, maxIdx)) }
    })
  }

  const currentVideo = filtered[activeIdx % filtered.length] || filtered[0]
  const currentTags = currentVideo?.tags || []

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* Sub tabs + nav arrows */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 12, alignItems: 'center', flexShrink: 0 }}>
        <button
          onClick={() => setActiveView('trending')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', borderRadius: 9999,
            border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            background: activeView === 'trending' ? '#FFF7ED' : 'transparent',
            color: activeView === 'trending' ? '#EA580C' : '#9CA3AF',
            transition: 'all 0.15s'
          }}
        >
          <span style={{ fontSize: 14 }}>&#128293;</span> Trending Content
        </button>
        <div style={{ width: 1, height: 16, background: '#E5E7EB', margin: '0 4px' }} />
        <button
          onClick={() => setActiveView('preview')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', borderRadius: 9999,
            border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            background: activeView === 'preview' ? '#F9FAFB' : 'transparent',
            color: activeView === 'preview' ? '#374151' : '#9CA3AF',
            transition: 'all 0.15s'
          }}
        >
          <span style={{ fontSize: 13 }}>&#9998;</span> Preview
        </button>
        <div style={{ flex: 1 }} />
        {/* Top nav arrows */}
        <button
          onClick={() => navigate(-1)}
          style={{
            width: 28, height: 28, borderRadius: '50%',
            border: '1px solid #E5E7EB', background: 'white',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginRight: 6, fontSize: 14, color: '#374151'
          }}
        >‹</button>
        <button
          onClick={() => navigate(1)}
          style={{
            width: 28, height: 28, borderRadius: '50%',
            border: '1px solid #E5E7EB', background: 'white',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, color: '#374151'
          }}
        >›</button>
      </div>

      {/* Tag pills for current video */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap', flexShrink: 0, minHeight: 26 }}>
        {currentTags.slice(0, 4).map(tag => {
          const colors = TAG_COLORS[tag] || { bg: '#F3F4F6', text: '#374151' }
          const isActive = activeTag === tag
          return (
            <button
              key={tag}
              onClick={() => { setActiveTag(isActive ? null : tag); setActiveIdx(0) }}
              style={{
                padding: '3px 12px', borderRadius: 9999, fontSize: 11, fontWeight: 600,
                background: isActive ? colors.text : colors.bg,
                color: isActive ? 'white' : colors.text,
                border: 'none', cursor: 'pointer',
                transition: 'all 0.2s ease',
                transform: isActive ? 'scale(1.05)' : 'scale(1)',
              }}
            >{tag}</button>
          )
        })}
      </div>

      {/* 3D Carousel */}
      {filtered.length > 0 && (
        <div style={{ flex: 1, minHeight: 0 }}>
          <VideoCarousel
            videos={filtered}
            activeIdx={activeIdx % filtered.length}
            onNavigate={navigate}
            onRemix={onRemix}
            slideIdxMap={slideIdxMap}
            onSlideNav={handleSlideNav}
            onSave={onSave}
            onDownload={onDownload}
            textOverrides={textOverrides}
            textStyles={textStyles}
            editingVideoId={editingVideoId}
            onStartEdit={id => setEditingVideoId(id)}
            onTextChange={(key, text) => setTextOverrides(prev => ({ ...prev, [key]: text }))}
            onStyleChange={(id, style) => setTextStyles(prev => ({ ...prev, [id]: style }))}
            onStopEdit={() => setEditingVideoId(null)}
            brand={brand}
          />
        </div>
      )}
    </div>
  )
}

/* ── Left form ───────────────────────────────────────── */
function ContentForm({ tab, onGenerate, loading, trendingThumb, mode, onModeChange, themeBadge, selectedVideo }) {
  const [form, setForm] = useState({ isBusiness: true, prompt: '' })

  // Sync mode from parent
  const currentMode = mode || 'remix'

  const typeMap = {
    slideshow: 'slideshow',
    'wall-of-text': 'wall-of-text',
    'video-hook-and-demo': 'video-hook-and-demo',
    'green-screen-meme': 'green-screen-meme'
  }

  const placeholders = {
    slideshow: 'What should this slideshow be about?',
    'wall-of-text': 'What should the wall of text caption be about?',
    'video-hook-and-demo': 'What should the hook caption be about?',
    'green-screen-meme': 'What should this meme be about?'
  }

  const trendingLabels = {
    slideshow: 'Trending slideshow',
    'wall-of-text': 'Trending wall of text',
    'video-hook-and-demo': 'Trending video hook',
    'green-screen-meme': 'Trending meme',
  }

  // Use selectedVideo thumbnail if available, otherwise fallback to trendingThumb
  const displayThumb = selectedVideo?.thumbnail || trendingThumb

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Theme badge (from URL param) */}
      {themeBadge && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '5px 12px', borderRadius: 9999, alignSelf: 'flex-start',
          background: 'linear-gradient(135deg, #FFF7ED, #FEF3C7)',
          border: '1px solid #FED7AA',
        }}>
          <span style={{ fontSize: 12 }}>&#127912;</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#C2410C' }}>{themeBadge}</span>
        </div>
      )}

      {/* Mode toggle */}
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 10 }}>Mode</div>
        <div style={{ display: 'flex', background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 10, padding: 3, gap: 2 }}>
          {[{ l: '⊕ Create New', v: 'create', icon: true }, { l: '⤭ Remix', v: 'remix', icon: true }].map(o => (
            <button
              key={o.v}
              onClick={() => onModeChange(o.v)}
              style={{
                flex: 1, padding: '10px 4px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: currentMode === o.v ? 600 : 400,
                background: currentMode === o.v ? 'white' : 'transparent',
                color: currentMode === o.v ? '#111827' : '#6B7280',
                boxShadow: currentMode === o.v ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s'
              }}
            >
              {o.l}
            </button>
          ))}
        </div>
      </div>

      {/* Mention business */}
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 10 }}>Mention your business?</div>
        <div style={{ display: 'flex', background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 10, padding: 3, gap: 2 }}>
          {[{ l: 'Yes', v: true }, { l: 'No', v: false }].map(o => (
            <button
              key={String(o.v)}
              onClick={() => setForm(f => ({ ...f, isBusiness: o.v }))}
              style={{
                flex: 1, padding: '10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: 14, fontWeight: 600,
                background: form.isBusiness === o.v ? '#EA580C' : 'transparent',
                color: form.isBusiness === o.v ? 'white' : '#6B7280',
                transition: 'all 0.15s'
              }}
            >
              {o.l}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt */}
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 10 }}>
          Prompt <span style={{ color: '#9CA3AF', fontWeight: 400, fontSize: 13 }}>(Optional)</span>
        </div>
        <textarea
          value={form.prompt}
          onChange={e => setForm(f => ({ ...f, prompt: e.target.value }))}
          placeholder={placeholders[tab] || 'What should this content be about?'}
          style={{
            width: '100%', padding: '10px 12px', borderRadius: 10,
            border: '1px solid #E5E7EB', fontSize: 13, color: '#374151',
            resize: 'none', height: 80, outline: 'none',
            fontFamily: 'inherit', background: 'white', lineHeight: 1.5,
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* Generate button — only generates content, no theme selector */}
      <button
        onClick={() => onGenerate({
          topic: form.prompt || 'viral content for my business',
          platform: 'tiktok',
          tone: 'engaging',
          type: typeMap[tab] || 'slideshow',
          mode: currentMode,
          isBusiness: form.isBusiness
        })}
        disabled={loading}
        style={{
          width: '100%', padding: '14px', borderRadius: 12, border: 'none',
          background: loading ? '#FDBA74' : '#FB923C',
          color: 'white', fontWeight: 700, fontSize: 15,
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'all 0.15s',
          marginTop: 8
        }}
      >
        {loading ? (
          <>
            <div style={{
              width: 16, height: 16,
              border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white',
              borderRadius: '50%', animation: 'spin 0.8s linear infinite'
            }} />
            Generating...
          </>
        ) : (
          <>
            <span style={{ fontSize: 16 }}>✂</span> Generate
          </>
        )}
      </button>
    </div>
  )
}

/* ── Slideshow preview ───────────────────────────────── */
function SlideshowPreview({ data, onClear, onSave, onDownload }) {
  const [idx, setIdx] = useState(0)
  const COLORS = ['#EA580C','#1a1a1a','#6366f1','#10b981','#f59e0b','#8b5cf6','#06b6d4','#ef4444']
  const slide = data.slides?.[idx]
  if (!slide) return null
  const bg = COLORS[idx % COLORS.length]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', paddingTop: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: 320, marginBottom: 16 }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>Slideshow Preview</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onSave} style={{ padding: '5px 12px', border: '1px solid #E5E7EB', borderRadius: 8, background: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Save size={12} /> Save
          </button>
          {onDownload && (
            <button onClick={onDownload} style={{ padding: '5px 12px', border: '1px solid #E5E7EB', borderRadius: 8, background: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Download size={12} /> Download
            </button>
          )}
          <button onClick={onClear} style={{ padding: '5px 12px', border: '1px solid #E5E7EB', borderRadius: 8, background: 'white', cursor: 'pointer', fontSize: 12, color: '#6B7280' }}>Clear</button>
        </div>
      </div>

      {/* Slide */}
      <div style={{
        width: 240, aspectRatio: '9/16', borderRadius: 18, overflow: 'hidden',
        background: slide.bgImage ? `url(${slide.bgImage}) center/cover` : bg,
        position: 'relative', boxShadow: '0 16px 48px rgba(0,0,0,0.3)'
      }}>
        {slide.bgImage && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center'
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>{slide.emoji}</div>
          <div style={{
            color: 'white', fontWeight: 800, fontSize: 17, lineHeight: 1.3, marginBottom: 10,
            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
          }}>{slide.title}</div>
          <div style={{ color: 'rgba(255,255,255,0.88)', fontSize: 12, lineHeight: 1.6 }}>{slide.body}</div>
        </div>
        {/* Dots */}
        <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 4 }}>
          {data.slides.map((_, i) => (
            <div key={i} onClick={() => setIdx(i)} style={{
              width: i === idx ? 14 : 4, height: 3, borderRadius: 2,
              background: i === idx ? 'white' : 'rgba(255,255,255,0.4)',
              cursor: 'pointer', transition: 'all 0.3s'
            }} />
          ))}
        </div>
      </div>

      {/* Nav */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 14 }}>
        <button onClick={() => setIdx(i => Math.max(0, i-1))} disabled={idx === 0}
          style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #E5E7EB', background: 'white', cursor: idx === 0 ? 'default' : 'pointer', opacity: idx === 0 ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ChevronLeft size={14} />
        </button>
        <span style={{ fontSize: 13, color: '#6B7280', minWidth: 60, textAlign: 'center' }}>{idx + 1} / {data.slides.length}</span>
        <button onClick={() => setIdx(i => Math.min(data.slides.length-1, i+1))} disabled={idx === data.slides.length-1}
          style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #E5E7EB', background: 'white', cursor: idx === data.slides.length-1 ? 'default' : 'pointer', opacity: idx === data.slides.length-1 ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Caption */}
      {slide.cta && (
        <div style={{ marginTop: 16, padding: '10px 16px', background: '#FFF7ED', borderRadius: 10, border: '1px solid #FED7AA', maxWidth: 280, width: '100%', textAlign: 'center' }}>
          <span style={{ fontSize: 12, color: '#C2410C', fontWeight: 600 }}>Add a CTA caption and hashtags before posting</span>
        </div>
      )}
    </div>
  )
}

/* ── Text result preview ─────────────────────────────── */
function TextPreview({ result, onClear }) {
  const [copied, setCopied] = useState(false)
  const copy = t => { navigator.clipboard.writeText(t); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  const labels = { 'wall-of-text': 'Generated Post', 'video-hook-and-demo': 'Video Script', 'green-screen-meme': 'Meme Content' }
  const content = result.data?.content || ''

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', paddingTop: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>{labels[result.type] || 'Generated Content'}</span>
        <button onClick={onClear} style={{ padding: '5px 12px', border: '1px solid #E5E7EB', borderRadius: 8, background: 'white', cursor: 'pointer', fontSize: 12, color: '#6B7280' }}>Clear</button>
      </div>

      {/* Preview pane */}
      {result.type === 'green-screen-meme' && result.data?.bgVideo?.thumbnail && (
        <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', marginBottom: 12, aspectRatio: '9/16', maxWidth: 200 }}>
          <img src={result.data.bgVideo.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 12, textAlign: 'center' }}>
            {content.match(/TOP_TEXT: (.+)/)?.[1] && (
              <div style={{ color: 'white', fontWeight: 900, fontSize: 14, textShadow: '0 2px 4px rgba(0,0,0,0.8)', marginBottom: 'auto' }}>
                {content.match(/TOP_TEXT: (.+)/)[1]}
              </div>
            )}
            {content.match(/BOTTOM_TEXT: (.+)/)?.[1] && (
              <div style={{ color: 'white', fontWeight: 900, fontSize: 14, textShadow: '0 2px 4px rgba(0,0,0,0.8)', marginTop: 'auto' }}>
                {content.match(/BOTTOM_TEXT: (.+)/)[1]}
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{
        background: '#F9FAFB', borderRadius: 10, padding: '12px 14px',
        fontSize: 13, lineHeight: 1.7, color: '#111827', whiteSpace: 'pre-wrap',
        flex: 1, overflowY: 'auto', border: '1px solid #E5E7EB',
        fontFamily: result.type === 'video-hook-and-demo' ? 'monospace' : 'inherit'
      }}>
        {content}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <button
          onClick={() => copy(content)}
          style={{
            flex: 1, padding: '9px', border: '1px solid #E5E7EB',
            borderRadius: 8, background: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5
          }}
        >
          <Copy size={13} /> {copied ? 'Copied!' : 'Copy'}
        </button>
        <button
          onClick={() => {
            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
            const link = document.createElement('a')
            link.href = URL.createObjectURL(blob)
            link.download = `${result.type}-content.txt`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(link.href)
          }}
          style={{
            flex: 1, padding: '9px', border: '1px solid #E5E7EB',
            borderRadius: 8, background: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5
          }}
        >
          <Download size={13} /> Download
        </button>
      </div>
    </div>
  )
}

/* ── Main Content page ───────────────────────────────── */
export default function Content() {
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState('slideshow')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('remix')
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [themeBadge, setThemeBadge] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2200) }

  const handleContentSave = async (video) => {
    const res = await saveToLibrary(video)
    showToast(res.message)
  }

  const handleContentDownload = async (video) => {
    showToast('Downloading...')
    await downloadContent(video)
  }

  // Read URL params on mount: /content?videoId=X&theme=Y&mode=remix
  useEffect(() => {
    const videoId = searchParams.get('videoId')
    const theme = searchParams.get('theme')
    const urlMode = searchParams.get('mode')

    if (videoId) {
      const found = VIRAL_CONTENT.find(v => String(v.id) === String(videoId))
      if (found) {
        setSelectedVideo(found)
      }
    }
    if (theme) {
      setThemeBadge(theme)
    }
    if (urlMode === 'remix') {
      setMode('remix')
    }
  }, [searchParams])

  // Get thumbnail for "Trending X" field
  const typeMap = { slideshow: 'slideshow', 'wall-of-text': 'wall-of-text', 'video-hook-and-demo': 'video-hook-and-demo', 'green-screen-meme': 'green-screen-meme' }
  const tabVids = VIRAL_CONTENT.filter(v => {
    const t = typeMap[tab]
    if (t === 'slideshow') return v.contentType === 'slideshow' || !v.contentType
    return true
  })
  const trendingThumb = tabVids[0]?.thumbnail

  // Handle "Remix this" from carousel
  const handleRemix = (video) => {
    setSelectedVideo(video)
    setMode('remix')
  }

  const handleGenerate = async ({ topic, platform, tone, type }) => {
    setLoading(true); setResult(null)
    try {
      const { data } = await api.post(`/content/${type}`, { topic, platform, tone })
      setResult({ type, data })
    } catch {
      alert('Generation failed. Check your API keys.')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!result) return
    try {
      await api.post('/library/save', {
        type: result.type,
        platform: 'tiktok',
        title: result.data.topic || 'Generated content',
        content_json: result.data,
        thumbnail_url: result.data.slides?.[0]?.bgImage || ''
      })
      alert('Saved to Library!')
    } catch {
      alert('Save failed.')
    }
  }

  const isTextResult = result && ['wall-of-text','video-hook-and-demo','green-screen-meme'].includes(result.type)
  const isSlideshowResult = result && result.type === 'slideshow' && result.data?.slides

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#FAFAFA' }}>

      {/* Top tabs */}
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        padding: '12px 24px', background: 'white',
        borderBottom: '1px solid rgba(229,231,235,0.8)', flexShrink: 0, gap: 6
      }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setResult(null) }}
            style={{
              padding: '7px 18px', border: '1px solid',
              borderColor: tab === t.id ? '#D1D5DB' : 'transparent',
              borderRadius: 9999, background: tab === t.id ? 'white' : 'transparent',
              cursor: 'pointer', fontSize: 13,
              fontWeight: tab === t.id ? 600 : 400,
              color: tab === t.id ? '#111827' : '#6B7280',
              boxShadow: tab === t.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s', whiteSpace: 'nowrap'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Body: left form | right panel */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left panel — form */}
        <div style={{
          width: 300, background: 'white', borderRight: '1px solid rgba(229,231,235,0.8)',
          padding: '20px', overflowY: 'auto', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 0
        }}>
          <ContentForm
            tab={tab}
            onGenerate={handleGenerate}
            loading={loading}
            trendingThumb={trendingThumb}
            mode={mode}
            onModeChange={setMode}
            themeBadge={themeBadge}
            selectedVideo={selectedVideo}
          />
        </div>

        {/* Right panel — trending carousel or result preview */}
        <div style={{ flex: 1, padding: '16px 20px 16px 16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {isSlideshowResult ? (
            <SlideshowPreview data={result.data} onClear={() => setResult(null)} onSave={handleSave} onDownload={() => {
              const slide = result.data?.slides?.[0]
              if (slide?.bgImage) {
                const link = document.createElement('a')
                link.href = slide.bgImage
                link.download = 'slideshow.jpg'
                link.target = '_blank'
                link.click()
              }
              showToast('Downloading slideshow...')
            }} />
          ) : isTextResult ? (
            <TextPreview result={result} onClear={() => setResult(null)} />
          ) : (
            <TrendingPanel tab={tab} onRemix={handleRemix} onSave={handleContentSave} onDownload={handleContentDownload} />
          )}
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: '#111827', color: 'white', padding: '10px 24px', borderRadius: 12,
          fontSize: 13, fontWeight: 600, zIndex: 200, boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          animation: 'fadeInUp 0.25s ease'
        }}>
          {toast}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateX(-50%) translateY(10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
      `}</style>
    </div>
  )
}
