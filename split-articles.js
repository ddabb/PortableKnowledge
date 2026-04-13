/**
 * split-articles.js v3 - 健壮版
 * 用法: node split-articles.js <源文件> [输出目录]
 */
const fs = require('fs');
const path = require('path');

function splitByH2(file, outputDir) {
  const raw = fs.readFileSync(file, 'utf8');
  
  // 找 frontmatter：第一个 --- 到第一个 ---（支持\r\n和\n）
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  
  const body = fmMatch ? fmMatch[2] : raw;
  const originalFrontmatter = fmMatch ? fmMatch[1] : '';
  
  // 找所有 ## 标题
  const h2Regex = /^## (.+)$/gm;
  const matches = [];
  let m;
  while ((m = h2Regex.exec(body)) !== null) {
    matches.push({ title: m[1].trim(), pos: m.index });
  }
  
  if (matches.length < 2) {
    console.log('  跳过（章节不足）: ' + path.relative('source', file));
    return 0;
  }
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].pos;
    const end = i < matches.length - 1 ? matches[i + 1].pos : body.length;
    const sectionTitle = matches[i].title.replace(/[\\/:*?"<>|]/g, '·').trim();
    const sectionBody = body.substring(start, end).trim();
    
    // 生成文件名
    const numMatch = sectionTitle.match(/^(\d+[.、:：\s]+)/);
    const cleanTitle = sectionTitle.replace(/^\d+[.、:：\s]+/, '');
    const fileName = numMatch
      ? `${String(i + 1).padStart(2, '0')}_${cleanTitle}.md`
      : `${cleanTitle}.md`;
    
    // 为每个章节生成独立的 frontmatter
    const chapterFrontmatter = `---
title: "${cleanTitle}"
description: "${cleanTitle}"
category: "${getCategoryFromPath(file)}"
tags: []
---

`;
    
    const outPath = path.join(outputDir, fileName);
    fs.writeFileSync(outPath, chapterFrontmatter + sectionBody + '\n', 'utf8');
    console.log('  + ' + path.relative(outputDir, outPath));
  }
  
  console.log('  - 删除: ' + path.relative('source', file));
  fs.unlinkSync(file);
  return matches.length;
}

function getCategoryFromPath(file) {
  // 从路径中提取分类：source/cat/sub/name.md -> cat/sub
  const rel = path.relative('source', file);
  const parts = rel.replace(/\\/g, '/').split('/');
  parts.pop(); // 移除文件名
  return parts.join('/');
}

const args = process.argv.slice(2);
if (args.length >= 1) {
  const file = args[0];
  const outDir = args[1] || path.dirname(file);
  console.log('拆分: ' + file);
  const n = splitByH2(file, outDir);
  console.log('完成 (' + n + '个章节)');
} else {
  console.log('用法: node split-articles.js <源文件> [输出目录]');
}
