export type PandocFormat = [
    label: string,
    extensions: Array<string>,
    pandocName: string,
    binaryZip: boolean
]

/**
 * File formats that can be converted by pandoc.
 *
 * See https://pandoc.org/MANUAL.html#general-options for a list of supported
 * formats.
 *
 * Each entry is:
 *   [label, fileExtensions, pandocFormatName, isBinaryZipFormat]
 */
export const formats: Array<PandocFormat> = [
    // ["DOCX", ["docx"], "docx", true],
    ["LaTeX", ["tex"], "latex", false],
    ["Markdown", ["md"], "markdown", false],
    ["JATS XML", ["xml"], "jats", false],
    ["Emacs Org Mode", ["org"], "org", false],
    ["reStructuredText", ["rst"], "rst", false],
    ["Textile", ["textile"], "textile", false],
    ["HTML", ["html", "htm"], "html", false],
    ["EPUB", ["epub"], "epub", true]
]
