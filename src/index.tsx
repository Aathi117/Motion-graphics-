import React from 'react';
import {
  registerRoot,
  Composition,
  AbsoluteFill,
  Sequence,
  Audio,
  Img,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { z } from 'zod';
import { zColor } from '@remotion/zod-types';

// एक सिंगल सीन (Clip) के कंट्रोल्स
const sceneSchema = z.object({
  heading: z.string().describe('Scene Title (बड़ा टाइटल)'),
  era: z.string().describe('Year / Location (साल या जगह)'),
  narration: z.string().describe('Bottom Subtitle (नीचे की कहानी)'),
  imageUrl: z.string().describe('Background Image URL (फोटो का लिंक - खाली भी छोड़ सकते हो)'),
  durationSec: z.number().min(2).max(30).step(1).describe('Scene Length (सेकंड में)'),
  cameraMove: z.enum(['zoom-in', 'zoom-out', 'pan-left', 'pan-right']).describe('Camera Motion'),
  accentColor: zColor().describe('Scene Glow Color'),
});

// पूरा स्टूडियो इंटरफेस (UI Controls)
export const studioSchema = z.object({
  customScriptJson: z
    .string()
    .describe('⚡ PASTE AI CODE HERE (पूरी स्क्रिप्ट का JSON कोड यहाँ पेस्ट करें, वरना खाली छोड़ें)'),
  globalTheme: z.object({
    bgColor: zColor().describe('Base Dark Background'),
    filmGrain: z.boolean().describe('Cinematic Film Grain (पुराना फिल्म इफ़ेक्ट)'),
    vignette: z.boolean().describe('Dark Edges Vignette (किनारों पर अंधेरा)'),
    emberParticles: z.boolean().describe('Floating Fire/Dust (उड़ते हुए कण)'),
    bgmUrl: z.string().describe('Background Music MP3 URL (ऑडियो लिंक)'),
    bgmVolume: z.number().min(0).max(1).step(0.05).describe('Music Volume'),
  }),
  scenes: z.array(sceneSchema).describe('🎬 TIMELINE SCENES (यहाँ से सीन जोड़ें या एडिट करें)'),
});

type SceneType = z.infer<typeof sceneSchema>;

// 1. उड़ते हुए सिंदूरी कण (Ember / Dust Layer)
const EmberLayer: React.FC<{ color: string }> = ({ color }) => {
  const frame = useCurrentFrame();
  const particles = Array.from({ length: 18 }).map((_, i) => {
    const seed = (i + 1) * 137;
    const x = (seed % 100);
    const speed = 0.4 + (seed % 5) * 0.15;
    const y = 110 - ((frame * speed + (seed % 100)) % 120);
    const size = 3 + (seed % 6);
    const opacity = interpolate(y, [0, 50, 100], [0, 0.65, 0], { extrapolateRight: 'clamp' });

    return (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: `${x}%`,
          top: `${y}%`,
          width: size,
          height: size,
          borderRadius: '50%',
          backgroundColor: color,
          boxShadow: `0 0 12px ${color}`,
          opacity,
        }}
      />
    );
  });
  return <AbsoluteFill style={{ pointerEvents: 'none' }}>{particles}</AbsoluteFill>;
};

