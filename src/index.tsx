import React from 'react';
import {
  registerRoot,
  Composition,
  AbsoluteFill,
  Sequence,
  Audio,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

interface BattleScene {
  era: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  durationSec: number;
  fxType: 'slow-push' | 'sword-clash' | 'war-earthquake' | 'blood-thunder';
  themeColor: string;
}

// 🎬 यहाँ तुम्हारी 4-सीन की हाई-क्वालिटी फाइटिंग और डार्क हिस्ट्री स्क्रिप्ट है
const WAR_SCENES: BattleScene[] = [
  {
    era: 'KASHMIR • 958 AD',
    title: 'THE STORM OF STEEL',
    subtitle: 'घाटी की खामोशी टूट चुकी थी... और हवा में सिर्फ लोहे और लहू की गंध थी।',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1920&q=85',
    durationSec: 4,
    fxType: 'blood-thunder',
    themeColor: '#ff1a1a',
  },
  {
    era: 'THE AMBUSH AT LOHARA',
    title: 'BLADES IN THE DARK',
    subtitle: 'अंधेरी रात में जब पहली तलवार चली, तो सिंहासन की नींव हिल उठी!',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1920&q=85',
    durationSec: 4,
    fxType: 'sword-clash',
    themeColor: '#ff5500',
  },
  {
    era: 'BATTLE FOR THE CROWN',
    title: 'FALL OF THE REBELS',
    subtitle: 'गद्दारों के हर वार का जवाब रानी दिद्दा ने दस गुना क्रूरता से दिया।',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1920&q=85',
    durationSec: 4,
    fxType: 'war-earthquake',
    themeColor: '#cc0000',
  },
  {
    era: 'AFTERMATH • 980 AD',
    title: 'THE IRON EMPRESS',
    subtitle: 'राख और लाशों के ढेर पर खड़ा था कश्मीर का सबसे शक्तिशाली साम्राज्य।',
    imageUrl: 'https://images.unsplash.com/photo-1566837945700-30057527ade0?w=1920&q=85',
    durationSec: 5,
    fxType: 'slow-push',
    themeColor: '#e68a00',
  },
];

// 🔥 1. युद्ध के मैदान की उड़ती हुई चिंगारियाँ (Fire Sparks & Ash)
const BattlefieldSparks: React.FC<{ color: string }> = ({ color }) => {
  const frame = useCurrentFrame();
  const sparks = Array.from({ length: 35 }).map((_, i) => {
    const seed = (i + 1) * 193;
    const startX = seed % 100;
    const speedY = 1.2 + (seed % 7) * 0.35;
    const driftX = Math.sin((frame + seed) * 0.08) * 35;
    const y = 110 - ((frame * speedY + (seed % 100)) % 125);
    const size = 2 + (seed % 5);
    const opacity = interpolate(y, [0, 30, 85, 110], [0, 0.9, 0.8, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

    return (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: `calc(${startX}% + ${driftX}px)`,
          top: `${y}%`,
          width: size,
          height: size * 2.2,
          borderRadius: '50%',
          backgroundColor: '#ffddaa',
          boxShadow: `0 0 14px 4px ${color}`,
          transform: 'rotate(25deg)',
          opacity,
        }}
      />
    );
  });
  return <AbsoluteFill style={{ pointerEvents: 'none' }}>{sparks}</AbsoluteFill>;
};

// ⚔️ 2. तलवार के वार और खून के छींटे का सिनेमैटिक इफ़ेक्ट (Sword Slash FX)
const SwordSlashOverlay: React.FC<{ triggerFrame: number }> = ({ triggerFrame }) => {
  const frame = useCurrentFrame();
  const localFrame = frame - triggerFrame;

  if (localFrame < 0 || localFrame > 25) return null;

  const slashProgress = interpolate(localFrame, [0, 6], [0, 100], {
    extrapolateRight: 'clamp',
  });
  const slashOpacity = interpolate(localFrame, [0, 4, 20], [0, 1, 0], {
    extrapolateRight: 'clamp',
  });
  const redFlash = interpolate(localFrame, [2, 5, 18], [0, 0.55, 0], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* Red Blood Impact Flash */}
      <AbsoluteFill style={{ backgroundColor: `rgba(180, 0, 0, ${redFlash})` }} />

      {/* Diagonal Metallic Blade Cut */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: `${slashProgress * 22}px`,
          height: '8px',
          background: 'linear-gradient(90deg, transparent, #ffffff, #ff3300, #ffffff, transparent)',
          boxShadow: '0 0 50px 15px rgba(255, 60, 0, 0.95)',
          transform: 'translate(-50%, -50%) rotate(-28deg)',
          opacity: slashOpacity,
        }}
      />
    </AbsoluteFill>
  );
};

