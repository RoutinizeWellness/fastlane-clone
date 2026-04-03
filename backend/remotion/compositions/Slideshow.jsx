import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  OffthreadVideo,
} from 'remotion';

const PALETTE = [
  '#6C3CE1', '#E84393', '#00B894', '#0984E3', '#FD7E14',
  '#E17055', '#00CEC9', '#A29BFE', '#FF6B6B', '#2ED573',
];

const Slide = ({title, body, bgColor, slideNum, total, brandName, style = {}}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 12, 93, 105], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const scale = interpolate(frame, [0, 12], [0.95, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const titleFont = style.fontFamily || 'system-ui, -apple-system, sans-serif';
  const bodyFont = style.fontBodyFamily || titleFont;
  const titleSize = style.fontSizeHeadline || 76;
  const bodySize = style.fontSizeBody || 48;
  const titleWeight = style.fontWeightHeadline || 800;
  const bodyWeight = style.fontWeightBody || 400;
  const textColor = style.colorText || 'white';

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bgColor,
        opacity,
        transform: `scale(${scale})`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 60px',
      }}
    >
      {/* Brand watermark */}
      {brandName && (
        <div
          style={{
            position: 'absolute',
            top: 80,
            left: 0,
            right: 0,
            textAlign: 'center',
            color: 'rgba(255,255,255,0.4)',
            fontSize: 32,
            fontWeight: 700,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            letterSpacing: 2,
          }}
        >
          {brandName}
        </div>
      )}

      {/* Title */}
      <div
        style={{
          color: textColor,
          fontSize: titleSize,
          fontWeight: titleWeight,
          textAlign: 'center',
          lineHeight: 1.2,
          fontFamily: titleFont,
          marginBottom: 30,
          textShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}
      >
        {title}
      </div>

      {/* Body */}
      {body && (
        <div
          style={{
            color: textColor + 'E6',
            fontSize: bodySize,
            fontWeight: bodyWeight,
            textAlign: 'center',
            lineHeight: 1.4,
            fontFamily: bodyFont,
            maxWidth: 900,
          }}
        >
          {body}
        </div>
      )}

      {/* Slide dots */}
      <div
        style={{
          position: 'absolute',
          bottom: 120,
          display: 'flex',
          gap: 12,
          justifyContent: 'center',
        }}
      >
        {Array.from({length: total}).map((_, i) => (
          <div
            key={i}
            style={{
              width: i === slideNum ? 28 : 12,
              height: 12,
              borderRadius: 6,
              backgroundColor:
                i === slideNum
                  ? 'white'
                  : 'rgba(255,255,255,0.4)',
              transition: 'all 0.3s',
            }}
          />
        ))}
      </div>

      {/* Counter */}
      <div
        style={{
          position: 'absolute',
          bottom: 70,
          color: 'rgba(255,255,255,0.5)',
          fontSize: 28,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {slideNum + 1}/{total}
      </div>
    </AbsoluteFill>
  );
};

export const SlideshowVideo = ({compositionDoc, slides: propSlides, brandName: propBrandName, brandColor}) => {
  // Use compositionDoc if available, fall back to direct props
  const slides = compositionDoc?.slides || propSlides || [];
  const brandName = compositionDoc?.brandName || propBrandName || '';
  const bgVideoUrl = compositionDoc?.backgroundVideoUrl || null;
  const accentColor = compositionDoc?.accentColor || brandColor || PALETTE[0];

  // Extract brand style from compositionDoc
  const style = {};
  if (compositionDoc?.textBlocks) {
    const titleBlock = compositionDoc.textBlocks.find(b => b.role === 'title');
    const bodyBlock = compositionDoc.textBlocks.find(b => b.role === 'body');
    if (titleBlock) {
      style.fontFamily = titleBlock.fontFamily;
      style.fontSizeHeadline = titleBlock.fontSize;
      style.fontWeightHeadline = titleBlock.fontWeight;
      style.colorText = titleBlock.color;
    }
    if (bodyBlock) {
      style.fontBodyFamily = bodyBlock.fontFamily;
      style.fontSizeBody = bodyBlock.fontSize;
      style.fontWeightBody = bodyBlock.fontWeight;
    }
  }

  const slideDuration = 105; // 3.5s at 30fps

  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      {/* Background video layer */}
      {bgVideoUrl && (
        <AbsoluteFill>
          <OffthreadVideo src={bgVideoUrl} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          <AbsoluteFill style={{backgroundColor: 'rgba(0,0,0,0.5)'}} />
        </AbsoluteFill>
      )}
      {slides.map((slide, i) => (
        <Sequence key={i} from={i * slideDuration} durationInFrames={slideDuration}>
          <Slide
            title={slide.title || `Slide ${i + 1}`}
            body={slide.body || slide.text || ''}
            bgColor={bgVideoUrl ? 'transparent' : (slide.bgColor || accentColor || PALETTE[i % PALETTE.length])}
            slideNum={i}
            total={slides.length}
            brandName={brandName}
            style={style}
          />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