// 2. सिंगल सीन रेंडरर (Camera + Text + Subtitles)
const SceneView: React.FC<{ scene: SceneType; durationInFrames: number }> = ({
  scene,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();

  // Smooth Fade In & Fade Out
  const fade = interpolate(
    frame,
    [0, 15, durationInFrames - 15, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Camera Ken Burns Effect
  let scale = 1.1;
  let translateX = 0;

  if (scene.cameraMove === 'zoom-in') {
    scale = interpolate(frame, [0, durationInFrames], [1, 1.22]);
  } else if (scene.cameraMove === 'zoom-out') {
    scale = interpolate(frame, [0, durationInFrames], [1.22, 1]);
  } else if (scene.cameraMove === 'pan-left') {
    scale = 1.18;
    translateX = interpolate(frame, [0, durationInFrames], [40, -40]);
  } else if (scene.cameraMove === 'pan-right') {
    scale = 1.18;
    translateX = interpolate(frame, [0, durationInFrames], [-40, 40]);
  }

  const textY = interpolate(frame, [5, 30], [35, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ opacity: fade }}>
      {/* Background Image Layer */}
      {scene.imageUrl && scene.imageUrl.trim() !== '' && (
        <AbsoluteFill style={{ overflow: 'hidden' }}>
          <Img
            src={scene.imageUrl}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: `scale(${scale}) translateX(${translateX}px)`,
              filter: 'brightness(0.45) contrast(1.2) saturate(0.85)',
            }}
          />
        </AbsoluteFill>
      )}

      {/* Main Center Heading & Era */}
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: '0 80px',
          transform: `translateY(${textY}px)`,
        }}
      >
        <div
          style={{
            fontSize: 32,
            color: '#b0b0b0',
            letterSpacing: '10px',
            textTransform: 'uppercase',
            marginBottom: 16,
            fontWeight: 600,
          }}
        >
          {scene.era}
        </div>
        <h1
          style={{
            fontSize: 92,
            fontWeight: 900,
            color: '#ffffff',
            textShadow: `0 0 45px ${scene.accentColor}, 0 6px 20px rgba(0,0,0,0.95)`,
            margin: 0,
            lineHeight: 1.1,
            letterSpacing: '2px',
          }}
        >
          {scene.heading}
        </h1>
      </AbsoluteFill>

      {/* Bottom Documentary Narration Bar (Subtitles) */}
      {scene.narration && (
        <AbsoluteFill
          style={{
            justifyContent: 'flex-end',
            alignItems: 'center',
            paddingBottom: 70,
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(5, 5, 5, 0.82)',
              borderLeft: `6px solid ${scene.accentColor}`,
              padding: '18px 42px',
              borderRadius: '6px',
              maxWidth: '82%',
              boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
            }}
          >
            <p
              style={{
                fontSize: 38,
                color: '#f0f0f0',
                margin: 0,
                fontFamily: 'system-ui, sans-serif',
                textAlign: 'center',
                lineHeight: 1.35,
              }}
            >
              {scene.narration}
            </p>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// 3. मास्टर डॉक्यूमेंट्री कंपोज़िशन (Timeline Sequencer)
export const KashmirMasterDocu: React.FC<z.infer<typeof studioSchema>> = ({
  customScriptJson,
  globalTheme,
  scenes,
}) => {
  const { fps } = useVideoConfig();

  // अगर यूज़र ने 'customScriptJson' बॉक्स में कोड पेस्ट किया है, तो उसे चलाओ!
  let activeScenes: SceneType[] = scenes;
  if (customScriptJson && customScriptJson.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(customScriptJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        activeScenes = parsed;
      }
    } catch {
      // अगर टाइपिंग अधूरी है तो डिफ़ॉल्ट सीन्स दिखाते रहो
    }
  }

  let currentStartFrame = 0;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: globalTheme.bgColor,
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {/* Background Music Layer */}
      {globalTheme.bgmUrl && globalTheme.bgmUrl.trim() !== '' && (
        <Audio src={globalTheme.bgmUrl} volume={globalTheme.bgmVolume} />
      )}

      {/* Multi-Track Timeline Sequences (KineMaster-style Clips) */}
      {activeScenes.map((scene, index) => {
        const durationInFrames = Math.max(30, Math.round(scene.durationSec * fps));
        const fromFrame = currentStartFrame;
        currentStartFrame += durationInFrames;

        return (
          <Sequence
            key={index}
            from={fromFrame}
            durationInFrames={durationInFrames}
            name={`🎬 Scene ${index + 1}: ${scene.heading}`}
          >
            <SceneView scene={scene} durationInFrames={durationInFrames} />
          </Sequence>
        );
      })}

      {/* Floating Ember Particles */}
      {globalTheme.emberParticles && (
        <EmberLayer color={activeScenes[0]?.accentColor || '#b30000'} />
      )}

      {/* Cinematic Dark Vignette */}
      {globalTheme.vignette && (
        <AbsoluteFill
          style={{
            background:
              'radial-gradient(circle, rgba(0,0,0,0) 45%, rgba(0,0,0,0.92) 100%)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Old Film Scanline / Grain Overlay */}
      {globalTheme.filmGrain && (
        <AbsoluteFill
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 3px)',
            pointerEvents: 'none',
          }}
        />
      )}
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="DarkHistory"
      component={KashmirMasterDocu}
      fps={30}
      width={1920}
      height={1080}
      schema={studioSchema}
      defaultProps={{
        customScriptJson: '',
        globalTheme: {
          bgColor: '#050505',
          filmGrain: true,
          vignette: true,
          emberParticles: true,
          bgmUrl: '',
          bgmVolume: 0.5,
        },
        scenes: [
          {
            heading: "THE QUEEN'S DECEPTION",
            era: 'KASHMIR • 958 AD',
            narration: 'सत्ता के इस खेल में अपनों का ही खून बहने वाला था...',
            imageUrl: 'https://images.unsplash.com/photo-1566837945700-30057527ade0?w=1920&q=80',
            durationSec: 5,
            cameraMove: 'zoom-in',
            accentColor: '#b30000',
          },
          {
            heading: 'RISE OF DIDDA',
            era: 'THE IRON THRONE • 980 AD',
            narration: 'एक ऐसी रानी जिसने कश्मीर के इतिहास की दिशा हमेशा के लिए बदल दी।',
            imageUrl: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=1920&q=80',
            durationSec: 5,
            cameraMove: 'pan-right',
            accentColor: '#d97706',
          },
        ],
      }}
      calculateMetadata={({ props }) => {
        let list = props.scenes;
        if (props.customScriptJson && props.customScriptJson.trim().startsWith('[')) {
          try {
            const parsed = JSON.parse(props.customScriptJson);
            if (Array.isArray(parsed) && parsed.length > 0) list = parsed;
          } catch {}
        }
        const totalSec = list.reduce((acc, s) => acc + (Number(s.durationSec) || 5), 0);
        return {
          durationInFrames: Math.max(60, Math.round(totalSec * 30)),
        };
      }}
    />
  );
};

registerRoot(RemotionRoot);
