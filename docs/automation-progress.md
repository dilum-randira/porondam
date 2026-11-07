# Porondam automation progress

## 2026-11-07 — foundation hardening

Inspected existing MERN code, registration form, authentication controller, user model, discovery controller, socket handlers, API bootstrap and package manifests. Existing product is still branded Pulse in many screens. This is an incremental hardening pass, **not** a complete rebuild.

### Changes
- Restrict REST and socket cross-origin requests to configured origins; bound JSON and socket payload sizes; add basic response headers.
- Bind personal socket room to authenticated user, not client-supplied user ID; reject malformed chat IDs and overlong messages.
- Validate registration fields server-side; enforce 18+ birth-date eligibility and 12-character minimum password for new accounts. Existing passwords remain usable.
- Store birth date as a non-default-selected field. Existing accounts have no verified age; they must be handled before production launch.
- Add date-of-birth entry and age validation in registration UI.

### Verification and caveats
Reviewed code through GitHub connector and checked changed file contents prior to writing. **No local npm install, build, tests, browser rendering, database integration, or vulnerability scan was available in this run.** Changes require CI and manual testing before production deployment. A successful merge alone does not establish production readiness.

### Critical outstanding work
1. Add automated backend auth and socket authorization tests, CI, lint and reproducible build checks.
2. Add per-IP and per-account rate limiting, particularly auth and socket message emission.
3. Audit upload route and private-photo storage; remove any publicly exposed sensitive content.
4. Implement profile visibility, block/report flows and server-enforced restrictions across feed, messages and sockets.
5. Replace precise geolocation discovery with privacy-preserving district-level preferences; avoid displaying exact coordinates.
6. Plan migration and verification for legacy accounts without date of birth; do not automatically mark them 18+.
7. Review JWT storage, revocation and session handling, dependency advisories, deployment and CORS environment configuration.
8. Rebrand remaining Pulse UI, create design system, and test mobile/Sinhala layouts.

### Operational note
CLIENT_ORIGIN supports comma-separated allowed origins; configure it explicitly in deployment. Never commit secrets. Do not claim production-ready adult verification: a self-entered date is only an eligibility declaration.

## 2026-11-07 — follow-up security and CI pass

- Removed exact coordinates from authentication and discovery responses (stored coordinates remain; a district-level replacement is pending).
- Reject malformed swipe and message-history identifiers; cap each history response at 100 newest messages, returned chronologically. Older-message pagination is still needed.
- Restrict image upload MIME/extension allowlist to JPEG/PNG and require secure storage URLs; this is **not** content-byte verification or private-photo authorization. New uploads use the porondam_profiles Cloudinary folder; existing assets are not moved.
- Avoid logging raw upload exceptions. Added GitHub Actions checks for server JS syntax and client build.
- Connector-only review: no local npm install, build, browser, MongoDB integration, security scan or runtime tests were executed. CI outcome must be checked before merging. No production readiness claim.

Next: check CI and PR mergeability; test existing login/registration/chat/upload behavior end-to-end; add actual file signature validation, auth rate limits, and private-photo access controls. Existing photo URLs may still be publicly accessible.
