- Live Demo：https://cutfysh1101.github.io/job-104-scraper/
- GitHub Repo：https://github.com/CUTFYSH1101/job-104-scraper/

---

### pnpm

1. 用系統管理員開啟cmd
2. （cd到專案目錄，否則將在全局啟用pnpm）
3. corepack enable
4. corepack prepare pnpm@latest --activate
5. 回到 WebStorm 使用`pnpm -v`看是否安裝成功

### 測試 vitest 與 jsdom

- ```bash
  npm install -D vitest
  ```
- ```bash
  npm install -D jsdom
  ```
- 如果要直接測試.vue文件（SFC文件）
  ```bash
  npm install -D @vue/test-utils
  ```
- 在 vite.config.js
  ```javascript
  import { defineConfig } from 'vite'

  export default defineConfig({
    base: './',
    test: {
      environment: 'jsdom',
    },
  })
  ```
- ```bash
  npx vitest
  ```
  或
  配置在 package.json 的 script
  "test": "vitest"
  "test list": "vitest list"
  再用
  ```bash
  npm test
  ```

#### 全域導入，不必在每個測試文件導入`import { test, describe, it, expect, assert, vi } from 'vitest'`

- `vite.config.js`寫入`globals: true`
  ```javascript
  export default defineConfig({
    test: {
      environment: 'jsdom',
      include: 'tests/**/*.{test,spec}.{js,ts}',
      globals: true,
    },
  })
  ```
  或`vitest.config.js`寫入`globals: true`
  ```javascript
  import { defineConfig } from 'vitest/config'
  import vue from '@vitejs/plugin-vue'
  import vueDevTools from 'vite-plugin-vue-devtools'
  import tailwindcss from '@tailwindcss/vite'

  export default defineConfig({
    plugins: [
      vue(),  // 由於`vitest.config.js`優先級大於`vite.config.js`，他不認得.vue檔了
      vueDevTools(),  // 可選
      tailwindcss(),  // 可選
    ],
    test: {
      environment: 'jsdom',
      include: 'tests/**/*.{test,spec}.{js,ts}',
      globals: true,
    },
  })
  ```
- 有ts的話，`tsconfig.json`寫入以下：
  ```json
  {
    "compilerOptions": {
      "types": [
        "vitest/globals"
      ]
    }
  }
  ```

### 使用`BookmarksView.vue`者要搭配

- `BookmarksView.vue`用途是顯示當前工作的書籤號
- `v-bookmark-listener='job'`
- 在`main.js`註冊
  ```javascript
  import { bookmarkListener } from '@/js/bookmark.js'
  app.directive('bookmark-listener', bookmarkListener)
  ```
  或是在組件中註冊
  ```vue
  <script>
  import { bookmarkListener } from '@/js/bookmark.js'
  
  export default {
    directives: {
      bookmarkListener
    },
  }
  </script>
  ```
  由於有三個 xxxResult.vue 都依賴書籤，因此註冊在`main.js`就可以通用在其他 SFC 檔案

### 程式碼關聯圖

- 安裝
  ```bash
  npm i dependency-cruiser -D
  choco install graphviz -y # 如果有choco，反之用別的安裝
  ```
- 輸出html(只需要前者)
  ```bash
  npx dependency-cruiser src -T html > dependencies.html
  ```
- 輸出svg(需要graphviz)
  ```bash
  npx dependency-cruiser src -T dot | dot -T svg > dependencies.svg
  ```
- 用 Claude 著色 AI-Prompt
  ```markdown
  根據關聯圖的耦合程度和程式碼相關性，用不同顏色著色，使用彩虹色票，對比度拉高
  ```
  ```markdown
  根據關聯圖的耦合程度和程式碼相關性，用不同顏色著色，使用彩虹色票，對比度拉高，使用圖二的色票著色圖三，應用圖一到圖二的著色邏輯到圖三
  ### 線段邏輯
  橙色到紅色 (#ffd400, #ff0000)：高耦合
  黃綠到黃色 (#b4ff00, #cfff00, #e9ff00)：中高耦合
  綠色系 (#36ff8a, #21ff55, #15ff00)：中等耦合
  青綠色系 (#5ffff4, #4bffbf)：中低耦合
  藍色系 (#1484ff, #29a4ff, #3ec4ff, #53e5ff)：低耦合模組
  ### 節點邏輯
  紅色 (#ff0000)：最高耦合度（如 src/js/core/utils.js）
  綠色系 (#36ff8a, #21ff55, #15ff00, #0cff1f)：中高耦合
  青色系 (#5ffff4, #4bffbf, #3ec4ff)：中等耦合
  藍色系 (#53e5ff, #29a4ff, #1484ff)：低耦合
  ```

