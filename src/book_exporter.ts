import type {BibDB as BibliojsonBibDB} from "bibliojson"
import {BibLatexExporter} from "bibliojson"
import download from "downloadjs"

import {getMissingChapterData} from "@fiduswriter/books-document/exporter/tools"
import type {Book, DocumentListEntry} from "@fiduswriter/books-document"
import {PandocExporterCitations} from "@fiduswriter/document/exporter/pandoc/citations"
import {PandocExporterConvert} from "@fiduswriter/document/exporter/pandoc/convert"
import {
    fixTables,
    removeHidden
} from "@fiduswriter/document/exporter/tools/doc_content"
import {createSlug} from "@fiduswriter/document/exporter/tools/file"
import type {BibDB, CSL, ImageDB, User} from "@fiduswriter/document"
import {get, gettext, interpolate} from "fwtoolkit"
import {ZipFileCreator} from "fwtoolkit/file/zip"

export type ProgressCallback = (
    message: string,
    percentage?: number | null
) => void

export interface PandocBookExporterOptions {
    [key: string]: unknown
}

/**
 * Exports a book via pandoc-wasm, converting each chapter to a chosen format
 * and packaging all converted files into a single ZIP.
 *
 * ZIP structure:
 *
 *   book.json                          → book metadata + chapter list
 *   chapters/<n>/<slug>.<ext>          → converted chapter file
 *   bibliography.bib                   → combined bibliography (if any)
 *
 * The exporter processes chapters sequentially to keep memory usage bounded.
 */
export class PandocBookExporter {
    schema: any
    csl: CSL
    book: Book
    user: User
    docList: DocumentListEntry[]
    updated: Date
    format: string
    fileExtension: string
    mimeType: string
    options: PandocBookExporterOptions
    progressCallback?: ProgressCallback

    textFiles: Array<{filename: string; contents: string}>
    httpFiles: Array<{filename: string; url: string}>
    bibliography: Record<string, Record<string, unknown>>

    constructor(
        schema: any,
        csl: CSL,
        book: Book,
        user: User,
        docList: DocumentListEntry[],
        updated: Date,
        format: string,
        fileExtension: string,
        mimeType: string,
        options: PandocBookExporterOptions = {},
        progressCallback?: ProgressCallback
    ) {
        this.schema = schema
        this.csl = csl
        this.book = book
        this.user = user
        this.docList = docList
        this.updated = updated
        this.format = format
        this.fileExtension = fileExtension
        this.mimeType = mimeType
        this.options = options
        this.progressCallback = progressCallback

        this.textFiles = []
        this.httpFiles = []
        this.bibliography = {}
    }

    init(): Promise<void> {
        if (this.book.chapters.length === 0) {
            throw new Error(
                gettext("Book cannot be exported due to lack of chapters.")
            )
        }

        this.progressCallback?.(gettext("Pandoc export has been initiated."), 0)

        return getMissingChapterData(this.book, this.docList, this.schema)
            .then(() => this.exportContents())
            .catch(error => {
                this.progressCallback?.(gettext("Pandoc export failed."), 100)
                throw error
            })
    }

