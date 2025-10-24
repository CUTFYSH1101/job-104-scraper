export function getCookie(name) {
    let parts = []
    if (document.cookie.startsWith(`${name}=`))
        parts = document.cookie.split(`${name}=`)
    else
        parts = document.cookie.split(`; ${name}=`)

    if (parts.length === 2) {
        let value = parts.pop().split(';').shift()
        try {
            return JSON.parse(decodeURIComponent(value))
        } catch (e) {
            return decodeURIComponent(value)
        }
    }
}

export function setCookie(name, value) {
    document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))}; max-age=3600`
}

export function getLocalStorage(name) {
    return JSON.parse(localStorage.getItem(name))
}

export function setLocalStorage(name, value) {
    localStorage.setItem(name, JSON.stringify(value))
}

export function removeLocalStorage(name) {
    localStorage.removeItem(name)
}

export function includes(str, compare) {
    return typeof str == "string" && str.indexOf(compare) > -1
}

/**
 * @param {Object} dict
 * @param {string} compare
 * @returns {boolean}
 */
export function dictIncludes(dict, compare) {
    if (isFalsy(dict)) return false
    return Object.keys(dict).includes(compare)
}

export function count(arr, func) {
    return arr.filter(func).length
}

export function insert(arr, index, value) {
    return arr.toSpliced(index, 0, value)
}

export function sum(arr) {
    return arr.reduce((acc, cur) => acc + cur, 0)
}

export function isArray(val) {
    return Array.isArray(val)
}

export function isDict(val) {
    return typeof val == "object" && val !== null && !Array.isArray(val)
}

export function isFalsy(val) {
    if (typeof val === 'string')
        return !val.trim()
    if (isArray(val))
        return val.length === 0
    if (isDict(val))
        return Object.keys(val).length === 0
    if (typeof val === 'number')
        return isNaN(val)
    return val === null || val === undefined
}

String.prototype.format = function(args) {
    let result = this
    if (arguments.length > 0) {
        for (let i = 0; i < arguments.length; i++) {
            // 使用正則表達式替換，將 {0}, {1} 等替換成對應的參數
            let regex = new RegExp('\\{' + i + '\\}', 'g')
            result = result.replace(regex, arguments[i])
        }
    }
    return result
}

export function prefixEach(arr, separator) {
    return isFalsy(arr) ? '' : separator + arr.join(separator)
}

export function toPercent(f) {
    f *= 100
    f = parseFloat(f.toFixed(2))
    return `${f}%`
}

// 不分大小寫
export function replace(text, search, replace) {
    let regex = new RegExp(`(${search})`, 'gi')  // /search/gi 不分大小寫
    return text.replace(regex, replace)
}

export function joinDictValues(list, separator) {
    return Object.values(list).join(separator)
}

export function getContent(job) {
    return joinDictValues(job, ',')
}

export function getDetail(job) {

}

export function getLowerTags(job) {
    if (job['關鍵字'] === undefined) return []
    return job['關鍵字'].toLowerCase().split(',')
}

export function getTags(job) {
    if (job['關鍵字'] === undefined) return []
    return job['關鍵字'].split(',')
}

export function getTotalTags(jobs) {
    return jobs.map(job => this.getTags(job)).flat()
}

export function getTotalUniqueTags(jobs) {
    return [...new Set(getTotalTags(jobs))]
}

export async function loadText(filepath) {
    let res = await fetch(filepath)
    return await res.text()
}

export async function loadJobs(filepath, onSuccess = filepath => {
}) {
    let text = await loadText(filepath)
    try {
        let jobs = []
        let lines = text.split(/\r?\n/)  // 每行
        let col_names = lines[0].split(',')  // 第一行是欄位名稱 ['網址', '工作名稱', '工作標籤', '關鍵字']
        for (let i = 1; i < lines.length; i++) {  // 跳過第一行
            let job = {}
            if (lines[i].includes('"')) {  // 關鍵字有用""包起來 lines[i] = 網址,工作名稱,工作標籤,"關鍵字"
                let col_keyword = lines[i].split('"')
                let cols = col_keyword[0].split(',')
                col_keyword = col_keyword.at(-2)  // 倒數第二個
                for (let j = 0; j < col_names.length; j++)
                    job[col_names[j]] = cols[j]
                job[col_names.at(-1)] = col_keyword
            } else {  // 關鍵字沒有用""包起來 lines[i] = 網址,工作名稱,工作標籤,關鍵字
                let cols = lines[i].split(',')
                for (let j = 0; j < col_names.length; j++)
                    job[col_names[j]] = cols[j]
            }
            jobs.push(job)
        }

        // dropna
        jobs = jobs.filter(job => joinDictValues(job, '').trim().length > 0 && job['網址'].trim().length > 0)
        onSuccess?.(filepath)
        return jobs
    } catch (e) {
        console.error(e)
        return undefined
    }
}

import Papa from 'papaparse'

export async function loadDetails(filepath) {
    if (!filepath || filepath.length === 0) return undefined
    let text = await loadText(filepath)
    let jobs = []
    Papa.parse(text, {
        complete(result) {
            let lines = result.data
            let col_names = lines[0]
            for (let i = 1; i < lines.length; i++) {  // 每一行
                let job = {}
                for (let j = 0; j < col_names.length; j++)
                    job[col_names[j]] = lines[i][j]
                jobs.push(job)
            }
            jobs = jobs.filter(job => joinDictValues(job, '').trim().length > 0 && job['job-href'].trim().length > 0)
        },
    })
    return jobs
}

export function shortPath(path) {
    if (!path || path.length === 0) return undefined
    let sep = '[\\/\\\\]'
    let folder = '[^\\/\\\\]+'
    let date = '\\d{4}-\\d{2}-\\d{2}'
    let regex = new RegExp(`${sep}${folder}${sep}${date}${sep}`)  // '/xxx/yyyy-mm-dd'
    return path.match(regex)[0]
}
