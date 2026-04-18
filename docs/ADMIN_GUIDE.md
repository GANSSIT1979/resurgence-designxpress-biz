# ADMIN GUIDE

## Admin Role Scope

System Admin users oversee:

* sponsor applications
* sponsor records
* creators
* gallery and media
* inquiries
* users and roles
* settings
* reports

## Core Admin Pages

Typical entry points:

* `/admin`
* `/admin/sponsor-submissions`
* `/admin/inquiries`
* `/admin/gallery`

## Reviewing Sponsor Applications

The current schema uses `SponsorApplication`.

Statuses:

* `NEW`
* `UNDER\_REVIEW`
* `APPROVED`
* `DECLINED`

Use the admin submissions page to:

* review inbound records
* update status
* keep the approval pipeline current

## Managing Inquiries

The current inquiry statuses are:

* `NEW`
* `REVIEWED`
* `CLOSED`

Use the admin inquiries page to:

* review messages
* update statuses
* maintain follow-up visibility

## Managing Gallery Assets

Use gallery CMS to:

* upload or assign image paths
* set titles and captions
* mark featured assets
* keep homepage-ready visuals current

## Operational Advice

After any large UI or schema update:

1. regenerate Prisma Client
2. reload the admin dashboard
3. confirm the overview page loads without missing delegate errors
4. confirm submissions, inquiries, and gallery pages load

## Admin Safety Notes

* do not rename Prisma delegates in code casually
* keep schema and generated client aligned
* prefer shared components over page-level one-off UI changes
* validate role-based access on admin-only routes

