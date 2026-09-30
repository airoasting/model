# GPT-6 ASTRA

A cinematic, Korean-language interactive showcase for GPT-6 Astra.

## Run locally

```sh
cd gpt6astra
python3 -m http.server 4316 --bind 127.0.0.1
```

Open http://127.0.0.1:4316. No installation or build step is required.

## Files

- `index.html`: page structure and copy
- `style.css`: desktop/mobile styling and animations
- `app.js`: interactive canvas, tabs, examples, motion controls
- `assets/astra-nebula.jpg`: original generated hero artwork
- `build.mjs`: copies the root source files into `dist/` for Sites publishing

For deployment, run `npm run build` (no dependencies to install). Sites serves the generated `dist/` directory; edit the root source files.

## Interactions

- Slowly drifting planet with eased pointer parallax, a breathing corona, and a press-and-hold star warp
- Planet motion and glow pause with the motion control, reduced-motion preference, or when the hero is off screen
- Draggable particle field that morphs between sphere, helix, and torus
- Three sample scenarios with animated responses and replay
- Five-level reasoning effort explorer
- Scroll reveals, reading progress, and hover effects
- Keyboard navigation and reduced-motion support

The playground scenarios are authored examples, not live model responses. The page does not send prompts or call an API. The official Playground links open OpenAI's service.

Model specifications were checked against https://developers.openai.com/api/docs/models/gpt-6-astra on 2026-09-30. This is an independent concept page, not an official OpenAI website.

## Launch and benchmark sources

- Launch date: **2026-09-03**, OpenAI API changelog: https://developers.openai.com/api/docs/changelog
- Benchmark scores and evaluation conditions: https://openai.com/index/gpt-6-astra/
- Checked on 2026-09-30. Scores are the best across evaluated reasoning-effort levels as reported by OpenAI; research setups may differ from production.
- FrontierMath uses the precise table value, 97.6%, rather than the 98% rounded introduction.
- OSWorld 2.0 is v2026.08.08, offline set, partial score. Humanity’s Last Exam includes tools.
- Comparison choices: GPT-5.6 Sol, Claude Fable 5.1, Claude Opus 5. Missing results stay unscored; negative differences are displayed as such.
- Hero content uses normal flex flow to prevent the title and subtitle from overlapping on wide or short viewports.
