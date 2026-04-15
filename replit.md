# big-O-guard

## Overview

A developer tool that analyzes code snippets for Big-O time and space complexity using AI. Paste code, click analyze, get instant complexity metrics with explanations and optimization suggestions. Supports Python, JavaScript, TypeScript, Java, C++, Go, and more.

## Features

- **Analyzer** (`/`): Code editor with line numbers, language selector, AI-powered Big-O analysis
- **History** (`/history`): Scrollable log of past analyses with complexity badges
- **Stats** (`/stats`): Dashboard with complexity distribution charts and language breakdown

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/big-o-guard)
- **API framework**: Express 5 (artifacts/api-server)
- **AI**: OpenAI gpt-5.2 via Replit AI Integrations
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (zod/v4), drizzle-zod
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## DB Schema

- `analyses` table: id, code, language, timeComplexity, spaceComplexity, explanation, suggestions (text[]), createdAt

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string
- `AI_INTEGRATIONS_OPENAI_BASE_URL` — Replit AI proxy base URL
- `AI_INTEGRATIONS_OPENAI_API_KEY` — Replit AI proxy key
