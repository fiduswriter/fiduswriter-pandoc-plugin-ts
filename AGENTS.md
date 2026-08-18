# AGENTS.md — @fiduswriter/pandoc

This file contains information for AI coding agents working on the
`fiduswriter-pandoc-plugin-ts` repository. Read this first if you are unfamiliar
with the project.

## Project overview

`@fiduswriter/pandoc` is a TypeScript library that implements Pandoc-based
import/export conversion for Fidus Writer. It builds on top of
`@fiduswriter/document` and `@fiduswriter/books-document` and is consumed by the
`fiduswriter-pandoc-plugin` Django plugin.

- Package name: `@fiduswriter/pandoc`
- License: `AGPL-3.0`
- Repository: `https://git.fiduswriter.org/fiduswriter/fiduswriter-pandoc-plugin-ts.git`
- Author: Johannes Wilm

## Scope

Code in this repository should be limited to:

- Pandoc-based single-document export (`src/exporter.ts`).
- Pandoc-based single-document import (`src/importer.ts`).
- Pandoc-based book export (`src/book_exporter.ts`).
- Shared constants and helpers (`src/constants.ts`, `src/helpers.ts`).

Do **not** put in this repository:

- Pure UI components (those belong in `fwtoolkit`).
- Django-specific logic.
- Fidus Writer plugin hooks (those belong in `fiduswriter-pandoc-plugin`).

## Technology stack

- **Language:** TypeScript 6.0+.
- **Module system:** ESM (`"type": "module"`).
- **Build tool:** `tsc` only; no bundler is used.
- **Test runner:** Jest with `ts-jest` and `--experimental-vm-modules`.

## Directory layout

```
.
├── src/                  # TypeScript source files
│   ├── index.ts          # Public barrel exports
│   ├── constants.ts      # Supported format list
│   ├── helpers.ts        # Shared helpers
│   ├── exporter.ts       # PandocConversionExporter
│   ├── importer.ts       # PandocConversionImporter
│   └── book_exporter.ts  # PandocBookExporter
├── dist/                 # Compiled JS, .d.ts and source maps (generated)
├── test/                 # Jest tests
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Build and test commands

```bash
# Install dependencies
pnpm install

# Compile TypeScript to dist/
pnpm run build

# Run the Jest test suite
pnpm test

# Run linting and formatting checks
pnpm run lint
pnpm run format:check
```

This repository uses pnpm for day-to-day development. Run `pnpm install` to
install dependencies; `package-lock.json` is not tracked (pnpm maintains
`pnpm-lock.yaml`).

## Pre-commit / pre-publish

- `npm publish` triggers `prepublishOnly`, which builds.
- There is no pre-commit hook in this repository; rely on CI and run tests
  before committing.

## Code style guidelines

- Use ES modules and TypeScript strict mode.
- Import local files with the `.js` extension even when the source file is
  `.ts`, e.g. `import {formats} from "./constants.js"`.
- Avoid `any` unless necessary.
- Keep the library backend-agnostic; do not import Django or browser-only APIs
  except where required by the conversion runtime (e.g. `downloadjs`).

## Testing instructions

Tests live in `test/` and run with Jest.

- Use `pnpm test` to run the full suite.
- Tests cover exporter/importer instantiation and conversion round-trips.

## Consumers

This library is consumed by:

- `fiduswriter-pandoc-plugin/` (the Django plugin) for Pandoc import/export UI.
- Potentially `@fiduswriter/cli` for command-line Pandoc conversion.

When publishing a new version, update those consumers and run their tests.

## Release checklist

- Ensure `pnpm run build` succeeds.
- Ensure `pnpm test` passes.
- Update `package.json` version if needed (`npm version patch|minor|major`).
- `npm publish` triggers `prepublishOnly`, which builds.
- Push commits and tags.
- Update downstream consumers (`fiduswriter-pandoc-plugin/`, `@fiduswriter/cli`).

## Useful references

- `package.json` — scripts, exports and dependency versions.
- `tsconfig.json` — compiler options.
- `src/index.ts` — canonical list of public exports.
- `@fiduswriter/document` — the underlying document library this package builds
  on.
