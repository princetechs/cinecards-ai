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
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");

const TERMS_PATH = resolve(repoRoot, "data/terms.json");
const RULES_PATH = resolve(repoRoot, "data/sequenceRules.json");
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

const errors: string[] = [];
function fail(file: string, path: string, reason: string): void {
  errors.push(`  [${file}] ${path}: ${reason}`);
}

const ajv = new Ajv2020({ allErrors: true, strict: false });

const terms = readJson(TERMS_PATH) as Array<Record<string, unknown>>;
const rules = readJson(RULES_PATH) as Record<string, unknown>;
const termSchema = readJson(TERM_SCHEMA_PATH);
const rulesSchema = readJson(RULES_SCHEMA_PATH);

const validateTerm = ajv.compile(termSchema as object);
const validateRules = ajv.compile(rulesSchema as object);

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
  } sequence rule sets validated.`
);
