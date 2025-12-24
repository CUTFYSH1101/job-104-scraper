// region DOM 樣式相關
// 視窗寬度
export function windowWidth() {
  return window.innerWidth
}

// 視窗高度
export function windowHeight() {
  return window.innerHeight
}

// 撇除滾動條，整體可用區域
export function clientWidth() {
  return document.documentElement.clientWidth
}

// 撇除滾動條，整體可用區域
export function clientHeight() {
  return document.documentElement.clientHeight
}

export function px2dvh(px) {
  return parseFloat(px) / windowHeight() * 100
}

export function dvh2px(dvh) {
  return parseFloat(dvh) * 0.01 * windowHeight()
}

export function getCssRoot(varName) {
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
}

// endregion

// region Cookie & Storage
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
  let second = 60 * 60 * 24 * 30
  document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))}; max-age=${second}`
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

// endregion

// region 陣列、字典、型別工具
export function includes(str, compare) {
  return typeof str == 'string' && str.indexOf(compare) > -1
}

/**
 * @param {Object} dict
 * @param {string} compare
 * @returns {boolean}
 */
export function dictIncludes(dict, compare) {
  if (isFalsy(dict)) return false
  return Object.keys(dict).includes(compare)  // `compare in dict`也可
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
  return typeof val == 'object' && val !== null && !Array.isArray(val) && !(val instanceof Set) && !(val instanceof Map)
}

// typeof val === 'object' 是為了處理 Vue 的 ref() 或 reactive()
export function isFalsy(val) {
  if (typeof val === 'string')
    return !val.trim()
  if (isArray(val))
    return val.length === 0
  if (typeof val === 'object' && val instanceof Event)
    return true
  if (isDict(val))
    return Object.keys(val).length === 0
  if (typeof val === 'number')
    return isNaN(val)
  return val === null || val === undefined
}

// endregion

// region 原型擴充
Object.defineProperty(Object.prototype, '_values', {
  get: function() {
    if (isDict(this)) return Object.values(this)
    if (this instanceof Map) return [...this.values()]
    throw new TypeError('This variable must be a dictionary.')
  },
})
Object.defineProperty(Object.prototype, '_keys', {
  get: function() {
    if (isDict(this)) return Object.keys(this)
    if (this instanceof Map) return [...this.keys()]
    throw new TypeError('This variable must be a dictionary.')
  },
})
// for item in obj._items console.log(item.key, item.value)
Object.defineProperty(Object.prototype, '_items', {
  get: function() {
    if (isDict(this)) return Object.entries(this)
      .map(([key, value]) => ({ key: key, value: value }))
    throw new TypeError('This variable must be a dictionary.')
  },
})
/**
 * @param {Array} compare
 * @returns {Array}
 */
Array.prototype.intersection = function(compare) {
  if (!isArray(compare))
    throw new TypeError('The argument must be an array.')
  return this.filter(item => compare.includes(item))
}
/**
 * @param {Array} universe
 * @returns {Array}
 */
Array.prototype.complement = function(universe) {
  if (!isArray(universe))
    throw new TypeError('The argument must be an array.')
  return universe.filter(item => !this.includes(item))
}
/**
 * @example
 * let arr = [1, 2, 3, 4]
 * arr.remove(2)
 * console.log(arr)       // [1, 3, 4]
 *
 * @example
 * let arr = [1, 2, 3, 4]
 * removed = arr.remove(2)
 * console.log(arr)       // [1, 3, 4]
 * console.log(removed)   // 2
 */
Array.prototype.remove = function(removed) {
  let index = this.indexOf(removed)
  if (index <= -1) throw new Error('This array does not contain the value to be deleted.')
  return this.splice(index, 1)
}
Array.prototype.removeArray = function(removed) {
  return this.filter(item => {
    if (!Array.isArray(item)) return true
    if (item.length !== removed.length) return true
    return !item.every((val, i) => val === removed[i])
  })
}
Array.prototype.copy = function() {
  return this.slice()
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
Array.prototype.toDict = function(keyName, valueName) {
  return Object.fromEntries(this.map(item => [item[keyName], item[valueName]]))
}
/**
 * @template T
 * @param {(el: T) => {}} callback
 */
Set.prototype.forEach = function(callback) {
  for (const el of this) callback(el)
}
/**
 * @template T
 * @param {(el: T) => boolean} callback
 * @returns {Set<T>}
 */
Set.prototype.filter = function(callback) {
  const result = new Set()
  for (const el of this) {
    if (callback(el))
      result.add(el)
  }
  return result
}
/**
 * @param {Set} compare
 * @returns {Set}
 */
Set.prototype.intersection = function(compare) {
  if (!(compare instanceof Set))
    throw new TypeError('The argument must be an set.')
  return this.filter(item => compare.has(item))
}
/**
 * @param {Set} universe
 * @returns {Set}
 */
Set.prototype.complement = function(universe) {
  if (!(universe instanceof Set))
    throw new TypeError('The argument must be an set.')
  return universe.filter(item => !this.has(item))
}
// querySelectorAll
NodeList.prototype.map = function(callback) {
  return [...this].map(callback)
}
NodeList.prototype.filter = function(callback) {
  return [...this].filter(callback)
}
NodeList.prototype.find = function(callback) {
  return [...this].find(callback)
}
NodeList.prototype.some = function(callback) {
  return [...this].some(callback)
}
NodeList.prototype.every = function(callback) {
  return [...this].every(callback)
}
// getElementsXXX
HTMLCollection.prototype.map = function(callback) {
  return [...this].map(callback)
}
HTMLCollection.prototype.forEach = function(callback) {
  return [...this].forEach(callback)
}
HTMLCollection.prototype.filter = function(callback) {
  return [...this].filter(callback)
}
HTMLCollection.prototype.find = function(callback) {
  return [...this].find(callback)
}
HTMLCollection.prototype.some = function(callback) {
  return [...this].some(callback)
}
HTMLCollection.prototype.every = function(callback) {
  return [...this].every(callback)
}

// endregion

// region 語法糖、前綴、轉成百分比，slice、join、startswith進階處理
export function prefixEach(arr, separator) {
  return isFalsy(arr) ? '' : separator + arr.join(separator)
}

export function toPercent(f) {
  f *= 100
  f = parseFloat(f.toFixed(2))
  return `${f}%`
}

export function fractionToFloat(s) {
  let [numerator, denominator] = s.split('/').map(Number)
  return numerator / denominator
}

// 不分大小寫
export function replace(text, search, replace) {
  let regex = new RegExp(`(${search})`, 'gmi')  // /search/gmi 不分大小寫 m包含^$
  return text.replace(regex, replace)
}

String.prototype.isStartsWithDash = function() {
  // this.charAt(0) === '-'
  return this.startsWith('-')
}
export let isStartsWithDash = word => word.isStartsWithDash()
export let notStartsWithDash = word => !word.isStartsWithDash()
String.prototype.dumpFirst = function() {
  return this.substring(1)
}
export let dumpFirst = word => word.dumpFirst()

export let slice = (arrayOrStr, length) => {
  if (isFalsy(arrayOrStr)) return ''
  if (length >= arrayOrStr.length) return arrayOrStr
  if (Array.isArray(arrayOrStr)) return arrayOrStr.slice(0, length)
  return arrayOrStr.slice(0, length) + '...'
}

// endregion

// region 檔案載入與欄位
export function joinDictValues(list, separator = ' ') {
  return Object.values(list).join(separator)
}

export function getContent(job) {
  return joinDictValues(job, ',')
}

export function getLowerTags(job) {
  if (job['關鍵字'] === undefined) return []
  return job['關鍵字'].toLowerCase().split(',').filter(keyword => keyword.trim())
}

export function getTags(job) {
  if (typeof job['關鍵字'] !== 'string') return []
  return job['關鍵字'].split(',').filter(keyword => keyword.trim())
}

export function getTotalTags(jobs) {
  return jobs
    .map(job => getLowerTags(job))
    .flat()
}

export function getTotalUniqueTags(jobs) {
  return [...new Set(getTotalTags(jobs))]
}

export function getEachTagCount(jobs) {
  let total = getTotalTags(jobs)
  let uniqueTags = getTotalUniqueTags(jobs)
  let result = {}
  uniqueTags.forEach(tag1 => result[tag1] = count(total, tag2 => tag1 === tag2))
  return result
}

export async function loadText(filepath) {
  let res = await fetch(filepath)
  return await res.text()
}

import Papa from 'papaparse'

export async function loadJobs(filepath, onSuccess = filepath => {
}) {
  let async_ = async () => new Promise((resolve, reject) => Papa.parse(filepath, {
    download: true, // 載入檔案而非字串
    header: true, // 轉成[{},{}]格式
    complete(result) {
      resolve(result.data)
    }, error(e) {
      reject(e)
    },
  }))
  try {
    let jobs = await async_()
    jobs = jobs.filter(job => joinDictValues(job, '').trim() && job['網址']?.trim())  // dropna
    await onSuccess?.(filepath)
    return jobs
  } catch (e) {
    console.error(e)
    return undefined
  }
}

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

// endregion

// region vue <script setup>
export function parseValue(val) {
  return JSON.parse(JSON.stringify(val.value))
}

export function parse(val) {
  return JSON.parse(JSON.stringify(val))
}

// endregion
