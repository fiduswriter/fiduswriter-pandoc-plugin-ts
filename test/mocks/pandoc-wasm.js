export const convert = (options, content, _files) => {
    return Promise.resolve({
        stdout: `converted:${options.to}:${content}`,
        mediaFiles: {}
    })
}
