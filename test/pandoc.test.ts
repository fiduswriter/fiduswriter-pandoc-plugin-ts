import {
    formats,
    PandocConversionExporter,
    PandocConversionImporter,
    PandocBookExporter,
    fileToString
} from "../src/index.js"

describe("@fiduswriter/pandoc", () => {
    it("exports supported formats", () => {
        expect(formats).toBeInstanceOf(Array)
        expect(formats.length).toBeGreaterThan(0)
        const [label, extensions, pandocName, binaryZip] = formats[0]
        expect(typeof label).toBe("string")
        expect(extensions).toBeInstanceOf(Array)
        expect(typeof pandocName).toBe("string")
        expect(typeof binaryZip).toBe("boolean")
    })

    it("exports fileToString helper", () => {
        expect(typeof fileToString).toBe("function")
    })

    it("can instantiate PandocConversionExporter", () => {
        const doc = {
            id: 1,
            title: "Test",
            content: {type: "doc", content: []},
            settings: {}
        }
        const exporter = new PandocConversionExporter(
            "markdown",
            "md",
            "text/markdown",
            {},
            doc,
            {db: {}},
            {db: {}},
            {} as any,
            new Date()
        )
        expect(exporter).toBeInstanceOf(PandocConversionExporter)
        expect(exporter.format).toBe("markdown")
    })

    it("can instantiate PandocConversionImporter", () => {
        const file = new File(["test"], "test.md", {type: "text/markdown"})
        const importer = new PandocConversionImporter(
            file,
            {id: 1},
            "/",
            null,
            {
                getTemplate: () => Promise.resolve({}),
                importBibliography: () => Promise.resolve({}),
                nativeBackend: {} as any
            }
        )
        expect(importer).toBeInstanceOf(PandocConversionImporter)
    })

    it("can instantiate PandocBookExporter", () => {
        const book = {
            title: "Test Book",
            metadata: {},
            settings: {language: "en"},
            chapters: [{text: 1, number: 1}]
        }
        const exporter = new PandocBookExporter(
            {},
            {} as any,
            book,
            {id: 1},
            [],
            new Date(),
            "markdown",
            "md",
            "text/markdown"
        )
        expect(exporter).toBeInstanceOf(PandocBookExporter)
    })
})
