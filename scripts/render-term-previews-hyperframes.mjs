import { mkdirSync, rmSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = process.cwd();
const projectDir = join(repoRoot, "media/hyperframes/term-previews");
const outDir = join(repoRoot, "public/videos/terms");
const renderDir = join(projectDir, "renders");
const requestedTermIds = new Set(process.argv.slice(2).filter((arg) => !arg.startsWith("--")));

const terms = [
  {
    id: "frame",
    name: "Frame",
    hook: "What the viewer can see.",
    lesson: "Choose the boundary first.",
    type: "frame",
    steps: ["Set the border", "Place the subject", "Remove distractions"]
  },
  {
    id: "shot",
    name: "Shot",
    hook: "One continuous camera view.",
    lesson: "Start recording. Hold one idea.",
    type: "shot",
    steps: ["Record starts", "Action happens", "Cut ends the shot"]
  },
  {
    id: "scene",
    name: "Scene",
    hook: "Shots that belong to one moment.",
    lesson: "Same place, same purpose.",
    type: "scene",
    steps: ["Wide", "Medium", "Close-up"]
  },
  {
    id: "sequence",
    name: "Sequence",
    hook: "Scenes arranged into a story beat.",
    lesson: "Build a clear beginning, middle, and payoff.",
    type: "sequence",
    steps: ["Setup", "Action", "Result"]
  },
  {
    id: "aspect-ratio",
    name: "Aspect Ratio",
    hook: "The shape of the video frame.",
    lesson: "Pick the shape for the platform.",
    type: "aspect",
    steps: ["16:9", "1:1", "9:16"]
  },
  {
    id: "establishing-shot",
    name: "Establishing Shot",
    hook: "Show where the story happens.",
    lesson: "Let the place read before the detail.",
    type: "establishing",
    steps: ["Start wide", "Place the subject", "Hold for context"]
  },
  {
    id: "wide-shot",
    name: "Wide Shot",
    hook: "Subject plus meaningful space.",
    lesson: "Show the whole subject and their world.",
    type: "wide",
    steps: ["Full body", "Useful background", "Readable action"]
  },
  {
    id: "medium-shot",
    name: "Medium Shot",
    hook: "Gesture and expression together.",
    lesson: "Frame the action around the torso.",
    type: "medium",
    steps: ["Comfortable crop", "Hands visible", "Action clear"]
  },
  {
    id: "close-up",
    name: "Close-Up",
    hook: "Emotion or detail fills the frame.",
    lesson: "Remove distractions and focus attention.",
    type: "close",
    steps: ["Move closer", "Simplify background", "Focus on feeling"]
  },
  {
    id: "insert-shot",
    name: "Insert Shot",
    hook: "A small action that matters.",
    lesson: "Cut to the object that explains the moment.",
    type: "insert",
    steps: ["Pick the object", "Show the action", "Return to scene"]
  }
];

function run(command, args, cwd = repoRoot) {
  const result = spawnSync(command, args, { cwd, stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed`);
  }
}

function diagramMarkup(term) {
  if (term.type === "frame") {
    return `
      <div class="stage frame-stage">
        <div class="viewfinder"></div>
        <div class="subject"></div>
        <div class="noise noise-a"></div>
        <div class="noise noise-b"></div>
        <div class="guide guide-x"></div>
        <div class="guide guide-y"></div>
      </div>`;
  }
  if (term.type === "shot") {
    return `
      <div class="stage shot-stage">
        <div class="camera-body"><div class="lens"></div><div class="rec-dot"></div></div>
        <div class="shot-window"><div class="actor"></div><div class="path"></div></div>
        <div class="record-line"><span></span></div>
      </div>`;
  }
  if (term.type === "scene") {
    return `
      <div class="stage scene-stage">
        <div class="mini-shot wide"><span>Wide</span></div>
        <div class="mini-shot medium"><span>Medium</span></div>
        <div class="mini-shot close"><span>Close</span></div>
        <div class="scene-band">one place + one purpose</div>
      </div>`;
  }
  if (term.type === "sequence") {
    return `
      <div class="stage sequence-stage">
        <div class="beat beat-a"><span>Setup</span></div>
        <div class="beat beat-b"><span>Action</span></div>
        <div class="beat beat-c"><span>Payoff</span></div>
        <div class="connector connector-a"></div>
        <div class="connector connector-b"></div>
      </div>`;
  }
  if (term.type === "establishing") {
    return `
      <div class="stage live-shot-stage establishing-stage" data-layout-allow-overflow>
        <div class="sky"></div>
        <div class="sun"></div>
        <div class="building building-a"></div>
        <div class="building building-b"></div>
        <div class="ground" data-layout-allow-overflow></div>
        <div class="subject-person far-person"></div>
        <div class="camera-crop wide-crop"></div>
        <div class="focus-target place-target" data-layout-ignore></div>
      </div>`;
  }
  if (term.type === "wide") {
    return `
      <div class="stage live-shot-stage wide-stage" data-layout-allow-overflow>
        <div class="set-wall"></div>
        <div class="prop prop-left"></div>
        <div class="prop prop-right"></div>
        <div class="subject-person full-person"></div>
        <div class="camera-crop wide-crop"></div>
        <div class="focus-target subject-target" data-layout-ignore></div>
      </div>`;
  }
  if (term.type === "medium") {
    return `
      <div class="stage live-shot-stage medium-stage" data-layout-allow-overflow>
        <div class="set-wall"></div>
        <div class="table"></div>
        <div class="subject-person torso-person"></div>
        <div class="held-item"></div>
        <div class="camera-crop medium-crop"></div>
        <div class="crop-line top-crop"></div>
        <div class="crop-line bottom-crop"></div>
      </div>`;
  }
  if (term.type === "close") {
    return `
      <div class="stage live-shot-stage close-stage" data-layout-allow-overflow>
        <div class="soft-bg"></div>
        <div class="face"></div>
        <div class="eye eye-left"></div>
        <div class="eye eye-right"></div>
        <div class="emotion-mark"></div>
        <div class="camera-crop close-crop"></div>
        <div class="focus-target face-target" data-layout-ignore></div>
      </div>`;
  }
  if (term.type === "insert") {
    return `
      <div class="stage live-shot-stage insert-stage" data-layout-allow-overflow>
        <div class="desk"></div>
        <div class="hand hand-a"></div>
        <div class="hand hand-b"></div>
        <div class="object-card"></div>
        <div class="object-glow"></div>
        <div class="camera-crop insert-crop"></div>
        <div class="focus-target object-target" data-layout-ignore></div>
      </div>`;
  }
  return `
    <div class="stage aspect-stage">
      <div class="ratio ratio-wide"><span>16:9</span></div>
      <div class="ratio ratio-square"><span>1:1</span></div>
      <div class="ratio ratio-vertical"><span>9:16</span></div>
    </div>`;
}

function html(term) {
  const stepItems = term.steps.map((step) => `<li>${step}</li>`).join("");
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1280, height=720" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      * { box-sizing: border-box; }
      html, body { margin: 0; width: 1280px; height: 720px; overflow: hidden; background: #F8F5EF; }
      body { font-family: Inter, Arial, sans-serif; color: #171717; }
      #root {
        position: relative;
        width: 1280px;
        height: 720px;
        overflow: hidden;
        background:
          radial-gradient(circle at 12% 10%, rgba(228, 87, 46, 0.13), transparent 28%),
          linear-gradient(180deg, #F8F5EF 0%, #EFE8DC 100%);
      }
      .scene-content {
        width: 100%;
        height: 100%;
        padding: 58px 72px;
        display: grid;
        grid-template-columns: 405px 1fr;
        gap: 54px;
        align-items: center;
      }
      .copy { display: flex; flex-direction: column; gap: 22px; }
      .eyebrow {
        width: max-content;
        border: 1px solid rgba(23, 23, 23, 0.14);
        border-radius: 999px;
        padding: 8px 15px;
        color: #7A7268;
        font-size: 18px;
        font-weight: 800;
        text-transform: uppercase;
      }
      h1 {
        margin: 0;
        font-family: "Space Grotesk", Arial, sans-serif;
        font-size: 78px;
        line-height: 0.95;
        letter-spacing: 0;
      }
      .hook {
        margin: 0;
        max-width: 390px;
        color: #4F4A45;
        font-size: 30px;
        line-height: 1.2;
        font-weight: 700;
      }
      .lesson {
        border-left: 8px solid #E4572E;
        padding: 15px 0 15px 22px;
        color: #171717;
        font-size: 25px;
        line-height: 1.25;
        font-weight: 850;
      }
      .steps {
        display: flex;
        gap: 12px;
        list-style: none;
        padding: 0;
        margin: 0;
        flex-wrap: wrap;
      }
      .steps li {
        border-radius: 12px;
        background: #171717;
        color: #F8F5EF;
        padding: 10px 13px;
        font-size: 17px;
        font-weight: 800;
      }
      .stage {
        position: relative;
        width: 700px;
        height: 462px;
        border-radius: 28px;
        background: rgba(255, 255, 255, 0.64);
        border: 1px solid rgba(23, 23, 23, 0.11);
        box-shadow: 0 28px 70px rgba(23, 23, 23, 0.14);
        overflow: hidden;
      }
      .stage::before {
        content: "";
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(rgba(23, 23, 23, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(23, 23, 23, 0.05) 1px, transparent 1px);
        background-size: 56px 56px;
      }
      .viewfinder { position: absolute; inset: 66px 82px; border: 8px solid #E4572E; border-radius: 18px; }
      .subject { position: absolute; width: 118px; height: 206px; left: 292px; top: 151px; border-radius: 58px 58px 24px 24px; background: #171717; }
      .noise { position: absolute; border-radius: 12px; background: rgba(122, 114, 104, 0.28); }
      .noise-a { width: 94px; height: 72px; left: 108px; top: 260px; }
      .noise-b { width: 128px; height: 54px; right: 112px; top: 112px; }
      .guide { position: absolute; background: rgba(228, 87, 46, 0.5); }
      .guide-x { left: 82px; right: 82px; top: 231px; height: 3px; }
      .guide-y { top: 66px; bottom: 66px; left: 350px; width: 3px; }
      .camera-body { position: absolute; left: 70px; top: 146px; width: 190px; height: 126px; border-radius: 22px; background: #171717; }
      .lens { position: absolute; width: 86px; height: 86px; border-radius: 999px; background: #E4572E; left: 52px; top: 20px; border: 12px solid #F8F5EF; }
      .rec-dot { position: absolute; width: 22px; height: 22px; border-radius: 999px; background: #E4572E; right: 20px; top: 18px; }
      .shot-window { position: absolute; right: 70px; top: 92px; width: 345px; height: 228px; border: 6px solid #E4572E; border-radius: 18px; overflow: hidden; }
      .actor { position: absolute; left: 52px; bottom: 38px; width: 62px; height: 118px; border-radius: 32px 32px 14px 14px; background: #171717; }
      .path { position: absolute; left: 72px; right: 46px; bottom: 47px; height: 4px; background: #E4572E; transform-origin: left center; }
      .record-line { position: absolute; left: 82px; right: 82px; bottom: 74px; height: 14px; border-radius: 999px; background: rgba(23,23,23,0.13); overflow: hidden; }
      .record-line span { display: block; width: 100%; height: 100%; background: #E4572E; transform-origin: left center; }
      .mini-shot { position: absolute; width: 220px; height: 150px; border-radius: 18px; border: 6px solid #171717; background: #F8F5EF; display: grid; place-items: end start; padding: 16px; font-size: 23px; font-weight: 900; }
      .wide { left: 60px; top: 88px; }
      .medium { left: 240px; top: 156px; border-color: #E4572E; }
      .close { left: 420px; top: 224px; }
      .scene-band { position: absolute; left: 120px; right: 120px; bottom: 68px; border-radius: 18px; background: #171717; color: #F8F5EF; padding: 18px 24px; text-align: center; font-size: 26px; font-weight: 900; }
      .beat { position: absolute; top: 155px; width: 160px; height: 160px; border-radius: 26px; background: #F8F5EF; border: 6px solid #171717; display: grid; place-items: center; font-size: 25px; font-weight: 900; z-index: 2; }
      .beat-a { left: 70px; }
      .beat-b { left: 270px; border-color: #E4572E; }
      .beat-c { left: 470px; }
      .connector { position: absolute; top: 230px; width: 120px; height: 8px; background: #E4572E; transform-origin: left center; }
      .connector-a { left: 195px; }
      .connector-b { left: 395px; }
      .ratio { position: absolute; display: grid; place-items: center; border: 7px solid #171717; border-radius: 18px; background: #F8F5EF; font-size: 28px; font-weight: 950; }
      .ratio-wide { width: 320px; height: 180px; left: 62px; top: 70px; border-color: #E4572E; }
      .ratio-square { width: 210px; height: 210px; left: 420px; top: 126px; }
      .ratio-vertical { width: 150px; height: 268px; left: 248px; top: 166px; }
      .live-shot-stage { background: linear-gradient(180deg, #FBF8F1 0%, #EDE4D8 100%); }
      .live-shot-stage::after {
        content: "";
        position: absolute;
        inset: 22px;
        border-radius: 20px;
        border: 2px solid rgba(23, 23, 23, 0.08);
        pointer-events: none;
      }
      .sky { position: absolute; inset: 0 0 170px; background: linear-gradient(180deg, #E7D8C6, #F8F5EF); }
      .sun { position: absolute; width: 62px; height: 62px; right: 104px; top: 72px; border-radius: 999px; background: #E4572E; opacity: 0.78; }
      .ground { position: absolute; left: 0; right: 0; bottom: 0; height: 178px; background: #D9CDBE; }
      .building { position: absolute; bottom: 154px; border-radius: 14px 14px 0 0; background: #7A7268; opacity: 0.78; }
      .building-a { left: 112px; width: 132px; height: 172px; }
      .building-b { right: 134px; width: 178px; height: 218px; opacity: 0.58; }
      .set-wall { position: absolute; inset: 0; background: linear-gradient(110deg, rgba(122, 114, 104, 0.16), rgba(255,255,255,0.48)); }
      .prop { position: absolute; bottom: 74px; border-radius: 18px; background: rgba(122, 114, 104, 0.32); }
      .prop-left { left: 78px; width: 96px; height: 118px; }
      .prop-right { right: 86px; width: 132px; height: 84px; }
      .subject-person { position: absolute; background: #171717; z-index: 2; }
      .subject-person::before {
        content: "";
        position: absolute;
        left: 50%;
        border-radius: 999px;
        background: #171717;
        transform: translateX(-50%);
      }
      .far-person { left: 324px; bottom: 132px; width: 38px; height: 86px; border-radius: 18px 18px 9px 9px; }
      .far-person::before { width: 31px; height: 31px; top: -32px; }
      .full-person { left: 302px; bottom: 82px; width: 86px; height: 214px; border-radius: 42px 42px 18px 18px; }
      .full-person::before { width: 68px; height: 68px; top: -70px; }
      .torso-person { left: 286px; bottom: 66px; width: 126px; height: 230px; border-radius: 62px 62px 28px 28px; }
      .torso-person::before { width: 92px; height: 92px; top: -86px; }
      .table { position: absolute; left: 138px; right: 138px; bottom: 62px; height: 76px; border-radius: 20px; background: #7A7268; opacity: 0.44; }
      .held-item { position: absolute; left: 414px; bottom: 168px; width: 74px; height: 48px; border-radius: 10px; background: #E4572E; z-index: 4; }
      .face { position: absolute; left: 238px; top: 82px; width: 226px; height: 286px; border-radius: 104px 104px 74px 74px; background: #171717; z-index: 2; }
      .soft-bg { position: absolute; inset: 0; background: radial-gradient(circle at 62% 48%, rgba(228,87,46,0.18), transparent 34%); }
      .eye { position: absolute; top: 190px; width: 35px; height: 13px; border-radius: 999px; background: #F8F5EF; z-index: 3; }
      .eye-left { left: 304px; }
      .eye-right { left: 370px; }
      .emotion-mark { position: absolute; left: 332px; top: 265px; width: 40px; height: 10px; border-radius: 999px; background: #E4572E; z-index: 3; }
      .desk { position: absolute; inset: 178px 70px 70px; border-radius: 28px; background: #D6C7B6; }
      .hand { position: absolute; width: 166px; height: 62px; border-radius: 999px; background: #171717; z-index: 3; }
      .hand-a { left: 138px; top: 232px; transform: rotate(10deg); }
      .hand-b { right: 138px; top: 278px; transform: rotate(-12deg); }
      .object-card { position: absolute; left: 290px; top: 232px; width: 124px; height: 88px; border-radius: 16px; background: #F8F5EF; border: 8px solid #E4572E; z-index: 4; }
      .object-glow { position: absolute; left: 268px; top: 210px; width: 168px; height: 132px; border-radius: 26px; border: 5px solid rgba(228,87,46,0.46); z-index: 2; }
      .camera-crop { position: absolute; z-index: 5; border: 7px solid #E4572E; border-radius: 20px; box-shadow: 0 0 0 999px rgba(23, 23, 23, 0.10); }
      .wide-crop { inset: 48px 58px; }
      .medium-crop { left: 212px; top: 64px; width: 286px; height: 340px; }
      .close-crop { left: 196px; top: 54px; width: 310px; height: 354px; }
      .insert-crop { left: 226px; top: 176px; width: 248px; height: 202px; }
      .crop-line { position: absolute; left: 212px; width: 286px; height: 5px; background: #E4572E; z-index: 6; }
      .top-crop { top: 64px; }
      .bottom-crop { top: 399px; }
      .focus-target {
        position: absolute;
        z-index: 7;
        width: 138px;
        height: 56px;
        border-radius: 18px;
        border: 5px solid #171717;
        background: rgba(248, 245, 239, 0.16);
      }
      .place-target { left: 82px; bottom: 72px; }
      .subject-target { left: 276px; top: 58px; width: 142px; height: 318px; }
      .face-target { left: 410px; top: 86px; width: 104px; height: 82px; }
      .object-target { left: 392px; top: 166px; width: 178px; height: 74px; }
      .wipe { position: absolute; inset: 0; background: #E4572E; transform: translateX(-101%); z-index: 10; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="8" data-width="1280" data-height="720">
      <div class="scene-content">
        <section class="copy">
          <div class="eyebrow">aiscreens term preview</div>
          <h1>${term.name}</h1>
          <p class="hook">${term.hook}</p>
          <div class="lesson">${term.lesson}</div>
          <ul class="steps">${stepItems}</ul>
        </section>
        ${diagramMarkup(term)}
      </div>
      <div class="wipe"></div>
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
      tl.from(".eyebrow", { y: 24, opacity: 0, duration: 0.55, ease: "power2.out" }, 0.2)
        .from("h1", { x: -44, opacity: 0, duration: 0.7, ease: "expo.out" }, 0.38)
        .from(".hook", { y: 28, opacity: 0, duration: 0.6, ease: "circ.out" }, 0.72)
        .from(".stage", { scale: 0.94, y: 34, opacity: 0, duration: 0.72, ease: "back.out(1.3)" }, 0.58)
        .from(".lesson", { x: -30, opacity: 0, duration: 0.55, ease: "power3.out" }, 3.5)
        .from(".steps li", { y: 18, opacity: 0, stagger: 0.12, duration: 0.35, ease: "back.out(1.7)" }, 5.1)
        .to(".wipe", { x: "101%", duration: 0.62, ease: "power3.inOut" }, 7.35);

      if ("${term.type}" === "frame") {
        tl.from(".viewfinder", { scale: 1.12, opacity: 0, duration: 0.7, ease: "power3.out" }, 1.25)
          .from(".subject", { y: 36, opacity: 0, duration: 0.55, ease: "back.out(1.4)" }, 2.0)
          .from(".noise", { opacity: 0, scale: 0.7, stagger: 0.12, duration: 0.42, ease: "power2.out" }, 2.25)
          .from(".guide", { scaleX: 0, scaleY: 0, stagger: 0.16, duration: 0.5, ease: "power2.inOut" }, 3.0);
      }
      if ("${term.type}" === "shot") {
        tl.from(".camera-body", { x: -60, opacity: 0, duration: 0.62, ease: "expo.out" }, 1.2)
          .from(".shot-window", { x: 52, opacity: 0, duration: 0.58, ease: "power3.out" }, 1.6)
          .from(".actor", { x: -60, duration: 1.6, ease: "sine.inOut" }, 2.1)
          .from(".path", { scaleX: 0, duration: 1.25, ease: "power1.inOut" }, 2.2)
          .from(".record-line span", { scaleX: 0, duration: 3.0, ease: "none" }, 2.0);
      }
      if ("${term.type}" === "scene") {
        tl.from(".mini-shot", { y: 34, opacity: 0, stagger: 0.25, duration: 0.55, ease: "back.out(1.4)" }, 1.25)
          .from(".scene-band", { y: 28, opacity: 0, duration: 0.55, ease: "power3.out" }, 3.25);
      }
      if ("${term.type}" === "sequence") {
        tl.from(".beat", { scale: 0.82, opacity: 0, stagger: 0.34, duration: 0.55, ease: "back.out(1.5)" }, 1.25)
          .from(".connector", { scaleX: 0, stagger: 0.32, duration: 0.5, ease: "power2.inOut" }, 2.2);
      }
      if ("${term.type}" === "aspect") {
        tl.from(".ratio-wide", { x: -70, opacity: 0, duration: 0.55, ease: "expo.out" }, 1.2)
          .from(".ratio-square", { scale: 0.7, opacity: 0, duration: 0.55, ease: "back.out(1.5)" }, 2.0)
          .from(".ratio-vertical", { y: 70, opacity: 0, duration: 0.55, ease: "circ.out" }, 2.8)
          .to(".ratio", { borderColor: "#E4572E", stagger: 0.16, duration: 0.36, ease: "power2.out" }, 4.2);
      }
      if ("${term.type}" === "establishing") {
        tl.from(".building", { y: 80, opacity: 0, stagger: 0.16, duration: 0.6, ease: "power3.out" }, 1.1)
          .from(".ground", { y: 60, opacity: 0, duration: 0.5, ease: "power2.out" }, 1.25)
          .from(".far-person", { scale: 0.5, opacity: 0, duration: 0.48, ease: "back.out(1.8)" }, 2.0)
          .from(".camera-crop", { scale: 1.22, opacity: 0, duration: 0.8, ease: "power3.out" }, 2.55)
          .from(".focus-target", { x: -28, opacity: 0, duration: 0.45, ease: "power2.out" }, 3.45);
      }
      if ("${term.type}" === "wide") {
        tl.from(".prop", { y: 54, opacity: 0, stagger: 0.14, duration: 0.5, ease: "power2.out" }, 1.1)
          .from(".full-person", { y: 44, opacity: 0, duration: 0.58, ease: "back.out(1.5)" }, 1.75)
          .from(".camera-crop", { scale: 0.86, opacity: 0, duration: 0.65, ease: "power3.out" }, 2.45)
          .from(".focus-target", { y: -20, opacity: 0, duration: 0.45, ease: "power2.out" }, 3.35)
          .to(".full-person", { x: 34, duration: 1.4, ease: "sine.inOut" }, 3.9);
      }
      if ("${term.type}" === "medium") {
        tl.from(".table", { y: 50, opacity: 0, duration: 0.5, ease: "power2.out" }, 1.1)
          .from(".torso-person", { y: 42, opacity: 0, duration: 0.58, ease: "back.out(1.4)" }, 1.65)
          .from(".held-item", { scale: 0.5, opacity: 0, duration: 0.5, ease: "back.out(1.8)" }, 2.28)
          .from(".camera-crop", { scaleY: 0.8, opacity: 0, duration: 0.62, ease: "power3.out" }, 2.9)
          .from(".crop-line", { scaleX: 0, stagger: 0.12, duration: 0.36, ease: "power2.inOut" }, 3.35);
      }
      if ("${term.type}" === "close") {
        tl.from(".face", { scale: 0.78, y: 28, opacity: 0, duration: 0.7, ease: "back.out(1.2)" }, 1.15)
          .from(".eye", { scaleX: 0, stagger: 0.08, duration: 0.35, ease: "power2.out" }, 2.02)
          .from(".camera-crop", { scale: 1.18, opacity: 0, duration: 0.64, ease: "power3.out" }, 2.55)
          .from(".emotion-mark", { scaleX: 0, duration: 0.42, ease: "power2.out" }, 3.05)
          .from(".focus-target", { x: 22, opacity: 0, duration: 0.45, ease: "power2.out" }, 3.42);
      }
      if ("${term.type}" === "insert") {
        tl.from(".desk", { y: 48, opacity: 0, duration: 0.48, ease: "power2.out" }, 1.1)
          .from(".object-card", { scale: 0.62, opacity: 0, duration: 0.46, ease: "back.out(1.8)" }, 1.75)
          .from(".hand-a", { x: -80, opacity: 0, duration: 0.6, ease: "power3.out" }, 2.1)
          .from(".hand-b", { x: 80, opacity: 0, duration: 0.6, ease: "power3.out" }, 2.28)
          .from(".camera-crop", { scale: 1.2, opacity: 0, duration: 0.6, ease: "power3.out" }, 3.0)
          .from(".object-glow", { scale: 0.75, opacity: 0, duration: 0.48, ease: "power2.out" }, 3.4)
          .from(".focus-target", { y: -22, opacity: 0, duration: 0.42, ease: "power2.out" }, 3.78);
      }
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;
}

mkdirSync(outDir, { recursive: true });
mkdirSync(renderDir, { recursive: true });
rmSync(renderDir, { recursive: true, force: true });
mkdirSync(renderDir, { recursive: true });

const selectedTerms = requestedTermIds.size > 0
  ? terms.filter((term) => requestedTermIds.has(term.id))
  : terms;

if (selectedTerms.length === 0) {
  throw new Error(`No matching terms for ${Array.from(requestedTermIds).join(", ")}`);
}

for (const term of selectedTerms) {
  await writeFile(join(projectDir, "index.html"), html(term), "utf8");
  run("npx", ["--yes", "hyperframes@0.6.4", "lint"], projectDir);
  run("npx", ["--yes", "hyperframes@0.6.4", "inspect", "--samples", "8"], projectDir);
  const rendered = join(renderDir, `${term.id}-hyperframes.mp4`);
  run("npx", ["--yes", "hyperframes@0.6.4", "render", "--quality", "draft", "--fps", "24", "--workers", "1", "--output", rendered], projectDir);
  const final = join(outDir, `${term.id}-preview.mp4`);
  run("ffmpeg", [
    "-y",
    "-hide_banner",
    "-loglevel",
    "error",
    "-i",
    rendered,
    "-vf",
    "scale=640:360,format=yuv420p",
    "-c:v",
    "libx264",
    "-profile:v",
    "baseline",
    "-preset",
    "veryfast",
    "-crf",
    "30",
    "-movflags",
    "+faststart",
    "-an",
    final
  ]);
  console.log(`Rendered ${resolve(final)}`);
}
