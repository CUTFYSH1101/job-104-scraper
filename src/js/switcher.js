import { computed, ref, toRef } from 'vue'

export default function useSwitcher(selections) {
    selections = toRef(selections)
    let currentIndex = ref(0)

    function switchMode(e) {
        e.preventDefault()      // .prevent 避免預設行為如選取
        e.stopPropagation()     // .stop 阻止向上傳遞
        currentIndex.value++
        if (currentIndex.value >= selections.value.length) currentIndex.value = 0
        return selection.value
    }

    function addListener() {
        return {
            click: switchMode,
            touchstart: switchMode,
        }
    }

    let selection = computed(() => selections.value[currentIndex.value])

    return {
        selection,
        switchMode,
        addListener,
    }
}
