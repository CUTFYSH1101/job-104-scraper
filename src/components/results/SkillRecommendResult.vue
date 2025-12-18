<template>
  <div class="container-recommend">
    <SkillRankingResult :jobs="jobs" :keyword="keyword"/>
    <SkillRelationResult :jobs="jobs" :keyword="keyword"/>
  </div>
</template>

<script>
import SkillRankingResult from '@/components/results/SkillRankingResult.vue'
import SkillRelationResult from '@/components/results/SkillRelationResult.vue'
import { setIsGraphPage } from '@/js/graphPage.js'

export default {
  name: 'SkillRecommendResult',
  props: ['jobs', 'keyword'],
  components: { SkillRankingResult, SkillRelationResult },
  activated: () => setIsGraphPage(true),
  deactivated: () => setIsGraphPage(false),
}
</script>

<style scoped lang="sass">
@use '@/styles/variables.sass' as var

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