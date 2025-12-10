import DetailStorage from '@/js/detailStorage.js'
import * as utils from '@/js/utils.js'
import * as config from '@/js/config.js'

let detailConfig = new DetailStorage()
await detailConfig.init()

export async function setCurrentPath(val) {
  await detailConfig.setCurrentPath(val)
}

export function getDetail(job) {
  // jobsLoader.setCurrentPath -> setCurrentJob -> getCurrentDetail
  // 路徑設定：由 jobsLoader 指定 details.csv 的所在路徑
  // job 作用：使用 job['網址'] 搜尋相同網址的 detail 資料
  // 兩者合併：開啟 details.csv 後，依網址搜尋對應的 detail 內容
  detailConfig.setCurrentJob(job)
  let detail = detailConfig.getCurrentJobDetail()
  return detail ? utils.joinDictValues(detail) : ''
}

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

  return tags.includes(keyword)
}

// 這段文字是否包含別名或關鍵字
// 若關鍵字等於別名，優先使用別名比對，避免誤中無關內容
// 比方像搜尋'ai'，等於搜尋以下陣列其一
// ['ai 工程師', '機器學習', 'machine learning', '深度學習', 'deep learning', 'keras', 'sklearn',
// 'scikit-learn', 'tensorflow', 'pytorch']
// 若不使用別名，會誤匹配到如 'taiwan'、'email'、'tailwind' 等含有 ai 的字詞
export function matchKeyword(text, keyword) {
  if (!text || !keyword) return false
  keyword = keyword.toLowerCase()
  text = text.toLowerCase()

  let aliases = config.keywordAliases[keyword]
  if (aliases) return aliases.some(alias => text.includes(alias))

  return text.includes(keyword)
}

export function isJobIncludesKeyword(job, keyword) {
  return matchKeyword(getDetail(job), keyword)
}
