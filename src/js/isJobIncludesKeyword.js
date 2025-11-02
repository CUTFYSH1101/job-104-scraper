import DetailStorage from '@/js/detailStorage.js'
import * as utils from '@/js/utils.js'
import * as config from '@/js/config.js'

let detailConfig = new DetailStorage()
detailConfig.init()

export async function setCurrentPath(val) {
  await detailConfig.setCurrentPath(val)
}

function getDetail(job) {
  // jobsLoader.setCurrentPath -> setCurrentJob -> getCurrentDetail
  // 路徑設定：由 jobsLoader 指定 details.csv 的所在路徑
  // job 作用：使用 job['網址'] 搜尋相同網址的 detail 資料
  // 兩者合併：開啟 details.csv 後，依網址搜尋對應的 detail 內容
  detailConfig.setCurrentJob(job)
  let detail = detailConfig.getCurrentJobDetail()
  return detail ? utils.joinDictValues(detail) : ''
}

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
