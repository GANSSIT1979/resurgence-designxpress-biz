# Creator Dashboard QA Checklist

Run after deployment:

```bash
npm run build
```

Verify live routes:

- `/creators`
- `/creators/jake-anilao`
- `/feed`
- `/shop`
- `/sponsor/apply`

Manual checks:

- Creator hero loads image and role data.
- Social buttons open external links in new tabs.
- Missing social platforms show safe empty states.
- Trending video embed loads without breaking layout.
- Analytics/stat cards render without hydration errors.
- Empty states display for missing posts, tagged merch, or media events.
- Mobile bottom nav remains visible and does not overlap content.
