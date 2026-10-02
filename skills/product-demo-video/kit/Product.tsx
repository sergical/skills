import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { EndCard } from "./scenes/EndCard";
import { Backdrop, Grain } from "./ui";

// Replace with the real scenes. Each scene starts 20 frames before the previous one ends,
// so every exit plays under the next entrance.
const Placeholder: React.FC = () => null;
const OVERLAP = 20;
const LENGTHS = [
  { name: "Question", length: 420, component: Placeholder },
  { name: "Demo", length: 1290, component: Placeholder },
  { name: "How it works", length: 780, component: Placeholder },
  { name: "CTA", length: 360, component: Placeholder },
  { name: "End card", length: 300, component: EndCard },
];
export const SCENES = LENGTHS.reduce<((typeof LENGTHS)[number] & { from: number })[]>(
  (acc, s) => [...acc, { ...s, from: acc.length ? acc[acc.length - 1].from + acc[acc.length - 1].length - OVERLAP : 0 }],
  [],
);
export const PRODUCT_FRAMES = SCENES[SCENES.length - 1].from + SCENES[SCENES.length - 1].length;

// Fill from scripts/music.py: offset puts the drop on the reveal frame, gain brings the used part to -17 dBFS.
// Record the track in CREDITS.md before it goes in.
const MUSIC = { file: "music/track.mp3", offset: 0, gain: 1 };

export const Product: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const delay = Math.max(0, Math.round(-MUSIC.offset * fps));
  const length = PRODUCT_FRAMES - delay;
  // Darker behind dense product UI, lighter on title and CTA.
  const dim = interpolate(frame, [SCENES[1].from - 20, SCENES[1].from + 40, SCENES[3].from, SCENES[3].from + 40], [0.42, 0.74, 0.74, 0.4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill>
      <Backdrop dim={dim} />
      {SCENES.map(({ name, from, length: duration, component: Scene }) => (
        <Sequence key={name} name={name} from={from} durationInFrames={duration}>
          <Scene />
        </Sequence>
      ))}
      <Grain />
      <Sequence name="Music" from={delay} durationInFrames={length}>
        <Audio
          src={staticFile(MUSIC.file)}
          trimBefore={Math.max(0, Math.round(MUSIC.offset * fps))}
          volume={(f) => MUSIC.gain * interpolate(f, [0, 30, length - 120, length], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
