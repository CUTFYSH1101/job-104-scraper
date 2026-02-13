import { test, describe, it, expect, vi, afterEach, beforeAll, assert } from 'vitest'
import { mount } from '@vue/test-utils'
import * as utilsVitest from './utilsVitest.js'
import { loadJobs } from './jobsLoader.js'
import { loadText } from './utils.js'

let csvPath = 'public/data/9.6公里內 所有工程師/2025-10-09/claude/9.6公里內 所有工程師.csv'
let pathPath = 'public/data/paths.txt'

// region mock loadText、setJobsAndPoses
vi.mock('@/js/core/utils.js', async () => {
    let actual = await vi.importActual('@/js/core/utils.js')
    let pathPath = 'public/data/paths.txt'
    return {
        ...actual,
        loadText: async () =>
            await loadText(pathPath),
    }
})
vi.mock('@/js/mobile/setJobsAndPoses.js', () =>
    ({
        default: {
            updated: vi.fn(),
            activated: vi.fn(),
            deactivated: vi.fn(),
        }
    }))
import * as utils from '@/js/core/utils.js'
import KeywordCoverageResult from '@/components/results/KeywordCoverageResult.vue'
// endregion

let jobs
let wrapper

async function mountKeywordCoverageResult() {
    jobs = loadJobs(csvPath)
    wrapper = mount(KeywordCoverageResult, {
        props: {
            jobs,
            keyword: '',
        },
        // 未呼叫 main.js 因此未掛載 app.directive('bookmark-listener', bookmarkListener)
        // KeywordCoverageResult 呼叫 v-bookmark-listener='job' 發警告
        // 大量 jobs 輸出的來源是 Vue 的警告機制，不是程式碼中的 console.log
        global: {
            directives: {
                'bookmark-listener': () => {}
            },
        },
    })
}

test('jobs 和 loadText 是否運作正常', async () => {
    await mountKeywordCoverageResult()
    let path = await loadText(pathPath)
    expect(jobs.length).toBe(502)
    assert(path)
})

describe('calcuTotalRate', async () => {
    beforeAll(mountKeywordCoverageResult)

    async function assertSearchResultLength(keyword, expected) {
        await wrapper.setProps({ keyword: keyword })
        await wrapper.vm.updateResult()
        expect(wrapper.vm.skillRateNum.count).toBe(expected)
    }

    it('應該過濾掉包含 javascript 的工作', async () =>
        await assertSearchResultLength('-javascript', 391))
    it('應該過濾掉包含 python 的工作', async () =>
        await assertSearchResultLength('-python', 409))
    it('應該過濾掉同時包含 python 和 javascript 的工作', async () =>
        await assertSearchResultLength('-python -javascript', 321))
    it('應該找到 java 但排除 javascript', async () =>
        await assertSearchResultLength('/java(?!s)/', 76))
    it('應該找到 java（排除 javascript）且排除 python', async () =>
        await assertSearchResultLength('/java(?!s)/ -python', 55))
    it('應該找到同時包含 java（排除 javascript）和 node.js 的工作', async () =>
        await assertSearchResultLength('/java(?!s)/ node.js', 6))
    it('應該找到包含 javascript 的工作', async () =>
        await assertSearchResultLength('javascript', 111))
    it('應該找到包含 micropython 的工作（預期為 0）', async () =>
        await assertSearchResultLength('micropython', 0))
    it('應該找到包含 python 的工作', async () =>
        await assertSearchResultLength('python', 93))
    it('應該找到包含 python 但排除 java 的工作', async () =>
        await assertSearchResultLength('python -java', 72))
    it('應該找到包含 python 但排除 javascript 的工作', async () =>
        await assertSearchResultLength('python -javascript', 70))
    it('應該找到同時包含 python 和 java（正則）的工作', async () =>
        await assertSearchResultLength('python /java(?!s)/', 21))
    it('應該找到同時包含 python 和 java 的工作', async () =>
        await assertSearchResultLength('python java', 21))
    it('應該找到同時包含 python 和 JavaScript 的工作', async () =>
        await assertSearchResultLength('python JavaScript', 23))
})

describe('calcuRateForeachJob 和 calcuWeightForeachJob', async () => {
    beforeAll(mountKeywordCoverageResult)

    // assert(工作有的標籤, 搜尋的關鍵字, 預期比例, 預期比重)
    async function assert_(jobKeys, search, rate, weight) {
        let fakeJob = {
            '網址': '',
            '工作名稱': '',
            '工作標籤': '',
            '關鍵字': jobKeys
        }
        await wrapper.setProps({
            keyword: search,
            jobs: [fakeJob]
        })
        await wrapper.vm.updateResult()
        fakeJob = wrapper.vm.processedJobs[0]
        utilsVitest.expectOrNone(fakeJob.skillRate, rate)
        utilsVitest.expectOrNone(fakeJob.skillWeight, weight)
    }

    it('正面 負面 ', async () =>
        await assert_('python,vue,JavaScript', 'python vue -java', 1, 2 / 3))
    it('正則', async () => {
        await assert_('python,vue,JavaScript', '/java(?!s)/', undefined, undefined)
        await assert_('python,vue,JAVA', '/java(?!s)/', 1, 1 / 3)
    })
})
