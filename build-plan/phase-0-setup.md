# Phase 0 — Project setup and guardrails

> Hand this entire file to Claude Code in one session. Build only this phase. Do not start Phase 1.

## Prerequisites

- GitHub repo cloned locally.
- `CLAUDE.md` at the repo root and this `build-plan/` folder committed.
- Node.js LTS and Expo tooling available.

## Goal

A running blank Expo app with the repo, tooling, folder structure, and pinned dependencies in place. No features yet.

## Create the branch

```bash
git checkout main && git pull
git checkout -b phase-0-setup
```

## Context you must respect

- Read `CLAUDE.md` at the repo root first.
- Use the exact folder structure in the "Folder structure" section of `CLAUDE.md`.
- Install only the libraries listed below. Pin every version after install.

## Build tasks

1. Create a new Expo app with TypeScript and Expo Router, with TypeScript strict mode on.
2. Create the folder structure from `CLAUDE.md` (empty placeholder files are fine where a phase will fill them later).
3. Install and then pin these in `package.json`: `@supabase/supabase-js`, `@tanstack/react-query`, `zustand`, `expo-print`, `expo-sharing`, and Expo env config (use `EXPO_PUBLIC_` variables).
4. Add a `.env` for `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`, and add `.env` to `.gitignore`. Add a `.env.example` with empty placeholders.
5. Confirm the app boots to a blank screen on a simulator or a device.

## Kickoff prompt for Claude Code

> Read CLAUDE.md, then implement build-plan/phase-0-setup.md. Do only this phase. Install only the listed libraries and pin their versions. Do not build any features. Ask before assuming anything.

## Files created or modified

- Expo project scaffold, `app/_layout.tsx`, the `/app` and `/src` folder tree
- `package.json` (pinned versions), `.gitignore`, `.env.example`, `tsconfig.json` (strict)

## Guardrails for this phase

- Do not add any library beyond the list above.
- Do not build screens, auth, or data logic. This phase is scaffolding only.
- Never commit `.env`.

## Acceptance checks (must pass before commit)

- [ ] App launches and shows a blank screen on a device or simulator.
- [ ] Folder structure matches `CLAUDE.md`.
- [ ] `package.json` has pinned versions, `.env` is gitignored.
- [ ] TypeScript compiles with no errors.

## Definition of done

- `git add -A && git commit -m "phase-0: project setup and guardrails"`
- Push, open a PR, review the diff, merge to main.
- Stop. Do not begin Phase 1.
