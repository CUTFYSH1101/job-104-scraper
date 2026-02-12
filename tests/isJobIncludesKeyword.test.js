import { test, describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { loadJobs } from './jobsLoader.js'
import KeywordCoverageResult from '@/components/results/KeywordCoverageResult.vue'

let csvPath = 'public/data/9.6公里內 所有工程師/2025-10-09/claude/9.6公里內 所有工程師.csv'

test('test', async () => {
    let jobs = loadJobs(csvPath)
    expect(jobs.length).toBe(502)

    // calcuTotalRate
    let wrapper = mount(KeywordCoverageResult, {
        props: {
            jobs,
            keyword: '-javascript',
        },
    })
    await wrapper.vm.updateResult()
    expect(wrapper.vm.skillRateNum.count).toBe(391)
})
