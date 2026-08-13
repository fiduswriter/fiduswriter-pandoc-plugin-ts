/** @type {import('jest').Config} */
export default {
    rootDir: ".",
    testEnvironment: "node",
    resolver: "ts-jest-resolver",
    extensionsToTreatAsEsm: [".ts"],
    transform: {
        "^.+\\.ts$": [
            "ts-jest",
            {
                useESM: true,
                tsconfig: {
                    module: "NodeNext",
                    moduleResolution: "NodeNext"
                }
            }
        ]
    },
    moduleDirectories: ["node_modules"],
    moduleNameMapper: {
        "^downloadjs$": "<rootDir>/test/mocks/downloadjs.js",
        "^fwtoolkit$": "<rootDir>/test/mocks/fwtoolkit.js",
        "^fwtoolkit/.*": "<rootDir>/test/mocks/fwtoolkit.js",
        "^pandoc-wasm$": "<rootDir>/test/mocks/pandoc-wasm.js"
    },
    testMatch: ["<rootDir>/test/**/*.test.{js,ts}"],
    moduleFileExtensions: ["ts", "js", "mjs", "json"]
}
