"""Find where a music track should start so its drop lands on a chosen video frame.

Source mode (pick and place a track):
  uv run --quiet --with librosa --with numpy python music.py track.mp3 --target 20.83 --length 51.17
Rendered mode (check the drop in a rendered audio-only file):
  uv run --quiet --with librosa --with numpy python music.py out.wav --target 20.83 --rendered
"""

import argparse

import librosa
import numpy as np

p = argparse.ArgumentParser()
p.add_argument("file")
p.add_argument("--target", type=float, required=True, help="video second where the drop must land")
p.add_argument("--length", type=float, help="video length in seconds (source mode)")
p.add_argument("--level", type=float, default=-17.0, help="target RMS dBFS for the used part")
p.add_argument("--fps", type=int, default=60)
p.add_argument("--rendered", action="store_true", help="search for the drop near --target only")
a = p.parse_args()

y, sr = librosa.load(a.file, sr=22050, mono=True)
dur = len(y) / sr
hop = 128

# A drop is where bass enters and stays. Compare the mean low-band level of the second after
# each point with the second before it. A per-frame threshold catches risers and single kicks.
S = np.abs(librosa.stft(y, n_fft=2048, hop_length=hop))
f = librosa.fft_frequencies(sr=sr, n_fft=2048)
t = librosa.frames_to_time(np.arange(S.shape[1]), sr=sr, hop_length=hop)
low = S[f < 150].sum(0)
db = 20 * np.log10(low / low.max() + 1e-9)
cs = np.cumsum(np.r_[0, db])
w = int(sr / hop)
idx = np.arange(w, len(t) - w)
step = (cs[idx + w] - cs[idx]) / w - (cs[idx] - cs[idx - w]) / w


def rms_db(start, end):
    seg = y[int(max(0, start) * sr) : int(min(dur, end) * sr)]
    return 20 * np.log10(np.sqrt(np.mean(seg**2)) + 1e-12)


if a.rendered:
    near = np.abs(t[idx] - a.target) <= 2
    j = idx[near][np.argmax(step[near])]
    err = (t[j] - a.target) * a.fps
    print(f"drop {t[j]:.3f}s  target {a.target:.3f}s  error {err:+.1f} frames  {'OK' if abs(err) <= 2 else 'FIX'}")
    print(f"level {rms_db(2, dur - 2):.1f} dBFS (target {a.level})")
    raise SystemExit

tempo, beats = librosa.beat.beat_track(y=y, sr=sr, hop_length=512)
bpm = float(np.atleast_1d(tempo)[0])
bt = librosa.frames_to_time(beats, sr=sr, hop_length=512)
print(f"{a.file}  {dur:.1f}s  {bpm:.1f} BPM  beat {60 / bpm:.3f}s  bar {240 / bpm:.3f}s")

# Peaks of at least 6 dB, at least 4 s apart, strongest first.
picks = []
for i in np.argsort(-step):
    if step[i] < 6 or len(picks) == 6:
        break
    ti = t[idx[i]]
    if all(abs(ti - q) >= 4 for q, _ in picks):
        picks.append((ti, step[i]))

if not picks:
    print("no clear drop (no 6 dB bass step); the track is flat, pick another")
for ti, s in sorted(picks):
    if len(bt):
        nb = bt[np.argmin(np.abs(bt - ti))]
        ti = nb if abs(nb - ti) < 0.1 else ti
    off = ti - a.target
    line = f"  drop {ti:6.2f}s  step {s:+5.1f} dB  offset {off:6.2f}s"
    if a.length:
        end = off + a.length
        fits = end <= dur
        lvl = rms_db(off, end)
        gain = 10 ** ((a.level - lvl) / 20)
        note = "" if fits else f"  ENDS {end - dur:.1f}s EARLY"
        line += f"  level {lvl:5.1f} dBFS  gain {min(gain, 1):.2f}{' (track too quiet)' if gain > 1 else ''}{note}"
        if off < 0:
            line += f"  delay start {-off:.2f}s"
    print(line)
