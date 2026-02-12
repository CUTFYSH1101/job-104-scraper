import { test, describe, it, expect, vi, afterEach, assert } from 'vitest'
import { mount } from '@vue/test-utils'
import { loadJobs } from './jobsLoader.js'
import { loadText } from './utils.js'

let csvPath = 'public/data/9.6公里內 所有工程師/2025-10-09/claude/9.6公里內 所有工程師.csv'
let pathPath = 'public/data/paths.txt'

// region mock loadText
vi.mock('@/js/core/utils.js', async () => {
    let actual = await vi.importActual('@/js/core/utils.js')
    let pathPath = 'public/data/paths.txt'
    return {
        ...actual,
        loadText: async () => await loadText(pathPath),
    }
})
import * as utils from '@/js/core/utils.js'
import KeywordCoverageResult from '@/components/results/KeywordCoverageResult.vue'
// endregion

test('test', async () => {
    let jobs = loadJobs(csvPath)
    let path = await loadText(pathPath)
    expect(jobs.length).toBe(502)
    assert(path)

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
