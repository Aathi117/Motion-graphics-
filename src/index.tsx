import React from 'react';
import { registerRoot, Composition, AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

export const KashmirDocu: React.FC<{ title?: string; subtitle?: string }> = ({
  title = "THE QUEEN'S DECEPTION",
  subtitle = 'KASHMIR, 958 AD',
}) => {
  const frame = useCurrentFrame();

  const scale = interpolate(frame, [0, 300], [1, 1.15], {
    extrapolateRight: 'clamp',
  });

  const titleOpacity = interpolate(frame, [15, 45], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const titleY = interpolate(frame, [15, 45], [50, 0], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#050505',
        fontFamily: 'system-ui, sans-serif',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: '0 40px',
        }}
      >
        <h1
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            fontSize: '100px',
            fontWeight: 'bold',
            color: '#b30000',
            textShadow: '0 0 40px rgba(179, 0, 0, 0.8)',
            margin: 0,
          }}
        >
          {title}
        </h1>
        <h2
          style={{
            opacity: titleOpacity,
            fontSize: '40px',
            color: '#888888',
            letterSpacing: '8px',
            marginTop: '20px',
          }}
        >
          {subtitle}
        </h2>
      </div>
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="DarkHistory"
      component={KashmirDocu}
      durationInFrames={300}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        title: "THE QUEEN'S DECEPTION",
        subtitle: 'KASHMIR, 958 AD',
      }}
    />
  );
};

registerRoot(RemotionRoot);
