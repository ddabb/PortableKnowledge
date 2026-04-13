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

// Read ALL .md files including root and know/
let allFiles = [...getAllMdFiles('source')];

// Also check root
const rootFiles = ['TODOlist.md', '字数统计.md', '补充润色计划.md', 'build.js', 'count.js', 'package.json'];
for (const f of rootFiles) {
  if (fs.existsSync('./' + f)) allFiles.push('./' + f);
}

// Also check know/
if (fs.existsSync('know')) {
  allFiles.push(...getAllMdFiles('know'));
}

let foundError = false;
for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf8');
  
  // build.js regex
  const fmRegex = /^(\uFEFF)?(?:---|\+\+\+)\r?\n([\s\S]*?)\r?\n(?:---|\+\+\+)(?:\s*?$)/m;
  const match = content.match(fmRegex);
  
  if (!match) continue;
  
  const fmContent = match[2];
  
  try {
    yaml.load(fmContent);
  } catch (e) {
    console.log('文件: ' + file);
    console.log('YAML内容:');
    console.log(JSON.stringify(fmContent));
    console.log('错误: ' + e.message);
    console.log('');
    foundError = true;
  }
}

if (!foundError) console.log('所有文件YAML解析正常！');
