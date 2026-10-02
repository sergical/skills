import { loadFont as loadMono } from "@remotion/google-fonts/GeistMono";
import { loadFont as loadSans } from "@remotion/google-fonts/Rubik";
import { Easing, interpolate } from "remotion";

// Fill fonts and colors from brands/<brand>.md, the only source of brand values. Scenes import tokens from here.
export const sans = loadSans("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] }).fontFamily;
export const mono = loadMono("normal", { weights: ["400", "500"], subsets: ["latin"] }).fontFamily;

export const color = {
  bg: "TODO",
  surface: "TODO",
  line: "rgba(255, 255, 255, 0.1)",
  text: "TODO",
  muted: "TODO",
  faint: "TODO",
  good: "TODO",
  warn: "TODO",
  poor: "TODO",
  accent: "TODO",
};

export type Tone = "good" | "warn" | "poor" | "none";
export const toneColor: Record<Tone, string> = { good: color.good, warn: color.warn, poor: color.poor, none: color.faint };

export const easeOut = Easing.bezier(0.23, 1, 0.32, 1);
export const easeInOut = Easing.bezier(0.77, 0, 0.175, 1);

// A start of Infinity means "never", which keeps optional exits simple at the call site.
export const ramp = (frame: number, from: number, to: number, easing = easeOut) =>
  Number.isFinite(from) ? interpolate(frame, [from, to], [0, 1], { easing, extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

export const mix = (t: number, a: number, b: number) => a + (b - a) * t;
