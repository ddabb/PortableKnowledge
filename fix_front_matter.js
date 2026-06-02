const fs = require('fs');
const path = require('path');

const sourceDir = path.resolve(__dirname, 'source');

// 从报错信息中提取的文件列表（完整列表）
const mustFix = [
  '心理咨询师/基础心理学/感知觉.md',
  '心理咨询师/基础心理学/记忆与学习.md',
  '心理咨询师/基础心理学/思维与问题解决.md',
  '心理咨询师/基础心理学/情绪与情感.md',
  '心理咨询师/基础心理学/动机与意志.md',
  '心理咨询师/基础心理学/注意与意识.md',
  '心理咨询师/基础心理学/能力.md',
  '心理咨询师/基础心理学/人格.md',
  '心理咨询师/发展心理学/婴儿期发展.md',
  '心理咨询师/发展心理学/幼儿期发展.md',
  '心理咨询师/发展心理学/童年期发展.md',
  '心理咨询师/发展心理学/青少年期发展.md',
  '心理咨询师/发展心理学/成年期发展.md',
  '心理咨询师/咨询技能/初诊接待.md',
  '心理咨询师/咨询技能/心理评估.md',
  '心理咨询师/咨询技能/咨询关系建立.md',
  '心理咨询师/咨询技能/咨询方案制定.md',
  '心理咨询师/咨询技能/咨询技术.md',
  '心理咨询师/心理障碍/抑郁症.md',
  '心理咨询师/心理障碍/焦虑症.md',
  '心理咨询师/心理障碍/强迫症.md',
  '心理咨询师/心理障碍/双相障碍.md',
  '心理咨询师/心理障碍/创伤后应激障碍.md',
  '心理咨询师/心理障碍/精神分裂症.md',
  '心理咨询师/心理障碍/进食障碍.md',
  '心理咨询师/心理障碍/恐惧症.md',
  '心理咨询师/心理障碍/人格障碍.md',
  '心理咨询师/心理障碍/多动症.md',
  '心理咨询师/心理障碍/自闭症谱系障碍.md',
  '心理咨询师/心理障碍/睡眠障碍.md',
  '心理咨询师/伦理与法律/伦理原则.md',
  '心理咨询师/伦理与法律/保密原则.md',
  '心理咨询师/伦理与法律/多重关系.md',
  '心理咨询师/伦理与法律/知情同意.md',
  '心理咨询师/伦理与法律/法律责任.md',
  '心理咨询师/伦理与法律/专业胜任力.md',
  '心理咨询师/社会心理学/社会认知.md',
  '心理咨询师/社会心理学/社会影响.md',
  '心理咨询师/社会心理学/人际关系.md',
  '心理咨询师/社会心理学/社会态度.md',
  '心理咨询师/社会心理学/群体心理.md',
  '英语考试/四六级/词汇/高频词汇.md',
];

// 根据路径推导 category 和 tags
function getCategoryAndTags(relPath) {
  const parts = relPath.replace(/\\/g, '/').replace(/\.md$/i, '').split('/');
  // 去掉 '心理咨询师/' 或 '英语考试/四六级/' 等前缀，取倒数第二级作为分类
  const category = parts.slice(0, parts.length - 1).join('/');
  
  const tags = [];
  if (parts[0]) tags.push(parts[0]);
  if (parts[1] && parts[1] !== '词汇' && parts[1] !== '语法' && parts[1] !== '阅读' && parts[1] !== '写作' && parts[1] !== '听力') {
    tags.push(parts[1]);
  }
  // 添加子分类
  if (parts.length >= 2) tags.push(parts[parts.length - 2]);
  
  return { category, tags: [...new Set(tags)] };
}

// 从正文提取 description（前100字有意义的内容）
function extractDescription(content) {
  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('---') && !trimmed.startsWith('*')) {
      return trimmed.substring(0, 100).replace(/["`]/g, '');
    }
  }
  return '';
}

let fixed = 0;
let skipped = 0;
let errors = 0;

mustFix.forEach(relPath => {
  const fullPath = path.join(sourceDir, relPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  不存在: ${relPath}`);
    errors++;
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');

  // 已经有 front matter
  if (content.startsWith('---')) {
    console.log(`⏭️  已有 front matter: ${relPath}`);
    skipped++;
    return;
  }

  // 提取 title（第一个 # 标题）
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : path.basename(relPath, '.md');

  const { category, tags } = getCategoryAndTags(relPath);
  const description = extractDescription(content);

  const frontMatter = `---
title: ${title}
description: ${description}
category: ${category}
tags:${tags.map(t => '\n  - ' + t).join('')}
---

`;

  fs.writeFileSync(fullPath, frontMatter + content, 'utf8');
  console.log(`✅ 已修复: ${relPath}`);
  fixed++;
});

console.log(`\n📊 完成: 修复=${fixed}, 跳过=${skipped}, 错误=${errors}`);
