# TODO

- [ ] Replace client-side direct sqlite usage for approvals with backend API calls.
- [ ] Update `src/app/utils/approvalRequests.ts` to remove imports from `./db/*` and make functions async via `fetch`.
- [ ] Update components (`TreasurerApprovals.tsx`, `ClerkApprovalNotifications.tsx`, etc.) to use the async approvalRequests API.
- [ ] Add a fail-fast guard in `src/app/utils/db/sqlite.ts` to throw in browser context.
- [ ] Rebuild the Vite app to confirm `better-sqlite3` is no longer bundled.
