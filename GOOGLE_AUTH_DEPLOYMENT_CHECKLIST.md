# Google Auth Deployment Checklist

## Google Cloud Console

### OAuth Client

- [ ] OAuth client type is **Web application**
- [ ] Authorized JavaScript origins include:

```txt
http://localhost:3000
https://login.resurgence-dx.biz
https://resurgence-dx.biz
https://www.resurgence-dx.biz
```

- [ ] Authorized redirect URIs include:

```txt
http://localhost:3000/api/auth/google
https://login.resurgence-dx.biz/api/auth/google
https://resurgence-dx.biz/api/auth/google
https://www.resurgence-dx.biz/api/auth/google
```

### OAuth Consent Screen

- [ ] App name is configured
- [ ] User support email is configured
- [ ] Developer contact email is configured
- [ ] Authorized domain includes `resurgence-dx.biz`
- [ ] Privacy Policy URL works: `https://resurgence-dx.biz/privacy`
- [ ] Terms of Service URL works: `https://resurgence-dx.biz/terms`
- [ ] Required scopes are included:

```txt
openid
email
profile
```

- [ ] App publishing status is set correctly:
  - [ ] Testing with test users added, or
  - [ ] Published/In production if public access is needed

## Vercel Domains

- [ ] `resurgence-dx.biz` is added to the Vercel project
- [ ] `www.resurgence-dx.biz` is added to the Vercel project
- [ ] `login.resurgence-dx.biz` is added to the Vercel project
- [ ] DNS records are configured correctly
- [ ] SSL certificates are active for all domains
- [ ] `login.resurgence-dx.biz` is not blocked by Deployment Protection
- [ ] Production domain opens publicly without Vercel 401/403 protection

## Vercel Environment Variables

Set these in Vercel project settings:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

- [ ] `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set
- [ ] `GOOGLE_CLIENT_ID` is set to the same Google OAuth client ID
- [ ] `GOOGLE_CLIENT_SECRET` is set
- [ ] Production environment variables are configured
- [ ] Preview environment variables are configured only if testing preview OAuth
- [ ] Development environment variables are configured if using Vercel dev
- [ ] App redeployed after environment variable changes

## Local Environment

`.env.local` should contain:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

- [ ] Local Google origin exists in Google Cloud: `http://localhost:3000`
- [ ] Local redirect URI exists in Google Cloud: `http://localhost:3000/api/auth/google`

## App Routing / Middleware

- [ ] `/login` is public
- [ ] `/api/auth/google` is public
- [ ] `/api/auth/login` is public
- [ ] `/api/auth/logout` is public
- [ ] `/api/auth/me` is accessible after login
- [ ] Middleware does not block Google callback/API auth routes
- [ ] Google login uses POST credential flow to `/api/auth/google`

## App Smoke Tests

- [ ] `/login` loads without console errors
- [ ] Gmail login tab renders Google button
- [ ] Gmail signup tab renders Google button
- [ ] Gmail signup requires terms acceptance first
- [ ] Successful Google signup creates user
- [ ] Successful Google login sets session cookie: `resurgence_admin_session`
- [ ] Role-based redirect lands on the correct dashboard
- [ ] `/api/auth/me` returns authenticated user after login
- [ ] Logout clears authenticated session
- [ ] Refreshing protected dashboard keeps user authenticated

## Error Checks

- [ ] No `redirect_uri_mismatch`
- [ ] No `invalid_client`
- [ ] No `origin_mismatch`
- [ ] No Vercel `403 Forbidden`
- [ ] No Deployment Protection page on OAuth domains
- [ ] No missing `NEXT_PUBLIC_GOOGLE_CLIENT_ID` client-side error
- [ ] No missing `GOOGLE_CLIENT_SECRET` server-side error

## Final Verification Commands

```bash
npm run type-check
npm run lint
npm run build
npx prisma migrate status
```

Expected:

```txt
type-check passes
build passes
Prisma database schema is up to date
lint has warnings only, no errors
```

## Git Commit

```bash
git add .env.example src/app/login/page.tsx src/app/api/auth/google/route.ts
git commit -m "Document and verify Google auth deployment setup"
git push origin main
```

Do not commit `.env.local` or real secrets.
