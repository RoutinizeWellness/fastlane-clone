import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, OffthreadVideo} from 'remotion';

export const WallOfTextVideo = ({compositionDoc, text: propText, brandName: propBrandName}) => {
  const text = compositionDoc?.text || compositionDoc?.body || propText || '';
  const brandName = compositionDoc?.brandName || propBrandName || '';
  const bgVideoUrl = compositionDoc?.backgroundVideoUrl || null;
  const bgColor = compositionDoc?.backgroundColor || '#1a1a2e';

  // Brand style from compositionDoc
  const bodyBlock = compositionDoc?.textBlocks?.find(b => b.role === 'body');
  const fontFamily = bodyBlock?.fontFamily || 'system-ui, -apple-system, sans-serif';
  const fontSize = bodyBlock?.fontSize || 58;
  const fontWeight = bodyBlock?.fontWeight || 700;
  const textColor = bodyBlock?.color || 'white';
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 18, durationInFrames],
    [1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );
  const opacity = Math.min(fadeIn, fadeOut);

  // Subtle text reveal: characters appear over time
  const totalChars = text.length;
  const revealProgress = interpolate(frame, [10, durationInFrames * 0.7], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const charsVisible = Math.floor(revealProgress * totalChars);
  const visibleText = text.slice(0, charsVisible);
  const hiddenText = text.slice(charsVisible);

  // Subtle gradient shift
  const gradientShift = interpolate(frame, [0, durationInFrames], [0, 40], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        opacity,
        background: bgVideoUrl ? 'transparent' : `linear-gradient(${165 + gradientShift}deg, ${bgColor} 0%, ${bgColor}CC 50%, ${bgColor}99 100%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '100px 70px',
      }}
    >
      {/* Background video */}
      {bgVideoUrl && (
        <AbsoluteFill>
          <OffthreadVideo src={bgVideoUrl} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          <AbsoluteFill style={{backgroundColor: 'rgba(0,0,0,0.7)'}} />
        </AbsoluteFill>
      )}

      {/* Main text */}
      <div
        style={{
          color: textColor,
          fontSize,
          fontWeight,
          textAlign: 'center',
          lineHeight: 1.4,
          fontFamily,
          maxWidth: 950,
          wordBreak: 'break-word',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <span>{visibleText}</span>
        <span style={{color: 'transparent'}}>{hiddenText}</span>
      </div>

      {/* Decorative line */}
      <div
        style={{
          position: 'absolute',
          bottom: 200,
          width: interpolate(frame, [0, 60], [0, 200], {
            extrapolateRight: 'clamp',
          }),
          height: 3,
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: 2,
        }}
      />

      {/* Brand watermark */}
      {brandName && (
        <div
          style={{
            position: 'absolute',
            bottom: 80,
            color: 'rgba(255,255,255,0.25)',
            fontSize: 28,
            fontWeight: 600,
            fontFamily: 'system-ui, sans-serif',
            letterSpacing: 3,
            textTransform: 'uppercase',
          }}
        >
          {brandName}
        </div>
      )}
    </AbsoluteFill>
  );
};
