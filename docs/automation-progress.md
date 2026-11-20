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
- Historical records are retained. New messages broadcast to authenticated user rooms only after checking blocks, not previously joined match rooms. Concurrency races and real database/socket behavior still require integration testing.
- Follow-up priorities: deliver messages only to currently authorized recipients, add database-backed block authorization tests and browser checks, add unblock UI, report flow, and privacy audit. Verify CI before merging; local database and browser checks were not performed by the GitHub connector.


## 2026-11-11 — blocked account management

- Added a Block control to new matches, not only recent conversations.
- Added a self-service blocked-account list and confirmation-based Unblock action on Matches, backed by existing authenticated block endpoints.
- Added disabled controls during pending mutations, accessible success/error feedback and a refresh after blocking while the manager is open.
- Disclosed the server's 100-most-recent-blocks limit in the interface. Older records need pagination before all blocks can be managed.
- No change to block authorization, message storage or existing user data. Unblocking does not restore matches.

### Validation and remaining work
Changes were made through the GitHub connector. Local browser rendering, MongoDB-backed tests, and full user-journey checks were not available in this execution. Verify GitHub Actions build/tests and merge status separately; do not treat a successful build as browser or database validation. Next: add pagination for blocked records, report/moderation flows, database-backed reciprocal authorization tests, mobile and desktop visual review, and socket race-condition tests.

## 2026-11-14 — blocked-account pagination

- Added a compound index for account-scoped newest-first block listing.
- Changed GET /api/blocks to return 25 entries per page with `{ accounts, page, hasMore }`, using a deterministic createdAt/_id sort and bounded page input (1–1000).
- Updated Matches to load additional blocked accounts on demand and keep existing entries while paging. Block/unblock controls remain authenticated.
- Updated README with the API contract and limitations.
- This is offset pagination: concurrent insertions/deletions can shift pages, although the client deduplicates by account ID. A cursor-based approach is preferable for large histories.
- Pending verification: GitHub Actions build and tests, database-backed pagination and authorization tests, mobile/desktop browser review, and CI-gated merge. No production readiness claim.

Next: implement report/moderation flow, private-photo access control, real MongoDB integration tests and browser checks.

## 2026-11-15 — pagination CI regression repair

- Inspected PR #8 and failed GitHub Actions run 43517464119: three existing mocked list tests failed because their request stubs lacked query and expected the old array response; the frontend build was skipped.
- Updated owner-scoping, privacy, empty-list, and error-path test fixtures for the new paginated contract and query chain.
- Added dedicated tests for invalid page rejection, authenticated-owner scoping, deterministic sort, bounded lookahead, and omission of private account fields.
- Improved blocked-account loading announcements and avoided displaying a premature empty state while the first page is loading.
- Validation remains conditional on the latest GitHub Actions run. Do not merge if CI fails. Browser and MongoDB-backed integration checks are still outstanding.

## 2026-11-16 — pagination CI follow-up

- Investigated GitHub Actions run 43647334152: backend syntax/install succeeded, but three tests failed because direct controller test requests omitted `req.query`; the frontend build was skipped. The dependency install also reported 11 audit advisories (2 moderate, 7 high, 2 critical); these require a separate dependency-level review, not an unreviewed forced upgrade.
- Hardened the list handler to default safely when the query object is absent, matching Express default-page behavior.
- Added regression coverage for missing query objects and the highest supported page (1000), ensuring the offset remains bounded.
- Corrected the blocked-account UI so a failed initial load cannot be mistaken for a successful empty list.
- These are connector commits, not evidence of a successful build. Verify the new CI run, review failures, and merge PR #8 only after passing checks. MongoDB integration and browser visual testing are still outstanding.

Next: verify and merge PR #8; prioritize a targeted audit of critical/high dependency advisories, database-backed privacy tests, reporting/moderation, and mobile/desktop review.

## 2026-11-18 — image upload pre-storage validation (pending CI)
- Replaced direct Cloudinary Multer storage with bounded in-memory staging (5 MB) so the server can inspect uploaded bytes before forwarding them to storage.
- Added JPEG/PNG signature checks requiring the actual bytes, declared MIME type, and filename extension to agree; added four Node test cases.
- Uploaded files use Cloudinary's image-only streaming API. Returned URLs must use HTTPS on res.cloudinary.com before they are stored in the user's profile.
- Added consistent JSON errors for rejected upload size, count and type.
- **Important:** JPEG/PNG signature checks are not full image decoding, malware scanning, or moderation. Cloudinary assets are still public; private-photo authorization is not implemented. An upload may remain in Cloudinary if the later database update fails. A 5 MB memory buffer per simultaneous request can still cause memory pressure without upload rate limits.
- Validation status: remote commits made; local npm install, real Cloudinary integration, MongoDB and browser checks were not performed. Check PR CI before merging. Next: audit dependency advisories, enforce upload rate limits and photo ownership/privacy, handle orphaned assets and add real integration tests.

## 2026-11-20 — account-scoped photo upload throttling

- Extended the existing bounded process-local rate limiter with an optional trusted server-derived identity key. Existing IP-based authentication limits retain their defaults.
- Applied an authenticated-account limit of 10 image upload attempts per 15 minutes, before Multer buffers a request or Cloudinary storage is invoked. Rejected uploads also consume attempts.
- Added Node regression tests for cross-IP account throttling, independent account budgets, and invalid key generator configuration.
- **Limitations:** no shared Redis/database limiter, no multi-replica guarantee, no per-IP upload limit, no end-to-end Cloudinary or MongoDB integration testing, and no private-photo access control. A user can still create multiple accounts. Keep the service away from real personal data until privacy and moderation work is complete.
- **Verification:** changes committed through GitHub connector; CI status and mergeability must be confirmed before merging. Local npm, browser, and integration tests were not run in this connector-only execution.

Next: verify CI and merge if safe; investigate critical/high dependency advisories; implement authenticated private-photo access, account reporting/moderation, and mobile/desktop visual checks.
