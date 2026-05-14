#!/usr/bin/env node
/**
 * Validates data/terms.json and data/sequenceRules.json against the JSON
 * schemas in packages/content-schema/, plus cross-reference integrity:
 *   - relatedTerms NAMES must exist in terms.json
 *   - prerequisites + aliases entries (when present) must be unique strings
 *   - every term name in sequenceRules.json must exist in terms.json
 *   - every term id must be unique
 *
 * Exits with code 1 on any failure, printing readable file + path + reason.
 */
import { readFileSync } from "node:fs";
import { existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");

const TERMS_PATH = resolve(repoRoot, "data/terms.json");
const RULES_PATH = resolve(repoRoot, "data/sequenceRules.json");
const MONETIZATION_PATH = resolve(repoRoot, "data/monetization.json");
const TERM_SCHEMA_PATH = resolve(
  repoRoot,
  "packages/content-schema/term.schema.json"
);
const RULES_SCHEMA_PATH = resolve(
  repoRoot,
  "packages/content-schema/sequence-rules.schema.json"
);

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

function isLocalPublicUrl(url: unknown): url is string {
  return typeof url === "string" && url.startsWith("/") && !url.startsWith("//");
}

function publicPath(url: string): string {
  return resolve(repoRoot, "public", url.slice(1));
}

function sha256(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

const errors: string[] = [];
function fail(file: string, path: string, reason: string): void {
  errors.push(`  [${file}] ${path}: ${reason}`);
}

const ajv = new Ajv2020({ allErrors: true, strict: false });

const terms = readJson(TERMS_PATH) as Array<Record<string, unknown>>;
const rules = readJson(RULES_PATH) as Record<string, unknown>;
const monetization = readJson(MONETIZATION_PATH) as Record<string, unknown>;
const termSchema = readJson(TERM_SCHEMA_PATH);
const rulesSchema = readJson(RULES_SCHEMA_PATH);

const validateTerm = ajv.compile(termSchema as object);
const validateRules = ajv.compile(rulesSchema as object);

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function requireString(file: string, obj: Record<string, unknown>, key: string, path: string): void {
  if (typeof obj[key] !== "string" || String(obj[key]).trim() === "") {
    fail(file, `${path}.${key}`, "must be a non-empty string");
  }
}

function requireHref(file: string, obj: Record<string, unknown>, key: string, path: string): void {
  requireString(file, obj, key, path);
  const value = obj[key];
  if (
    typeof value === "string" &&
    !value.startsWith("/") &&
    !value.startsWith("https://") &&
    !value.startsWith("mailto:")
  ) {
    fail(file, `${path}.${key}`, "must start with /, https://, or mailto:");
  }
}

// 1. Validate every term entry
if (!Array.isArray(terms)) {
  fail("data/terms.json", "$", "expected an array of terms");
} else {
  terms.forEach((term, i) => {
    if (!validateTerm(term)) {
      for (const e of validateTerm.errors ?? []) {
        const path = `$[${i}]${e.instancePath}`;
        fail("data/terms.json", path, `${e.message ?? "invalid"}${e.params ? " " + JSON.stringify(e.params) : ""}`);
      }
    }
  });
}

// 2. Validate sequenceRules.json
if (!validateRules(rules)) {
  for (const e of validateRules.errors ?? []) {
    fail("data/sequenceRules.json", `$${e.instancePath}`, `${e.message ?? "invalid"}${e.params ? " " + JSON.stringify(e.params) : ""}`);
  }
}

// 2b. Validate monetization.json homepage/business-facing content.
// This file drives CTAs and conversion sections, so keep it editable but guarded.
if (!isObject(monetization)) {
  fail("data/monetization.json", "$", "expected an object");
} else {
  const homepageOffer = monetization.homepageOffer;
  if (!isObject(homepageOffer)) {
    fail("data/monetization.json", "$.homepageOffer", "expected an object");
  } else {
    for (const key of ["eyebrow", "title", "description"]) {
      requireString("data/monetization.json", homepageOffer, key, "$.homepageOffer");
    }
    if (!Array.isArray(homepageOffer.plans) || homepageOffer.plans.length < 2) {
      fail("data/monetization.json", "$.homepageOffer.plans", "expected at least two plans");
    } else {
      homepageOffer.plans.forEach((plan, index) => {
        const path = `$.homepageOffer.plans[${index}]`;
        if (!isObject(plan)) {
          fail("data/monetization.json", path, "expected an object");
          return;
        }
        for (const key of ["name", "price", "description", "cta"]) {
          requireString("data/monetization.json", plan, key, path);
        }
        requireHref("data/monetization.json", plan, "href", path);
      });
    }
  }

  const landingDemo = monetization.landingDemo;
  if (!isObject(landingDemo)) {
    fail("data/monetization.json", "$.landingDemo", "expected an object");
  } else {
    for (const key of ["eyebrow", "title", "description"]) {
      requireString("data/monetization.json", landingDemo, key, "$.landingDemo");
    }
    const steps = landingDemo.steps;
    if (!Array.isArray(steps) || steps.length < 4) {
      fail("data/monetization.json", "$.landingDemo.steps", "expected at least four demo steps");
    } else {
      steps.forEach((step, index) => {
        const path = `$.landingDemo.steps[${index}]`;
        if (!isObject(step)) {
          fail("data/monetization.json", path, "expected an object");
          return;
        }
        for (const key of ["n", "title", "label", "copy", "note"]) {
          requireString("data/monetization.json", step, key, path);
        }
      });
    }
  }

  const onboardingFlow = monetization.onboardingFlow;
  if (!Array.isArray(onboardingFlow) || onboardingFlow.length < 4) {
    fail("data/monetization.json", "$.onboardingFlow", "expected at least four onboarding steps");
  } else {
    onboardingFlow.forEach((step, index) => {
      const path = `$.onboardingFlow[${index}]`;
      if (!isObject(step)) {
        fail("data/monetization.json", path, "expected an object");
        return;
      }
      for (const key of ["step", "eyebrow", "title", "description", "action"]) {
        requireString("data/monetization.json", step, key, path);
      }
      requireHref("data/monetization.json", step, "href", path);
    });
  }

  const workflowDemo = monetization.workflowDemo;
  if (!isObject(workflowDemo)) {
    fail("data/monetization.json", "$.workflowDemo", "expected an object");
  } else {
    for (const key of ["eyebrow", "title", "description"]) {
      requireString("data/monetization.json", workflowDemo, key, "$.workflowDemo");
    }
    const steps = workflowDemo.steps;
    if (!Array.isArray(steps) || steps.length < 4) {
      fail("data/monetization.json", "$.workflowDemo.steps", "expected at least four workflow steps");
    } else {
      steps.forEach((step, index) => {
        const path = `$.workflowDemo.steps[${index}]`;
        if (!isObject(step)) {
          fail("data/monetization.json", path, "expected an object");
          return;
        }
        for (const key of ["step", "title", "body", "caption"]) {
          requireString("data/monetization.json", step, key, path);
        }
      });
    }
    const modelTips = workflowDemo.modelTips;
    if (!Array.isArray(modelTips) || modelTips.length < 3) {
      fail("data/monetization.json", "$.workflowDemo.modelTips", "expected at least three model tips");
    } else {
      modelTips.forEach((tip, index) => {
        const path = `$.workflowDemo.modelTips[${index}]`;
        if (!isObject(tip)) {
          fail("data/monetization.json", path, "expected an object");
          return;
        }
        for (const key of ["model", "copy"]) {
          requireString("data/monetization.json", tip, key, path);
        }
      });
    }
  }

  const creditFixer = monetization.creditFixer;
  if (!isObject(creditFixer)) {
    fail("data/monetization.json", "$.creditFixer", "expected an object");
  } else {
    for (const key of ["eyebrow", "title", "description", "weakLabel", "weakPrompt", "rewriteLabel", "rewritePrompt"]) {
      requireString("data/monetization.json", creditFixer, key, "$.creditFixer");
    }
    const scores = creditFixer.scores;
    if (!Array.isArray(scores) || scores.length < 3) {
      fail("data/monetization.json", "$.creditFixer.scores", "expected at least three score rows");
    } else {
      scores.forEach((score, index) => {
        const path = `$.creditFixer.scores[${index}]`;
        if (!isObject(score)) {
          fail("data/monetization.json", path, "expected an object");
          return;
        }
        requireString("data/monetization.json", score, "label", path);
        requireString("data/monetization.json", score, "value", path);
        const value = score.value;
        if (typeof value === "string" && !/^\d{1,3}%$/.test(value)) {
          fail("data/monetization.json", `${path}.value`, "must be a percentage string like 28%");
        }
      });
    }
  }

  const previewWall = monetization.previewWall;
  if (!isObject(previewWall)) {
    fail("data/monetization.json", "$.previewWall", "expected an object");
  } else {
    for (const key of ["eyebrow", "title", "description", "ctaLabel"]) {
      requireString("data/monetization.json", previewWall, key, "$.previewWall");
    }
    requireHref("data/monetization.json", previewWall, "ctaHref", "$.previewWall");
  }

  const homepageRecipes = monetization.homepageRecipes;
  if (!isObject(homepageRecipes)) {
    fail("data/monetization.json", "$.homepageRecipes", "expected an object");
  } else {
    for (const key of ["title", "description", "ctaLabel", "gridTitle", "gridDescription"]) {
      requireString("data/monetization.json", homepageRecipes, key, "$.homepageRecipes");
    }
    requireHref("data/monetization.json", homepageRecipes, "ctaHref", "$.homepageRecipes");
    const painPoints = homepageRecipes.painPoints;
    if (!Array.isArray(painPoints) || painPoints.length < 3) {
      fail("data/monetization.json", "$.homepageRecipes.painPoints", "expected at least three pain points");
    } else {
      painPoints.forEach((pain, index) => {
        const path = `$.homepageRecipes.painPoints[${index}]`;
        if (!isObject(pain)) {
          fail("data/monetization.json", path, "expected an object");
          return;
        }
        for (const key of ["title", "description"]) {
          requireString("data/monetization.json", pain, key, path);
        }
      });
    }
  }

  const liveExample = monetization.liveExample;
  if (!isObject(liveExample)) {
    fail("data/monetization.json", "$.liveExample", "expected an object");
  } else {
    for (const key of ["eyebrow", "title", "description", "ideaLabel", "idea", "ideaResult", "promptLabel", "prompt"]) {
      requireString("data/monetization.json", liveExample, key, "$.liveExample");
    }
    for (const key of ["primaryCta", "secondaryCta"]) {
      const cta = liveExample[key];
      const path = `$.liveExample.${key}`;
      if (!isObject(cta)) {
        fail("data/monetization.json", path, "expected an object");
      } else {
        requireString("data/monetization.json", cta, "label", path);
        requireHref("data/monetization.json", cta, "href", path);
      }
    }
    const shots = liveExample.shots;
    if (!Array.isArray(shots) || shots.length < 3) {
      fail("data/monetization.json", "$.liveExample.shots", "expected at least three shots");
    } else {
      shots.forEach((shot, index) => {
        const path = `$.liveExample.shots[${index}]`;
        if (!isObject(shot)) {
          fail("data/monetization.json", path, "expected an object");
          return;
        }
        for (const key of ["n", "type", "description", "duration"]) {
          requireString("data/monetization.json", shot, key, path);
        }
      });
    }
  }

  const workflowSteps = monetization.workflowSteps;
  if (!isObject(workflowSteps)) {
    fail("data/monetization.json", "$.workflowSteps", "expected an object");
  } else {
    for (const key of ["eyebrow", "title", "description"]) {
      requireString("data/monetization.json", workflowSteps, key, "$.workflowSteps");
    }
    const steps = workflowSteps.steps;
    if (!Array.isArray(steps) || steps.length < 3) {
      fail("data/monetization.json", "$.workflowSteps.steps", "expected at least three workflow steps");
    } else {
      steps.forEach((step, index) => {
        const path = `$.workflowSteps.steps[${index}]`;
        if (!isObject(step)) {
          fail("data/monetization.json", path, "expected an object");
          return;
        }
        for (const key of ["n", "title", "description", "href", "link"]) {
          requireString("data/monetization.json", step, key, path);
        }
        requireHref("data/monetization.json", step, "href", path);
      });
    }
  }

  const beginnerPath = monetization.beginnerPath;
  if (!isObject(beginnerPath)) {
    fail("data/monetization.json", "$.beginnerPath", "expected an object");
  } else {
    for (const key of ["eyebrow", "title", "description", "ctaLabel"]) {
      requireString("data/monetization.json", beginnerPath, key, "$.beginnerPath");
    }
    requireHref("data/monetization.json", beginnerPath, "ctaHref", "$.beginnerPath");
    const items = beginnerPath.items;
    if (!Array.isArray(items) || items.length < 4) {
      fail("data/monetization.json", "$.beginnerPath.items", "expected at least four beginner path items");
    } else {
      items.forEach((item, index) => {
        const path = `$.beginnerPath.items[${index}]`;
        if (!isObject(item)) {
          fail("data/monetization.json", path, "expected an object");
          return;
        }
        for (const key of ["n", "label", "detail"]) {
          requireString("data/monetization.json", item, key, path);
        }
      });
    }
  }

  const toolGrid = monetization.toolGrid;
  if (!isObject(toolGrid)) {
    fail("data/monetization.json", "$.toolGrid", "expected an object");
  } else {
    requireString("data/monetization.json", toolGrid, "title", "$.toolGrid");
    const items = toolGrid.items;
    if (!Array.isArray(items) || items.length < 3) {
      fail("data/monetization.json", "$.toolGrid.items", "expected at least three tool cards");
    } else {
      items.forEach((item, index) => {
        const path = `$.toolGrid.items[${index}]`;
        if (!isObject(item)) {
          fail("data/monetization.json", path, "expected an object");
          return;
        }
        for (const key of ["label", "title", "description", "meta"]) {
          requireString("data/monetization.json", item, key, path);
        }
        requireHref("data/monetization.json", item, "href", path);
      });
    }
  }

  const servicePage = monetization.servicePage;
  if (!isObject(servicePage)) {
    fail("data/monetization.json", "$.servicePage", "expected an object");
  } else {
    for (const key of ["eyebrow", "title", "description"]) {
      requireString("data/monetization.json", servicePage, key, "$.servicePage");
    }
    for (const key of ["primaryCta", "secondaryCta"]) {
      const cta = servicePage[key];
      const path = `$.servicePage.${key}`;
      if (!isObject(cta)) {
        fail("data/monetization.json", path, "expected an object");
      } else {
        requireString("data/monetization.json", cta, "label", path);
        requireHref("data/monetization.json", cta, "href", path);
      }
    }

    const packages = servicePage.packages;
    if (!Array.isArray(packages) || packages.length < 2) {
      fail("data/monetization.json", "$.servicePage.packages", "expected at least two service packages");
    } else {
      packages.forEach((pkg, index) => {
        const path = `$.servicePage.packages[${index}]`;
        if (!isObject(pkg)) {
          fail("data/monetization.json", path, "expected an object");
          return;
        }
        for (const key of ["name", "price", "bestFor"]) {
          requireString("data/monetization.json", pkg, key, path);
        }
        if (!Array.isArray(pkg.deliverables) || pkg.deliverables.length < 2) {
          fail("data/monetization.json", `${path}.deliverables`, "expected at least two deliverables");
        } else {
          pkg.deliverables.forEach((deliverable, itemIndex) => {
            if (typeof deliverable !== "string" || deliverable.trim() === "") {
              fail("data/monetization.json", `${path}.deliverables[${itemIndex}]`, "must be a non-empty string");
            }
          });
        }
      });
    }

    const process = servicePage.process;
    if (!Array.isArray(process) || process.length < 3) {
      fail("data/monetization.json", "$.servicePage.process", "expected at least three process steps");
    } else {
      process.forEach((step, index) => {
        const path = `$.servicePage.process[${index}]`;
        if (!isObject(step)) {
          fail("data/monetization.json", path, "expected an object");
          return;
        }
        for (const key of ["step", "title", "description"]) {
          requireString("data/monetization.json", step, key, path);
        }
      });
    }

    const briefBuilder = servicePage.briefBuilder;
    if (!isObject(briefBuilder)) {
      fail("data/monetization.json", "$.servicePage.briefBuilder", "expected an object");
    } else {
      for (const key of ["eyebrow", "title", "description", "submitLabel"]) {
        requireString("data/monetization.json", briefBuilder, key, "$.servicePage.briefBuilder");
      }
      const fields = briefBuilder.fields;
      if (!Array.isArray(fields) || fields.length < 3) {
        fail("data/monetization.json", "$.servicePage.briefBuilder.fields", "expected at least three brief fields");
      } else {
        fields.forEach((field, index) => {
          const path = `$.servicePage.briefBuilder.fields[${index}]`;
          if (!isObject(field)) {
            fail("data/monetization.json", path, "expected an object");
            return;
          }
          for (const key of ["name", "label", "placeholder", "type"]) {
            requireString("data/monetization.json", field, key, path);
          }
          if (field.type !== "text" && field.type !== "textarea") {
            fail("data/monetization.json", `${path}.type`, "must be text or textarea");
          }
        });
      }
    }

    const fitChecklist = servicePage.fitChecklist;
    if (!Array.isArray(fitChecklist) || fitChecklist.length < 3) {
      fail("data/monetization.json", "$.servicePage.fitChecklist", "expected at least three fit checklist items");
    } else {
      fitChecklist.forEach((item, index) => {
        if (typeof item !== "string" || item.trim() === "") {
          fail("data/monetization.json", `$.servicePage.fitChecklist[${index}]`, "must be a non-empty string");
        }
      });
    }

    const faqs = servicePage.faqs;
    if (!Array.isArray(faqs) || faqs.length < 2) {
      fail("data/monetization.json", "$.servicePage.faqs", "expected at least two FAQs");
    } else {
      faqs.forEach((faq, index) => {
        const path = `$.servicePage.faqs[${index}]`;
        if (!isObject(faq)) {
          fail("data/monetization.json", path, "expected an object");
          return;
        }
        for (const key of ["question", "answer"]) {
          requireString("data/monetization.json", faq, key, path);
        }
      });
    }
  }

  const plannerStarterIdeas = monetization.plannerStarterIdeas;
  if (!Array.isArray(plannerStarterIdeas) || plannerStarterIdeas.length < 3) {
    fail("data/monetization.json", "$.plannerStarterIdeas", "expected at least three starter ideas");
  } else {
    plannerStarterIdeas.forEach((idea, index) => {
      const path = `$.plannerStarterIdeas[${index}]`;
      if (!isObject(idea)) {
        fail("data/monetization.json", path, "expected an object");
        return;
      }
      for (const key of ["label", "topic", "audience"]) {
        requireString("data/monetization.json", idea, key, path);
      }
    });
  }

  const recipeSegments = monetization.recipeSegments;
  if (!Array.isArray(recipeSegments) || recipeSegments.length < 3) {
    fail("data/monetization.json", "$.recipeSegments", "expected at least three recipe segments");
  } else {
    recipeSegments.forEach((segment, index) => {
      const path = `$.recipeSegments[${index}]`;
      if (!isObject(segment)) {
        fail("data/monetization.json", path, "expected an object");
        return;
      }
      requireString("data/monetization.json", segment, "label", path);
      if (!Array.isArray(segment.match) || segment.match.length === 0) {
        fail("data/monetization.json", `${path}.match`, "expected at least one match token");
      } else {
        segment.match.forEach((token, tokenIndex) => {
          if (typeof token !== "string" || token.trim() === "") {
            fail("data/monetization.json", `${path}.match[${tokenIndex}]`, "must be a non-empty string");
          }
        });
      }
    });
  }

  const audiencePaths = monetization.audiencePaths;
  if (!Array.isArray(audiencePaths) || audiencePaths.length < 3) {
    fail("data/monetization.json", "$.audiencePaths", "expected at least three buyer/user paths");
  } else {
    audiencePaths.forEach((pathItem, index) => {
      const path = `$.audiencePaths[${index}]`;
      if (!isObject(pathItem)) {
        fail("data/monetization.json", path, "expected an object");
        return;
      }
      for (const key of ["label", "problem", "workflow", "cta"]) {
        requireString("data/monetization.json", pathItem, key, path);
      }
      requireHref("data/monetization.json", pathItem, "href", path);
    });
  }
}

// 3. Cross-reference checks
if (Array.isArray(terms)) {
  // 3a. Unique ids
  const idCounts = new Map<string, number>();
  terms.forEach((t) => {
    const id = t.id as string | undefined;
    if (typeof id === "string") {
      idCounts.set(id, (idCounts.get(id) ?? 0) + 1);
    }
  });
  for (const [id, count] of idCounts) {
    if (count > 1) {
      fail("data/terms.json", `$.id="${id}"`, `duplicate id appears ${count} times`);
    }
  }

  const nameSet = new Set(
    terms
      .map((t) => t.name)
      .filter((n): n is string => typeof n === "string")
  );

  // 3b. relatedTerms names exist
  terms.forEach((t, i) => {
    const related = t.relatedTerms;
    if (Array.isArray(related)) {
      related.forEach((r, j) => {
        if (typeof r === "string" && !nameSet.has(r)) {
          fail(
            "data/terms.json",
            `$[${i}].relatedTerms[${j}]`,
            `references unknown term name "${r}"`
          );
        }
      });
    }
    // 3c. prerequisites (v2, optional) — verify names exist if present
    const prereq = t.prerequisites;
    if (Array.isArray(prereq)) {
      prereq.forEach((p, j) => {
        if (typeof p === "string" && !nameSet.has(p)) {
          fail(
            "data/terms.json",
            `$[${i}].prerequisites[${j}]`,
            `references unknown term name "${p}"`
          );
        }
      });
    }
  });

  // 3d. Rights + consent attestations on assets[]
  // If a term has any entries in `assets`, every entry MUST carry a `rights`
  // object with all four required attestations true and a `licence` string.
  // See task 20 (rights + consent attestation flow).
  const REQUIRED_RIGHTS_FLAGS = ["iOwnOrLicensed", "subjectsConsented", "noPII"] as const;
  terms.forEach((t, i) => {
    const previewVideoUrl = t.previewVideoUrl;
    if (isLocalPublicUrl(previewVideoUrl)) {
      const path = publicPath(previewVideoUrl);
      if (!existsSync(path)) {
        fail("data/terms.json", `$[${i}].previewVideoUrl`, `local file does not exist: ${previewVideoUrl}`);
      }
    }

    const assets = (t as { assets?: unknown }).assets;
    if (!Array.isArray(assets) || assets.length === 0) return;
    assets.forEach((a, j) => {
      const path = `$[${i}].assets[${j}]`;
      if (!a || typeof a !== "object") {
        fail("data/terms.json", path, "asset entry must be an object");
        return;
      }
      const r = (a as { rights?: unknown }).rights;
      if (!r || typeof r !== "object") {
        fail("data/terms.json", `${path}.rights`, "missing rights{} block on asset");
        return;
      }
      const rights = r as Record<string, unknown>;
      for (const flag of REQUIRED_RIGHTS_FLAGS) {
        if (rights[flag] !== true) {
          fail("data/terms.json", `${path}.rights.${flag}`, "must be literal true");
        }
      }
      if (typeof rights.licence !== "string" || rights.licence.trim() === "") {
        fail("data/terms.json", `${path}.rights.licence`, "must be a non-empty string");
      }

      const asset = a as { url?: unknown; hash?: unknown };
      if (isLocalPublicUrl(asset.url)) {
        const diskPath = publicPath(asset.url);
        if (!existsSync(diskPath)) {
          fail("data/terms.json", `${path}.url`, `local file does not exist: ${asset.url}`);
          return;
        }
        if (typeof asset.hash === "string" && asset.hash.trim() !== "") {
          const actual = sha256(diskPath);
          if (asset.hash !== actual) {
            fail("data/terms.json", `${path}.hash`, `hash mismatch for ${asset.url}`);
          }
        }
      }
    });
  });

  // 3e. sequenceRules term names exist
  if (rules && typeof rules === "object") {
    for (const [seqType, list] of Object.entries(rules)) {
      if (Array.isArray(list)) {
        list.forEach((name, j) => {
          if (typeof name === "string" && !nameSet.has(name)) {
            fail(
              "data/sequenceRules.json",
              `$.${seqType}[${j}]`,
              `references unknown term name "${name}"`
            );
          }
        });
      }
    }
  }
}

if (errors.length > 0) {
  console.error(`Content validation FAILED (${errors.length} issue${errors.length === 1 ? "" : "s"}):`);
  for (const line of errors) console.error(line);
  process.exit(1);
}

console.log(
  `Content OK — ${Array.isArray(terms) ? terms.length : 0} terms, ${
    Object.keys(rules ?? {}).length
  } sequence rule sets, and homepage monetization content validated.`
);
