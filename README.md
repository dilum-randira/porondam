# Porondam (පොරොන්දම්)

An **in-development** Sri Lankan matchmaking application for adults. This repository started as Pulse, a MERN dating prototype; legacy branding and incomplete journeys remain. **Not production-ready.** Do not use it to collect real personal data until security, moderation and privacy reviews are complete.

## Stack and structure
- `client/`: React 18, Vite, Tailwind CSS, React Router, Socket.IO client.
- `server/`: Node.js, Express, MongoDB/Mongoose, JWT authentication, Socket.IO and Cloudinary-related upload dependencies.
- `docs/automation-progress.md`: completed work, known limitations and next priorities.

## Local development
Requires Node.js, npm and MongoDB. Install dependencies separately with `npm ci` inside `client/` and `server/`. Configure server environment variables in a local untracked `server/.env`, then run `npm start` in `server/` and `npm run dev` in `client/`. Run `npm run build` inside `client/` to build frontend assets. No automated test script is currently defined; this is a known gap.

## Environment variables (names only)
- `MONGO_URI`: MongoDB connection string (required by DB config; confirm against deployment).
- `JWT_SECRET`: strong random signing secret; never commit.
- `CLIENT_ORIGIN`: allowed frontend origin(s), comma-separated, e.g. `http://localhost:5173` for local development.
- `PORT`: API port, default `5000`.
- Cloudinary configuration: inspect `server/config/` and upload middleware for required names before enabling uploads.

## Implemented prototype capabilities
Registration and login, basic profile fields, location-based discovery, mutual likes/matches, chat via Socket.IO and photo upload routes exist in code. End-to-end correctness, authorization coverage, privacy and abuse protection have **not** been fully validated. New registration requires a self-declared date of birth indicating age 18+ and a password of at least 12 characters. Existing accounts are not automatically age-verified.

## Security and privacy
The API restricts browser origins via `CLIENT_ORIGIN`, limits JSON request bodies, sets basic protective response headers, and checks authenticated socket participants. These are partial controls, not a security guarantee. The current implementation still needs rate limiting, upload review, account recovery, blocking/reporting, privacy-preserving location handling, JWT/session review, moderation and production deployment hardening. Avoid exposing precise location or personal data in production. Do not use real users for demos.

## Roadmap
1. Automated tests, CI, authorization and rate-limit hardening.
2. Profile privacy, account management, blocks/reports and safer discovery.
3. Complete Porondam brand/design system and mobile accessibility.
4. Sinhala/Tamil/English localization and culturally relevant voluntary preferences.
5. Moderation, consent-first messaging, trustworthy verification descriptions.
6. Optional porondam guidance with clear limitations.

For the latest daily work and blockers, see `docs/automation-progress.md`. Deployment is not yet documented or approved as production-safe.
