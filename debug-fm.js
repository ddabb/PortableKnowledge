const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

function getAllMdFiles(dir) {
  const results = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) results.push(...getAllMdFiles(f));
    else if (e.name.endsWith('.md')) results.push(f);
  }
  return results;
}

let errors = [];

for (const file of getAllMdFiles('source')) {
  const content = fs.readFileSync(file, 'utf8');
  
  // 模拟 build.js 的正则
  const fmRegex = /^(\uFEFF)?(?:---|\+\+\+)\r?\n([\s\S]*?)\r?\n(?:---|\+\+\+)(?:\s*?$)/m;
  const match = content.match(fmRegex);
  
  if (!match) continue;
  
  const fmContent = match[2];
  
  // 如果frontmatter内容中有 ** 使用，单独报告（这是因为frontmatter没闭合）
  if (fmContent.includes('**使用场景') || fmContent.includes('**问题**')) {
    errors.push({
      file: path.relative('source', file),
      fmEnd: fmContent.substring(0, 200)
    });
  }
  
  try {
    yaml.load(fmContent);
  } catch (e) {
    errors.push({ file: path.relative('source', file), issue: e.message.substring(0, 80), fmEnd: fmContent.substring(0, 100) });
  }
}

console.log('发现问题: ' + errors.length);
errors.forEach(e => {
  console.log('文件: ' + e.file);
  if (e.issue) console.log('  错误: ' + e.issue);
  console.log('  frontmatter末尾: ' + e.fmEnd);
  console.log('');
});
