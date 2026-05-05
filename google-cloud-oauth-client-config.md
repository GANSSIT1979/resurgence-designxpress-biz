# Google Cloud OAuth Client Configuration

## Application type

```txt
Web application
```

## Name

```txt
RESURGENCE DesignXpress Web Client
```

## Authorized JavaScript origins

Use origins only. Do not include paths.

```txt
http://localhost:3000
https://login.resurgence-dx.biz
https://resurgence-dx.biz
https://www.resurgence-dx.biz
```

## Authorized redirect URIs

The current app uses Google Identity Services ID-token callback, then posts to `/api/auth/google`.
That means redirect URIs are not required for the active button flow.

Add these anyway for future compatibility with NextAuth/Auth.js or server-side OAuth:

```txt
http://localhost:3000/api/auth/callback/google
https://login.resurgence-dx.biz/api/auth/callback/google
https://resurgence-dx.biz/api/auth/callback/google
https://www.resurgence-dx.biz/api/auth/callback/google
```

## Important

Do not place callback URLs in Authorized JavaScript origins.

Correct origin:

```txt
https://login.resurgence-dx.biz
```

Incorrect origin:

```txt
https://login.resurgence-dx.biz/api/auth/callback/google
```
