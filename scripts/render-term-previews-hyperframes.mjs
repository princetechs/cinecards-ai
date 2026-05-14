#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = process.cwd();
const projectDir = join(repoRoot, "media/hyperframes/term-previews");
const renderDir = join(projectDir, "renders");
const videoOutDir = join(repoRoot, "public/videos/terms");
const imageOutDir = join(repoRoot, "public/images/terms");
const args = process.argv.slice(2);
const requestedTermIds = new Set(args.filter((arg) => !arg.startsWith("--")));
const force = args.includes("--force");
const forceImages = args.includes("--force-images");
const skipInspect = args.includes("--skip-inspect");
const inspectAll = args.includes("--inspect-all");
const limitArg = args.find((arg) => arg.startsWith("--limit="));
const limit = limitArg ? Number(limitArg.split("=")[1]) : 0;

const allTerms = JSON.parse(readFileSync(join(repoRoot, "data/terms.json"), "utf8"));

const categoryVisuals = {
  Composition: {
    kind: "composition",
    scene: "Frame a useful picture",
    labels: ["viewer sees", "subject", "clean edge"],
    steps: ["Choose the border", "Place attention", "Remove clutter"]
  },
  Shots: {
    kind: "shot",
    scene: "Choose the useful crop",
    labels: ["subject", "frame size", "clear action"],
    steps: ["Set distance", "Hold one action", "Cut on purpose"]
  },
  Angles: {
    kind: "angle",
    scene: "Place the camera height",
    labels: ["camera", "subject", "feeling"],
    steps: ["Pick eye level", "Change power", "Keep subject readable"]
  },
  Movement: {
    kind: "movement",
    scene: "Move for a reason",
    labels: ["start", "camera path", "reveal"],
    steps: ["Start stable", "Move once", "Land on payoff"]
  },
  "Lens / Optics": {
    kind: "lens",
    scene: "Control focus and depth",
    labels: ["lens", "focus plane", "background"],
    steps: ["Pick lens feel", "Lock focus", "Check exposure"]
  },
  Lighting: {
    kind: "lighting",
    scene: "Shape light around the subject",
    labels: ["key", "shadow", "separation"],
    steps: ["Place the main light", "Control shadow", "Keep direction"]
  },
  Editing: {
    kind: "editing",
    scene: "Connect clips into meaning",
    labels: ["clip A", "cut point", "clip B"],
    steps: ["Find the action", "Cut cleanly", "Preserve continuity"]
  },
  "AI Workflow": {
    kind: "ai",
    scene: "Prepare a model-ready prompt",
    labels: ["reference", "prompt", "retry fix"],
    steps: ["Lock the subject", "Describe motion", "Add guardrails"]
  }
};

