#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = process.cwd();
const args = new Set(process.argv.slice(2));
const apply = args.has("--apply");
const render = args.has("--render");
const forceRender = args.has("--force-render");
const skipBuild = args.has("--skip-build");
const requestedTerms = process.argv
  .slice(2)
  .filter((arg) => !arg.startsWith("--"));

function readJson(path) {
  return JSON.parse(readFileSync(join(repoRoot, path), "utf8"));
}

function run(label, command, commandArgs) {
  console.log(`\n==> ${label}`);
  const result = spawnSync(command, commandArgs, {
    cwd: repoRoot,
    stdio: "inherit",
    env: process.env
  });
  if (result.status !== 0) {
    throw new Error(`${label} failed`);
  }
}

function expandBatchTerms(batch, allTerms) {
  if (batch.terms?.includes("*")) return allTerms.map((term) => term.id);
  return batch.terms ?? [];
}

function plannedTerms(manifest, allTerms, assetKind) {
  const requested = new Set(requestedTerms);
  const termIds = [];
  for (const batch of manifest.batches) {
    if (batch.assetKind !== assetKind) continue;
    if (batch.status === "planned") continue;
    for (const termId of expandBatchTerms(batch, allTerms)) {
      if (requested.size > 0 && !requested.has(termId)) continue;
      const output = assetKind === "previewVideo"
        ? join(repoRoot, manifest.storage.localVideoDir, `${termId}-preview.mp4`)
        : join(repoRoot, manifest.storage.localImageDir, `${termId}-detail.jpg`);
      if (forceRender || !existsSync(output)) termIds.push(termId);
    }
  }
  return Array.from(new Set(termIds));
}

function validateManifest(manifest, terms) {
  const termIds = new Set(terms.map((term) => term.id));
  const errors = [];
  if (!Array.isArray(manifest.batches)) errors.push("data/mediaPipeline.json must include batches[]");
  for (const batch of manifest.batches ?? []) {
    if (!batch.id) errors.push("media batch missing id");
    if (!["image", "previewVideo"].includes(batch.assetKind)) {
      errors.push(`${batch.id}: assetKind must be image or previewVideo`);
    }
    if (!Array.isArray(batch.terms) || batch.terms.length === 0) {
      errors.push(`${batch.id}: terms[] must not be empty`);
    }
    for (const termId of batch.terms ?? []) {
      if (termId === "*") continue;
      if (!termIds.has(termId)) errors.push(`${batch.id}: unknown term "${termId}"`);
    }
  }
  if (errors.length > 0) {
    console.error("Media manifest validation failed:");
    for (const error of errors) console.error(`  - ${error}`);
    process.exit(1);
  }
}

const manifest = readJson("data/mediaPipeline.json");
const terms = readJson("data/terms.json");
validateManifest(manifest, terms);

console.log("aiscreens media pipeline");
console.log(`mode: ${apply ? "apply" : "check-only"}`);
console.log(`render missing previews: ${render ? "yes" : "no"}`);
console.log(`build: ${skipBuild ? "skipped" : "yes"}`);

if (render) {
  const renderTerms = Array.from(new Set([
    ...plannedTerms(manifest, terms, "previewVideo"),
    ...plannedTerms(manifest, terms, "image")
  ]));
  if (renderTerms.length > 0) {
    run("render HyperFrames term previews", "node", [
      "scripts/render-term-previews-hyperframes.mjs",
      "--skip-inspect",
      ...(forceRender ? ["--force"] : []),
      ...renderTerms
    ]);
  } else {
    console.log("\n==> render HyperFrames term previews");
    console.log("No preview videos need rendering.");
  }
}

run("prepare and validate media assets", "node", [
  "scripts/prepare-term-media.mjs",
  ...(apply ? ["--apply"] : [])
]);

run("validate content", "npm", ["run", "validate:content"]);

if (!skipBuild) {
  run("build site", "npm", ["run", "build"]);
}

console.log("\nMedia pipeline complete.");
