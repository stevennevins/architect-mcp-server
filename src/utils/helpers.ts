const debug = true
export function log(...args: any[]) {
    if (debug) {
        const msg = `[DEBUG ${new Date().toISOString()}] ${args.join(' ')}\n`
        process.stderr.write(msg)
    }
}

export const config = {
    // Add more config values as needed
}

export { version } from './version.js'