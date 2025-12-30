const fs = require('fs')
const path = require('path')

const TARGET_DIR = './src'
const FILE_EXTENSIONS = ['.vue', '.js', '.sass', '.scss']

const replacementRules = [
  {
    pattern: /\@param\s*\{(.*)\}\s*(\S*)/g,
    replacement: '@param {$1} $2'
  },
  {
    pattern: /<\/(template|script|style)>\n<(template|script|style)/g,
    replacement: '</$1>\n\n<$2'
  },
  {
    pattern: /(=|\s)"([^'"<>]+)"(?=\s|>|,|\/|$)/g,
    replacement: "$1'$2'"
  },
  {
    pattern: /(@use|from|src=)(\s*)"([^"]+)"/g,
    replacement: "$1$2'$3'"
  },
  {
    pattern: /;$/gmi,
    replacement: ''
  }
]

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath)

  files.forEach(file => {
    const filePath = path.join(dirPath, file)

    if (fs.statSync(filePath).isDirectory()) {
      if (!file.match(/^(node_modules|dist|build|\.git)$/)) {
        arrayOfFiles = getAllFiles(filePath, arrayOfFiles)
      }
    } else {
      const ext = path.extname(file)
      if (FILE_EXTENSIONS.includes(ext)) {
        arrayOfFiles.push(filePath)
      }
    }
  })

  return arrayOfFiles
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8')
  let modified = false

  replacementRules.forEach(rule => {
    const newContent = content.replace(rule.pattern, rule.replacement)
    if (newContent !== content) {
      content = newContent
      modified = true
    }
  })

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8')
    return true
  }

  return false
}

function main() {
  const files = getAllFiles(TARGET_DIR)
  let modifiedCount = 0

  files.forEach(file => {
    if (processFile(file)) {
      modifiedCount++
    }
  })

  console.log(`\n✅ 完成！共修改 ${modifiedCount} 個檔案`)
}

main()
