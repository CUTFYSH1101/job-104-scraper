import { ref } from 'vue'

let _isMobile = ref(window.innerWidth <= 430)
export let isMobile = () => _isMobile.value
window.addEventListener('resize', () => _isMobile.value = window.innerWidth <= 430)