### DEBUG：覆蓋率頁有時會空白一片，已修正，紀錄報錯如下

```javascript
function Bs(t) {
  let e = t.querySelectorAll(".job")
    , n = e ? e.map(i => i.querySelector("a").getAttribute("href")) : Vu().map(i => i.網址);
  e || console.warn("Jobs not found"),
    $o.setJobsAndPoses(e, n)
}

// index-n1-UlX4u.js:1 TypeError: Cannot read properties of null (reading 'querySelectorAll')

tagInKeywords(t)
{
  for (let e of this.mustKeywords)
    if (Fs([t], e))
      return !0;
  return !1
}
,
// index-n1-UlX4u.js:1 TypeError: this.mustKeywords is not iterable

this.processKeywords();
let t = this.mustKeywords.concat(this.notKeywords)
  , e = Qr(this.jobs);
t.some(i => Fs(e, i)) && (this.loading = !0,
// index-n1-UlX4u.js:11 Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'concat')
```

### DEBUG：使用者在輸入正則中...可能會因為正則替代.replace而記憶體爆炸

```javascript
if (keyword.includes('/') && keyword.length > 3) {
  let pattern = keyword.slice(1, -1)  // 去除頭尾/
  let matches = text.match(new RegExp(pattern, 'gmi'))
  if (!matches || matches.length === 0) {
    // console.warn(`${keyword}找不到匹配，原文：${text}`)
    return text
  }
  if (matches.length > 100) {
    // console.warn(`${keyword}匹配數量過多，無法全部高亮，原文：${text}`)
    return text
  }
  // console.log(`${keyword}匹配到：${text}`)
  return utils.replace(text, pattern, '<span class="highlight">$1</span>')
}
```

### 2025/12/19 修正甜甜圈圖

- `if (keywords.some(inputKey => matchKeyword(key, inputKey) || key === inputKey)) return`<br>
  `ai`不該包含`ai`
- `return tags.some(tag => tag === keyword)  // tags.includes(keyword)`<br>
  `ml`不該包含`html`、`mac`不該包含`machine`
- ```javascript
    if (this.colors.length < data.length)
      data = [...data]
        .sort((a, b) => this.value(b) - this.value(a))
        .slice(0, this.colors.length)
    let totalValue = d3.sum(data, this.value)
    data = data.filter(d => this.value(d) / totalValue > 0.01)  // 過濾小於整體資料 1% 的
    this.data = data  // 方便外部log
  ```
  解決甜甜圈容易出錯的問題，
  `Error: <path> attribute d: Expected arc flag ('0' or '1'), "…664048299328,0,0.999856252,1,-34…".`來自於扇形角度不能太小

### 2025/12/18 整理專案結構

#### 2025/12/30補充

##### 取代結尾;

- 搜尋目標
  ```javascript
  /;$/gmi
  ```
  或
  ```regexp
  ;$
  ```
- 取代成
  ```regexp
  ''
  ```

#### 2025/12/24補充

- 搜尋目標
  ```regexp
  \@param\s*\{(.*)\}\s*(\S*)
  ```
- 取代成
  ```regexp
  @param {$1} $2
  ```

#### 每個`<template><script><style>`之間要空格

```regexp
</(template|script|style)>\n<(template|script|style)
```

#### 取代"為'

- 搜尋目標
    - 要包含`=`/空格開頭，空格/換行/>/`/>`結尾
    - 由於`"`是單字邊界，無法搭配`/b`使用
    - `(?=)`內無法被辨識成`$3`
  ```regexp
  (=|\s)"([^'"<>]+)"(?=\s|>|,|/|$)
  ```
- 取代成
  ```regexp
  $1'$2'
  ```
- 檢查是否都取代好了
  ```regexp
  ".*"
  ```

- 檢查都沒有故障
  ```bash
  npm run dev
  ```

#### 將sass和js引用檔中的"取代成'

