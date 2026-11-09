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


## 2026-11-07 — trust, privacy and first visual identity

Branch: `feature/2026-11-07-trust-ux` (based on previously unmerged security foundation).

### Delivered on this branch
- Added bounded process-local IP throttling: five registration attempts and ten sign-in attempts per 15-minute window, with `Retry-After`; added five isolated Node test cases and an `npm test` script.
- Changed discovery to an optional district preference, avoiding the old `$near` query and registration's placeholder coordinates. Existing precise location fields are preserved to avoid destructive migrations; existing users without district can search broadly. **No automatic precise-coordinate deletion has been performed.**
- Discovery and new swipes target only accounts with a recorded self-declared adult birth date. Legacy profiles without birth dates need a consent-first eligibility migration; existing conversations are not automatically deleted.
- Built a new Porondam landing page with accurate early-stage language, Sri Lankan identity, mobile-aware navigation and no unverified claims of verification or matching accuracy.
- Removed nonfunctional Google and recovery buttons, and misleading stock-face placeholders from matches/chat; replaced missing photos with accessible initial avatars.
- Added optional frontend `VITE_API_URL` and `VITE_SOCKET_URL` configuration, documented setup, and added backend tests to CI.

### Verification and limitations
- This run used remote GitHub file inspection and commits. Local git clone was blocked by network DNS restrictions; no installed-dependency build, browser visual test, authenticated API integration test, or database integration test has been completed locally.
- GitHub Actions workflow checks build, syntax and initial throttling unit tests when a PR opens. Its actual result and mergeability must be checked, not assumed.
- Process-local IP throttling has memory and deployment limitations. Socket messages still need dedicated rate limits. Uploaded assets may still be public. Account blocking, reporting and moderation are still missing. UI redesign needs mobile and desktop screenshot review.
- The site is **not production ready** and should not collect sensitive personal information.

### Next priorities
1. Verify PR CI, investigate any failure and merge only if safe; verify remote `main`.
2. Run real registration/login/discovery/chat/upload tests with a disposable database and browser at desktop/mobile widths.
3. Enforce account eligibility and blocks across all routes and sockets; implement non-destructive legacy age re-confirmation.
4. Implement real image-byte validation, secure private-photo controls, safe media handling and reporting.
5. Replace local-only login throttling with a shared abuse-prevention strategy for production, and add accessibility and browser tests.

## 2026-11-08 — adult discovery access hardening

- Added a shared UTC adult-date eligibility helper and boundary tests (exactly 18, one day younger, invalid and missing birth dates).
- Added server-side adult eligibility middleware to discovery feed and swipe routes. Legacy accounts without birth dates receive `AGE_CONFIRMATION_REQUIRED` instead of participating in new discovery; existing conversations are left intact.
- Replaced database exception details in match endpoints with generic error responses.
- Self-declared dates do not establish verified identity or age. There is no legacy age confirmation flow yet, so affected users cannot use discovery until one is built.
- Connector edits only; local dependency installation, database integration, browser checks and build have not been executed here. CI and PR checks must be evaluated before merging.

Next: build a secure self-service date-of-birth confirmation path for legacy accounts; add database-backed authorization tests, rate limits and private photo controls.

## 2026-11-09 — legacy adult self-declaration

- Authentication payloads now report adult eligibility accurately, including for legacy logins (birth dates remain private).
- Added a password-reconfirmed, authenticated, process-locally throttled one-time DOB declaration endpoint. An atomic conditional update prevents replacing an existing DOB, including concurrent requests.
- Added a responsive profile form with status feedback and a clear distinction between self-declaration and verification.
- Existing conversations and legacy location data were not changed.

### Verification / limitations
GitHub connector source inspection and branch commits performed. Local Node dependencies, browser, MongoDB and integration test environment were unavailable in this execution. GitHub Actions results must be checked before merging; no runtime validation is claimed here. A process-local limiter does not protect multiple replicas; self-reported age is not verified; an account already holding a DOB cannot edit it through this endpoint. Next: integration tests for unauthorized/underage/concurrent submissions, rate-limit and auth boundary, and browser review at mobile and desktop widths. Continue blocking/reporting and private-photo authorization work.

## 2026-11-10 — blocking foundation

- Added unique indexed directional Block records, protected block/list/unblock API and reciprocal block lookup helpers.
- Filtered blocked users out of discovery and match lists; rejected new swipes and conversation history when either party blocks the other.
- Denied new socket chat joins and messages for blocked pairs; added a Block action to recent conversations.
- Historical records are retained. **Important limitation:** users already joined to socket match rooms can potentially receive a message broadcast to that room after a block, because Socket.IO room membership is not yet revoked and the broadcast currently targets the match room. Do not launch this as complete block protection.
- Follow-up priorities: deliver messages only to currently authorized recipients, add database-backed block authorization tests and browser checks, add unblock UI, report flow, and privacy audit. Verify CI before merging; local database and browser checks were not performed by the GitHub connector.
