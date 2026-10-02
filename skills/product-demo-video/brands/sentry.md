# Sentry

Sources (need the user's Google login, so open them in the user's Chrome and let the user sign in):
- Brand guide: https://brand.getsentry.com/d/4A7NQz1aXA1i/brand-identity
- Brand Drive, music and video assets: https://drive.google.com/drive/folders/1lggaUqIkLrolQ9mbkqnwCVO74jvpb1-y
- Video Toolkit deck: https://docs.google.com/presentation/d/1J5YAM_ueLUxS61XbyVm2P4LiLJeT-ZW8_8-2Vdx2NW4

Assets are in `brands/sentry/`. Copy them into the project's `public/brand/`:
- `backdrop.png`: the dark purple gradient
- `endcard.mp4`: Sentry glyph and wordmark. Use it as the last 5 s, muted.

## Tokens

| Token | Value | Use |
| --- | --- | --- |
| bg | `#181225` | Background, and the dim layer over the gradient |
| surface | `#1f1830` | Cards, panels, browser chrome |
| text | `#ffffff` | Headlines and neutral values |
| muted | `#a9a3b8` | Labels, secondary copy |
| faint | `#544b6e` | Empty states ("NO SCORE") |
| good | `#92dd00` | Passing value, used only when the passing is the point |
| warn | `#fdb81b` | Needs-improvement value |
| poor | `#ff45a8` | Failing value |
| accent (blurple) | `#7553ff` | Trace spans, brand marks |
| purple | `#9e86ff` | Secondary trace color, progress bars |
| blue | `#3edcff` | Third data series only |

Use accent and support colors on data only, and fill large areas with bg or surface. The brand guide sets this, and it also keeps status colors readable.

Fonts: Rubik (sans, 400 to 700) and Geist Mono (400, 500), both from `@remotion/google-fonts`.

## Music

The Drive has approved tracks. The Video Toolkit deck says to relicense production music through Adobe Stock before anything is published.
- For an internal or feedback cut: Drive tracks, or Pixabay tracks (Pixabay Content License, commercial use allowed, no attribution).
- For a public Sentry release: ask the user to confirm the license with the brand team. Until they confirm, label a Pixabay track "Pixabay license" in `CREDITS.md` and in reports.

The user picked "Minimal Technology Corporate" by SoulProdMusic (Pixabay, 123 BPM, no vocals) for the first video. Start the search near that sound.

## Facts

Sentry product claims need a source in the Sentry docs (`sentry docs "<question>"`) or the SDK changelog. Name the exact SDK version and browser support.
