<p align="center">
  <h1 align="center">@fiduswriter/pandoc</h1>
</p>

<p align="center">Pandoc-based import/export conversion for Fidus Writer</p>

---

## What it does

Implements document- and book-level conversion using
[pandoc-wasm](https://github.com/jgm/pandoc-wasm). It builds on top of
`@fiduswriter/document` and `@fiduswriter/books-document` and is backend
agnostic: it can be used from the browser, from Node.js, or from
`@fiduswriter/cli`.

### Supported operations

| Operation                  | Description                                                               |
| -------------------------- | ------------------------------------------------------------------------- |
| `PandocConversionExporter` | Convert a single Fidus document to any pandoc output format.              |
| `PandocConversionImporter` | Import a file (DOCX, EPUB, ODT, LaTeX, etc.) into Fidus JSON via pandoc.  |
| `PandocBookExporter`       | Convert every chapter of a Fidus book and package the results into a ZIP. |

## Exports

Main entry exports:

| Export    | Description                              |
| --------- | ---------------------------------------- |
| `formats` | List of supported import/export formats. |

### Subpath exports

| Path              | Description                |
| ----------------- | -------------------------- |
| `./exporter`      | `PandocConversionExporter` |
| `./importer`      | `PandocConversionImporter` |
| `./book_exporter` | `PandocBookExporter`       |
| `./formats`       | Format constants           |

## Installation

```bash
npm install @fiduswriter/pandoc
```

## Usage

```ts
import {PandocConversionExporter} from "@fiduswriter/pandoc/exporter"
import {PandocConversionImporter} from "@fiduswriter/pandoc/importer"
import {formats} from "@fiduswriter/pandoc/formats"
```

## Development

```bash
npm install          # Install dependencies
npm run build        # Compile TypeScript to dist/
npm run typecheck    # Check types without emitting
npm test             # Run test suite (Jest)
npm run lint         # Lint with ESLint
npm run format:check # Check formatting with Prettier
```

## License

AGPL-3.0 — see [LICENSE](LICENSE) for details.
