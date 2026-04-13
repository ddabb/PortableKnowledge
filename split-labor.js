/**
 * 拆分 labor-contract-guide.md 为多个独立文件
 */

const fs = require('fs');
const path = require('path');

const INPUT = 'F:/SelfJob/PortableKnowledge/source/职场生存/劳动权益/labor-contract-guide.md';
const OUTPUT_DIR = 'F:/SelfJob/PortableKnowledge/source/职场生存/劳动权益/split/';
const TARGET_DIR = 'F:/SelfJob/PortableKnowledge/source/职场生存/劳动权益/';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const content = fs.readFileSync(INPUT, 'utf8');

// 提取 frontmatter
const fm = content.match(/^---\n[\s\S]*?\n---\n/);
const fmStr = fm[0];
const body = content.substring(fm[0].length);

// 提取 frontmatter 对象
const fmLines = fmStr.split('\n');
const title = fmLines.find(l => l.startsWith('title:')).replace(/^title:\s*/, '').replace(/^["']|["']$/g, '').trim();
const description = fmLines.find(l => l.startsWith('description:')).replace(/^description:\s*/, '').replace(/^["']|["']$/g, '').trim();
const category = fmLines.find(l => l.startsWith('category:')).replace(/^category:\s*/, '').replace(/^["']|["']$/g, '').trim();
const tags = fmLines.find(l => l.startsWith('tags:'));
const date = fmLines.find(l => l.startsWith('date:')).replace(/^date:\s*/, '').replace(/^["']|["']$/g, '').trim();

// 分割章节（按 ## 开头分割）
const parts = body.split(/\n(?=## )/);
// parts[0] 是开头的介绍段落（# 标题 + 引言）

// 文件名映射
const filenameMap = {
  '一、劳动合同的法律地位': '劳动合同法基础与签订要求',
  '二、劳动合同必备条款': '劳动合同必备条款详解',
  '三、试用期陷阱': '试用期陷阱与法律保护',
  '四、劳动报酬条款': '劳动报酬条款与薪资陷阱',
  '五，工作地点与岗位条款': '工作地点与岗位变更条款',
  '六、工时制度与加班': '工时制度与加班费计算',
  '七、竞业限制条款': '竞业限制条款与实务',
  '八、保密条款与知识产权': '保密条款与知识产权归属',
  '九、培训与服务期': '培训服务期与违约金',
  '十、解除与终止条款': '劳动合同解除与终止',
  '十一、实际案例分析': '劳动合同典型案例分析',
  '十二、操作建议清单': '劳动合同签订与维权清单',
  '十三、总结': '劳动合同避坑总结'
};

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

let count = 0;
for (let i = 1; i < parts.length; i++) {  // 从1开始，跳过开头的介绍段落
  const sectionContent = parts[i];
  const firstLine = sectionContent.split('\n')[0];
  const sectionTitle = firstLine.replace(/^## /, '').trim();

  // 找映射文件名
  const key = Object.keys(filenameMap).find(k => sectionTitle.includes(k)) || sectionTitle;
  const newTitle = filenameMap[key] || sectionTitle;
  const safeFilename = newTitle.replace(/[\\/:*?"<>|]/g, ' ') + '.md';
  const filepath = path.join(OUTPUT_DIR, safeFilename);

  // 生成文件内容
  // 新文件的H1 = 新标题，H2 = 原章节标题
  const newLines = [
    makeFrontmatter(newTitle, ''),
    `# ${newTitle}`,
    '',
    `> 本文是《${title}》的第${i}部分，原章节：**${sectionTitle}**`,
    '',
    ...sectionContent.split('\n').slice(1)  // 去掉原 ## 标题行
  ];

  let newContent = newLines.join('\n').trim() + '\n';
  fs.writeFileSync(filepath, newContent, 'utf8');
  console.log(`✓ [${count + 1}] ${safeFilename} (${newContent.length} chars)`);
  count++;
}

console.log(`\n拆分完成，共 ${count} 个文件`);
console.log(`输出目录: ${OUTPUT_DIR}`);

// 删除原文件
fs.unlinkSync(INPUT);
console.log(`✓ 已删除原文件: ${INPUT}`);

// 移动新文件到目标目录
const files = fs.readdirSync(OUTPUT_DIR);
for (const file of files) {
  const src = path.join(OUTPUT_DIR, file);
  const dest = path.join(TARGET_DIR, file);
  fs.renameSync(src, dest);
}
fs.rmdirSync(OUTPUT_DIR);
console.log(`✓ 已移动文件到: ${TARGET_DIR}`);
