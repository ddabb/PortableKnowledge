const fs = require('fs');
const path = require('path');

function getAllMdFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...getAllMdFiles(full));
    else if (entry.name.endsWith('.md')) results.push(full);
  }
  return results;
}

for (const file of getAllMdFiles('source')) {
  const content = fs.readFileSync(file, 'utf8');
  const fmEnd = content.indexOf('\n---\n', 3);
  if (fmEnd === -1) continue;
  const body = content.substring(fmEnd + 5);
  const lines = body.split('\n');
  let found = false;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    // 找 **xxx： 模式（YAML别名引用）
    const matches = l.match(/\*\*[^*：:：\n]{1,30}[：:：]/g);
    if (matches) {
      if (!found) {
        console.log('文件: ' + path.relative('source', file));
        found = true;
      }
      console.log('  行' + (fmEnd + 5 + i + 1) + ': ' + l.trim().substring(0, 100));
    }
  }
  if (found) console.log('');
}
