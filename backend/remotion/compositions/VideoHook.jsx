import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  OffthreadVideo,
} from 'remotion';

const HookSegment = ({hook, accentColor = '#6C3CE1', hasVideo = false}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 10, 80, 90], [0.8, 1, 1, 0.9], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opacity = interpolate(frame, [0, 8, 82, 90], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const badgePulse = interpolate(frame, [0, 15, 30, 45], [1, 1.15, 1, 1.1], {
    extrapolateRight: 'extend',
  });

  return (
    <AbsoluteFill
      style={{
        opacity,
        background: hasVideo ? 'rgba(0,0,0,0.5)' : `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}CC 40%, ${accentColor}99 100%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 60px',
        transform: `scale(${scale})`,
      }}
    >
      {/* HOOK badge */}
      <div
        style={{
          position: 'absolute',
          top: 70,
          left: 50,
          backgroundColor: '#FF6B6B',
          color: 'white',
          fontSize: 24,
          fontWeight: 800,
          padding: '8px 20px',
          borderRadius: 8,
          fontFamily: 'system-ui, sans-serif',
          transform: `scale(${badgePulse})`,
          boxShadow: '0 4px 15px rgba(255,107,107,0.4)',
        }}
      >
        HOOK
      </div>

      {/* Hook text */}
      <div
        style={{
          color: 'white',
          fontSize: 84,
          fontWeight: 900,
          textAlign: 'center',
          lineHeight: 1.15,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textShadow: '0 6px 30px rgba(0,0,0,0.4)',
          maxWidth: 900,
        }}
      >
        {hook}
      </div>

      {/* Swipe indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: 100,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          color: 'rgba(255,255,255,0.6)',
          fontSize: 24,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <span style={{fontSize: 28}}>{'>>>>'}</span> Keep watching
      </div>
    </AbsoluteFill>
  );
};

const BodySegment = ({body, brandName, bgColor = '#16213e', hasVideo = false}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const slideUp = interpolate(frame, [0, 15], [30, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        opacity,
        background: hasVideo ? 'rgba(0,0,0,0.6)' : `linear-gradient(180deg, ${bgColor} 0%, ${bgColor}DD 100%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '100px 70px',
        transform: `translateY(${slideUp}px)`,
      }}
    >
      <div
        style={{
          color: 'rgba(255,255,255,0.95)',
          fontSize: 50,
          fontWeight: 500,
          textAlign: 'center',
          lineHeight: 1.5,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          maxWidth: 920,
        }}
      >
        {body}
      </div>

      {brandName && (
        <div
          style={{
            position: 'absolute',
            bottom: 80,
            color: 'rgba(255,255,255,0.25)',
            fontSize: 28,
            fontWeight: 600,
            fontFamily: 'system-ui, sans-serif',
            letterSpacing: 2,
          }}
        >
          {brandName}
        </div>
      )}
    </AbsoluteFill>
  );
};

export const VideoHookVideo = ({compositionDoc, hook: propHook, body: propBody, brandName: propBrandName}) => {
  const hook = compositionDoc?.hook || propHook || 'Wait for it...';
  const body = compositionDoc?.body || propBody || '';
  const brandName = compositionDoc?.brandName || propBrandName || '';
  const bgVideoUrl = compositionDoc?.backgroundVideoUrl || null;
  const accentColor = compositionDoc?.accentColor || '#6C3CE1';
  const bgColor = compositionDoc?.backgroundColor || '#16213e';

  const hookFrames = 90; // 3s
  const bodyLen = (body || '').length;
  const bodySecs = Math.max(5, Math.min(bodyLen / 20, 12));
  const bodyFrames = Math.round(bodySecs * 30);

  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      {/* Background video layer (shared across both segments) */}
      {bgVideoUrl && (
        <AbsoluteFill>
          <OffthreadVideo src={bgVideoUrl} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        </AbsoluteFill>
      )}
      <Sequence from={0} durationInFrames={hookFrames}>
        <HookSegment hook={hook} accentColor={accentColor} hasVideo={!!bgVideoUrl} />
      </Sequence>
      <Sequence from={hookFrames} durationInFrames={bodyFrames}>
        <BodySegment body={body} brandName={brandName} bgColor={bgColor} hasVideo={!!bgVideoUrl} />
      </Sequence>
    </AbsoluteFill>
  );
};
