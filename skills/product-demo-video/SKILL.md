---
name: product-demo-video
description: Product demo video in Remotion, made from stills of a running app in a brand profile. Use when the user asks for a demo, launch, or explainer video.
---

# Product demo video

For Remotion API details, use `remotion-best-practices`. The reference build is `~/src/playground/northlight-video`: 51 s, 1920x1080 at 60 fps, Remix 3 with Sentry soft-navigation Web Vitals. When a step is unclear, read how that project did it.

Every phase ends on **Done when**. Move to the next phase only when its criterion holds.

## 0. Inputs

- **The question.** Write the one question a curious visitor has. The title line asks it ("How do Web Vitals work?"), and the video answers it. The user judges every cut by whether it answers that question. The subject is the product and that question, not how the video was made.
- **Brand.** Load `brands/<brand>.md`. For a new brand, copy `brands/TEMPLATE.md`, fill fields from real sources (brand guide, the site's CSS), and ask the user for the fields still marked TODO.
- **Format.** 16:9, 1920x1080, 60 fps, under 60 s, unless the user says otherwise.
- **The app.** A running app at a `.localhost` URL.

Ask the user only for inputs that have no default here.

**Done when:** the question is written, the brand file has no TODO in tokens or fonts, and the app URL loads.

## 1. Fact sheet

Make `FACTS.md`, with one row per on-screen claim: the claim, its source (doc URL, code path, or a value measured in the app), and its status.

- Use real values from a real session of the app. Viewers who know the product spot invented numbers, and one wrong claim spoils the whole video.
- Write exact versions and support ("Chrome and Edge 151+", "@sentry/remix 11.4.0"), as narrow as the source states.
- Check every category word against the product's own docs. The first draft called Remix 3 an "SPA". It renders each navigation on the server, so the copy had to be rewritten.

**Done when:** every planned headline and number maps to a checked row.

## 2. Beat sheet

Make a table with one row per beat: the one idea, the headline (8 words or fewer), what moves, and the length in frames.

The order that worked:
1. The question.
2. The problem, shown side by side.
3. The product fixes it. This reveal sits on the music drop.
4. How it works (code or a trace).
5. Setup snippet as the CTA.
6. Brand end card.

- **One idea per beat.** A beat is one headline and one moving thing. When a beat needs two headlines at once, split it into two beats. The first draft was too dense, and the user asked for it to be simpler.
- **Copy says what happens**, in plain words: "renders each new page on the server", not "every navigation is a server round trip". Run `pstack-unslop` on every line.
- **Color only for problems.** Neutral and passing values use the text color. Status colors go on the values the viewer must notice. The brand accent goes on brand and trace elements only. When everything has a color, nothing stands out.

**Done when:** every row has one idea and one headline, and the lengths add up to under the target length.

## 3. Footage: 2x stills with drawn motion

The user rejected the screen recordings as janky and low resolution. Stills stay sharp at 60 fps, and you can re-time them freely.

- Capture with `kit/capture.mjs` (Playwright, 1440x900 viewport, deviceScaleFactor 2). The same run writes element rects to `src/shots.json`.
- The script hides debug HUDs with injected CSS. It waits for images and `document.fonts.ready`, then 400 ms.
- When headless Chrome breaks a request, fix it in the capture script with `context.route`, and leave the app as it is.
- In Remotion, show navigation as crossfades between stills. Use `Cursor` and `cursorAt` from `kit/ui.tsx` at the `shots.json` rects. Load bars, blanks, and metric panels are React elements on top of the stills.

**Done when:** every still the beat sheet needs exists in `public/shots/`, and every cursor target and highlight has a rect in `shots.json`.

## 4. Build

Copy `kit/` into `src/`: `theme.ts`, `ui.tsx`, `Product.tsx`, and `scenes/EndCard.tsx`. Put brand files in `public/brand/` as `backdrop.png` and `endcard.mp4`.

- **Tokens.** `theme.ts` holds every color and font from the brand file, and scenes import them from there. Changing the brand then means editing one file.
- **Overlap.** Scenes overlap by 20 frames (`OVERLAP`), so each exit plays under the next entrance.
- **Timing.** Keep in-scene beat frames as named constants in `timeline.ts` (`T.split`). Global frame = `scene.from + T.x`. Scenes that sync import `T` from `timeline.ts`.
- **Easing.**
  - `easeOut` (0.23, 1, 0.32, 1) for entrances
  - `easeInOut` (0.77, 0, 0.175, 1) for moves and exits
  - `MaskLine` for text: 34 frames in, 22 frames out
- **Sizes at 1080p.** These are the minimums, because people watch shared videos on phones.
  - title: 112
  - headlines and captions: 46 to 50
  - metric values: 42
  - code: mono 30
  - labels: mono 22 to 26, uppercase, 0.06em tracking
  - smallest text: 20 px at final scale
- **Layout.** Left margin is 140 px. Keep 120 px clear at each side.
- **Backdrop.** `Backdrop` `dim` runs from 0.4 (title, CTA) to 0.74 (dense product UI). `Grain` at 0.07 sits on top of everything to stop banding.
- **Compositions.** Keep one composition while you build. To compare variants (music, copy), add one composition per variant through `defaultProps`. Delete the losers when the user picks.

**Done when:** `theme.ts` has no TODO, `npx tsc --noEmit` and `npx eslint src` pass, and every beat-sheet row exists as a scene.

## 5. Music

Pick and analyze the tracks yourself. Build the best 2 to 4 as variant compositions, and the self-review covers each one. The user asked for this ("you download them and parse the beats").

1. **Credits.** Take sources from the brand file. Before a track goes in, add a row to `CREDITS.md`: file, title, artist, source URL, license, and date. At export time the user mixed up a Pixabay track with the brand Drive tracks. Only `CREDITS.md` settles which license applies.
2. **Download.** Ask before each download, and state the file name, source, and size. Pixabay answers curl with a 403. Read the `cdn.pixabay.com` mp3 URL from the page in the user's Chrome, then curl it with a browser User-Agent and a `Referer`.
3. **Analyze.** Run `uv run --quiet --with librosa --with numpy python scripts/music.py <track> --target <reveal s> --length <video s>`. It prints tempo, bar length, drop candidates, the offset that puts each drop on the reveal, the level, and the gain to reach -17 dBFS.
4. **Choose.** Pick a track where:
   - the drop lands on the reveal
   - a quiet or breakdown section plays under the intro, so headlines read
   - the track covers the full length from the offset, with no loop
   - the tempo is 115 to 130 BPM
   - there are no vocals over text
5. **Place.**
   - Fill `MUSIC` in `Product.tsx`. A negative offset delays the start.
   - The fade is 30 frames in and 120 frames out.
   - Put secondary moves on bars: `drop frame + n × (240 / BPM) × fps`. Northlight's trace zoom sits 8 bars after the drop.
6. **Verify.** Run `npx remotion render <comp> out/audio.wav --codec=wav` from the project root, so the render uses the current code. Then run `music.py out/audio.wav --target <reveal s> --rendered`.

**Done when:** the rendered drop is within 2 frames of the reveal, the level is within 1 dB of -17 dBFS, and every track has a row in `CREDITS.md`.

## 6. Self-review

This is the last gate before the user sees the cut. The user wants it "self validated and improved before passing it back".

Run `scripts/stills.sh <project> <comp> <sheet> <frames...>`. It renders frames at half scale and tiles them 2 across into one contact sheet. Set `REBUNDLE=1` after code edits.

For each scene, include these frames:
- the first frame after the entrance settles
- each headline
- the overlap window (`from` to `from + 20`)
- each beat-synced move
- the last frame before the exit

Check every sheet against this list:
- Text sits inside the margins, and nothing overlaps.
- Dead air: empty background lasts 30 frames at most between scenes. Northlight had a 35-frame gap before the CTA.
- Every number matches `FACTS.md`.
- Color appears only on problems.
- One headline is on screen at a time.

After a fix, re-render only the frames the fix changed.

**Done when:** every scene's frames pass every check, tsc and eslint pass, and you hand the user the Studio URL (`https://<project>.localhost/<CompositionId>`) with a short list of changes.

## 7. Export

Render the video only when the user asks for it. Run the render in the background, because 3000 frames take several minutes.

```sh
npx remotion render <comp> out/<name>.mp4 --codec=h264 --crf=18
ffmpeg -v error -y -i out/<name>.mp4 -c:v libx264 -crf 24 -preset slow -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 160k out/<name>-share.mp4
ffprobe -v error -show_entries format=duration,size:stream=codec_type,width,height,r_frame_rate -of compact out/<name>.mp4
```

**Done when:** you report three things:
- both paths: the master (about 80 MB for 50 s) and the share copy (about 16 MB, for Slack and email)
- the duration and the streams from ffprobe
- the license status of each asset, from `CREDITS.md`
