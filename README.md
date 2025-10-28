### git deploy failed

```commandline
Failed to get remote.origin.url (task must either be run in a git repository with a configured origin remote or must be configured with the "repo" option).
```

錯誤原因：npm套件衝突

解決方式：刪除 `package-lock.json` 和 `node_modules`，再輸入 `npm install` 重新安裝所有套件即可

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

npm install gh-pages --save-dev

git init
git config --global --add safe.directory 'T:/Programing_RightPath/_WebAndHTML/JS Hahow動畫互動網頁特效入門/4.
js/vue-project'
git remote add origin https://github.com/CUTFYSH1101/job-104-scraper.git
git pull
用Fork這款軟體，強制推送master到遠端資料庫origin，所有選項都打勾 詳情看notion教學
---

# vue-project

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (
and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
    - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
    - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
    - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
    - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```
