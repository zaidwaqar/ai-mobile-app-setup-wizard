# AI Mobile App Setup Wizard

Turn a beginner-friendly app idea into an Expo-ready mobile product brief with simple commands like `/start`, `/continue`, `/ui`, and `/build`.

Built for non-technical founders, operators, agencies, and AI builders who want the simplest correct mobile architecture before writing production code.

## Why This Repo Exists

Most mobile starters jump straight into screens and code.

Beginners usually need something first:

- a clear app idea
- a focused MVP
- a clean mobile UI direction
- a simple decision on whether backend is actually needed
- a safe place to capture credentials only when required

This project gives you that through a guided conversation flow that works in Expo Go on iOS and Android.

## What It Does

- asks one founder-friendly question at a time
- saves each answer immediately
- separates product, features, UI, integrations, and credentials
- intelligently recommends:
  - local-only
  - local-first with optional sync
  - full cloud backend
- avoids forcing backend or API keys for simple offline utilities
- creates reusable project files AI coding tools can build from

## Quick Start

```bash
npm install
npm run start
```

Then scan the Expo QR code with:

- Expo Go on iPhone
- Expo Go on Android

Inside the app, type:

```text
/start
```

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

## Smart Architecture Logic

The wizard tries to choose the simplest correct setup.

### Local-only

Used for ideas like:

- alarm app
- planner
- notes app
- checklist app
- habit tracker
- calculator
- offline personal utility

These should not be forced into backend, cloud database, or API key setup unless the founder clearly asks for sync, login, shared data, or outside services.

### Local-first with Optional Sync

Used when the app is mostly personal, but sync or outside services may matter later.

### Cloud Backend

Used for ideas like:

- portal
- booking app
- admin app
- school app
- clinic app
- e-commerce app
- team app
- CRM
- marketplace

These usually need shared data, login, admin controls, or remote storage.

## Project Files

The wizard writes clean project files for AI agents and collaborators:

- `project/session/state.json`
- `project/session/checklist.md`
- `project/product-idea.md`
- `project/features.md`
- `project/ui.md`
- `project/integrations.md`
- `project/credentials-checklist.md`
- `project/build-brief.md`

## Example Founder Flow

```text
/start
What should this mobile app be called?
Pocket Planner

In one simple sentence, what should the app do?
It helps busy parents plan family tasks and routines.

Who is this app mainly for?
Busy parents with young children.
```

The wizard keeps going one question at a time and updates the saved state as it learns more.

## Tech Stack

- Expo
- React Native
- TypeScript
- AsyncStorage for device-side persistence
- shared decision engine and repository writer for project docs and tests

## Scripts

```bash
npm run start
npm run android
npm run ios
npm run web
npm run test
npm run lint
npm run typecheck
npm run export
```

## Tests Included

The `tests/` folder includes:

- command flow tests
- persistence tests
- resume and interruption tests
- architecture decision tests
- UI quality tests
- positive and negative validation tests

## Important Notes

- do not store real secrets in this repository
- do not force backend if the app can stay local-first
- keep UI data separate from product and architecture data
- treat `INSTRUCTION.md` as the main AI-facing source of truth

## GitHub-Friendly Summary

If you are publishing this repo, a good short description is:

`A founder-friendly Expo wizard that turns mobile app ideas into build-ready product briefs and picks the simplest correct architecture.`
