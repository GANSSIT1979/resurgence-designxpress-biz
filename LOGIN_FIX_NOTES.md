# Login Fix Notes

Updated: 2026-04-16

## Purpose

This note records the authentication pass that improved login redirects, session cleanup, and role-aware routing.

## Current State

- demo accounts are hashed
- auth remains JWT cookie based
- stale session cleanup is still part of the current expected auth flow

## Canonical Docs

- `docs/SECURITY.md`
- `docs/USER_GUIDE.md`
- `docs/TROUBLESHOOTING.md`
