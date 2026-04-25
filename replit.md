# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `cd artifacts/api-server && pnpm dlx tsx src/seed.ts` — re-seed demo data

## Artifacts

- **NutritionGhar** (`artifacts/nutritionghar`) — React + Vite web app for the home-cooked food marketplace.
- **API Server** (`artifacts/api-server`) — Express API for NutritionGhar.

## NutritionGhar feature map

- **Auth**: phone OTP login with cookie sessions. The OTP is shown on the verify screen (demo only). Two roles: `customer` and `chef`.
- **Browse**: Home, Menu (with search + category/tag filters), Dish detail.
- **Cart & checkout**: zustand store, single-chef cart, mock payment, free delivery over ₹500.
- **Orders**: order history, live status tracking (refetches every 8s).
- **Chef**: dashboard with stats, dish CRUD with availability toggle, order pipeline (placed → preparing → out_for_delivery → delivered).
- **Subscriptions**: 5 hardcoded plans for corporate/individual.

## Demo accounts (seeded)

- Customer: phone `9999999999` (any name on first login is fine).
- Chefs: `9000000001` (Meera), `9000000002` (Lakshmi), `9000000003` (Sunita), `9000000004` (Rohan), `9000000005` (Aruna).
- Demo OTP is auto-filled on the verify screen.

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
