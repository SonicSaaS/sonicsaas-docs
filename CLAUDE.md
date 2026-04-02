# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

End-user documentation portal for SonicSaaS, deployed at [docs.sonicsaas.com](https://docs.sonicsaas.com). Content-focused — no product logic, no auth, no database.

## Boundaries

- This repo is **content only** — no product logic, no shared components with the app
- Documentation should match the current state of the product — coordinate when features ship

## Commands

```bash
npm run dev      # Dev server (port 3000)
npm run build    # Production build (static export in production)
npm start        # Start production server
```

## Architecture

- **Nextra 4** on Next.js 15, React 19, TypeScript
- **Content**: MDX files in `content/` organized by feature area (devices, firmware, policies, alerts, integrations, etc.)
- **Navigation**: `_meta.ts` files define sidebar ordering and titles per directory
- **Static export**: In production, `output: 'export'` generates static HTML. Dev mode runs as a normal Next.js server.
- **Components**: Custom components in `components/` for docs-specific UI
- **No backend**: No API routes, no database, no authentication

## Content Structure

All documentation lives in `content/`. Each subdirectory maps to a docs section:

- `getting-started/` — Setup and onboarding guides
- `devices/`, `firmware/`, `configurations/` — Device management
- `policies/`, `operations/`, `alerts/` — Platform features
- `integrations/`, `documentation/` — Third-party integrations
- `security/`, `compliance/`, `vpn/`, `wan/` — Security and network features
- `admin/`, `settings/`, `licensing/` — Administration

Add new pages as `.mdx` files. Update the parent `_meta.ts` to control sidebar placement.

## Security Notice

**This repo is PUBLIC.** Do not add:

- References to private repos or internal architecture details
- Screenshots from the product (may contain client data, device names, internal IPs)
- Credentials, API keys, or connection strings
- Client names, organization names, or any PII
