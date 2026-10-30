# LogisticsApp Frontend

React + TypeScript frontend for the existing Laravel 11 REST API.

## Local development

1. Install Node.js 20.19+ (or 22.12+).
2. From this directory, install dependencies:

   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and set `VITE_API_BASE_URL`.
4. Start the Laravel API on `http://localhost:8000`.
5. Run the frontend:

   ```bash
   npm run dev
   ```

The Vite development server runs on port 5173.

## Build

```bash
npm run typecheck
npm run build
```

## Integration notes

- API base path is `/api/v1`.
- Authentication uses Laravel Sanctum Bearer tokens. The API client currently keeps the token in memory; wire login/logout flows through `setAccessToken`.
- API error envelopes follow the existing backend's `error.code` and `error.message` convention.
- The overview currently contains clearly identified demo metrics and rows. Replace them with API queries before production use.
- Routes are scaffolded for loads, carriers, vehicles, applications, business places, map, subscription, and settings. Screens are intentionally placeholders until the corresponding backend contracts are complete.
- Do not assume subscription checkout, application review, dictionary, business-place, or admin endpoints exist; verify/add those backend contracts first.
