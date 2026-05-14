#!/usr/bin/env node
import { mkdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { spawn } from "node:child_process";

const url = process.env.LIGHTHOUSE_URL || process.argv[2] || "http://127.0.0.1:4322/";
const outDir = resolve(process.cwd(), ".lighthouse");
const jsonPath = resolve(outDir, "latest.json");

const scoreTargets = {
  performance: 0.9,
  accessibility: 0.95,
  "best-practices": 0.95,
  seo: 0.95,
};

const metricTargets = {
  "first-contentful-paint": 2000,
  "largest-contentful-paint": 3500,
  "total-blocking-time": 200,
  "cumulative-layout-shift": 0.1,
  "total-byte-weight": 600 * 1024,
};

function run(command, args) {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", rejectRun);
    child.on("close", (code) => {
      if (code === 0) {
        resolveRun({ stdout, stderr });
        return;
      }
      rejectRun(new Error(`${command} exited with ${code}\n${stdout}\n${stderr}`));
    });
  });
}

function formatScore(score) {
  return `${Math.round(score * 100)}`;
}

function formatMetric(id, value) {
  if (id === "cumulative-layout-shift") return String(value);
  if (id === "total-byte-weight") return `${Math.round(value / 1024)} KiB`;
  return `${Math.round(value)} ms`;
}

function getNumericAudit(audits, id) {
  const value = audits[id]?.numericValue;
  return typeof value === "number" ? value : null;
}

await mkdir(outDir, { recursive: true });

const lighthouseBin = process.platform === "win32" ? "lighthouse.cmd" : "lighthouse";
const args = [
  url,
  "--quiet",
  "--output=json",
  `--output-path=${jsonPath}`,
  "--only-categories=performance,accessibility,best-practices,seo",
  "--chrome-flags=--headless --no-sandbox --disable-dev-shm-usage",
];

try {
  await run(lighthouseBin, args);
} catch (error) {
  console.error(`Lighthouse could not audit ${url}.`);
  console.error("Build and start the production preview first:");
  console.error("  npm run build");
  console.error("  npm run preview -- --host 127.0.0.1 --port 4322");
  console.error(error.message);
  process.exit(1);
}

const report = JSON.parse(await readFile(jsonPath, "utf8"));
const { categories, audits } = report;
const failures = [];

console.log(`\nLighthouse audit for ${url}`);
console.log("Scores");

for (const [id, target] of Object.entries(scoreTargets)) {
  const score = categories[id]?.score ?? 0;
  const status = score >= target ? "pass" : "fail";
  console.log(`- ${id}: ${formatScore(score)} (${status}, target ${formatScore(target)})`);
  if (score < target) failures.push(`${id} score ${formatScore(score)} < ${formatScore(target)}`);
}

console.log("\nMetrics");

for (const [id, target] of Object.entries(metricTargets)) {
  const value = getNumericAudit(audits, id);
  if (value === null) continue;
  const status = value <= target ? "pass" : "fail";
  console.log(`- ${id}: ${formatMetric(id, value)} (${status}, target ${formatMetric(id, target)})`);
  if (value > target) failures.push(`${id} ${formatMetric(id, value)} > ${formatMetric(id, target)}`);
}

const contrastIssues = audits["color-contrast"]?.details?.items?.length ?? 0;
const consoleIssues = audits["errors-in-console"]?.details?.items?.length ?? 0;
const linkIssues = audits["link-name"]?.details?.items?.length ?? 0;

console.log("\nCommon regression checks");
console.log(`- color contrast items: ${contrastIssues}`);
console.log(`- console error items: ${consoleIssues}`);
console.log(`- unnamed link items: ${linkIssues}`);
console.log(`- JSON report: ${jsonPath}`);

if (failures.length > 0) {
  console.error("\nLighthouse budget failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("\nLighthouse budget passed.");