const specificVisuals = {
  frame: { kind: "composition", mode: "frame", labels: ["boundary", "subject", "distraction"], steps: ["Set the border", "Place the subject", "Remove distractions"] },
  shot: { kind: "shot", mode: "shot", labels: ["record", "one action", "cut"], steps: ["Start recording", "Hold one idea", "End the shot"] },
  scene: { kind: "editing", mode: "scene", labels: ["wide", "medium", "close"], steps: ["Same place", "Same purpose", "Multiple shots"] },
  sequence: { kind: "editing", mode: "sequence", labels: ["setup", "action", "payoff"], steps: ["Begin clearly", "Build action", "End with result"] },
  "aspect-ratio": { kind: "composition", mode: "aspect", labels: ["16:9", "1:1", "9:16"], steps: ["Pick platform", "Frame subject", "Avoid bad crop"] },
  "establishing-shot": { kind: "shot", mode: "wide-place", labels: ["location", "subject", "context"], steps: ["Start wide", "Show the place", "Hold for context"] },
  "wide-shot": { kind: "shot", mode: "wide", labels: ["full subject", "environment", "action"], steps: ["Show body", "Keep space useful", "Read the action"] },
  "medium-shot": { kind: "shot", mode: "medium", labels: ["torso", "hands", "gesture"], steps: ["Frame torso", "Keep hands visible", "Show action"] },
  "close-up": { kind: "shot", mode: "close", labels: ["face/detail", "emotion", "focus"], steps: ["Move closer", "Simplify background", "Show feeling"] },
  "extreme-close-up": { kind: "shot", mode: "macro", labels: ["tiny detail", "texture", "focus"], steps: ["Find detail", "Lock focus", "Hold still"] },
  "insert-shot": { kind: "shot", mode: "insert", labels: ["object", "small action", "meaning"], steps: ["Pick object", "Show action", "Return to scene"] },
  "eye-level-angle": { kind: "angle", mode: "eye", labels: ["neutral height", "viewer trust", "clear face"], steps: ["Match eye height", "Keep lens straight", "Let it feel natural"] },
  "high-angle": { kind: "angle", mode: "high", labels: ["camera above", "smaller subject", "less power"], steps: ["Raise camera", "Tilt down", "Keep action clear"] },
  "low-angle": { kind: "angle", mode: "low", labels: ["camera below", "larger subject", "power"], steps: ["Lower camera", "Tilt up", "Watch distortion"] },
  "birds-eye-view": { kind: "angle", mode: "top", labels: ["top view", "pattern", "layout"], steps: ["Go overhead", "Flatten space", "Show pattern"] },
  "worms-eye-view": { kind: "angle", mode: "worm", labels: ["ground view", "height", "scale"], steps: ["Place camera low", "Look upward", "Use for scale"] },
  "dutch-angle": { kind: "angle", mode: "dutch", labels: ["tilted horizon", "tension", "unease"], steps: ["Tilt frame", "Keep subject readable", "Use sparingly"] },
  pan: { kind: "movement", mode: "pan", labels: ["locked position", "rotate", "reveal"], steps: ["Lock tripod", "Rotate sideways", "Land on target"] },
  tilt: { kind: "movement", mode: "tilt", labels: ["up/down", "height reveal", "stop clean"], steps: ["Hold position", "Tilt vertically", "End on subject"] },
  "static-shot": { kind: "movement", mode: "static", labels: ["no drift", "stable frame", "clear action"], steps: ["Lock camera", "Let action happen", "Avoid shaking"] },
  "handheld-shot": { kind: "movement", mode: "handheld", labels: ["human energy", "small shake", "close presence"], steps: ["Keep elbows in", "Move gently", "Use for intimacy"] },
  "dolly-in": { kind: "movement", mode: "dolly-in", labels: ["move closer", "attention", "emotion"], steps: ["Start wider", "Push forward", "End on detail"] },
  "dolly-out": { kind: "movement", mode: "dolly-out", labels: ["move back", "reveal world", "isolation"], steps: ["Start close", "Pull back", "Reveal context"] },
  "tracking-shot": { kind: "movement", mode: "track", labels: ["follow subject", "parallel path", "movement"], steps: ["Match speed", "Keep distance", "Follow the action"] },
  "truck-move": { kind: "movement", mode: "truck", labels: ["sideways slide", "parallax", "reveal"], steps: ["Slide sideways", "Keep subject framed", "Reveal background"] },
  "pedestal-move": { kind: "movement", mode: "pedestal", labels: ["camera rises", "no tilt", "height change"], steps: ["Move camera up", "Keep lens level", "Reveal height"] },
  "crane-jib-shot": { kind: "movement", mode: "crane", labels: ["vertical sweep", "scale", "arrival"], steps: ["Start low", "Lift smoothly", "Show scale"] },
  zoom: { kind: "lens", mode: "zoom", labels: ["same position", "changing lens", "closer feel"], steps: ["Stay still", "Change focal length", "Avoid fake movement"] },
  "push-in": { kind: "movement", mode: "dolly-in", labels: ["push in", "importance", "focus"], steps: ["Move forward", "Hold subject", "End with intent"] },
  "pull-back": { kind: "movement", mode: "dolly-out", labels: ["pull back", "context", "payoff"], steps: ["Start close", "Move back", "Reveal meaning"] },
  "whip-pan": { kind: "movement", mode: "whip", labels: ["fast pan", "blur bridge", "new target"], steps: ["Start on target", "Whip across", "Stop sharp"] },
  "orbit-shot": { kind: "movement", mode: "orbit", labels: ["circle subject", "depth", "hero feel"], steps: ["Set center", "Move around", "Keep subject locked"] },
  "rack-focus": { kind: "lens", mode: "rack", labels: ["foreground", "focus shift", "background"], steps: ["Set two planes", "Start focused", "Pull focus"] },
  "shallow-depth-of-field": { kind: "lens", mode: "shallow", labels: ["sharp subject", "soft background", "focus"], steps: ["Open aperture", "Separate background", "Lock focus"] },
  "deep-focus": { kind: "lens", mode: "deep", labels: ["front sharp", "middle sharp", "back sharp"], steps: ["Close aperture", "Light the scene", "Keep depth readable"] },
  "rule-of-thirds": { kind: "composition", mode: "thirds", labels: ["third line", "subject", "balance"], steps: ["Turn on grid", "Place subject", "Leave useful space"] },
  "leading-lines": { kind: "composition", mode: "lines", labels: ["line path", "attention", "subject"], steps: ["Find lines", "Aim to subject", "Avoid clutter"] },
  "negative-space": { kind: "composition", mode: "space", labels: ["empty area", "small subject", "mood"], steps: ["Leave space", "Keep subject clear", "Use for feeling"] },
  foreground: { kind: "composition", mode: "foreground", labels: ["front layer", "subject", "depth"], steps: ["Add front object", "Keep subject sharp", "Create depth"] },
  background: { kind: "composition", mode: "background", labels: ["back layer", "context", "separation"], steps: ["Choose context", "Avoid noise", "Separate subject"] },
  "key-light": { kind: "lighting", mode: "key", labels: ["main light", "face shape", "direction"], steps: ["Place key", "Angle the shadow", "Keep mood consistent"] },
  "fill-light": { kind: "lighting", mode: "fill", labels: ["soft fill", "shadow control", "detail"], steps: ["Keep it softer", "Lift shadows", "Avoid flattening"] },
  "back-light": { kind: "lighting", mode: "back", labels: ["behind subject", "edge", "separation"], steps: ["Place behind", "Aim at edge", "Avoid lens flare"] },
  "rim-light": { kind: "lighting", mode: "rim", labels: ["thin edge", "outline", "separation"], steps: ["Light the outline", "Keep it subtle", "Separate from background"] },
  "hard-light": { kind: "lighting", mode: "hard", labels: ["sharp shadow", "contrast", "drama"], steps: ["Use small source", "Aim precisely", "Watch harsh faces"] },
  "soft-light": { kind: "lighting", mode: "soft", labels: ["large source", "gentle shadow", "flattering"], steps: ["Use big source", "Move it close", "Keep direction"] },
  silhouette: { kind: "lighting", mode: "silhouette", labels: ["bright back", "dark subject", "shape"], steps: ["Expose background", "Hide face detail", "Read the outline"] },
  "practical-light": { kind: "lighting", mode: "practical", labels: ["visible lamp", "motivation", "warm source"], steps: ["Show the source", "Match direction", "Keep exposure safe"] },
  "color-temperature": { kind: "lighting", mode: "temperature", labels: ["warm", "cool", "mood"], steps: ["Pick temperature", "Match lights", "Avoid mixed color"] },
  "bounce-light": { kind: "lighting", mode: "bounce", labels: ["bounce card", "soft return", "natural fill"], steps: ["Aim at surface", "Return soft light", "Keep it believable"] },
  "top-light": { kind: "lighting", mode: "top", labels: ["above", "shape", "shadow eyes"], steps: ["Place overhead", "Watch eye shadow", "Use for mood"] },
  "side-light": { kind: "lighting", mode: "side", labels: ["side source", "texture", "contrast"], steps: ["Light one side", "Let shadow fall", "Show shape"] },
  cut: { kind: "editing", mode: "cut", labels: ["clip A", "hard cut", "clip B"], steps: ["Find moment", "Cut instantly", "Keep rhythm"] },
  continuity: { kind: "editing", mode: "continuity", labels: ["same hand", "same screen side", "same action"], steps: ["Match position", "Check props", "Preserve direction"] },
  "180-degree-rule": { kind: "editing", mode: "axis", labels: ["axis line", "camera side", "screen direction"], steps: ["Draw the line", "Stay on one side", "Avoid flipping"] },
  "match-on-action": { kind: "editing", mode: "match-action", labels: ["start action", "cut inside", "finish action"], steps: ["Begin motion", "Cut mid-action", "Finish smoothly"] },
  "j-cut": { kind: "editing", mode: "jcut", labels: ["next audio", "before video", "smooth bridge"], steps: ["Bring audio early", "Hold old picture", "Reveal new shot"] },
  "l-cut": { kind: "editing", mode: "lcut", labels: ["old audio", "new picture", "emotional bridge"], steps: ["Cut picture first", "Keep audio trailing", "Ease transition"] },
  "jump-cut": { kind: "editing", mode: "jump", labels: ["time skip", "same angle", "energy"], steps: ["Cut dead time", "Accept jump", "Use for pace"] },
  "match-cut": { kind: "editing", mode: "match-cut", labels: ["shape match", "new scene", "meaning"], steps: ["Find matching shape", "Cut on similarity", "Create connection"] },
  montage: { kind: "editing", mode: "montage", labels: ["many shots", "compressed time", "progress"], steps: ["Pick beats", "Cut fast", "Show change"] },
  dissolve: { kind: "editing", mode: "dissolve", labels: ["fade overlap", "time passes", "soft transition"], steps: ["Overlap clips", "Use for time", "Keep it intentional"] },
  "fade-in": { kind: "editing", mode: "fade", labels: ["black", "image appears", "begin"], steps: ["Start black", "Raise picture", "Begin gently"] },
  "fade-out": { kind: "editing", mode: "fade", labels: ["image", "black", "end"], steps: ["Lower picture", "End beat", "Give closure"] },
  "text-to-video": { kind: "ai", mode: "text", labels: ["idea", "prompt", "generated clip"], steps: ["Write subject", "Add motion", "Specify camera"] },
  "image-to-video": { kind: "ai", mode: "image", labels: ["start image", "motion prompt", "video"], steps: ["Choose reference", "Describe motion", "Protect subject"] },
  "video-to-video": { kind: "ai", mode: "video", labels: ["source clip", "style prompt", "new clip"], steps: ["Keep timing", "Set style", "Check drift"] },
  "reference-image": { kind: "ai", mode: "reference", labels: ["reference", "identity", "consistency"], steps: ["Upload reference", "Name key traits", "Compare output"] },
  "start-frame": { kind: "ai", mode: "start", labels: ["first frame", "locked look", "motion begins"], steps: ["Set frame one", "Describe next motion", "Avoid changing subject"] },
  "end-frame": { kind: "ai", mode: "end", labels: ["target ending", "motion path", "payoff"], steps: ["Set final image", "Bridge motion", "Land cleanly"] },
  keyframe: { kind: "ai", mode: "keyframe", labels: ["frame 1", "middle beat", "frame 2"], steps: ["Set milestones", "Control drift", "Check timing"] },
  storyboard: { kind: "ai", mode: "storyboard", labels: ["shot order", "visual plan", "prompt pack"], steps: ["Sketch beats", "Plan prompts", "Generate in order"] },
  "prompt-template": { kind: "ai", mode: "prompt", labels: ["subject", "motion", "camera"], steps: ["Use slots", "Keep one action", "Add duration"] },
  "prompt-pack": { kind: "ai", mode: "pack", labels: ["shot list", "variants", "export"], steps: ["Group shots", "Adapt by model", "Copy together"] },
  "temporal-consistency": { kind: "ai", mode: "temporal", labels: ["same motion", "stable time", "no flicker"], steps: ["Reduce chaos", "Use clear action", "Check each second"] },
  "character-consistency": { kind: "ai", mode: "character", labels: ["same person", "same outfit", "same face"], steps: ["Use references", "Repeat traits", "Avoid vague style"] },
  seed: { kind: "ai", mode: "seed", labels: ["seed value", "repeatable try", "variation"], steps: ["Save seed", "Change one thing", "Compare result"] },
  "motion-strength": { kind: "ai", mode: "motion", labels: ["low", "balanced", "too much"], steps: ["Start low", "Increase slowly", "Avoid warping"] },
  "negative-prompt": { kind: "ai", mode: "negative", labels: ["avoid", "guardrail", "clean output"], steps: ["Name failures", "Keep it specific", "Do not overstuff"] },
  "timestamp-prompting": { kind: "ai", mode: "timestamp", labels: ["0s", "4s", "8s"], steps: ["Split timing", "Assign actions", "Keep transitions simple"] },
  "upscaling-export": { kind: "ai", mode: "export", labels: ["draft", "upscale", "delivery"], steps: ["Approve draft", "Upscale once", "Export cleanly"] },
  "provenance-metadata": { kind: "ai", mode: "metadata", labels: ["source", "history", "trust"], steps: ["Keep origin", "Store notes", "Share responsibly"] },
  watermark: { kind: "ai", mode: "watermark", labels: ["visible mark", "ownership", "platform"], steps: ["Check output", "Crop carefully", "Respect rules"] },
  c2pa: { kind: "ai", mode: "c2pa", labels: ["content credential", "origin", "trust"], steps: ["Attach metadata", "Preserve file", "Verify later"] }
};

