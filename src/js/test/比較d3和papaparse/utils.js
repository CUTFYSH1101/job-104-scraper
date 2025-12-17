export function getTags(job) {
  if (typeof job['關鍵字'] !== 'string') return []
  return job['關鍵字'].split(',').filter(keyword => keyword.trim())
}

export function getTotalTags(jobs) {
  return jobs.map(job => getTags(job)).flat()
}

export function getTotalUniqueTags(jobs) {
  return [...new Set(getTotalTags(jobs))]
}
