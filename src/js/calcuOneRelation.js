// 計算單一關鍵字與搜尋條件之間的相關性
import * as utils from '@/js/utils.js'
import { cleanKeyword, splitBySpace } from '@/js/highlight.js'
import { isJobTagsEqualsKeyword, matchKeyword } from '@/js/isJobIncludesKeyword.js'

let filterJobs = (jobs, keyword) => {}
let setHowToFilterJobs = func => filterJobs = func
const reverseKeyword = keyword => {
  keyword = cleanKeyword(keyword)
  let keywords = splitBySpace(keyword)
  let reverse = keywords.reduce((acc, keyword) => {
    return acc.flatMap(combo => [
      [...combo, keyword],
      [...combo, keyword.isStartsWithDash() ? keyword.dumpFirst() : '-' + keyword],
    ])
  }, [[]])
  reverse = reverse.removeArray(keywords)
  return reverse
}
const chi_squared = (a11, a12, a21, a22) => {
  const n = a11 + a12 + a21 + a22
  const critical = 3.84  // alpha=0.05, k=1, 查表得卡方臨界值=3.84

  const e11 = (a11 + a12) * (a11 + a21) / n
  const e12 = (a11 + a12) * (a12 + a22) / n
  const e21 = (a21 + a22) * (a11 + a21) / n
  const e22 = (a21 + a22) * (a12 + a22) / n

  const x2 = ((a11 - e11) ** 2 / e11 +
    (a12 - e12) ** 2 / e12 +
    (a21 - e21) ** 2 / e21 +
    (a22 - e22) ** 2 / e22)

  return { x2: x2, notH0: x2 > critical }  // h0:有95%的信心度表示沒有顯著差異,h1:兩者呈現關係
}
// <pre>
// 1. 計算搜尋結果中，個別關鍵字出現的次數，一筆職缺限出現一次
// 2. 跳過自己，例如當搜尋結果中出現 'python' 這個關鍵字，不搜尋 'python' 和 '-python'
// 3-1. 用卡方檢測，當卡方值x2小於等於臨界值，表示無相關，反之卡方值越大，相關度越高
// 3-2. k = (2-1)*(2-1) = 1，使用alpha = 0.05，帶入卡方分布表查得卡芳臨界值 = 3.84
//      表示在 95%的信心水準下，
//      卡方值x2<=卡方臨界值3.84，表示H0，即無明顯相關，
//      反之，x2>3.84，表示有相關，並且值越大相關度越高
// 3-3. a11, a12, a21, a22分別對應的值（頻率），期望值（頻率）e11 = (a11+a21)*(a11+a12)
//      　　　　　　　　｜　含關鍵字　｜　不含關鍵字
//      搜尋結果　　　　｜　ａ１１　　｜　ａ１２
//      搜尋結果的補集　｜　ａ２１　　｜　ａ２２
// 3-4. 當兩者相關（h1）的情況下，頻率a11>a21，表示有搜尋跟沒搜尋的情況下，關鍵字出現的機率更高了，為正相關
//      反之為負相關，不必考慮 a11===a21 的情況，因為已經確定彼此有相關
// 3-5. h1 = !h0，h0和h1為互斥
// </pre>
const calcu = (jobs, keyword) => {
  let uniqueKeywords = utils.getTotalUniqueTags(jobs)
  if (uniqueKeywords.includes('')) uniqueKeywords.remove('')

  // 遞迴每個關鍵字，計算正面與負面的次數，回傳[{name,count},{name,count},...]
  // 跳過自己的關鍵字
  const calcuIncludesCount = (jobs, keywords) => {
    let result = []
    uniqueKeywords.forEach(key => {
      if (keywords.some(input => matchKeyword(key, input))) return

      let includesCount = utils.count(jobs, job => isJobTagsEqualsKeyword(job, key))
      result.push({ name: key, count: includesCount })
      result.push({ name: '-' + key, count: jobs.length - includesCount })
    })
    result = result.sort((a, b) => b.count - a.count) // 大的排前面
    return result
  }

  // 處理使用者輸入的關鍵字：加入空格、切割、捨棄`-`符號
  keyword = cleanKeyword(keyword)
  let keywords = splitBySpace(keyword)
    .map(key => key.isStartsWithDash() ? key.dumpFirst() : key)

  // 計算搜尋結果，所有關鍵字正面與負面的次數
  let ones = calcuIncludesCount(filterJobs(jobs, keyword), keywords)

  // 計算搜尋結果的補集，所有關鍵字正面與負面的次數
  // 如果正面結果與負面結果剛好呈現相反才蒐集，反之則是不確定是否相關
  // 比方搜尋javascript中，bootstrap出現很多次，
  // 且搜尋-javascript中，bootstrap出現很少次，
  // 才能表明javascript和bootstrap存在某種關聯
  // console.log('負向查詢', reverseKeyword(keyword))  // 回傳[['str1','-str2'],['-str1','str2'],['-str1','-str2']]
  let reverseKeyword2DList = reverseKeyword(keyword)
  let reverses = []
  reverseKeyword2DList.forEach(keywords => {
    let keywordStr = keywords.join(' ').trim()
    let filteredJobs = filterJobs(jobs, keywordStr)
    let reverse = calcuIncludesCount(filteredJobs, keywords.map(key => key.isStartsWithDash() ? key.dumpFirst() : key))
    reverses.push(reverse)
    // console.log(keywordStr, reverse)
  })
  let reverseSum = reverses.flat().reduce((acc, item) => {
    // item 是單個物件 {name: "xxx", count: 123}
    if (acc[item.name]) acc[item.name] += item.count
    else acc[item.name] = item.count
    return acc
  }, {})
  reverseSum = Object.entries(reverseSum).map(([name, count]) => ({ name, count }))
  reverseSum = reverseSum.sort((a, b) => b.count - a.count) // 大的排前面
  // console.log('合併負向查詢', reverseSum)

  let chi_notH0_keywords = []
  // [{name,count},{name,count},...] 轉成 dict[name]=count
  let dictOnes = ones.toDict('name', 'count')
  let dictReversed = reverseSum.toDict('name', 'count')
  uniqueKeywords.forEach(keyword => {
    let a11 = dictOnes[keyword]
    let a12 = dictOnes['-' + keyword]
    let a21 = dictReversed[keyword]
    let a22 = dictReversed['-' + keyword]
    let chi2 = chi_squared(a11, a12, a21, a22)

    let posSum = a11 + a12
    let negSum = a21 + a22
    let posRate = a11 / posSum
    let negRate = a21 / negSum
    let relative = () => {
      if (!chi2.notH0) return '不顯著'
      return posRate > negRate ? '正相關' : '負相關'
    }
    chi_notH0_keywords.push({
      name: keyword,
      x2: parseInt(chi2.x2),
      posRate: utils.toPercent(posRate),
      negRate: utils.toPercent(negRate),
      relative: relative(),
    })
    // console.log(keyword,
    //     '\nχ²=', parseInt(chi2.x2),
    //     '\n顯著性=', chi2.notH0,
    //     '\n在搜索中關鍵字佔了{0}比例的工作({1}/{2})'.format(utils.toPercent(posRate), a11, posSum),
    //     '\n在補集搜索中關鍵字佔了{0}比例的工作({1}/{2})'.format(utils.toPercent(negRate), a21, negSum),
    //     '\n相關性=', relative(),
    // )
  })

  // let _8020Principle = parseInt(0.1 * ones.length)
  // ones = ones.slice(0, _8020Principle).concat(ones.slice(-_8020Principle))
  // return ones

  chi_notH0_keywords = chi_notH0_keywords.sort((a, b) => b.x2 - a.x2)  // 降序
  return chi_notH0_keywords
}
const test = (jobs, keyword) => {
  let ones = calcu(jobs, keyword)
  console.log(keyword, ones)
}

export default { setHowToFilterJobs, calcu, test }
