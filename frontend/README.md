# LogisticsApp Frontend

React + TypeScript frontend for the Laravel 12 API.

## Local development

1. Install Node.js 20.19+ (or 22.12+).
2. From this directory, install dependencies:

   ```bash
   npm install
   ```

3. Configure the Laravel `.env` file with `SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173,localhost,127.0.0.1`.
4. Start Laravel on `http://127.0.0.1:8000`.
5. Run the frontend:

   ```bash
   npm run dev
   ```

The Vite server runs on port 5173 and proxies `/api` and `/sanctum` to Laravel. In production, serve the built frontend and Laravel API from the same origin.

## Build and checks

```bash
npm run typecheck
npm run build
```

## Frontend structure

- `app/`: application-level providers and composition.
- `features/`: domain modules; the existing marketplace UI currently lives in `features/marketplace`.
- `lib/`: shared infrastructure such as the Axios API client.
- `assets/` and `styles.css`: shared visual resources.

## Authentication contract

- Authentication uses Laravel Sanctum SPA session cookies, not personal access tokens.
- Call `initializeCsrf()` before login, registration, or other state-changing requests.
- Use `authApi.login`, `authApi.register`, `authApi.me`, and `authApi.logout` from `features/auth/api/authApi.ts`.
- The browser sends the session cookie automatically; do not store or attach Bearer tokens.
- Laravel must run `$middleware->statefulApi()` and include the frontend origin in `SANCTUM_STATEFUL_DOMAINS`.
- Production should use HTTPS and a same-origin deployment.

## Integration notes

- API base path: `/api/v1`.
- API error envelopes currently use `error.code` and `error.message`.
- The marketplace page still contains demo listings and UI-local navigation. Replace these incrementally with feature pages and API queries; this refactor intentionally preserves the current UI.
- Do not assume subscription checkout, application review, dictionary, business-place, or admin endpoints exist; verify/add those backend contracts first.