    async exportContents(): Promise<void> {
        const {convert} = await import("pandoc-wasm")
        const sortedChapters = [...this.book.chapters].sort(
            (a, b) => a.number - b.number
        )

        // ── book.json metadata ──────────────────────────────────────────────
        const bookData = {
            title: this.book.title,
            metadata: this.book.metadata || {},
            settings: this.book.settings || {},
            chapters: sortedChapters.map((chapter, index) => ({
                number: chapter.number,
                part: chapter.part || "",
                chapter_index: index
            }))
        }
        this.textFiles.push({
            filename: "book.json",
            contents: JSON.stringify(bookData, null, 2)
        })

        // ── Process chapters sequentially ───────────────────────────────────
        for (
            let chapterIndex = 0;
            chapterIndex < sortedChapters.length;
            chapterIndex++
        ) {
            const chapter = sortedChapters[chapterIndex]
            const doc = this.docList.find(d => d.id === chapter.text)
            if (!doc) {
                continue
            }

            this.progressCallback?.(
                interpolate(gettext("Converting chapter %s of %s..."), [
                    chapterIndex + 1,
                    sortedChapters.length
                ]),
                Math.round((chapterIndex / sortedChapters.length) * 80)
            )

            const chapterSlug = createSlug(doc.title || gettext("Untitled"))
            const docContent = fixTables(removeHidden(doc.content) as any)
            const imageDB: ImageDB = {db: doc.images || {}}
            const bibDB: BibDB = {db: doc.bibliography || {}}

            // ── 1. Convert chapter content to Pandoc JSON AST ──────────────
            // Create a minimal exporter mock so PandocExporterConvert &
            // PandocExporterCitations can operate without the full
            // PandocExporter infrastructure from the editor.
            const exporterMock: any = {
                citations: null,
                doc: {settings: doc.settings || {}}
            }

            const citations = new PandocExporterCitations(
                exporterMock,
                bibDB,
                this.csl,
                docContent
            )

            await citations.init()

            exporterMock.citations = citations

            const converter = new PandocExporterConvert(
                exporterMock,
                imageDB,
                bibDB,
                doc.settings || {}
            )

            const conversion = converter.init(docContent)

            // ── 2. Collect used bibliography entries ────────────────────────
            Object.keys(conversion.usedBibDB).forEach(bibId => {
                this.bibliography[bibId] = (doc.bibliography || {})[bibId]
            })

            // ── 3. Queue image downloads ────────────────────────────────────
            conversion.imageIds.forEach(id => {
                const entry = (doc.images || {})[id]
                if (entry && typeof entry.image === "string") {
                    this.httpFiles.push({
                        filename: entry.image.split("/").pop() || "",
                        url: entry.image
                    })
                }
            })

            // ── 4. Download images for pandoc-wasm ─────────────────────────
            const binaryFiles = conversion.imageIds
                .map(id => {
                    const entry = (doc.images || {})[id]
                    if (!entry || typeof entry.image !== "string") {
                        return null
                    }
                    const imageUrl = entry.image
                    return get(imageUrl)
                        .then(response => response.blob())
                        .then(blob => ({
                            filename: imageUrl.split("/").pop() || "",
                            contents: blob
                        }))
                })
                .filter(
                    (p): p is Promise<{filename: string; contents: Blob}> =>
                        p !== null
                )

            const downloadedFiles = await Promise.all(binaryFiles)

            const pandocFiles: Record<string, string | Blob> = {}
            downloadedFiles.forEach(f => {
                if (f) {
                    pandocFiles[f.filename] = f.contents
                }
            })

            // ── 5. Add bibliography for this chapter (if any) ──────────────
            const hasBib = Object.keys(conversion.usedBibDB).length > 0
            const chapterBibEntries: Record<
                string,
                Record<string, unknown>
            > = {}
            if (hasBib) {
                Object.keys(conversion.usedBibDB).forEach(bibId => {
                    if ((doc.bibliography || {})[bibId]) {
                        chapterBibEntries[bibId] = (doc.bibliography || {})[
                            bibId
                        ]
                    }
                })
            }

            const pandocOptions: Record<string, unknown> = {
                from: "json",
                to: this.format,
                standalone: true
            }

            if (hasBib && Object.keys(chapterBibEntries).length > 0) {
                const bibExport = new BibLatexExporter(
                    chapterBibEntries as unknown as BibliojsonBibDB
                )
                const bibContents = bibExport.parse()
                pandocFiles["bibliography.bib"] = bibContents
                pandocOptions.bibliography = "bibliography.bib"
                pandocOptions.citeproc = true
            }

            // ── 6. Convert via pandoc-wasm ─────────────────────────────────
            const content = JSON.stringify(conversion.json)
            const {stdout: out} = await convert(
                pandocOptions,
                content,
                pandocFiles
            )

            // Add converted file to text files
            const outputFilename = `chapters/${chapterIndex}/${chapterSlug}.${this.fileExtension}`
            this.textFiles.push({
                filename: outputFilename,
                contents: out as string
            })
        }

        // ── 7. Add combined bibliography at book level (if any) ────────────
        if (Object.keys(this.bibliography).length > 0) {
            const bibExport = new BibLatexExporter(
                this.bibliography as unknown as BibliojsonBibDB
            )
            this.textFiles.push({
                filename: "bibliography.bib",
                contents: bibExport.parse()
            })
        }

        // ── 8. Create and download the ZIP ─────────────────────────────────
        this.progressCallback?.(gettext("Creating ZIP archive..."), 90)
        return this.createZip().then(() => {
            this.progressCallback?.(
                gettext("Pandoc book export complete."),
                100
            )
        })
    }

    createZip(): Promise<void> {
        const zipper = new ZipFileCreator(
            this.textFiles,
            this.httpFiles,
            undefined,
            undefined,
            this.updated
        )
        return zipper.init().then(blob => this.download(blob))
    }

    download(blob: Blob): void | Promise<void> {
        const zipName = `${createSlug(this.book.title)}.${this.format}.zip`
        return download(blob, zipName, "application/zip")
    }
}