const modeAliases = {
  "full-shot": { kind: "shot", mode: "wide", labels: ["whole body", "floor space", "gesture"], steps: ["Show full subject", "Leave headroom", "Read body action"] },
  "medium-close-up": { kind: "shot", mode: "close", labels: ["face + shoulders", "expression", "clean crop"], steps: ["Crop shoulders", "Keep eyes sharp", "Show emotion"] },
  "two-shot": { kind: "shot", mode: "two-shot", labels: ["person A", "person B", "relationship"], steps: ["Frame both people", "Show distance", "Keep eyelines clear"] },
  "over-the-shoulder": { kind: "shot", mode: "ots", labels: ["near shoulder", "speaker", "conversation"], steps: ["Use shoulder layer", "Focus speaker", "Keep eye line"] },
  "pov-shot": { kind: "shot", mode: "pov", labels: ["viewer eyes", "hands/object", "experience"], steps: ["Place camera as person", "Show what they see", "Keep motion natural"] },
  cutaway: { kind: "shot", mode: "insert", labels: ["reaction detail", "context", "bridge"], steps: ["Leave main action", "Show useful detail", "Return smoothly"] },
  "reaction-shot": { kind: "shot", mode: "close", labels: ["listener", "reaction", "meaning"], steps: ["Cut to face", "Hold response", "Return to action"] },
  "master-shot": { kind: "shot", mode: "wide-place", labels: ["full scene", "all action", "coverage"], steps: ["Show whole setup", "Record full action", "Use as anchor"] },
  "reverse-shot": { kind: "shot", mode: "ots", labels: ["opposite view", "speaker B", "dialogue"], steps: ["Turn around", "Match eyeline", "Keep screen direction"] },
  "screen-direction": { kind: "editing", mode: "axis", labels: ["left to right", "same direction", "viewer map"], steps: ["Pick direction", "Keep it consistent", "Avoid confusion"] },
  "eyeline-match": { kind: "editing", mode: "eyeline", labels: ["look", "object", "answer shot"], steps: ["Show gaze", "Cut to object", "Match position"] },
  "shot-reverse-shot": { kind: "editing", mode: "dialogue", labels: ["speaker A", "speaker B", "rhythm"], steps: ["Set two sides", "Cut on response", "Keep eyelines"] },
  "ambient-wild-track": { kind: "editing", mode: "audio", labels: ["room tone", "clean bridge", "edit cover"], steps: ["Record ambience", "Layer under cuts", "Hide gaps"] },
  "motivated-camera": { kind: "movement", mode: "track", labels: ["reason", "move", "result"], steps: ["Find motivation", "Move with action", "End with purpose"] },
  "mise-en-scene": { kind: "composition", mode: "blocking", labels: ["set", "props", "meaning"], steps: ["Arrange space", "Choose props", "Make meaning visible"] },
  blocking: { kind: "composition", mode: "blocking", labels: ["positions", "movement", "story"], steps: ["Place people", "Plan movement", "Keep readable"] },
  "wide-angle-lens": { kind: "lens", mode: "wide-lens", labels: ["wide lens", "more space", "distortion"], steps: ["Use close space", "Watch faces", "Show environment"] },
  "standard-lens": { kind: "lens", mode: "standard", labels: ["natural view", "balanced depth", "everyday"], steps: ["Keep normal distance", "Use for clarity", "Avoid gimmicks"] },
  "telephoto-lens": { kind: "lens", mode: "telephoto", labels: ["compressed depth", "distant subject", "soft back"], steps: ["Step back", "Zoom in", "Compress background"] },
  "prime-lens": { kind: "lens", mode: "prime", labels: ["fixed lens", "move feet", "clean look"], steps: ["Pick focal length", "Move camera", "Keep quality"] },
  "zoom-lens": { kind: "lens", mode: "zoom", labels: ["variable lens", "quick reframing", "coverage"], steps: ["Set range", "Frame fast", "Avoid lazy zoom"] },
  "anamorphic-lens": { kind: "lens", mode: "anamorphic", labels: ["wide feel", "oval bokeh", "flare"], steps: ["Use wide frame", "Watch edges", "Add cinematic texture"] },
  "macro-shot": { kind: "shot", mode: "macro", labels: ["tiny subject", "texture", "focus"], steps: ["Move close", "Light detail", "Stabilize camera"] },
  parallax: { kind: "movement", mode: "parallax", labels: ["front moves fast", "back moves slow", "depth"], steps: ["Add layers", "Move sideways", "Show depth"] },
  aperture: { kind: "lens", mode: "aperture", labels: ["iris", "depth", "light"], steps: ["Open or close", "Check depth", "Balance exposure"] },
  "shutter-speed": { kind: "lens", mode: "shutter", labels: ["motion blur", "sharpness", "speed"], steps: ["Pick blur", "Match movement", "Avoid stutter"] },
  "shutter-angle": { kind: "lens", mode: "shutter", labels: ["180 degree", "cinema blur", "motion feel"], steps: ["Use 180 as base", "Adjust for style", "Watch blur"] },
  iso: { kind: "lens", mode: "iso", labels: ["sensor gain", "noise", "brightness"], steps: ["Start low", "Raise carefully", "Protect image"] },
  "frame-rate": { kind: "lens", mode: "framerate", labels: ["24 fps", "60 fps", "motion feel"], steps: ["Pick output fps", "Shoot for motion", "Use slow motion intentionally"] },
  "slow-motion": { kind: "lens", mode: "slowmo", labels: ["more frames", "slower action", "detail"], steps: ["Shoot high fps", "Slow down", "Use for impact"] },
  "time-lapse": { kind: "lens", mode: "timelapse", labels: ["few frames", "fast time", "change"], steps: ["Lock camera", "Capture intervals", "Show change"] },
  exposure: { kind: "lens", mode: "exposure", labels: ["too dark", "correct", "too bright"], steps: ["Check highlights", "Protect subject", "Balance light"] },
  "dynamic-range": { kind: "lens", mode: "range", labels: ["shadow detail", "highlight detail", "latitude"], steps: ["Expose carefully", "Avoid clipped sky", "Keep recoverable detail"] },
  "white-balance": { kind: "lighting", mode: "temperature", labels: ["neutral white", "warm light", "cool light"], steps: ["Set white", "Match source", "Avoid color drift"] },
  diffusion: { kind: "lighting", mode: "soft", labels: ["diffusion", "larger source", "gentle face"], steps: ["Add diffusion", "Soften shadows", "Keep direction"] },
  lut: { kind: "lens", mode: "grade", labels: ["input", "look", "output"], steps: ["Apply look", "Check skin", "Do not crush detail"] },
  "color-grading": { kind: "lens", mode: "grade", labels: ["balance", "mood", "final look"], steps: ["Fix exposure", "Set mood", "Match shots"] },
  "highlight-roll-off": { kind: "lens", mode: "range", labels: ["bright area", "soft roll-off", "film feel"], steps: ["Protect highlights", "Use soft light", "Avoid harsh clipping"] }
};

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sentence(value, max = 92) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).replace(/\s+\S*$/, "")}.`;
}

function visualFor(term) {
  return {
    ...categoryVisuals[term.category],
    ...(modeAliases[term.id] ?? {}),
    ...(specificVisuals[term.id] ?? {})
  };
}

function contentFor(term) {
  const visual = visualFor(term);
  const hook = sentence(term.shortDefinition, 88);
  const lesson = sentence(term.whyItMatters || term.whenToUse || visual.scene, 96);
  return {
    ...visual,
    id: term.id,
    name: term.name,
    hook,
    lesson,
    steps: visual.steps.slice(0, 3),
    labels: visual.labels.slice(0, 3)
  };
}

function run(label, command, commandArgs, cwd = repoRoot) {
  const result = spawnSync(command, commandArgs, { cwd, stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error(`${label} failed`);
  }
}

function mediaSize(filePath) {
  return existsSync(filePath) ? `${Math.round(statSync(filePath).size / 1024)}KB` : "missing";
}

function html(term) {
  const steps = term.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("");
  const labels = term.labels.map((label, index) => `<span class="scene-tag scene-tag-${index + 1}">${escapeHtml(label)}</span>`).join("");
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1280, height=720" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      * { box-sizing: border-box; }
      html, body { margin: 0; width: 1280px; height: 720px; overflow: hidden; background: #0D0D11; }
      body { font-family: Inter, Arial, sans-serif; color: #F8F5EF; }
      #root {
        position: relative;
        width: 1280px;
        height: 720px;
        overflow: hidden;
        background:
          radial-gradient(circle at 76% 18%, rgba(232, 109, 75, 0.22), transparent 34%),
          radial-gradient(circle at 17% 78%, rgba(199, 173, 133, 0.16), transparent 36%),
          linear-gradient(135deg, #0D0D11 0%, #17151A 49%, #211511 100%);
      }
      .grain {
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(rgba(248, 245, 239, 0.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(248, 245, 239, 0.025) 1px, transparent 1px);
        background-size: 56px 56px;
        opacity: 0.65;
      }
      .scene-content {
        position: relative;
        z-index: 2;
        width: 100%;
        height: 100%;
        padding: 52px 64px;
        display: grid;
        grid-template-columns: 390px 1fr;
        gap: 52px;
        align-items: center;
      }
      .copy { min-width: 0; display: flex; flex-direction: column; gap: 20px; }
      .eyebrow {
        width: max-content;
        border: 1px solid rgba(248, 245, 239, 0.16);
        border-radius: 999px;
        padding: 9px 15px;
        color: #E88A66;
        background: rgba(248, 245, 239, 0.07);
        font-size: 17px;
        font-weight: 850;
        text-transform: uppercase;
        letter-spacing: 2px;
      }
      h1 {
        margin: 0;
        font-family: "Space Grotesk", Inter, Arial, sans-serif;
        font-size: 66px;
        line-height: 0.96;
        letter-spacing: 0;
      }
      .hook {
        margin: 0;
        color: rgba(248, 245, 239, 0.78);
        font-size: 28px;
        line-height: 1.18;
        font-weight: 780;
      }
      .lesson {
        border-left: 7px solid #E4572E;
        padding: 13px 0 13px 20px;
        color: #F8F5EF;
        font-size: 23px;
        line-height: 1.25;
        font-weight: 850;
      }
      .steps {
        display: flex;
        gap: 10px;
        list-style: none;
        padding: 0;
        margin: 0;
        flex-wrap: wrap;
      }
      .steps li {
        border-radius: 13px;
        background: rgba(248, 245, 239, 0.1);
        border: 1px solid rgba(248, 245, 239, 0.14);
        color: #F8F5EF;
        padding: 10px 12px;
        font-size: 16px;
        font-weight: 850;
      }
      .stage {
        position: relative;
        width: 720px;
        height: 468px;
        overflow: hidden;
        border-radius: 30px;
        border: 1px solid rgba(248, 245, 239, 0.16);
        background:
          radial-gradient(circle at 68% 22%, rgba(232, 109, 75, 0.32), transparent 34%),
          linear-gradient(140deg, #17171B 0%, #2E2928 57%, #67301F 100%);
        box-shadow: 0 36px 90px rgba(0, 0, 0, 0.35);
      }
      .stage::before {
        content: "";
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(rgba(248, 245, 239, 0.055) 1px, transparent 1px),
          linear-gradient(90deg, rgba(248, 245, 239, 0.045) 1px, transparent 1px);
        background-size: 48px 48px;
        mask-image: linear-gradient(180deg, transparent, black 16%, black 84%, transparent);
      }
      .stage-title {
        position: absolute;
        left: 36px;
        top: 30px;
        z-index: 10;
        color: rgba(248, 245, 239, 0.74);
        font-size: 18px;
        font-weight: 900;
        letter-spacing: 3px;
        text-transform: uppercase;
      }
      .stage-pill {
        position: absolute;
        right: 32px;
        top: 28px;
        z-index: 10;
        border-radius: 999px;
        padding: 9px 13px;
        background: rgba(13, 13, 17, 0.72);
        border: 1px solid rgba(248, 245, 239, 0.14);
        color: #F8F5EF;
        font-size: 15px;
        font-weight: 900;
      }
      .video-frame {
        position: absolute;
        left: 70px;
        right: 70px;
        top: 104px;
        height: 256px;
        border-radius: 28px;
        border: 2px solid rgba(248, 245, 239, 0.24);
        background:
          radial-gradient(circle at 28% 42%, rgba(248, 245, 239, 0.14), transparent 22%),
          linear-gradient(105deg, rgba(248, 245, 239, 0.06), rgba(248, 245, 239, 0.02));
      }
      .set-floor {
        position: absolute;
        left: 42px;
        right: 42px;
        bottom: 56px;
        height: 105px;
        border-radius: 22px;
        background: linear-gradient(90deg, rgba(248, 245, 239, 0.07), rgba(232, 109, 75, 0.13));
      }
      .subject {
        position: absolute;
        z-index: 4;
        left: 330px;
        top: 198px;
        width: 86px;
        height: 140px;
        border-radius: 44px 44px 18px 18px;
        background: #F4D8C0;
        box-shadow: 0 22px 36px rgba(0, 0, 0, 0.28);
      }
      .subject::before {
        content: "";
        position: absolute;
        left: 50%;
        top: -55px;
        width: 62px;
        height: 62px;
        border-radius: 999px;
        background: #F4D8C0;
        transform: translateX(-50%);
      }
      .subject::after {
        content: "";
        position: absolute;
        left: 22px;
        top: -27px;
        width: 42px;
        height: 8px;
        border-radius: 999px;
        background: rgba(41, 25, 19, 0.38);
      }
      .product {
        position: absolute;
        z-index: 5;
        left: 384px;
        top: 249px;
        width: 112px;
        height: 78px;
        border-radius: 20px;
        background: #F8F5EF;
        border: 7px solid rgba(232, 109, 75, 0.78);
        box-shadow: 0 20px 34px rgba(0, 0, 0, 0.22);
      }
      .product::after {
        content: "";
        position: absolute;
        inset: 18px 26px;
        border-radius: 999px;
        border: 5px solid rgba(80, 48, 36, 0.34);
      }
      .background-prop {
        position: absolute;
        left: 112px;
        top: 168px;
        width: 134px;
        height: 164px;
        border-radius: 24px 24px 8px 8px;
        background: rgba(248, 245, 239, 0.1);
      }
      .foreground-prop {
        position: absolute;
        right: 110px;
        bottom: 84px;
        width: 118px;
        height: 76px;
        border-radius: 999px;
        background: rgba(248, 245, 239, 0.13);
        filter: blur(0.5px);
      }
      .camera {
        position: absolute;
        z-index: 8;
        left: 84px;
        bottom: 76px;
        width: 98px;
        height: 58px;
        border-radius: 16px;
        background: #101014;
        border: 1px solid rgba(248, 245, 239, 0.18);
      }
      .camera::before {
        content: "";
        position: absolute;
        right: -34px;
        top: 15px;
        width: 42px;
        height: 28px;
        border-radius: 10px;
        background: #101014;
      }
      .camera::after {
        content: "";
        position: absolute;
        left: 35px;
        top: 15px;
        width: 28px;
        height: 28px;
        border-radius: 999px;
        background: #E4572E;
        border: 6px solid #2A2527;
      }
      .frame-guide,
      .focus-plane,
      .thirds,
      .axis-line,
      .movement-path,
      .exposure-bars,
      .timeline,
      .prompt-panel,
      .light,
      .light-beam {
        position: absolute;
        z-index: 7;
        pointer-events: none;
      }
      .frame-guide {
        left: 194px;
        top: 126px;
        width: 346px;
        height: 230px;
        border-radius: 26px;
        border: 4px solid rgba(248, 245, 239, 0.55);
        box-shadow: 0 0 0 999px rgba(0, 0, 0, 0.1);
      }
      .focus-plane {
        left: 214px;
        top: 178px;
        width: 304px;
        height: 146px;
        border: 3px dashed rgba(248, 245, 239, 0.48);
        border-radius: 26px;
      }
      .thirds {
        left: 110px;
        top: 126px;
        width: 500px;
        height: 250px;
        background:
          linear-gradient(90deg, transparent 33%, rgba(248, 245, 239, 0.24) 33.3%, transparent 34%, transparent 66%, rgba(248, 245, 239, 0.24) 66.3%, transparent 67%),
          linear-gradient(transparent 33%, rgba(248, 245, 239, 0.24) 33.3%, transparent 34%, transparent 66%, rgba(248, 245, 239, 0.24) 66.3%, transparent 67%);
        border: 1px solid rgba(248, 245, 239, 0.18);
        border-radius: 24px;
        opacity: 0;
      }
      .axis-line,
      .movement-path {
        left: 112px;
        right: 112px;
        bottom: 150px;
        height: 5px;
        border-radius: 999px;
        background: rgba(248, 245, 239, 0.25);
        transform-origin: left center;
      }
      .movement-path::after {
        content: "";
        display: block;
        width: 48%;
        height: 100%;
        border-radius: inherit;
        background: #E4572E;
      }
      .axis-line {
        background: rgba(232, 109, 75, 0.72);
      }
      .light {
        width: 64px;
        height: 64px;
        border-radius: 999px;
        background: #F8F5EF;
        box-shadow: 0 0 36px rgba(248, 245, 239, 0.72);
      }
      .light-key { left: 134px; top: 128px; }
      .light-fill { right: 138px; top: 174px; opacity: 0.48; }
      .light-back { right: 256px; top: 100px; width: 48px; height: 48px; }
      .light-beam {
        left: 166px;
        top: 166px;
        width: 340px;
        height: 170px;
        background: linear-gradient(105deg, rgba(248, 245, 239, 0.28), transparent 72%);
        clip-path: polygon(0 20%, 100% 0, 92% 100%, 0 78%);
        opacity: 0;
      }
      .timeline {
        left: 76px;
        right: 76px;
        bottom: 70px;
        height: 86px;
        border-radius: 20px;
        background: rgba(13, 13, 17, 0.72);
        border: 1px solid rgba(248, 245, 239, 0.14);
        display: grid;
        grid-template-columns: 1fr 12px 1fr 1fr;
        gap: 10px;
        padding: 18px;
      }
      .timeline span {
        border-radius: 12px;
        background: rgba(248, 245, 239, 0.15);
      }
      .timeline span:nth-child(2) {
        background: #E4572E;
      }
      .prompt-panel {
        left: 82px;
        right: 82px;
        bottom: 58px;
        padding: 18px 20px;
        border-radius: 22px;
        background: rgba(13, 13, 17, 0.82);
        border: 1px solid rgba(248, 245, 239, 0.14);
        color: rgba(248, 245, 239, 0.86);
        font-size: 19px;
        line-height: 1.25;
        font-weight: 800;
      }
      .prompt-panel b {
        color: #E88A66;
      }
      .exposure-bars {
        right: 102px;
        top: 138px;
        width: 150px;
        display: grid;
        gap: 10px;
      }
      .exposure-bars span {
        display: block;
        height: 14px;
        border-radius: 999px;
        background: linear-gradient(90deg, #E4572E, rgba(248, 245, 239, 0.26));
      }
      .scene-tag {
        position: absolute;
        z-index: 12;
        border-radius: 999px;
        padding: 10px 14px;
        background: rgba(13, 13, 17, 0.78);
        border: 1px solid rgba(248, 245, 239, 0.16);
        color: #F8F5EF;
        font-size: 16px;
        font-weight: 950;
        letter-spacing: 1px;
        text-transform: uppercase;
      }
      .scene-tag-1 { left: 74px; top: 392px; }
      .scene-tag-2 { left: 292px; top: 82px; }
      .scene-tag-3 { right: 74px; bottom: 88px; }
      .caption {
        position: absolute;
        left: 54px;
        right: 54px;
        bottom: 28px;
        z-index: 12;
        border-radius: 22px;
        padding: 16px 22px;
        background: rgba(13, 13, 17, 0.86);
        color: rgba(248, 245, 239, 0.86);
        font-size: 22px;
        font-weight: 820;
      }
      .stage[data-kind="composition"] .thirds { opacity: 0.8; }
      .stage[data-kind="composition"] .focus-plane,
      .stage[data-kind="composition"] .timeline,
      .stage[data-kind="composition"] .prompt-panel,
      .stage[data-kind="composition"] .light,
      .stage[data-kind="composition"] .light-beam,
      .stage[data-kind="composition"] .exposure-bars { display: none; }

      .stage[data-kind="shot"] .timeline,
      .stage[data-kind="shot"] .prompt-panel,
      .stage[data-kind="shot"] .light,
      .stage[data-kind="shot"] .light-beam,
      .stage[data-kind="shot"] .exposure-bars,
      .stage[data-kind="shot"] .axis-line { display: none; }

      .stage[data-kind="angle"] .thirds,
      .stage[data-kind="angle"] .timeline,
      .stage[data-kind="angle"] .prompt-panel,
      .stage[data-kind="angle"] .light,
      .stage[data-kind="angle"] .light-beam,
      .stage[data-kind="angle"] .exposure-bars { display: none; }
      .stage[data-kind="angle"] .axis-line { transform: rotate(-12deg); transform-origin: center; }
      .stage[data-kind="angle"][data-mode="eye"] .axis-line { transform: rotate(0deg); }
      .stage[data-kind="angle"][data-mode="high"] .camera { top: 86px; bottom: auto; left: 110px; transform: rotate(16deg); }
      .stage[data-kind="angle"][data-mode="low"] .camera { bottom: 48px; left: 120px; transform: rotate(-16deg); }
      .stage[data-kind="angle"][data-mode="top"] .subject { width: 120px; height: 74px; border-radius: 999px; top: 214px; }
      .stage[data-kind="angle"][data-mode="worm"] .subject { transform: scale(1.18); top: 174px; }
      .stage[data-kind="angle"][data-mode="dutch"] .video-frame,
      .stage[data-kind="angle"][data-mode="dutch"] .frame-guide { transform: rotate(-8deg); }

      .stage[data-kind="movement"] .thirds,
      .stage[data-kind="movement"] .timeline,
      .stage[data-kind="movement"] .prompt-panel,
      .stage[data-kind="movement"] .light,
      .stage[data-kind="movement"] .light-beam,
      .stage[data-kind="movement"] .exposure-bars,
      .stage[data-kind="movement"] .axis-line { display: none; }
      .stage[data-kind="movement"] .camera { left: 96px; }
      .stage[data-kind="movement"][data-mode="orbit"] .movement-path {
        left: 270px;
        top: 172px;
        width: 190px;
        height: 130px;
        border: 5px dashed rgba(232, 109, 75, 0.7);
        border-radius: 999px;
        background: transparent;
      }
      .stage[data-kind="movement"][data-mode="orbit"] .movement-path::after { display: none; }
      .stage[data-kind="movement"][data-mode="static"] .movement-path::after { width: 0; }
      .stage[data-kind="movement"][data-mode="whip"] .movement-path::after { width: 86%; filter: blur(4px); }
      .stage[data-kind="movement"][data-mode="pedestal"] .movement-path {
        left: 150px;
        bottom: 104px;
        width: 5px;
        height: 200px;
      }
      .stage[data-kind="movement"][data-mode="pedestal"] .movement-path::after { width: 100%; height: 60%; }

      .stage[data-kind="lens"] .thirds,
      .stage[data-kind="lens"] .timeline,
      .stage[data-kind="lens"] .prompt-panel,
      .stage[data-kind="lens"] .light,
      .stage[data-kind="lens"] .light-beam,
      .stage[data-kind="lens"] .axis-line { display: none; }
      .stage[data-kind="lens"] .focus-plane { display: block; }
      .stage[data-kind="lens"] .exposure-bars { display: grid; }
      .stage[data-kind="lens"][data-mode="shallow"] .background-prop { filter: blur(8px); }
      .stage[data-kind="lens"][data-mode="deep"] .background-prop { filter: none; opacity: 0.9; }
      .stage[data-kind="lens"][data-mode="telephoto"] .video-frame { transform: scaleX(0.86); }
      .stage[data-kind="lens"][data-mode="wide-lens"] .video-frame { transform: scaleX(1.06); }

      .stage[data-kind="lighting"] .thirds,
      .stage[data-kind="lighting"] .timeline,
      .stage[data-kind="lighting"] .prompt-panel,
      .stage[data-kind="lighting"] .axis-line,
      .stage[data-kind="lighting"] .movement-path,
      .stage[data-kind="lighting"] .focus-plane,
      .stage[data-kind="lighting"] .exposure-bars { display: none; }
      .stage[data-kind="lighting"] .light,
      .stage[data-kind="lighting"] .light-beam { display: block; }
      .stage[data-kind="lighting"][data-mode="back"] .light-key { left: auto; right: 190px; top: 112px; }
      .stage[data-kind="lighting"][data-mode="silhouette"] .subject { background: #07070A; }
      .stage[data-kind="lighting"][data-mode="temperature"] .video-frame {
        background:
          linear-gradient(90deg, rgba(244, 137, 76, 0.24), rgba(105, 155, 255, 0.18)),
          linear-gradient(105deg, rgba(248, 245, 239, 0.06), rgba(248, 245, 239, 0.02));
      }

      .stage[data-kind="editing"] .thirds,
      .stage[data-kind="editing"] .prompt-panel,
      .stage[data-kind="editing"] .light,
      .stage[data-kind="editing"] .light-beam,
      .stage[data-kind="editing"] .exposure-bars,
      .stage[data-kind="editing"] .movement-path,
      .stage[data-kind="editing"] .focus-plane,
      .stage[data-kind="editing"] .axis-line { display: none; }
      .stage[data-kind="editing"] .timeline { display: grid; }
      .stage[data-kind="editing"] .camera { display: none; }

      .stage[data-kind="ai"] .thirds,
      .stage[data-kind="ai"] .timeline,
      .stage[data-kind="ai"] .light,
      .stage[data-kind="ai"] .light-beam,
      .stage[data-kind="ai"] .exposure-bars,
      .stage[data-kind="ai"] .axis-line,
      .stage[data-kind="ai"] .movement-path,
      .stage[data-kind="ai"] .focus-plane { display: none; }
      .stage[data-kind="ai"] .prompt-panel { display: block; }
      .stage[data-kind="ai"] .prompt-panel {
        left: 118px;
        right: 118px;
        bottom: 72px;
        text-align: center;
        font-size: 18px;
      }
      .stage[data-kind="ai"] .camera { display: none; }
      .stage[data-kind="ai"] .scene-tag-1 { left: 92px; top: 148px; }
      .stage[data-kind="ai"] .scene-tag-2 { left: 358px; top: 126px; }
      .stage[data-kind="ai"] .scene-tag-3 { right: 92px; bottom: 156px; }

      .stage[data-mode="macro"] .subject { left: 306px; top: 168px; width: 146px; height: 118px; border-radius: 32px; }
      .stage[data-mode="macro"] .subject::before { display: none; }
      .stage[data-mode="macro"] .product { left: 324px; top: 224px; transform: scale(1.12); }
      .stage[data-mode="two-shot"] .subject { left: 278px; }
      .stage[data-mode="two-shot"] .product { left: 420px; width: 86px; height: 132px; border-radius: 44px 44px 18px 18px; background: #DCC3AB; border: 0; }
      .stage[data-mode="ots"] .foreground-prop { width: 160px; height: 190px; right: 72px; bottom: 72px; border-radius: 68px 68px 28px 28px; }
      .stage[data-mode="wide-place"] .subject { transform: scale(0.58); top: 226px; }
      .stage[data-mode="wide-place"] .product { transform: scale(0.72); }
      .stage[data-mode="wide"] .frame-guide { left: 116px; width: 488px; }
      .stage[data-mode="close"] .frame-guide { left: 262px; width: 210px; height: 246px; }
      .stage[data-mode="insert"] .frame-guide { left: 306px; top: 196px; width: 210px; height: 150px; }
      .stage[data-mode="aspect"] .video-frame { width: 410px; left: 110px; }
      .stage[data-mode="aspect"] .frame-guide { left: 462px; width: 140px; height: 250px; }
      .stage[data-mode="lines"] .axis-line { display: block; transform: rotate(-16deg); }
      .stage[data-mode="space"] .subject { left: 488px; transform: scale(0.76); }
      .stage[data-mode="space"] .frame-guide { left: 96px; width: 520px; }
      .stage[data-mode="foreground"] .foreground-prop { transform: scale(1.65); filter: blur(2px); }
      .stage[data-mode="blocking"] .product { left: 198px; border-radius: 999px; width: 82px; height: 82px; }
      .stage[data-mode="rack"] .focus-plane { left: 126px; width: 240px; }
      .stage[data-mode="grade"] .video-frame { filter: saturate(1.3) contrast(1.08); }
      .stage[data-mode="silhouette"] .video-frame { background: radial-gradient(circle at 74% 34%, rgba(232, 109, 75, 0.55), transparent 34%), #19171A; }
      .stage[data-mode="fade"] .timeline span:nth-child(1) { background: #050507; }

      .wipe { position: absolute; inset: 0; background: #E4572E; transform: translateX(-101%); z-index: 30; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="6" data-width="1280" data-height="720">
      <div class="grain"></div>
      <div class="scene-content">
        <section class="copy">
          <div class="eyebrow">aiscreens glossary</div>
          <h1>${escapeHtml(term.name)}</h1>
          <p class="hook">${escapeHtml(term.hook)}</p>
          <div class="lesson">${escapeHtml(term.lesson)}</div>
          <ul class="steps">${steps}</ul>
        </section>
        <div class="stage" data-kind="${escapeHtml(term.kind)}" data-mode="${escapeHtml(term.mode || term.kind)}" data-layout-allow-overflow>
          <div class="stage-title">${escapeHtml(term.scene)}</div>
          <div class="stage-pill">${escapeHtml(term.kind)}</div>
          <div class="video-frame"></div>
          <div class="set-floor"></div>
          <div class="background-prop"></div>
          <div class="foreground-prop"></div>
          <div class="subject"></div>
          <div class="product"></div>
          <div class="frame-guide"></div>
          <div class="thirds"></div>
          <div class="focus-plane"></div>
          <div class="axis-line"></div>
          <div class="movement-path"></div>
          <div class="camera"></div>
          <div class="light light-key"></div>
          <div class="light light-fill"></div>
          <div class="light light-back"></div>
          <div class="light-beam"></div>
          <div class="exposure-bars"><span></span><span></span><span></span></div>
          <div class="timeline"><span></span><span></span><span></span><span></span></div>
          <div class="prompt-panel"><b>[subject]</b> + camera + light + one action + duration</div>
          ${labels}
          <div class="caption">${escapeHtml(term.hook)}</div>
        </div>
      </div>
      <div class="wipe"></div>
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
      tl.from(".eyebrow", { y: 24, opacity: 0, duration: 0.45 }, 0.12)
        .from("h1", { x: -44, opacity: 0, duration: 0.68, ease: "expo.out" }, 0.28)
        .from(".hook", { y: 24, opacity: 0, duration: 0.52 }, 0.62)
        .from(".stage", { scale: 0.94, y: 32, opacity: 0, duration: 0.68, ease: "back.out(1.25)" }, 0.48)
        .from(".video-frame", { scale: 1.04, opacity: 0, duration: 0.58 }, 0.98)
        .from(".set-floor, .background-prop, .foreground-prop", { y: 30, opacity: 0, stagger: 0.1, duration: 0.42 }, 1.08)
        .from(".subject", { y: 34, opacity: 0, duration: 0.48, ease: "back.out(1.45)" }, 1.44)
        .from(".product", { scale: 0.62, opacity: 0, duration: 0.46, ease: "back.out(1.7)" }, 1.72)
        .from(".camera", { x: -44, opacity: 0, duration: 0.44 }, 1.92)
        .from(".frame-guide, .focus-plane, .thirds, .axis-line", { scale: 0.88, opacity: 0, duration: 0.54 }, 2.18)
        .from(".movement-path", { scaleX: 0, opacity: 0, duration: 0.74, transformOrigin: "left center" }, 2.34)
        .from(".light, .light-beam", { scale: 0.65, opacity: 0, stagger: 0.1, duration: 0.46 }, 2.2)
        .from(".timeline span", { scaleX: 0, opacity: 0, stagger: 0.1, duration: 0.42, transformOrigin: "left center" }, 2.26)
        .from(".prompt-panel", { y: 32, opacity: 0, duration: 0.48 }, 2.36)
        .from(".exposure-bars span", { scaleX: 0, opacity: 0, stagger: 0.1, duration: 0.38, transformOrigin: "left center" }, 2.48)
        .from(".scene-tag", { y: 18, opacity: 0, stagger: 0.12, duration: 0.3, ease: "back.out(1.6)" }, 2.76)
        .to(".camera", { x: 38, duration: 0.78, ease: "sine.inOut" }, 3.06)
        .to(".subject", { x: 18, duration: 0.72, ease: "sine.inOut" }, 3.12)
        .to(".product", { x: -20, rotation: 2, duration: 0.72, ease: "sine.inOut" }, 3.14)
        .from(".caption", { y: 26, opacity: 0, duration: 0.38 }, 3.78)
        .from(".lesson", { x: -28, opacity: 0, duration: 0.4 }, 4.22)
        .from(".steps li", { y: 16, opacity: 0, stagger: 0.08, duration: 0.28, ease: "back.out(1.5)" }, 4.72)
        .to(".wipe", { x: "101%", duration: 0.48, ease: "power3.inOut" }, 5.5);

      const kind = "${escapeHtml(term.kind)}";
      const mode = "${escapeHtml(term.mode || term.kind)}";
      if (kind === "movement" && mode === "orbit") {
        tl.to(".camera", { x: 265, y: -70, rotation: 16, duration: 0.82, ease: "sine.inOut" }, 3.02);
      }
      if (kind === "angle" && (mode === "high" || mode === "low" || mode === "dutch")) {
        tl.to(".video-frame", { rotation: mode === "dutch" ? -7 : 0, duration: 0.62, ease: "sine.inOut" }, 2.96);
      }
      if (kind === "lighting") {
        tl.to(".light-beam", { opacity: 0.55, duration: 0.55 }, 2.92)
          .to(".subject", { filter: "brightness(1.12)", duration: 0.55 }, 3.1);
      }
      if (kind === "lens") {
        tl.to(".focus-plane", { x: mode === "rack" ? 150 : 24, duration: 0.7, ease: "sine.inOut" }, 2.98);
      }
      if (kind === "ai") {
        tl.to(".prompt-panel", { borderColor: "rgba(232, 109, 75, 0.75)", duration: 0.36 }, 3.08);
      }
      window.__timelines.main = tl;
    </script>
  </body>
</html>`;
}

