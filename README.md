# Porondam (පොරොන්දම්)

An **in-development** Sri Lankan matchmaking application for adults. This repository started as Pulse, a MERN dating prototype; legacy branding and incomplete journeys remain. **Not production-ready.** Do not use it to collect real personal data until security, moderation and privacy reviews are complete.

## Stack and structure
- `client/`: React 18, Vite, Tailwind CSS, React Router, Socket.IO client.
- `server/`: Node.js, Express, MongoDB/Mongoose, JWT authentication, Socket.IO and Cloudinary-related upload dependencies.
- `docs/automation-progress.md`: completed work, known limitations and next priorities.

## Local development
Requires Node.js, npm and MongoDB. Install dependencies separately with `npm ci` inside `client/` and `server/`. Configure server environment variables in a local untracked `server/.env`, then run `npm start` in `server/` and `npm run dev` in `client/`. Run `npm run build` inside `client/` to build frontend assets. Run `npm test` inside `server/` for the first unit tests (rate-limiter coverage). The GitHub Actions verification workflow runs those tests, server JavaScript syntax checks and the client build. These checks do **not** substitute for database integration or browser testing.

## Environment variables (names only)
- `MONGO_URI`: MongoDB connection string (required by DB config; confirm against deployment).
- `JWT_SECRET`: strong random signing secret; never commit.
- `CLIENT_ORIGIN`: allowed frontend origin(s), comma-separated, e.g. `http://localhost:5173` for local development.
- `PORT`: API port, default `5000`.
- `VITE_API_URL`: optional client build-time API URL, e.g. `http://localhost:5000/api`.
- `VITE_SOCKET_URL`: optional client build-time Socket.IO origin; defaults to the API origin.
- Cloudinary configuration: inspect `server/config/` and upload middleware for required names before enabling uploads.

## Implemented prototype capabilities
Registration and login, basic profile fields, district-optional discovery, mutual likes/matches, chat via Socket.IO and photo upload routes exist in code. End-to-end correctness, authorization coverage, privacy and abuse protection have **not** been fully validated. New registration requires a self-declared date of birth indicating age 18+ and a password of at least 12 characters. A voluntary district preference supports non-coordinate-based discovery; existing profiles without a recorded birth date are excluded from new discovery and cannot receive new swipes. Existing accounts are not automatically age-verified.

## Security and privacy
The API restricts browser origins via `CLIENT_ORIGIN`, limits JSON request bodies, sets basic protective response headers, checks authenticated socket participants, and uses an in-memory per-IP limit on login (10) and registration (5) within 15 minutes. This rate limit is per server process, not suitable by itself for distributed production deployments. These are partial controls, not a security guarantee. The current implementation still needs distributed and per-account rate limiting, upload review, account recovery, blocking/reporting, privacy-preserving location handling, JWT/session review, moderation and production deployment hardening. Avoid exposing precise location or personal data in production. Do not use real users for demos.

## Roadmap
1. Expand automated authorization tests and integration coverage, review deployed CI and add distributed and per-account rate limits.
2. Profile privacy, account management, blocks/reports and safer discovery.
3. Extend the new Porondam landing identity to authenticated pages, with mobile and Sinhala/Tamil accessibility reviews.
4. Sinhala/Tamil/English localization and culturally relevant voluntary preferences.
5. Moderation, consent-first messaging, trustworthy verification descriptions.
6. Optional porondam guidance with clear limitations.

For the latest daily work and blockers, see `docs/automation-progress.md`. Deployment is not yet documented or approved as production-safe.


### Legacy-account discovery eligibility
Discovery feed and swipes require an authenticated account with a stored self-declared adult date of birth. Older accounts missing this field receive HTTP 403 with `AGE_CONFIRMATION_REQUIRED`. A password-confirmed self-service declaration is available on the profile page for legacy accounts. Historical conversations are retained. This is an eligibility declaration, **not** proof of identity or age. The server test suite includes UTC age-boundary cases.

### Legacy adult declaration (in development)
Authenticated accounts without a recorded date of birth can submit their current password and an adult birth date through Profile. The API route is `POST /api/auth/confirm-adult`; it is process-locally rate limited, refuses to overwrite an existing birth date, and updates only the authenticated account. The profile page reflects eligibility after success. This is **self-declared**, not documentary age verification. Existing accounts may need to sign out and back in to refresh previously cached eligibility. Browser and database integration testing remain outstanding.

### Blocking (prototype)
Authenticated users can block another account with `PUT /api/blocks/:userId`, list up to 100 of their blocked accounts with `GET /api/blocks`, and unblock with `DELETE /api/blocks/:userId`. The Matches page offers a Block action for recent conversations. Blocks are directional records, but restrictions apply **both ways** to discovery, swipes, match lists, message-history access, socket chat-room joins, and new socket messages. Historical messages remain stored, and new messages are delivered to authenticated participant user rooms only after a block check, rather than stale conversation rooms. Existing socket room membership is not revoked, but no longer receives message broadcasts. Concurrent block/send races still require integration testing. The Matches page now includes a blocked-account management panel and unblock actions, as well as block controls for new matches. The list is limited to the 100 most recent records; older blocks cannot be managed through this UI. Unblocking does not restore deleted matches or messages. Reporting/moderation and database integration coverage remain outstanding. Do not treat this as a complete abuse-prevention system.
