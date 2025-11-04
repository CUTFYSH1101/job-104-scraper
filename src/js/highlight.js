import * as utils from '@/js/utils.js'
import { keywordAliases } from '@/js/config.js'

export function cleanKeyword(keyword) {
  if (!keyword || typeof keyword === 'object') return ''

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

/**
 *
 * @param {string} keyword
 * @returns {{} | {all: string[], must: string[], not: string[]}}
 */
function parseKeyword(keyword) {
  if (!keyword || typeof keyword === 'object') return {}
  let cleaned = cleanKeyword(keyword)
  if (!cleaned) return {}

  let all = cleaned.includes(' ') ? cleaned.split(/\s+/) : [cleaned]
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
function expandAliases(keyword) {
  if (!keyword || typeof keyword === 'object') return ''

  let cleaned = cleanKeyword(keyword)
  let keyword_ = cleaned.toLowerCase().split(/\s+/)
  let must = keyword_.filter(utils.notStartsWithDash)
  let includes = must.intersection(keywordAliases._keys)
  let replace = includes.map(keyword => keywordAliases[keyword]).flat().join(' ')
  includes.forEach(key => cleaned = cleaned.replace(key, ''))
  cleaned += ' ' + replace
  cleaned = cleaned.trim()
  return cleaned
}

export function highlightText(text, keyword) {
  if (!keyword || !text || typeof keyword === 'object') return text

  keyword = expandAliases(keyword)

  // 以空白切割，只強調正向關鍵字
  if (keyword.includes(' ')) {
    let keyword_ = keyword.toLowerCase().split(/\s+/)
    let must = keyword_.filter(utils.notStartsWithDash)
    must.forEach(keyword => text = utils.replace(text, keyword, '<span class="highlight">$1</span>'))
    return text
  }

  // 負面關鍵字表示不用強調
  if (keyword.includes('-'))
    return text

  // 只有一個正向關鍵字
  return utils.replace(text, keyword, '<span class="highlight">$1</span>')
}
