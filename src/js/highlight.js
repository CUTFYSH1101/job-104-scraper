// keyword 型別為 string，而非 string[]
// 輸出結果為 string：expandAllAliases、expandMustAliases、highlightText

import * as utils from '@/js/utils.js'
import { keywordAliases } from '@/js/config.js'
import { cleanKeyword, splitBySpace } from '@/js/isJobIncludesKeyword.js'

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
    must.sort((a, b) => b.length - a.length)  // 先替換`javascript`再替換`java`
    must.forEach(keyword => text = utils.replace(text, keyword, '<span class="highlight">$1</span>'))
    return text
  }

  // 只有一個負面關鍵字表示不用強調
  if (keyword.isStartsWithDash())
    return text

  // 只有一個正向關鍵字
  return utils.replace(text, keyword, '<span class="highlight">$1</span>')
}
