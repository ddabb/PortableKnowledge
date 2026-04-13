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

for (const file of getAllMdFiles('source')) {
  const content = fs.readFileSync(file, 'utf8');
  
  const fmRegex = /^(\uFEFF)?(?:---|\+\+\+)\r?\n([\s\S]*?)\r?\n(?:---|\+\+\+)(?:\s*?$)/m;
  const match = content.match(fmRegex);
  
  if (!match) continue;
  
  const fmContent = match[2];
  const lines = fmContent.split('\n');
  
  if (lines.length >= 4) {
    const line4 = lines[3]; // 0-indexed, line 4 is index 3
    if (line4.includes('**使用场景') || line4.includes('**问题**')) {
      console.log('文件: ' + path.relative('source', file));
      console.log('第4行: ' + JSON.stringify(line4));
      console.log('第3行: ' + JSON.stringify(lines[2]));
      console.log('第5行: ' + JSON.stringify(lines[4] || ''));
      console.log('');
    }
  }
  
  // Also check for YAML alias patterns in frontmatter
  if (fmContent.includes('*') && fmContent.includes('：') && /\*[^*][^:：]*[：:][^:]*\*\*/.test(fmContent)) {
    console.log('别名嫌疑文件: ' + path.relative('source', file));
    console.log('frontmatter:');
    console.log(fmContent.substring(0, 300));
    console.log('---');
  }
}
