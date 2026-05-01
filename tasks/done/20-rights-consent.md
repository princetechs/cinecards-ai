# 20 — Rights + Consent Attestation Flow

**Status:** ✅ Done

## Goal
Anything user-uploaded carries explicit rights + consent.

## Build
- Upload form: required checkboxes for `iOwnOrLicensed`, `subjectsConsented`, `noPII`, `licenceChoice`
- Persist in `rights{}` on the asset
- Public asset pages render the licence + attribution
- Reject upload if any required attestation missing

## Acceptance
- No public asset can exist without a populated `rights` object

## Depends on
10.
