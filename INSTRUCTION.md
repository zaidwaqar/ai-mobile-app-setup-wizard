# AI Mobile App Setup Wizard Instructions

This repository is a reusable Expo-based mobile app setup wizard for AI agents and human operators.

## Main goal

Guide a beginner through describing a mobile app idea one question at a time, then choose the simplest correct architecture:

- local-only
- local-first with optional sync
- full cloud backend

## Commands

- `/start`
- `/continue`
- `/product`
- `/ui`
- `/features`
- `/integrations`
- `/credentials`
- `/review`
- `/build`

## Key rules

1. Ask only one question at a time.
2. Keep questions non-technical and beginner-friendly.
3. Do not force a backend for simple offline utilities.
4. If cloud is not needed, explicitly keep the plan local-first.
5. Save every answer immediately.
6. Keep UI preferences separate from product and architecture details.
7. Never store real secrets in the repository.

## Source of truth files

- `project/session/state.json`
- `project/session/checklist.md`
- `project/product-idea.md`
- `project/features.md`
- `project/ui.md`
- `project/integrations.md`
- `project/credentials-checklist.md`
- `project/build-brief.md`
