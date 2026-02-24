import * as utils from '@/js/core/utils.js'
import { cleanKeyword, parseKeyword, isJobIncludesKeyword } from '@/js/job/isJobIncludesKeyword.js'

export default function (jobs, keyword_) {
  if (!jobs) return []
  if (utils.isFalsy(keyword_)) return jobs

  let keyword = cleanKeyword(keyword_)
  let keywords = parseKeyword(keyword)
  return jobs.filter(job => {
    if (!keywords.must.every(wordOrGroup => {
      if (utils.isArray(wordOrGroup))
        return wordOrGroup.some(word => isJobIncludesKeyword(job, word))
      else
        return isJobIncludesKeyword(job, wordOrGroup)
    })) return false
    if (keywords.not.some(word => isJobIncludesKeyword(job, word))) return false
    return true
  })
}
