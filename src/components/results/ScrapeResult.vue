<template>
  <button @click="callScrape" :disabled="loading">
    {{ loading ? '爬取中...' : '開始爬取' }}
  </button>
  <div v-if="error">錯誤訊息：{{ error }}</div>
  <!-- null, 2 的意思是「縮排 2 個空白」，有換行有縮排，配 <pre> 標籤保留格式 -->
  <div v-if="result">結果：
    <pre>{{ JSON.stringify(result, null, 2) }}</pre>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ScrapeResult',
  data() {
    return {
      result: null,
      loading: false,
      error: null,
    }
  },
  methods: {
    async callScrape() {
      this.loading = true
      this.error = null
      this.result = null

      try {
        const response = await axios.post('api/scrape')
        this.result = response.data.result
      } catch (e) {
        // 前者是 webApi 定義的 jsonify({'success': False, 'result': str(e)}), 500
        // 後者是錯誤但沒觸發，可能是伺服器沒開
        this.error = e.response.data.result || e.message
      } finally {
        this.loading = false
      }
    }
  },
}
</script>

<style scoped lang="sass">

</style>