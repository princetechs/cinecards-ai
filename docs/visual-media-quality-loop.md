# Visual Media Quality Loop

aiscreens should not use abstract placeholder motion as a main product visual. Every homepage, recipe, planner, service, and glossary visual should help a beginner understand what the product does.

## Rule

Use media only when it teaches a concrete thing:

- what the user starts with
- what aiscreens gives back
- where the result goes next
- what failure the user avoids

If the visual cannot answer those points within two seconds, replace it with a better image, a HyperFrames explainer loop, or plain text.

## Current Approved Site Media

The public page media slots live in `data/siteMedia.json`.

- `home.hero` — idea to shot plan to model-ready prompt
- `home.workflow` — creator brief to shot order to prompt
- `home.recipes` — recipe picker to shot list to copyable prompt
- `recipes.hero` — recipe page explainer loop
- `services.hero` — service/done-for-you workflow explainer loop
- `services.packageCovers` — image-backed offer cards for service packages

The HyperFrames source compositions live in:

- `media/hyperframes/hero-director-loop/`
- `media/hyperframes/workflow-director-loop/`
- `media/hyperframes/recipe-picker-loop/`

Final lightweight media files live in:

- `public/videos/home/`
- `public/images/home/posters/`

## When To Use Video

Use a 5-8 second HyperFrames loop when the section needs to explain a process:

- one vague idea becoming a plan
- a recipe becoming a shot list
- a prompt being rewritten for a model
- a service brief becoming deliverables
- a glossary term that depends on motion or timing

Use a still image when the section only needs a concrete scene or cover:

- recipe cards
- tool cards
- blog cards
- supporting plan cards

## Quality Checklist

Before shipping visual changes:

- No raw internal fields should be visible, especially `previewVideoUrl`.
- Silent videos should have caption tracks but no forced visible default captions.
- Explanatory videos must use `object-fit: contain` so text is not cropped.
- Decorative CSS-only shapes should not be the main visual for a product section.
- Videos need posters and reduced-motion image fallbacks.
- Only first-viewport media should be eager. Below-the-fold loops and preview wall posters must lazy-load through `components/MediaLoop.astro` or the preview-wall observer.
- Keep Lighthouse `total-byte-weight` under the 600 KiB budget on the homepage.
- Run `npm run check`, `npm run build`, and browser-test `/`, `/recipes`, `/services`, `/glossary`, and `/planner`.
- For new HyperFrames videos, run `npm run check` inside the composition directory before rendering.

## Next Media Targets

- Add more term-specific HyperFrames previews for foundation terms that still have `previewVideoUrl: null`.
- Keep homepage videos few and small. Use more videos only where they explain a decision, not as decoration.
