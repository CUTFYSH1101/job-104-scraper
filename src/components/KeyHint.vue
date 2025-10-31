<template>
  <div class="keys" :style="styles">
    <button class="key"
            v-for="keyName in keys"
            v-on="onClick(keyName)"
            :class="{focused: focusedKey === keyName}">
      {{ keyName }}
    </button>
  </div>
</template>

<script>
export default {
  props: {
    'keys': {},
    'flexDirection': { default: 'row' },
    'bottom': { default: '0.25rem' },
  },
  data() {
    return {
      focusedKey: '',
    }
  },
  methods: {
    dispatchEvent(type, keyName) {
      this.focusedKey = keyName
      window.dispatchEvent(new KeyboardEvent(type, { key: keyName }))
    },
    onClick(keyName) {
      return {
        click: () => this.dispatchEvent('keyup', keyName),
        touchstart: () => this.dispatchEvent('keyup', keyName),
      }
    },
  },
  computed: {
    styles() {
      return {
        flexDirection: this.flexDirection,
        bottom: this.bottom,
      }
    },
  },
}
</script>

<style scoped lang="sass">
$unit: 0.25rem
$unitL: 0.75rem

.keys
  display: flex
  width: fit-content
  height: fit-content
  position: absolute
  right: $unit
  bottom: $unit
  max-width: calc(100% - #{$unit * 2})
// 限制顯示範圍

.key
  box-shadow: 0 $unit 0 rgba(black, 0.05)
  border: 1px solid rgba(black, 0.1)
  border-radius: $unit
  padding: $unit $unitL
  font-size: $unitL
  line-height: $unitL
  margin: 0 $unit $unit 0
  cursor: pointer
  transition: 0.1s
  min-width: 0  // 限制顯示範圍

  &:hover
    transform: scale(1.1)

  &:focus, &.focused
    transform: scale(0.9)
</style>