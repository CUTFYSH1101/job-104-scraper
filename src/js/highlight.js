// keyword 型別為 string，而非 string[]
// 輸出結果為 string：cleanKeyword、expandAllAliases、expandMustAliases、highlightText
// 輸出結果為 string[]：splitBySpace、parseKeyword

import * as utils from '@/js/utils.js'
import { keywordAliases } from '@/js/config.js'

export function cleanKeyword(keyword) {
  if (utils.isFalsy(keyword)) return ''

  keyword = keyword.toLowerCase().trim()  // 去除前後空格
  // 假設忘記在其中一個'-'前加上' '，補' '避免後續split(' ')失敗
  if (keyword.includes('-'))
    for (let i = 1; i < keyword.length; i++)
      if (keyword.charAt(i) === '-' && keyword.charAt(i - 1) !== ' ') {
        keyword = keyword.substring(0, i) + ' ' + keyword.substring(i)
        i++
      }
  return keyword
}

export function splitBySpace(keyword) {
  return keyword.includes(' ') ? keyword.split(/\s+/) : [keyword]
}

/**
 *
 * @param {string} keyword
 * @returns {{} | {all: string[], must: string[], not: string[]}}
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

  // 以空白切割，只強調正向關鍵字
  if (keyword.includes(' ')) {
    let keywords = splitBySpace(keyword.toLowerCase())
    let must = keywords.filter(utils.notStartsWithDash)
    must.forEach(keyword => text = utils.replace(text, keyword, '<span class="highlight">$1</span>'))
    return text
  }

  // 只有一個負面關鍵字表示不用強調
  if (keyword.isStartsWithDash())
    return text

  // 只有一個正向關鍵字
  return utils.replace(text, keyword, '<span class="highlight">$1</span>')
}

export default { cleanKeyword, parseKeyword, expandMustAliases, highlightText }
