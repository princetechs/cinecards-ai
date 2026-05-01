// Minimal Node hooks so `--experimental-strip-types` can load our .ts
// modules even though they import each other without explicit extensions
// and import JSON without an `assert { type: "json" }` clause.
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith(".") || specifier.startsWith("/")) {
    const parentURL = context.parentURL ?? pathToFileURL(process.cwd() + "/").href;
    const base = new URL(specifier, parentURL);
    const basePath = fileURLToPath(base);
    const candidates = [basePath, `${basePath}.ts`, `${basePath}.mts`, `${basePath}/index.ts`];
    for (const p of candidates) {
      if (existsSync(p)) {
        const url = pathToFileURL(p).href;
        if (p.endsWith(".json")) {
          return { url, format: "json", shortCircuit: true, importAttributes: { type: "json" } };
        }
        return nextResolve(url, context);
      }
    }
    if (basePath.endsWith(".json") && existsSync(basePath)) {
      return {
        url: pathToFileURL(basePath).href,
        format: "json",
        shortCircuit: true,
        importAttributes: { type: "json" }
      };
    }
  }
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url.endsWith(".json")) {
    const source = readFileSync(fileURLToPath(url), "utf8");
    return { format: "json", source, shortCircuit: true };
  }
  return nextLoad(url, context);
}
