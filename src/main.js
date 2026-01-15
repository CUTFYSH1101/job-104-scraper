import { createApp } from 'vue'
import App from '@/App.vue'
import { loadAndSetJobs } from '@/js/job/jobsLoader.js'
import '@/styles/styles.css'  // Tailwind Css
import { bookmarkListener } from '@/js/bookmark.js'

let app = createApp(App)
app.directive('bookmark-listener', bookmarkListener)
window.vm = app.mount('#app')
await loadAndSetJobs('data/9.6公里內 所有工程師/2025-10-09/claude/9.6公里內 所有工程師.csv')
