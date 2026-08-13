export const fileToString = (file: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new window.FileReader()
        reader.onerror = () => reject(reader.error)
        reader.onload = () => resolve(reader.result as string)
        reader.readAsText(file)
    })
