# Google OAuth on Vercel

This checklist fixes Google sign-in errors such as:

```text
Error 400: origin_mismatch
flowName=GeneralOAuthFlow
```

## Why this happens

Google OAuth validates the browser origin that starts the sign-in flow. If the deployed Vercel URL is not listed in the Google OAuth web client, Google rejects the request before it reaches the app.

## Current rejected origin

Add this exact origin in Google Cloud for the current Vercel deployment:

```text
https://resurgence-designxpress-q2p2q9bvu.vercel.app
```

## Google Cloud settings

Go to Google Cloud Console, then:

1. APIs and Services
2. Credentials
3. OAuth 2.0 Client IDs
4. Select the web client used by RESURGENCE

Under **Authorized JavaScript origins**, add the deployed app origins only. Use scheme and host only. Do not include paths or trailing slashes.

Recommended origins:

```text
https://resurgence-designxpress-q2p2q9bvu.vercel.app
https://www.resurgence-dx.biz
https://resurgence-dx.biz
https://login.resurgence-dx.biz
https://admin.resurgence-dx.biz
```

Correct format:

```text
https://example.com
```

Incorrect formats:

```text
https://example.com/
https://example.com/login
```

## Redirect callback URLs

If the implementation uses redirect-based OAuth, add callback URLs under **Authorized redirect URIs**.

Recommended callbacks:

```text
https://resurgence-designxpress-q2p2q9bvu.vercel.app/api/auth/callback/google
https://www.resurgence-dx.biz/api/auth/callback/google
https://login.resurgence-dx.biz/api/auth/callback/google
```

## Vercel environment setup

Set the Google OAuth public client ID for browser-side sign-in. Also set the matching server-side client ID and server-only client secret if the backend verifies Google tokens or uses an OAuth callback flow.

After changing Vercel environment variables, redeploy the app. Existing deployments do not automatically receive changed environment values until redeployed.

## Preview deployment warning

Vercel preview URLs can change per deployment. Google OAuth does not accept wildcard origins for Vercel preview URLs. For stable testing, use one of these approaches:

1. Add each preview URL that needs Google sign-in.
2. Use a stable custom preview domain.
3. Test Google sign-in only on the production/custom domain.

## Verification

After updating Google Cloud and redeploying Vercel:

1. Open the exact Vercel deployment URL.
2. Start Google sign-in from the browser.
3. Confirm the `origin_mismatch` error no longer appears.
4. Confirm the user session is created and the app redirects to the correct dashboard.
