# Sprint 3 TODO

## Backend
- [x] Add authorized middleware (JWT verify) in `runclash_api/src/middlewares/authorized.middleware.ts`

- [x] Add GET `/api/v1/auth/whoami` controller to return logged-in user detail
- [x] Add POST `/api/v1/auth/update` with multer upload + profile update + optional password update

- [ ] Update auth routes to register new endpoints
- [ ] Extend user model/schema for profile image field (if required) and implement update logic in service
- [ ] Add static serving for uploaded images (if using local filesystem storage)

## Frontend
- [ ] Add AuthContext provider (`runclash/app/providers/AuthProvider.tsx`) and wire into `app/layout.tsx`
- [ ] Add protected routing via `runclash/middleware.ts`
- [ ] Implement proxy endpoints:
  - [ ] `runclash/app/api/v1/auth/whoami/route.ts`
  - [ ] `runclash/app/api/v1/auth/update/route.ts` (multipart forwarding)
- [ ] Replace `runclash/app/setting/page.tsx` with:
  - [ ] User Profile Update form (prefill from context/whoami + image upload)
  - [ ] User password update form using same update API
- [ ] Update login flow to set context user after saving cookies

## Testing
- [ ] Run backend dev server and verify endpoints
- [ ] Run frontend dev server and verify forms