function shouldInspectTerm(term, inspectedKinds) {
  if (skipInspect) return false;
  if (inspectAll) return true;
  if (selectedTerms.length <= 12) return true;
  if (!inspectedKinds.has(term.kind)) {
    inspectedKinds.add(term.kind);
    return true;
  }
  return false;
}

mkdirSync(projectDir, { recursive: true });
mkdirSync(renderDir, { recursive: true });
mkdirSync(videoOutDir, { recursive: true });
mkdirSync(imageOutDir, { recursive: true });
rmSync(renderDir, { recursive: true, force: true });
mkdirSync(renderDir, { recursive: true });

let selectedTerms = requestedTermIds.size > 0
  ? allTerms.filter((term) => requestedTermIds.has(term.id))
  : allTerms;

if (limit > 0) selectedTerms = selectedTerms.slice(0, limit);

if (selectedTerms.length === 0) {
  throw new Error(`No matching terms for ${Array.from(requestedTermIds).join(", ")}`);
}

const inspectedKinds = new Set();
for (const rawTerm of selectedTerms) {
  const term = contentFor(rawTerm);
  const finalVideo = join(videoOutDir, `${term.id}-preview.mp4`);
  const detailImage = join(imageOutDir, `${term.id}-detail.jpg`);
  const needsVideo = force || !existsSync(finalVideo);
  const needsImage = forceImages || !existsSync(detailImage);

  if (!needsVideo && !needsImage) {
    console.log(`OK ${term.id} already has video and image`);
    continue;
  }

  writeFileSync(join(projectDir, "index.html"), html(term), "utf8");
  run(`lint ${term.id}`, "npx", ["--yes", "hyperframes@0.6.4", "lint"], projectDir);
  if (shouldInspectTerm(term, inspectedKinds)) {
    run(`inspect ${term.id}`, "npx", ["--yes", "hyperframes@0.6.4", "inspect", "--samples", "8"], projectDir);
  }

  const rendered = join(renderDir, `${term.id}-hyperframes.mp4`);
  run(`render ${term.id}`, "npx", [
    "--yes",
    "hyperframes@0.6.4",
    "render",
    "--quality",
    "draft",
    "--fps",
    "18",
    "--workers",
    "1",
    "--output",
    rendered
  ], projectDir);

  if (needsVideo) {
    run(`encode preview ${term.id}`, "ffmpeg", [
      "-y",
      "-hide_banner",
      "-loglevel",
      "error",
      "-i",
      rendered,
      "-vf",
      "scale=480:270,format=yuv420p",
      "-c:v",
      "libx264",
      "-profile:v",
      "baseline",
      "-preset",
      "veryfast",
      "-crf",
      "31",
      "-movflags",
      "+faststart",
      "-an",
      finalVideo
    ]);
  }

  if (needsImage) {
    run(`extract detail ${term.id}`, "ffmpeg", [
      "-y",
      "-hide_banner",
      "-loglevel",
      "error",
      "-ss",
      "3.5",
      "-i",
      rendered,
      "-vf",
      "scale=1200:675",
      "-frames:v",
      "1",
      "-q:v",
      "5",
      detailImage
    ]);
  }

  console.log(`Rendered ${term.id}: video ${mediaSize(finalVideo)}, detail ${mediaSize(detailImage)}`);
}

console.log(`HyperFrames term media complete: ${resolve(videoOutDir)} / ${resolve(imageOutDir)}`);
