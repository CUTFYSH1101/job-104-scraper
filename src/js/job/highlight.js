// keyword 型別為 string，而非 string[]
// 輸出結果為 string：expandAllAliases、expandMustAliases、highlightText

import * as utils from '@/js/core/utils.js'
import { keywordAliases } from '@/js/core/config.js'
import { cleanKeyword, splitBySpace } from '@/js/job/isJobIncludesKeyword.js'
import myRegex from '@/js/core/myRegex.js'

/**
 * @param {string} keyword
 * @return string
 */
function expandMustAliases(keyword) {
  if (utils.isFalsy(keyword)) return ''

  let cleaned = cleanKeyword(keyword)
  let keywords = splitBySpace(cleaned.toLowerCase())
  let must = keywords.filter(utils.notStartsWithDash)
  let includes = must.intersection(keywordAliases._keys)
  let replace = includes.map(keyword => keywordAliases[keyword]).flat().join(' ')
  let originCleaned = cleaned.trim()
  includes.forEach(key => cleaned = cleaned.replace(key, ''))
  if (originCleaned) cleaned += ' ' + replace
  cleaned = cleaned.trim()
  return cleaned
}

export function highlightText(text, keyword) {
  if (utils.isFalsy(text) || utils.isFalsy(keyword)) return text

  keyword = expandMustAliases(keyword)

  // 包含正則與空格
  if (keyword.includes('/') && keyword.includes(' ')) {
    let regexes = keyword.match(myRegex)
    let patterns = []
    regexes.forEach(regex => patterns.push(regex.slice(1, -1)))  // 去除頭尾/

    keyword = keyword.replace(myRegex, '')
    let keywords = splitBySpace(keyword.toLowerCase())
    let must = keywords.filter(utils.notStartsWithDash)
    must.forEach(keyword => patterns.push(keyword))

    patterns.sort((a, b) => b.length - a.length)  // 先替換`javascript`再替換`java`
    return utils.replace(text, patterns.join('|'), '<span class="highlight">$1</span>')
  }

  // 單一正則
  if (keyword.includes('/') && keyword.length > 3) {
    let pattern = keyword.slice(1, -1)  // 去除頭尾/
    return utils.replace(text, pattern, '<span class="highlight">$1</span>')
  }

  // 以空格切割，只強調正向關鍵字
  if (keyword.includes(' ')) {
    let keywords = splitBySpace(keyword.toLowerCase())
    let must = keywords.filter(utils.notStartsWithDash)
    must.sort((a, b) => b.length - a.length)  // 先替換`javascript`再替換`java`
    return utils.replace(text, must.join('|'), '<span class="highlight">$1</span>')
  }

  // 只有一個負面關鍵字表示不用強調
  if (keyword.isStartsWithDash())
    return text

  // 只有一個正向關鍵字
  return utils.replace(text, keyword, '<span class="highlight">$1</span>')
}

export function isTimeout(text, keyword) {
  if (utils.isFalsy(text) || utils.isFalsy(keyword)) return false

  // 包含正則與空格
  if (keyword.includes('/') && keyword.includes(' ')) {
    let regexes = keyword.match(myRegex)
    let patterns = []
    regexes.forEach(regex => patterns.push(regex.slice(1, -1)))  // 去除頭尾/

    // 避免輸入過程記憶體爆炸
    let matches = text.match(new RegExp(patterns.join('|'), 'gmi'))
    if (matches && matches.length > 100) return true
  }

  // 單一正則
  if (keyword.includes('/') && keyword.length > 3) {
    let pattern = keyword.slice(1, -1)  // 去除頭尾/

    // 避免輸入過程記憶體爆炸
    let matches = text.match(new RegExp(pattern, 'gmi'))
    if (matches && matches.length > 100) return true
  }
  return false
}
