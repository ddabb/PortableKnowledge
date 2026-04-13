const fs = require('fs');
const path = require('path');

const INPUT = 'F:/SelfJob/PortableKnowledge/source/职场生存/劳动权益/severance-and-bonus.md';
const TARGET_DIR = 'F:/SelfJob/PortableKnowledge/source/职场生存/劳动权益/';

const content = fs.readFileSync(INPUT, 'utf8');

// 提取 frontmatter
const fm = content.match(/^---\n[\s\S]*?\n---\n/);
const fmStr = fm[0];
const body = content.substring(fm[0].length);

const fmLines = fmStr.split('\n');
const title = fmLines.find(l => l.startsWith('title:')).replace(/^title:\s*/, '').replace(/^["']|["']$/g, '').trim();
const description = fmLines.find(l => l.startsWith('description:')).replace(/^description:\s*/, '').replace(/^["']|["']$/g, '').trim();
const category = fmLines.find(l => l.startsWith('category:')).replace(/^category:\s*/, '').replace(/^["']|["']$/g, '').trim();
const tags = fmLines.find(l => l.startsWith('tags:')).replace(/^tags:\s*/, '').trim();
const date = fmLines.find(l => l.startsWith('date:')).replace(/^date:\s*/, '').replace(/^["']|["']$/g, '').trim();

function makeFrontmatter(newTitle, newDesc) {
  return `---
title: "${newTitle}"
description: "${newDesc || newTitle}"
category: "${category}"
tags: ${tags}
date: "${date}"
---
`;
}

const filenameMap = {
  '一、经济补偿金的基本概念': '经济补偿金基础概念',
  '二、经济补偿金N的计算': '经济补偿金N的计算详解',
  '三、"N"适用的情形': '经济补偿金N的适用情形',
  '四、"N+1"的适用情形': 'N+1代通知金适用情形',
  '五、"2N"的适用情形': '违法解除赔偿金2N详解',
  '六、经济补偿计算实例': '经济补偿金计算实例',
  '七、年终奖的法律问题': '年终奖法律问题与维权',
  '八、期权与股权激励': '期权与股权激励处理',
  '九、离职时其他权益清单': '离职权益清单汇总',
  '十、维权途径与时效': '劳动维权途径与时效',
  '十一、总结': '离职补偿完整总结'
};

// 按 ## 章节分割
const parts = body.split(/\n(?=## )/);

let count = 0;
for (let i = 1; i < parts.length; i++) {
  const sectionContent = parts[i];
  const firstLine = sectionContent.split('\n')[0];
  const sectionTitle = firstLine.replace(/^## /, '').trim();

  const key = Object.keys(filenameMap).find(k => sectionTitle.includes(k)) || sectionTitle;
  const newTitle = filenameMap[key] || sectionTitle;
  const safeFilename = newTitle.replace(/[\\/:*?"<>|]/g, ' ') + '.md';
  const filepath = path.join(TARGET_DIR, safeFilename);

  const newLines = [
    makeFrontmatter(newTitle, ''),
    `# ${newTitle}`,
    '',
    `> 本文是《${title}》的第${i}部分，原章节：**${sectionTitle}**`,
    '',
    ...sectionContent.split('\n').slice(1)
  ];

  let newContent = newLines.join('\n').trim() + '\n';
  fs.writeFileSync(filepath, newContent, 'utf8');
  console.log(`✓ [${count + 1}] ${safeFilename} (${newContent.length} chars)`);
  count++;
}

console.log(`\n拆分完成，共 ${count} 个文件`);
fs.unlinkSync(INPUT);
console.log(`✓ 已删除原文件`);