- 搜尋目標
  ```regexp
  (@use|from|src=)(\s*)"([^"]+)"
  ```
- 取代成
  ```regexp
  $1$2'$3'
  ```

### 整理`src/components`資料夾

移動到detail、results和utils<br>
由於`KeyHint.vue`被引用次數多因此不放入utils<br>
由於`SearchPanel.vue`只有一個檔案且results行為依賴於它，因此不創建search資料夾以放置它<br>
由於`Site.vue`行為更像`App.vue`因此也不放入results

### 關聯圖互動整理

####

在dragging時不要觸發node hover事件<br>
在node hover時不要觸發link hover事件

1. drag start → drag end（假設滑鼠在svg外的狀態，則觸發滑鼠移出）
2. mouse enter node → mouse leave node，內文簡稱node hover
3. svg.mousemove，相當於hover，內文簡稱為link hover事件
   三事件只會進行一邊

1.dragging控制力模擬<br>
2.hover控制節點+線段透明度<br>
3.hover控制線段透明度<br>
在1.dragging時不會觸發2.<br>
在2.時不會觸發3.

####

mouse enter svg → mouse leave svg<br>
偵測滑鼠是否在svg內的狀態

####

svg.click控制關鍵字

####

```javascript
myNodes.on('mouseenter', this.interaction.mouseenterNode)
```

相當於呼叫

```javascript
onEnterNode: id => {
  this._isEnterNode = true
  this.interaction.setHoverNode(id, this.links)
  this.setOpacityByHoverLine(1)
  this.setOpacity(0)
  this.canvasRenderer.draw()
}
```

### `Set` `Map` `.map` 與 `Object`字典物件

- 在js中`Object`可能代表字典、`Array`、`Event`，在此我們只說「字典」物件，字典用途的 Object：key 會被轉成字串，不適合用物件當
  key
  ```javascript
    let obj = {}
    obj['name'] = value

    if (obj['name']) {}
  ```
- `.map`和`Map`完全不一樣，只是剛好名稱一樣
    - 這是`.map`：`let arr2 = arr1.map(el => el.count)`表示轉成一個[count,count,...]陣列後指派給`arr1`
    - 這是`Map`
      ```javascript
        let map = new Map()
        arr1.forEach(el => map.set(el.name, el))  // 注意格式是 `.set(key,value)`
  
        let map = new Map(arr1.map(el => [el.name, el]))  // 注意格式是 `new Map(.map([key,value]))`
  
        return map.get(el.name)
      ```
- `Set`
  ```javascript
    let set = new Set([1,2,3])

    if (set.has(1)) {}
  ```
- 不管是哪個通常都比`Array`的 `arr.find` 和 `arr.filter` 來得快
  因為`find`和`filter`表示重頭找，時間是 O(n)，其餘都是 O(1)

### jobs還未切換過來所造成的錯誤

解法1：等待直到載入

```javascript
// 直到`isJobIncludesKeyword.setCurrentPath`觸發，`calcuLoading.jobsData.getDetail`才不為`undefined`
async function loadingAfterSettingDetailCsvPath(nodes, delay = 100) {
  return await new Promise(resolve => {
    let interval = setInterval(async () => {
      let result = await CalcuLoading.loading(utils.parse(props.jobs), nodes)
      if (!result[0].count) return
      clearInterval(interval)
      resolve(result)
    }, delay)
  })
}
```

解法2：在每個async方法，用await等待它載入<br>
缺點是畫面會等待它而卡頓

```javascript
export async function loadJobs(filepath, onSuccess = filepath => {
}) {
  let async_ = async () => new Promise((resolve, reject) => Papa.parse(filepath, {
    download: true, // 載入檔案而非字串
    header: true, // 轉成[{},{}]格式
    complete(result) {
      resolve(result.data)
    }, error(e) {
      reject(e)
    },
  }))
  try {
    let jobs = await async_()
    jobs = jobs.filter(job => joinDictValues(job, '').trim() && job['網址']?.trim())  // dropna
    await onSuccess?.(filepath)  // 這一行
    return jobs
  } catch (e) {
    console.error(e)
    return undefined
  }
}
```

### 在`d3.join`等有`{}`括住的地方呼叫`this`最好搭配箭頭函數（一般都是希望指向外側的`class`本體）

