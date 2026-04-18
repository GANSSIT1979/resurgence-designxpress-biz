# DATABASE

## Current Provider Strategy

Local development:
- SQLite

Production target:
- PostgreSQL

## Prisma Datasource Pattern

The checked-in schema may use SQLite locally, while your provider-aware setup can prepare the schema for PostgreSQL in production.

## Enums

Current enums include:

- Role
- UserStatus
- InquiryStatus
- SubmissionStatus
- SponsorStatus
- PartnerStatus
- PackageStatus
- DeliverableStatus
- InvoiceStatus
- TransactionType
- EmailQueueStatus

## Core Models

### User
Tracks login, role, status, and optional sponsor or partner linkage.

### Sponsor
Main sponsor business record. Links to:
- SponsorPackage
- SponsorProfile
- SponsorDeliverable
- Invoice
- User
- SponsorApplication

### SponsorApplication
The current application model used for sponsor submissions. Key fields:
- sponsorName
- contactName
- email
- phone
- company
- packageInterest
- message
- status
- sponsorId

### SponsorDeliverable
Tracks sponsor commitments and status progression.

### Invoice
Key fields:
- number
- sponsorId
- customerName
- issuedAt
- dueDate
- totalAmount
- balanceDue
- status
- notes

### Receipt
Key fields:
- number
- invoiceId
- amount
- issuedAt
- notes

### CashierTransaction
Tracks collections, refunds, and adjustments linked to invoices.

### Inquiry
Stores public and support contact requests.

### CreatorProfile
Stores creator bio, stats, story, image, slug, and social links JSON.

### GalleryMedia / MediaEvent
Stores media assets and optional event grouping.

### ChatConversation / ChatMessage
Stores support chat session state and message history.

## Important Delegate Names

Current Prisma delegate names:

- `db.user`
- `db.counter`
- `db.setting`
- `db.contentSection`
- `db.productService`
- `db.inquiry`
- `db.sponsorPackage`
- `db.sponsor`
- `db.sponsorProfile`
- `db.sponsorApplication`
- `db.sponsorDeliverable`
- `db.partner`
- `db.creatorProfile`
- `db.mediaEvent`
- `db.galleryMedia`
- `db.sponsorInventoryItem`
- `db.invoice`
- `db.cashierTransaction`
- `db.receipt`
- `db.reportSnapshot`
- `db.notification`
- `db.emailQueue`
- `db.chatConversation`
- `db.chatMessage`

## Frequent Schema Alignment Errors

Wrong:
- `db.sponsorSubmission`
- `invoiceNumber`
- `balance`
- `receiptNumber`

Correct:
- `db.sponsorApplication`
- `number`
- `balanceDue`
- `number`

## Local Reset Commands

```bash
npm run prisma:generate
npm run db:push
npm run db:seed
```

## Production Migration Guidance

Before production rollout:

- confirm PostgreSQL provider preparation
- run migrations against staging first
- validate decimal handling for money fields
- verify upload path strategy
- verify role-scoped data access
