<template>
  <div class="container-recommend">
    <SkillRankingResult :jobs="jobs" :keyword="keyword"/>
    <SkillRelationResult :jobs="jobs" :keyword="keyword"/>
  </div>
</template>

<script>
import SkillRankingResult from '@/components/SkillRankingResult.vue'
import SkillRelationResult from '@/components/SkillRelationResult.vue'

export default {
  name: 'SkillRecommendResult',
  props: ['jobs', 'keyword'],
  components: { SkillRankingResult, SkillRelationResult },
}
</script>

<style scoped lang="sass">
@use "@/styles/variables.sass" as var

=fillWindow()
  width: 100%
  height: 100%
  margin: 0

.container-recommend
  +fillWindow
  display: flex
  flex-direction: column
  gap: 20px
</style>