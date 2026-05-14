import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const apply = process.argv.includes("--apply");
const repoRoot = process.cwd();
const manifest = JSON.parse(readFileSync(join(repoRoot, "data/mediaPipeline.json"), "utf8"));
const termsPath = join(repoRoot, "data/terms.json");
const terms = JSON.parse(readFileSync(termsPath, "utf8"));

const rights = {
  licence: "CC BY 4.0",
  holder: "aiscreens",
  attribution: "Generated for aiscreens educational term media",
  iOwnOrLicensed: true,
  subjectsConsented: true,
  noPII: true,
  consentFlags: ["no-personal-likeness", "synthetic-educational-media"]
};

const hashFile = (filePath) => createHash("sha256").update(readFileSync(filePath)).digest("hex");
const fileKb = (filePath) => Math.round(statSync(filePath).size / 1024);
const allTermIds = terms.map((term) => term.id);

function expandBatchTerms(batch) {
  if (batch.terms?.includes("*")) return allTermIds;
  return batch.terms ?? [];
}

function ensureCardVariant(termId) {
  const detailPath = join(repoRoot, manifest.storage.localImageDir, `${termId}-detail.jpg`);
  const cardPath = join(repoRoot, manifest.storage.localImageDir, `${termId}-card.jpg`);
  if (!existsSync(detailPath)) return { ok: false, reason: "missing detail image" };
  if (!apply) return { ok: existsSync(cardPath), reason: existsSync(cardPath) ? "exists" : "missing card image" };
  if (existsSync(cardPath)) return { ok: true, reason: "preserved existing card image" };

  const resize = spawnSync("sips", ["-Z", String(manifest.qualityTargets.cardImage.width), detailPath, "--out", cardPath], { stdio: "pipe" });
  if (resize.status !== 0) return { ok: false, reason: resize.stderr.toString().trim() || "sips resize failed" };
  const compress = spawnSync("sips", ["-s", "formatOptions", "65", cardPath, "--out", cardPath], { stdio: "pipe" });
  if (compress.status !== 0) return { ok: false, reason: compress.stderr.toString().trim() || "sips compression failed" };
  return { ok: true, reason: "created" };
}

function upsertAsset(term, asset) {
  term.assets = Array.isArray(term.assets) ? term.assets : [];
  const index = term.assets.findIndex((item) => item.type === asset.type && item.url === asset.url);
  if (index >= 0) {
    term.assets[index] = { ...term.assets[index], ...asset };
  } else if (asset.type === "image") {
    term.assets.unshift(asset);
  } else {
    term.assets.push(asset);
  }
}

function underBudget(kind, kb) {
  const target =
    kind === "cardImage"
      ? manifest.qualityTargets.cardImage.maxKb
      : kind === "detailImage"
        ? manifest.qualityTargets.detailImage.maxKb
        : manifest.qualityTargets.previewVideo.maxKb;
  return { ok: kb <= target, target };
}

const rows = [];
for (const batch of manifest.batches) {
  if (batch.status === "planned") continue;
  for (const termId of expandBatchTerms(batch)) {
    const term = terms.find((item) => item.id === termId);
    if (!term) {
      rows.push({ termId, kind: batch.assetKind, ok: false, message: "term missing" });
      continue;
    }

    if (batch.assetKind === "image") {
      const variant = ensureCardVariant(termId);
      const detailUrl = `/images/terms/${termId}-detail.jpg`;
      const detailPath = join(repoRoot, "public", detailUrl);
      const cardPath = join(repoRoot, "public/images/terms", `${termId}-card.jpg`);
      const detailExists = existsSync(detailPath);
      const cardExists = existsSync(cardPath);
      const detailKb = detailExists ? fileKb(detailPath) : 0;
      const cardKb = cardExists ? fileKb(cardPath) : 0;
      const detailBudget = detailExists ? underBudget("detailImage", detailKb) : { ok: false, target: manifest.qualityTargets.detailImage.maxKb };
      const cardBudget = cardExists ? underBudget("cardImage", cardKb) : { ok: false, target: manifest.qualityTargets.cardImage.maxKb };
      const ok = variant.ok && detailExists && cardExists && detailBudget.ok && cardBudget.ok;
      if (ok && apply) {
        upsertAsset(term, {
          type: "image",
          url: detailUrl,
          hash: hashFile(detailPath),
          rights
        });
      }
      rows.push({
        termId,
        kind: "image",
        ok,
        message: ok
          ? `card ${cardKb}KB, detail ${detailKb}KB`
          : !variant.ok
            ? variant.reason
            : !cardExists
              ? "missing card image"
              : !detailExists
                ? "missing detail image"
                : !cardBudget.ok
                  ? `card ${cardKb}KB exceeds ${cardBudget.target}KB`
                  : `detail ${detailKb}KB exceeds ${detailBudget.target}KB`
      });
    }

    if (batch.assetKind === "previewVideo") {
      const clipUrl = `/videos/terms/${termId}-preview.mp4`;
      const clipPath = join(repoRoot, "public", clipUrl);
      const clipExists = existsSync(clipPath);
      const clipKb = clipExists ? fileKb(clipPath) : 0;
      const clipBudget = clipExists ? underBudget("previewVideo", clipKb) : { ok: false, target: manifest.qualityTargets.previewVideo.maxKb };
      const ok = clipExists && clipBudget.ok;
      if (ok && apply) {
        term.previewVideoUrl = clipUrl;
        upsertAsset(term, {
          type: "clip",
          url: clipUrl,
          hash: hashFile(clipPath),
          rights
        });
      }
      rows.push({
        termId,
        kind: "previewVideo",
        ok,
        message: ok ? `${clipKb}KB` : clipExists ? `${clipKb}KB exceeds ${clipBudget.target}KB` : "missing preview video"
      });
    }
  }
}

if (apply) {
  writeFileSync(termsPath, `${JSON.stringify(terms, null, 2)}\n`);
}

const failed = rows.filter((row) => !row.ok);
for (const row of rows) {
  console.log(`${row.ok ? "OK" : "FAIL"} ${row.termId} ${row.kind} - ${row.message}`);
}

if (failed.length > 0) {
  process.exitCode = 1;
}
