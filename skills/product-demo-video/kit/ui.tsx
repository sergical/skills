import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { color, easeInOut, mix, mono, ramp, sans } from "./theme";

// One line of text that slides up out of a mask, and back up out of it on exit.
export const MaskLine: React.FC<{ at: number; out?: number; children: ReactNode; style?: CSSProperties }> = ({
  at,
  out = Infinity,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const enter = ramp(frame, at, at + 34);
  const exit = ramp(frame, out, out + 22, easeInOut);
  return (
    <div style={{ overflow: "hidden", paddingBottom: "0.12em", marginBottom: "-0.12em", ...style }}>
      <div style={{ translate: `0px ${(1 - enter) * 110 - exit * 110}%`, opacity: mix(exit, 1, 0) }}>{children}</div>
    </div>
  );
};

export type Cue = { at: number; text: ReactNode };

// A caption slot that swaps lines in place: the old line leaves upward as the new one rises.
export const Captions: React.FC<{ cues: Cue[]; end?: number; style?: CSSProperties }> = ({ cues, end, style }) => (
  <div style={{ position: "relative", height: 64, ...style }}>
    {cues.map((cue, i) => (
      <MaskLine
        key={i}
        at={cue.at}
        out={(cues[i + 1]?.at ?? end ?? Infinity) - 8}
        style={{ position: "absolute", inset: 0, fontFamily: sans, fontSize: 50, fontWeight: 500, letterSpacing: "-0.01em", color: color.text }}
      >
        {cue.text}
      </MaskLine>
    ))}
  </div>
);

export const Muted: React.FC<{ children: ReactNode }> = ({ children }) => <span style={{ color: color.muted }}>{children}</span>;

export const Code: React.FC<{ children: ReactNode; tone?: string }> = ({ children, tone = color.text }) => (
  <span style={{ fontFamily: mono, fontSize: "0.9em", letterSpacing: "-0.01em", color: tone }}>{children}</span>
);

// Animated film grain keeps the large flat blacks from banding and looking digital.
export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 2) % 8;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: 0.07, mixBlendMode: "screen" }}>
      <svg width="100%" height="100%">
        <filter id={`grain-${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};

// The brand backdrop image, dimmed with the background color so product UI on top keeps its contrast.
export const Backdrop: React.FC<{ dim: number }> = ({ dim }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: color.bg }}>
      <Img
        src={staticFile("brand/backdrop.png")}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", scale: `${1.04 + frame * 0.00002}`, rotate: `${Math.sin(frame / 900) * 1.2}deg` }}
      />
      <AbsoluteFill style={{ backgroundColor: color.bg, opacity: dim }} />
    </AbsoluteFill>
  );
};

export type CursorStop = { at: number; x: number; y: number };

// Eased point-to-point moves with a slight arc, like a hand on a trackpad rather than a tween.
export function cursorAt(frame: number, stops: CursorStop[], travel = 44) {
  let { x, y } = stops[0];
  for (let i = 1; i < stops.length; i++) {
    const from = stops[i - 1];
    const to = stops[i];
    const start = to.at - travel;
    if (frame < start) break;
    const t = ramp(frame, start, to.at, easeInOut);
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const arc = Math.sin(Math.PI * t) * 0.12;
    x = from.x + dx * t - dy * arc;
    y = from.y + dy * t + dx * arc;
  }
  return { x, y };
}

export const Cursor: React.FC<{ x: number; y: number; clicks: number[]; opacity: number; size?: number }> = ({
  x,
  y,
  clicks,
  opacity,
  size = 34,
}) => {
  const frame = useCurrentFrame();
  const press = clicks.reduce((acc, at) => Math.max(acc, interpolate(frame, [at - 4, at, at + 10], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })), 0);
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity, pointerEvents: "none" }}>
      {clicks.map((at) => {
        const t = ramp(frame, at, at + 36);
        if (frame < at || t >= 1) return null;
        const r = mix(t, 6, 46);
        return (
          <div
            key={at}
            style={{
              position: "absolute",
              left: -r,
              top: -r,
              width: r * 2,
              height: r * 2,
              borderRadius: "50%",
              border: `2px solid ${color.text}`,
              opacity: (1 - t) * 0.7,
            }}
          />
        );
      })}
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        style={{ position: "absolute", left: -3, top: -2, scale: `${1 - press * 0.14}`, transformOrigin: "3px 2px", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.5))" }}
      >
        <path d="M4 2.5 L4 19.5 L8.6 15.4 L11.6 22 L14.6 20.7 L11.7 14.2 L18 14 Z" fill="#fff" stroke="#000" strokeWidth="1.3" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

export const jitter = (frame: number, start: number, length: number, amount: number) => {
  const t = ramp(frame, start, start + length);
  if (frame < start || t >= 1) return 0;
  return (random(`j${Math.floor(frame / 2)}`) - 0.5) * 2 * amount * (1 - t);
};
