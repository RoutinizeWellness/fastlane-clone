import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, OffthreadVideo} from 'remotion';

export const GreenScreenMemeVideo = ({compositionDoc, topText: propTop, bottomText: propBottom, brandName: propBrandName}) => {
  const topText = compositionDoc?.topText || propTop || '';
  const bottomText = compositionDoc?.bottomText || propBottom || '';
  const brandName = compositionDoc?.brandName || propBrandName || '';
  const bgVideoUrl = compositionDoc?.backgroundVideoUrl || null;
  const bgColor = compositionDoc?.backgroundColor || '#00B894';

  // Brand style from compositionDoc
  const titleBlock = compositionDoc?.textBlocks?.find(b => b.role === 'title' || b.role === 'top');
  const fontFamily = titleBlock?.fontFamily || 'system-ui, -apple-system, Impact, sans-serif';
  const fontSize = titleBlock?.fontSize || 74;
  const fontWeight = titleBlock?.fontWeight || 900;

  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );
  const opacity = Math.min(fadeIn, fadeOut);

  // Subtle zoom
  const zoom = interpolate(frame, [0, durationInFrames], [1, 1.05], {
    extrapolateRight: 'clamp',
  });

  // Text slam-in effect
  const topScale = interpolate(frame, [5, 18], [2, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const bottomScale = interpolate(frame, [25, 38], [2, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const topOpacity = interpolate(frame, [5, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const bottomOpacity = interpolate(frame, [25, 35], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const textStyle = {
    color: 'white',
    fontSize,
    fontWeight,
    textAlign: 'center',
    fontFamily,
    textTransform: 'uppercase',
    WebkitTextStroke: '4px black',
    paintOrder: 'stroke fill',
    lineHeight: 1.15,
    padding: '0 40px',
    maxWidth: 1000,
    textShadow: '0 4px 10px rgba(0,0,0,0.5)',
  };

  return (
    <AbsoluteFill
      style={{
        opacity,
        backgroundColor: bgVideoUrl ? 'transparent' : bgColor,
        transform: `scale(${zoom})`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '160px 0',
      }}
    >
      {/* Background video */}
      {bgVideoUrl && (
        <AbsoluteFill>
          <OffthreadVideo src={bgVideoUrl} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          <AbsoluteFill style={{backgroundColor: 'rgba(0,0,0,0.3)'}} />
        </AbsoluteFill>
      )}

      {/* MEME badge */}
      <div
        style={{
          position: 'absolute',
          top: 50,
          left: 40,
          backgroundColor: 'rgba(0,0,0,0.7)',
          color: '#FFD700',
          fontSize: 26,
          fontWeight: 800,
          padding: '6px 16px',
          borderRadius: 8,
          fontFamily: 'system-ui, sans-serif',
          zIndex: 2,
        }}
      >
        MEME
      </div>

      {/* Top text */}
      <div
        style={{
          ...textStyle,
          opacity: topOpacity,
          transform: `scale(${topScale})`,
          zIndex: 1,
        }}
      >
        {(topText || '').toUpperCase()}
      </div>

      {/* Center emoji */}
      <div style={{fontSize: 120, opacity: 0.3, zIndex: 1}}>{'😂'}</div>

      {/* Bottom text */}
      <div
        style={{
          ...textStyle,
          opacity: bottomOpacity,
          transform: `scale(${bottomScale})`,
          zIndex: 1,
        }}
      >
        {(bottomText || '').toUpperCase()}
      </div>

      {/* Brand watermark */}
      {brandName && (
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            color: 'rgba(255,255,255,0.3)',
            fontSize: 24,
            fontWeight: 500,
            fontFamily: 'system-ui, sans-serif',
            zIndex: 1,
          }}
        >
          {brandName}
        </div>
      )}
    </AbsoluteFill>
  );
};
