# aiscreens HyperFrames Design Rules

## Style Prompt

Create practical AI video direction previews, not generic motion graphics. Every frame must teach the viewer what a shot, recipe, workflow step, or failure fix means. Use a premium dark editorial interface with warm sand surfaces, clay/orange action accents, soft cinematography lighting, readable labels, and simple object/person/scene diagrams that make the lesson obvious within two seconds.

## Colors

- Ink: `#171717`
- Dark canvas: `#0F0F13`
- Sand surface: `#F8F5EF`
- Clay action: `#B83A1F`
- Warm highlight: `#F28A61`
- Muted body copy: `#4F4A45`

## Typography

- Use system UI or bundled sans-serif for labels and prompts.
- Use large bold display type only for the main term or recipe title.
- Keep captions short enough to read on mobile.

## What NOT To Do

- Do not use abstract rounded rectangles unless they represent a real subject, frame, object, camera path, or UI control.
- Do not create a film-strip decoration that says nothing about the term.
- Do not animate a still image just to create motion.
- Do not hide the teaching point behind atmosphere, glow, or generic cinematic shapes.
- Do not make a preview if it cannot answer: what is the subject, what is the camera doing, and what should the learner notice?
- Do not use generated bitmap text as the main explanation; add readable web/HTML labels over the image or video instead.

## Required Preview Structure

Every generated image or 5-8 second HyperFrames video should include:

- A concrete scenario, such as cafe reel, product hero, dialogue, tutorial, travel, interview, action, or lifestyle.
- A visible subject or object.
- A camera/frame guide that explains the shot.
- 2-4 short labels that match the lesson.
- A clear before/after, sequence, or failure-fix beat.

## Homepage Visual Pattern

Use image generation for the realistic base scene, then layer HyperFrames, Remotion, or site CSS for readable labels and motion. The base scene should be a real creator scenario such as a cafe product reel, bakery shot-plan table, storyboard desk, or learning workspace. Motion should show a practical change: idea to shot plan, wide to detail, weak prompt to fixed prompt, or export target switching.
