import {createApp} from 'vue'
import App from '@/App.vue'
import * as utils from '@/js/utils'
import {setCurrentPath} from '@/js/detailPreview.js'

window.vm = createApp(App).mount('#app')
let jobs = await utils.loadJobs('data/9.6公里內 所有工程師/2025-10-09/claude/9.6公里內 所有工程師.csv', setCurrentPath)
if (jobs && jobs.length > 0)
    window.vm.jobs = jobs
