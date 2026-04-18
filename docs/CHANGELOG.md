# CHANGELOG

## Unreleased

### Added
- premium dashboard shell and page orchestration layer
- shared CRUD, chart, table, form, and semantics components
- sponsor-facing overview and module page upgrades
- admin and cashier overview upgrades
- optional AI support integration pattern
- chat session persistence models and routes
- support for creator, gallery, sponsor inventory, and cashier modules

### Changed
- aligned module pages with actual Prisma schema names
- corrected sponsor application usage to `SponsorApplication`
- corrected invoice fields to `number` and `balanceDue`
- corrected receipt field to `number`
- improved login, logout, and dashboard navigation behavior
- improved Windows local setup resilience
- improved CSS consistency and dashboard visual language

### Fixed
- Prisma client initialization issues
- optional AI import build issues
- auth helper export mismatches
- schema mismatch runtime crashes
- broken CSS media block nesting
- sponsor profile JSON parsing errors
- login/dashboard routing loop issues

## Documentation Release
- created full markdown documentation set
- documented schema-aligned model names
- documented deployment, config, security, testing, and troubleshooting flows
