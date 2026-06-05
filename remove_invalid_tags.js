/**
 * 移除 tags 中的无效值 "--"
 * 遍历所有 .md 文件，将 ["标签1", "--", "标签2"] 清理为 ["标签1", "标签2"]
 */

const fs = require('fs');
const path = require('path');

const SOURCE_DIR = path.join(__dirname, 'source');

let fixedCount = 0;
let skippedCount = 0;

function fixFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // 匹配包含 "--" 的 tags 行
    // 例如: tags: ["心理咨询师", "--", "发展心理学"]
    const tagsLineRegex = /^(tags:\s*\[.*?"--".*?\])\s*$/m;
    const match = content.match(tagsLineRegex);
    
    if (!match) {
      skippedCount++;
      return;
    }
    
    const oldTagsLine = match[1];
    
    // 解析 tags 数组（简单解析，处理引号情况）
    // 去掉 "tags: [" 前缀和 "]" 后缀
    const arrayContent = oldTagsLine
      .replace(/^tags:\s*\[\s*/, '')
      .replace(/\s*\]\s*$/, '');
    
    // 按 "," 分割，清理每个元素
    const items = arrayContent.split(',').map(s => s.trim()).filter(s => {
      // 去掉引号后检查是否为 "--"
      const cleaned = s.replace(/^["']|["']$/g, '').trim();
      return cleaned !== '--';
    });
    
    // 重新组装 tags 行
    const newTagsLine = 'tags: [' + items.join(', ') + ']';
    
    // 替换文件内容
    const newContent = content.replace(oldTagsLine, newTagsLine);
    
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf-8');
      fixedCount++;
      console.log(`已修复: ${filePath}`);
    } else {
      skippedCount++;
    }
    
  } catch (err) {
    console.error(`处理失败: ${filePath}`, err.message);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (file.endsWith('.md')) {
      fixFile(filePath);
    }
  }
}

console.log('开始移除 tags 中的无效值 "--"...\n');
walkDir(SOURCE_DIR);
console.log(`\n完成！修复: ${fixedCount} 个文件，跳过: ${skippedCount} 个文件`);
