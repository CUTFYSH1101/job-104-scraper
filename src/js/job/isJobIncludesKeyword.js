// 輸出結果為 string：cleanKeyword
// 輸出結果為 string[]：splitBySpace、parseKeyword
// 輸入 input：cleanKeyword、splitBySpace、parseKeyword
// 輸出 input：cleanKeyword
// 輸出 splitKeywords：splitBySpace、splitKeywords

import { detailConfig } from '@/js/job/detailStorage.js'
import * as utils from '@/js/core/utils.js'
import * as config from '@/js/core/config.js'
import myRegex from '@/js/core/myRegex.js'
import myRegexHref from '@/js/core/myRegexHref.js'

// region 獲取職缺細節
export function getDetail(job) {
  // jobsLoader.setCurrentPath -> setCurrentJob -> getCurrentDetail
  // 路徑設定：由 jobsLoader 指定 details.csv 的所在路徑
  // job 作用：使用 job['網址'] 搜尋相同網址的 detail 資料
  // 兩者合併：開啟 details.csv 後，依網址搜尋對應的 detail 內容
  detailConfig.setCurrentJob(job)
  let detail = detailConfig.getCurrentJobDetail()
  return detail ? utils.joinDictValues(detail) : ''
}

// endregion

// region 關鍵字清理與解析（No IO）
/**
 * 補空格
 * @param {string} keyword input
 * @returns {string} input
 */
export function cleanKeyword(keyword) {
  if (utils.isFalsy(keyword)) return ''

  // 去除前後空格
  keyword = keyword.trim()

  // 判斷是否在斜槓內
  let inSlash = false

  let chars = keyword.split('')
  for (let i = 0; i < chars.length; i++) {
    // 只切換狀態
    if (chars[i] === '/') {
      inSlash = !inSlash
      continue
    }

    // 只有在不在 // 內、且是-、且前面沒空格時，可能是忘記加空格，補空格，避免後續split(' ')失敗
    if (i >= 1 && chars[i] === '-' && chars[i - 1] !== ' ' && !inSlash) {
      chars.splice(i, 0, ' ')
      i++  // 跳過剛剛補進去的那個空格
    }

    if (!inSlash) {
      chars[i] = chars[i].toLowerCase()
    }
  }
  keyword = chars.join('')
  return keyword
}

/**
 * 正則切割->空白切割
 * @param {string} keyword input
 * @returns {string[]} splitKeywords
 */
export function splitBySpace(keyword) {
  keyword = keyword.trim()

  let slashParts = keyword.match(myRegex) || []
  let remaining = keyword.replace(myRegex, '').trim()
  const spaceParts = remaining ? remaining.split(/\s+/) : []

  return [...slashParts, ...spaceParts]
}

/**
 * 補空格->正則切割->空白切割
 * @param {string} keyword input
 * @returns {{} | {all: string[], must: string[], not: string[]}} splitKeywords
 */
export function parseKeyword(keyword) {
  if (utils.isFalsy(keyword)) return {}
  let cleaned = cleanKeyword(keyword)
  if (!cleaned) return {}

  let all = splitBySpace(cleaned)
  return {
    all: all,
    must: all.filter(utils.notStartsWithDash),
    not: all.filter(utils.isStartsWithDash).map(utils.dumpFirst)
  }
}

// endregion

// region 職缺/文字關鍵字比對
// 逐一比對單一關鍵字與職缺標籤
// 目的：避免像搜尋「java」時不小心比對到「javascript」，或搜尋「ml」時誤比對到「html」
// 因為 job['關鍵字'] 與 keywordsPickUp 的來源一致、擷取方式相同，因此可以使用「完全相等」比較
// 而不是 tag.includes(keyword)，能更精準排除像 'javascript'.includes('java') 這類誤判
export function isJobTagsEqualsKeyword(job, keyword) {
  if (!job || !keyword) return false
  keyword = keyword.toLowerCase()
  let tags = utils.getLowerTags(job)

  let aliases = config.keywordAliases[keyword]
  if (aliases && Array.isArray(aliases))
    return aliases.intersection(tags).length > 0

  return tags.some(tag => tag === keyword)  // tags.includes(keyword)
}

export function isJobTagsMatchKeyword(job, keyword) {
  return isTagsMatchKeyword(utils.getLowerTags(job), keyword)
}

export function isTagsMatchKeyword(tags, keyword) {
  if (!tags || !keyword) return false
  let regex = tryParseRegex(keyword)
  if (regex instanceof RegExp)
    return tags.some(tag => regex.test(tag))

  tags = tags.map(tag => tag.toLowerCase())
  keyword = keyword.toLowerCase()

  let aliases = config.keywordAliases[keyword]
  if (aliases && Array.isArray(aliases))
    return aliases.intersection(tags).length > 0

  return tags.some(tag => tag === keyword)
}

/**
 * @param {string} keyword
 * @returns {string|RegExp}
 */
export function tryParseRegex(keyword) {
  let match = keyword.match(myRegex)
  if (match)
    try {
      let pattern = match[0].slice(1, -1)
      return new RegExp(pattern, 'gmi')
    } catch (e) {
      console.warn(`正規表達式解析失敗： ${keyword} ，退回用一般搜尋`)
      return keyword
    }
  return keyword
}

// 1. 這段文字是否包含別名或關鍵字
//    若關鍵字等於別名，優先使用別名比對，避免誤中無關內容
//    比方像搜尋'ai'，等於搜尋以下陣列其一
//    ['ai 工程師', '機器學習', 'machine learning', '深度學習', 'deep learning', 'keras', 'sklearn',
//    'scikit-learn', 'tensorflow', 'pytorch']
//    若不使用別名，會誤匹配到如 'taiwan'、'email'、'tailwind' 等含有 ai 的字詞
// 2. 放在補空格->正則切割->空白切割->別名比對之後
export function matchKeyword(text, keyword) {
  if (!text || !keyword) return false

  // 處理 regex 格式：/pattern/flags，flags（正則修飾符）恆為`gmi`，使用者不可輸入及修改正則修飾符
  let regex = tryParseRegex(keyword)
  if (regex instanceof RegExp)
    return regex.test(text)

  keyword = keyword.toLowerCase()
  text = text.toLowerCase()

  let aliases = config.keywordAliases[keyword]
  if (aliases) return aliases.some(alias => text.includes(alias))

  return text.includes(keyword)
}

export function isJobIncludesKeyword(job, keyword) {
  let detail = getDetail(job)
  if (detail) detail = detail.replace(myRegexHref, '')
  return matchKeyword(detail, keyword)
}

// endregion
