import { readFileSync } from 'fs'
import Papa from 'papaparse'

// 使用 jsdom 而非瀏覽器環境
export function loadJobs(filepath) {
    let csvContent = readFileSync(filepath, 'utf8')
    let result = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true
    })
    return result.data
}
