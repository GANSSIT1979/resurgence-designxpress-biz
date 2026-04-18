# RESURGENCE Powered by DesignXpress

Production-oriented full-stack sponsorship and business platform built with Next.js App Router, TypeScript, Prisma, JWT cookie authentication, and a responsive multi-role dashboard system.

## Documentation Map

- [INSTALL.md](sandbox:/mnt/data/resurgence-docs/INSTALL.md)
- [QUICKSTART.md](sandbox:/mnt/data/resurgence-docs/QUICKSTART.md)
- [ARCHITECTURE.md](sandbox:/mnt/data/resurgence-docs/ARCHITECTURE.md)
- [API.md](sandbox:/mnt/data/resurgence-docs/API.md)
- [DATABASE.md](sandbox:/mnt/data/resurgence-docs/DATABASE.md)
- [DEPLOYMENT.md](sandbox:/mnt/data/resurgence-docs/DEPLOYMENT.md)
- [CONFIGURATION.md](sandbox:/mnt/data/resurgence-docs/CONFIGURATION.md)
- [SECURITY.md](sandbox:/mnt/data/resurgence-docs/SECURITY.md)
- [TESTING.md](sandbox:/mnt/data/resurgence-docs/TESTING.md)
- [TROUBLESHOOTING.md](sandbox:/mnt/data/resurgence-docs/TROUBLESHOOTING.md)
- [CHANGELOG.md](sandbox:/mnt/data/resurgence-docs/CHANGELOG.md)
- [USER_GUIDE.md](sandbox:/mnt/data/resurgence-docs/USER_GUIDE.md)
- [ADMIN_GUIDE.md](sandbox:/mnt/data/resurgence-docs/ADMIN_GUIDE.md)
- [ROADMAP.md](sandbox:/mnt/data/resurgence-docs/ROADMAP.md)

## Platform Summary

This project includes:

- public website pages for Home, About, Services, Sponsors, Sponsor Apply, Contact, and Support
- role-based dashboards for System Admin, Cashier, Sponsor, Staff, and Partner
- sponsor applications, sponsor profiles, sponsor deliverables, gallery/media, creator network, and sponsor inventory
- cashier workflows for invoices, receipts, transactions, and reports
- JWT cookie authentication with seeded demo users
- Prisma persistence with SQLite for local development and PostgreSQL-ready deployment strategy
- optional AI support for the Support page

## Current Stack

- Next.js App Router
- TypeScript
- Prisma ORM
- SQLite local development
- PostgreSQL production target
- JSON Web Token cookie sessions
- Recharts for dashboard charts
- optional OpenAI Agents integration

## Current Database Model Snapshot

The current schema includes these main models:

- User
- Counter
- Setting
- ContentSection
- ProductService
- Inquiry
- SponsorPackage
- Sponsor
- SponsorProfile
- SponsorApplication
- SponsorDeliverable
- Partner
- CreatorProfile
- MediaEvent
- GalleryMedia
- SponsorInventoryItem
- Invoice
- CashierTransaction
- Receipt
- ReportSnapshot
- Notification
- EmailQueue
- ChatConversation
- ChatMessage

## Important Notes

- The current Prisma schema uses `SponsorApplication`, not `SponsorSubmission`.
- The current invoice fields are `number`, `totalAmount`, and `balanceDue`.
- The current receipt field is `number`.
- Optional AI support should degrade safely when `@openai/agents` or `OPENAI_API_KEY` is not configured.
- If you are using the newer premium dashboard layer, keep the shared components and CSS layers aligned together.

## Recommended First Read Order

1. INSTALL.md
2. QUICKSTART.md
3. CONFIGURATION.md
4. DATABASE.md
5. TROUBLESHOOTING.md
6. DEPLOYMENT.md

## Project Goals

- make sponsorship workflows operational, not just presentational
- support public inquiries and sponsor applications
- give administrators and cashiers real day-to-day tools
- provide a professional sponsor-facing portal
- stay modular so future AI, reporting, and automation layers can be added safely
