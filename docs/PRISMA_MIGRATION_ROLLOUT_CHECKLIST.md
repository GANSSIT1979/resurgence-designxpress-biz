# Prisma Migration Rollout Checklist

Updated: 2026-05-05

1. Freeze schema target.
2. Generate Prisma client.
3. Review additive SQL.
4. Apply to Preview database.
5. Deploy matching Preview app.
6. Smoke-test auth, feed, upload, save, PayPal, and health.
7. Apply the same migration to Production.
8. Promote matching app build only after DB success.
