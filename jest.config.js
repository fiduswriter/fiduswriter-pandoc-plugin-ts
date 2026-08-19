/** @type {import('jest').Config} */
export default {
    rootDir: ".",
    testEnvironment: "node",
    extensionsToTreatAsEsm: [".ts"],
    transform: {
        "^.+\\.ts$": [
            "@swc/jest",
            {
                jsc: {
                    parser: {
                        syntax: "typescript"
                    },
                    target: "es2020"
                }
            }
        ]
    },
    moduleDirectories: ["node_modules"],
    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
        "^downloadjs$": "<rootDir>/test/mocks/downloadjs.js",
        "^fwtoolkit$": "<rootDir>/test/mocks/fwtoolkit.js",
        "^fwtoolkit/.*": "<rootDir>/test/mocks/fwtoolkit.js",
        "^pandoc-wasm$": "<rootDir>/test/mocks/pandoc-wasm.js"
    },
    testMatch: ["<rootDir>/test/**/*.test.{js,ts}"],
    moduleFileExtensions: ["ts", "js", "mjs", "json"]
}
