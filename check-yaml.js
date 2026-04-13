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
let checked = 0;

for (const file of getAllMdFiles('source')) {
  checked++;
  const content = fs.readFileSync(file, 'utf8');
  
  // 找frontmatter：第一个 --- 到第一个 \n---\n
  const fmMatch = content.match(/^---\r?\n([\s\S]+?)(?:\r?\n)?---\r?\n([\s\S]*)$/);
  if (!fmMatch) {
    // No frontmatter at all, skip
    continue;
  }
  
  const fmContent = fmMatch[1];
  
  // 检查是否有 *xxx： 这样的YAML别名模式
  if (/\*[^*][^:]*:[^:]/.test(fmContent)) {
    errors.push({ file: path.relative('source', file), issue: 'possible YAML alias in frontmatter' });
    continue;
  }
  
  try {
    yaml.load(fmContent);
  } catch (e) {
    errors.push({ file: path.relative('source', file), issue: e.message.substring(0, 80) });
  }
}

console.log('检查了 ' + checked + ' 个文件');
console.log('发现 ' + errors.length + ' 个YAML问题:');
errors.forEach(e => console.log('  ' + e.file + ': ' + e.issue));
