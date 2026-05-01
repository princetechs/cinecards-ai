// Asset submission types for the rights + consent attestation flow.
//
// The literal-`true` types on the attestation flags make it impossible to
// construct an `AssetRights` value at compile time without ticking every
// required attestation. PRs that try to skip them will not type-check.

export type AssetLicence =
  | "CC-BY-4.0"
  | "CC-BY-SA-4.0"
  | "CC0-1.0"
  | "All-Rights-Reserved";

export type AssetType = "image" | "clip" | "thumbnail" | "diagram";

export interface AssetRights {
  iOwnOrLicensed: true;
  subjectsConsented: true;
  noPII: true;
  licence: AssetLicence;
  holder?: string;
  attribution?: string;
  derivativeOf?: string;
}

export interface AssetSubmission {
  termId: string;
  type: AssetType;
  url: string;
  rights: AssetRights;
}