// 🎥 3. सिंगल एक्शन सीन (Camera Shake + Color Grading + Anamorphic Bars)
const ActionSceneView: React.FC<{ scene: BattleScene; durationInFrames: number }> = ({
  scene,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Smooth Cinematic Fade
  const fade = interpolate(
    frame,
    [0, 12, durationInFrames - 12, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Dynamic Camera Zoom
  const baseZoom = interpolate(frame, [0, durationInFrames], [1.08, 1.28]);

  // Camera Shake (Fighting & War Impact)
  let shakeX = 0;
  let shakeY = 0;

  if (scene.fxType === 'war-earthquake') {
    shakeX = Math.sin(frame * 1.7) * 14 + Math.cos(frame * 2.3) * 8;
    shakeY = Math.cos(frame * 1.9) * 12;
  } else if (scene.fxType === 'sword-clash') {
    // Frame 25 aur 65 par talwar takrane ka jhatka
    const hit1 = frame >= 25 && frame <= 38 ? Math.sin(frame * 4) * 28 : 0;
    const hit2 = frame >= 65 && frame <= 78 ? Math.cos(frame * 4) * 28 : 0;
    shakeX = hit1 + hit2;
    shakeY = (hit1 - hit2) * 0.7;
  }

  // Lightning / Thunder Flash
  const lightningFlash =
    scene.fxType === 'blood-thunder' && ((frame > 18 && frame < 23) || (frame > 55 && frame < 59))
      ? 0.45
      : 0;

  // Title Slam Animation
  const slamScale = spring({
    frame: frame - 8,
    fps,
    config: { damping: 12, stiffness: 160 },
  });

  return (
    <AbsoluteFill style={{ opacity: fade, backgroundColor: '#000' }}>
      {/* Background 4K Art with Camera Shake & Dark Grading */}
      <AbsoluteFill style={{ overflow: 'hidden' }}>
        <Img
          src={scene.imageUrl}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${baseZoom}) translate(${shakeX}px, ${shakeY}px)`,
            filter: 'brightness(0.42) contrast(1.35) saturate(0.85)',
          }}
        />
      </AbsoluteFill>

      {/* Atmospheric Fog & Smoke Gradient */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, rgba(0,0,0,0.75) 0%, rgba(20,5,5,0.2) 50%, rgba(0,0,0,0.92) 100%)`,
        }}
      />

      {/* Thunder Flash */}
      {lightningFlash > 0 && (
        <AbsoluteFill style={{ backgroundColor: `rgba(255, 220, 200, ${lightningFlash})` }} />
      )}

      {/* Sword Clash Strikes */}
      {scene.fxType === 'sword-clash' && (
        <>
          <SwordSlashOverlay triggerFrame={25} />
          <SwordSlashOverlay triggerFrame={65} />
        </>
      )}

      {/* Center Epic Typography */}
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: '0 90px',
          transform: `scale(${Math.max(0.01, slamScale)})`,
        }}
      >
        <div
          style={{
            fontSize: 28,
            color: '#d4d4d4',
            letterSpacing: '12px',
            fontWeight: 700,
            marginBottom: 14,
            textShadow: '0 4px 12px rgba(0,0,0,0.9)',
          }}
        >
          {scene.era}
        </div>
        <h1
          style={{
            fontSize: 96,
            fontWeight: 900,
            color: '#ffffff',
            margin: 0,
            letterSpacing: '4px',
            textTransform: 'uppercase',
            textShadow: `0 0 50px ${scene.themeColor}, 0 8px 25px #000000`,
          }}
        >
          {scene.title}
        </h1>
      </AbsoluteFill>

      {/* Bottom Cinematic Subtitle Box */}
      <AbsoluteFill
        style={{
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingBottom: 115,
        }}
      >
        <div
          style={{
            backgroundColor: 'rgba(8, 8, 8, 0.85)',
            borderTop: `2px solid ${scene.themeColor}`,
            borderBottom: `2px solid ${scene.themeColor}`,
            padding: '16px 48px',
            maxWidth: '80%',
            boxShadow: '0 15px 40px rgba(0,0,0,0.95)',
          }}
        >
          <p
            style={{
              fontSize: 36,
              color: '#f5f5f5',
              margin: 0,
              fontWeight: 500,
              letterSpacing: '1px',
              textAlign: 'center',
            }}
          >
            {scene.subtitle}
          </p>
        </div>
      </AbsoluteFill>

      {/* Hollywood Widescreen Black Bars (Letterbox) */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 75, backgroundColor: '#000' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 75, backgroundColor: '#000' }} />
    </AbsoluteFill>
  );
};

// 🏆 4. मास्टर सीक्वेंसर (BGM + All Scenes + Fire Overlay)
export const KashmirWarDocu: React.FC = () => {
  const { fps } = useVideoConfig();
  let currentFrame = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000', fontFamily: 'system-ui, sans-serif' }}>
      {/* Epic Dark Background Music */}
      <Audio
        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
        volume={0.45}
      />

      {WAR_SCENES.map((scene, idx) => {
        const durationInFrames = scene.durationSec * fps;
        const from = currentFrame;
        currentFrame += durationInFrames;

        return (
          <Sequence key={idx} from={from} durationInFrames={durationInFrames}>
            <ActionSceneView scene={scene} durationInFrames={durationInFrames} />
          </Sequence>
        );
      })}

      {/* Global Battlefield Fire Sparks */}
      <BattlefieldSparks color="#ff3300" />

      {/* Heavy Dark Vignette */}
      <AbsoluteFill
        style={{
          background: 'radial-gradient(circle, transparent 40%, rgba(0,0,0,0.88) 100%)',
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => {
  const totalSeconds = WAR_SCENES.reduce((acc, s) => acc + s.durationSec, 0);
  return (
    <Composition
      id="DarkHistory"
      component={KashmirWarDocu}
      durationInFrames={totalSeconds * 30}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};

registerRoot(RemotionRoot);
