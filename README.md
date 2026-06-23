# Marble App — Phased Build Pack

Build files for Claude Code, one phase at a time. Each phase is a separate file you hand to Claude Code in a single session. Build, verify, commit, then move to the next. This small, scoped context is the main thing that stops the AI from drifting or inventing fields.

## Repo layout

- Put `CLAUDE.md` at the repo **root**.
- Put every `phase-*.md` file in a `/build-plan` folder in the repo.
- Commit and push that before you start Phase 0.

## The build loop (repeat for each phase, in order)

1. Create the phase branch (the command is at the top of each phase file).
2. Open Claude Code in the repo and paste the kickoff prompt from the phase file, for example:
   `Read CLAUDE.md, then read and implement build-plan/phase-1-supabase-backend.md. Do only this phase. Ask me before assuming anything.`
3. When it finishes, run the acceptance checks listed in that file.
4. Only when every check passes: commit with the message in the file, push, open a pull request, review the diff, and merge to main.
5. Move to the next phase. Never run two phases in one session.

## Golden rules (also in CLAUDE.md)

- One phase at a time. Do not skip ahead.
- The database schema and the generated TypeScript types are law. Never invent a field.
- No new libraries or version changes without your approval. Pin versions after install.
- Check official Expo and Supabase docs. Do not guess APIs.
- Verify acceptance, then commit. Green before commit.
- The Supabase anon key is safe in the app. The service role key never goes in the app.

## Build order

| File | Phase |
|---|---|
| `phase-0-setup.md` | Project, tooling, repo, folder structure |
| `phase-1-supabase-backend.md` | Database, security, seed data, types |
| `phase-2-data-layer.md` | Supabase client, typed cached queries |
| `phase-3-auth-roles.md` | Login, admin and staff roles |
| `phase-4-product-admin.md` | Owner manages products and prices |
| `phase-5-add-item-cart-calc.md` | Measuring, cart, calculation |
| `phase-6-invoice-pdf.md` | Invoice generation and PDF |
| `phase-7-history.md` | Saved invoices |
| `phase-8-polish-offline.md` | Hardening, offline reads, validation |
| `phase-9-build-ship.md` | Store builds and submission |

## Pre-build checklist (do once)

- [ ] Node.js LTS, Git, and Claude Code installed
- [ ] GitHub repo created and cloned locally
- [ ] Supabase project created (note the project URL and anon key)
- [ ] Expo (EAS) account
- [ ] Apple Developer enrollment started ($99/year, can take a day or two)
- [ ] Google Play Console ($25 one-time)
- [ ] `CLAUDE.md` placed at the repo root, `build-plan/` folder pushed

## Progress tracker

- [ ] Phase 0
- [ ] Phase 1
- [ ] Phase 2
- [ ] Phase 3
- [ ] Phase 4
- [ ] Phase 5
- [ ] Phase 6
- [ ] Phase 7
- [ ] Phase 8
- [ ] Phase 9
