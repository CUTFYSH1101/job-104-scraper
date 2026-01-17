import { describe, it, expect, vi } from 'vitest'

vi.mock('@/js/job/detailStorage.js', () => ({
    detailConfig: {
        setCurrentJob: vi.fn(),
        getCurrentJobDetail: vi.fn(),
    }
}))

import { parseKeyword, isTagsMatchKeyword } from '../isJobIncludesKeyword.js'

describe('parseKeyword', () => {
    it('應該正確解析關鍵字', () => {
        const result = parseKeyword('python vue -java')
        console.log(result)
        expect(result.must).toContain('python')
        expect(result.not).toContain('java')
    })
})

// 從 KeywordCoverageResult.vue 抽出的純函數版本
function calcuSkillRate(job, processedKeywords, notKeywords) {
    let total = processedKeywords.length
    let notMisses = notKeywords.length - job.notMatches.length
    let count = job.mustMatches.length + notMisses
    return count / total
}

describe('calcuSkillRate', () => {
    it('全部符合時應該是 100%', () => {
        const job = {
            mustMatches: ['python', 'vue'],
            notMatches: []  // 沒有匹配到負面關鍵字
        }
        const processedKeywords = ['python', 'vue', 'java']  // java 是負面
        const notKeywords = ['java']

        const rate = calcuSkillRate(job, processedKeywords, notKeywords)
        // must: 2/2, not: 1-0=1 (沒踩到負面加分)
        // total = 3, count = 2 + 1 = 3
        expect(rate).toBe(1)
    })

    it('部分符合時應該計算正確比例', () => {
        const job = {
            mustMatches: ['python'],  // 只符合 python
            notMatches: ['java']      // 踩到負面關鍵字
        }
        const processedKeywords = ['python', 'vue', 'java']
        const notKeywords = ['java']

        const rate = calcuSkillRate(job, processedKeywords, notKeywords)
        // must: 1, notMisses: 1-1=0
        // total = 3, count = 1 + 0 = 1
        expect(rate).toBeCloseTo(1/3)
    })
})
