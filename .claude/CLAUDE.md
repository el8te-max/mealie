# Mealie Pro

Project-specific instructions for this fork. Upstream's `CLAUDE.md` (a symlink to `AGENTS.md`) covers general Mealie architecture and conventions. Do not edit it; keep Mealie Pro rules here so upstream merges stay clean.

## Overview

Fork of the open-source [Mealie](https://github.com/mealie-recipes/mealie) recipe manager, for personal/household use.
Goal: a full visual UI/UX redesign so the app is easier to work with, on both mobile and desktop.
End state: runs as a Docker container on the user's home server.

## Repo & branches

- `origin` = github.com/el8te-max/mealie (fork), `upstream` = mealie-recipes/mealie.
- Based on release tag `v3.28.0`. Redesign work lives on branch `pro`.
- Upstream sync: pull backend/API/security fixes from new upstream releases; the frontend is expected to diverge fully.

## Rules

- Keep the redesign confined to `frontend/`. Do not change the backend (`mealie/`) unless unavoidable, and call it out when you do.
- No Docker on the dev Mac. Develop with Node (pnpm) + Python via `uv`. The Docker image is built on the home server.
- Stack: Nuxt 4, Vue 3, Vuetify 4, TypeScript. See `frontend/app/` for pages, components, composables, layouts.
