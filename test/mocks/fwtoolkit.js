// Mock for `fwtoolkit` used by @fiduswriter/pandoc tests.

export const addAlert = (_type, _message) => {}

export const get = _url =>
    Promise.resolve({
        text: () => Promise.resolve(""),
        json: () => Promise.resolve({}),
        blob: () => Promise.resolve(new Blob([]))
    })

export const post = (_url, _params) => Promise.resolve({ok: true})

export const postJson = (_url, _data) => Promise.resolve({json: {}})

export const getJson = _url => Promise.resolve({})

export const convertDataURIToBlob = _dataURI => new Blob([])

export const escapeText = text =>
    String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")

export const shortFileTitle = (title, path) => title || path || "untitled"

export const longFilePath = (path, filename) => `${path}${filename}`

export const localizeDate = date => new Date(date).toISOString()

export const staticUrl = path => `/static/${path}`

export const gettext = text => text

export const interpolate = (fmt, ...args) => {
    const values = Array.isArray(args[0]) ? args[0] : args
    return fmt.replace(/%s/g, () => values.shift())
}

export const noSpaceTmp = (strings, ...values) => {
    const tmpStrings = Array.from(strings)
    let combined = ""
    while (tmpStrings.length > 0 || values.length > 0) {
        if (tmpStrings.length > 0) {
            combined += tmpStrings.shift()
        }
        if (values.length > 0) {
            const value = values.shift()
            combined += value !== undefined && value !== null ? String(value) : ""
        }
    }
    return combined
        .split("\n")
        .map(line => line.replace(/^\s*/g, ""))
        .join("")
}

export class ZipFileCreator {
    constructor(
        textFiles = [],
        binaryFiles = [],
        zipFiles = [],
        mimeType = "application/zip",
        date = new Date()
    ) {
        this.textFiles = textFiles
        this.binaryFiles = binaryFiles
        this.zipFiles = zipFiles
        this.mimeType = mimeType
        this.date = date
    }

    init() {
        return Promise.resolve(new Blob(["zip"]))
    }

    convertDataURIToBlob(_dataURI) {
        return new Blob([])
    }
}

export const addProgress = (_type, _title, _options) => ({
    update: (_percentage, _message) => {},
    close: () => {}
})
