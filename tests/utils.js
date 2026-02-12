import { readFileSync } from 'fs'
import { resolve } from 'path'

export async function loadText(filepath) {
    const fullPath = resolve(filepath)
    return readFileSync(fullPath, 'utf-8')
}
