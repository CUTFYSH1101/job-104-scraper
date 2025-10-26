import { createApp } from 'vue'
import App from '@/App.vue'
import { loadAndSetJobs } from '@/js/jobsLoader.js'

window.vm = createApp(App).mount('#app')
await loadAndSetJobs('data/9.6公里內 所有工程師/2025-10-09/claude/9.6公里內 所有工程師.csv')