```javascript
{  // <--注意這個
  g.append('rect')
    .attr('fill', 'white')
    .attr('width', d => d.width)
    .attr('height', this.nodeHeight)
    .lower()
    .call(
      d3.drag()
        .on('start', this.dragStart)
        .on('drag', this.dragging)
        .on('end', this.dragEnd),
    )
    .on('mouseenter', this.interaction.mouseenterNode)
    .on('mouseleave', this.interaction.mouseleaveNode)
    .attr('cursor', 'pointer')
}  // <--注意這個
```

要搭配箭頭函數

```javascript
this.dragging = (event, data) => {
  this.simulation.dragging(event, data)  // `this`指向外側的`class`本體
}
```

而不是函式

```javascript
function dragging(event, data) {
  this.simulation.dragging(event, data)  // `this`指向`function`，此時`this.simulation`為`undefined`
}
```

---

### 力學模擬傳入新的nodes或links，節點會飄到不知道哪裡

DEBUG: 更新`nodes`或`links`不會位置跑掉（錯誤原因：會繼承上一次設定的`vx, vy, x, y`導致偏移）<br>
解決方法有兩種，我選後一種，因為邏輯是每次更新任何屬性，就重新繪製畫面

```javascript
// 經過力學模擬後，`nodes`不會改變，但是`links`會改變，必須還原`links`的`source`和`target`
// 原本links[0] = { 'source': 'A', 'target': 'B' }
// 經過力學模擬，links[0] = { 'source': { id, index, vx, vy, x, y }, 'target': { id, index, vx, vy, x, y } }
let [n2, l2] = CalcuBetweenRelation.calcu(utils.parse(props.jobs))  // okay
// let [n2, l2] = [Object.assign([], nodes), Object.assign([], links)]  // error
let loadingNodesCount = await CalcuLoading.loading(utils.parse(props.jobs), n2)
graph.args = {
  nodes: loadingNodesCount,
  links: l2,
}
```

```javascript
// 資料更新後，統一把 source/target 轉回字串，再調用`d3.forceSimulation`重新綁定和生成位置
if (this.links?.length > 0 && this.links[0].source.id)
  this.links.forEach(link => {
    link.source = link.source.id
    link.target = link.target.id
  })
```

---

### git deploy failed

```commandline
Failed to get remote.origin.url (task must either be run in a git repository with a configured origin remote or must be configured with the "repo" option).
```

錯誤原因：npm套件衝突

解決方式：刪除 `package-lock.json` 和 `node_modules`，再輸入 `npm install` 重新安裝所有套件即可

---

### 找不到App.vue檔案

```commandline
Failed to resolve import "@/App.vue" from "src/main.js". Does the file exist?
```

```commandline
Failed to parse source for import analysis because the content contains invalid JS syntax. Install @vitejs/plugin-vue to handle .vue files.
```

##### 造成問題的原因：

有進程占用了 5173 這個 port 導致 Vue 自動切到 5174，也就是說 `http://localhost:5173/` 連不到，要改成
`http://localhost:5174/`

##### 解決方式：

1. 重啟環境`npm run dev`後點選新網址
2. 關閉占用5173的進程

二擇一，以下是關閉占用進程的方法

```commandline
# 查看誰在使用 5173 port
netstat -ano | findstr :5173

# 會看到類似這樣的輸出：
# TCP    0.0.0.0:5173    0.0.0.0:0    LISTENING    12345
# 最後的數字（12345）就是 Process ID (PID)

# 關閉該進程（用上面查到的 PID）
taskkill /PID 12345 /F
```

或是關閉全部進程

```commandline
# 一次關閉所有 Node.js 進程
taskkill /IM node.exe /F
```

---

### 推送到github

```bash
npm install gh-pages --save-dev

git init
git config --global --add safe.directory 'T:/Programing_RightPath/_WebAndHTML/JS Hahow動畫互動網頁特效入門/4.
js/vue-project'
git remote add origin https://github.com/CUTFYSH1101/job-104-scraper.git
git pull
```

用Fork這款軟體，強制推送master到遠端資料庫origin，所有選項都打勾<br>
詳情看notion教學

### 創建vite

```bash
npm create vite@latest
```
運行
```bash
npx vite
```
或
```bash
npm run dev
```
