/**
 * 批量修复 YAML front matter 缺少结束标记 --- 的问题
 * 
 * 问题：某些文件的 YAML front matter 缺少结束标记 ---，
 * 导致 YAML 解析器把正文内容也当作 YAML 来解析，从而报错。
 * 
 * 修复方法：在 YAML front matter 的最后一个字段（通常是 tags）之后，
 * 在第一个 markdown 标题（# 标题）之前，添加结束标记 ---。
 */

const fs = require('fs');
const path = require('path');

const SOURCE_DIR = path.join(__dirname, 'source');

let fixedCount = 0;
let skippedCount = 0;
let errorCount = 0;

/**
 * 检查并修复单个文件的 YAML front matter
 */
function fixFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    // 检查文件是否以 --- 开头（是否有 YAML front matter）
    if (lines[0] !== '---') {
      // 没有 YAML front matter，跳过
      skippedCount++;
      return;
    }
    
    // 查找结束的 ---（第二个 ---）
    let endMarkerIndex = -1;
    for (let i = 1; i < lines.length; i++) {
      if (lines[i] === '---') {
        endMarkerIndex = i;
        break;
      }
    }
    
    if (endMarkerIndex !== -1) {
      // 已经有结束标记，跳过
      skippedCount++;
      return;
    }
    
    // 没有结束标记，需要添加
    // 找到第一个 markdown 标题行（以 # 开头的行）
    let firstMarkdownHeaderIndex = -1;
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].startsWith('# ')) {
        firstMarkdownHeaderIndex = i;
        break;
      }
    }
    
    if (firstMarkdownHeaderIndex === -1) {
      // 没有找到 markdown 标题，无法修复，跳过
      console.error(`无法修复（未找到 markdown 标题）: ${filePath}`);
      errorCount++;
      return;
    }
    
    // 在第一个 markdown 标题之前插入结束标记 ---
    lines.splice(firstMarkdownHeaderIndex, 0, '---', '');
    
    // 写回文件
    fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
    
    fixedCount++;
    console.log(`已修复: ${filePath}`);
    
  } catch (err) {
    console.error(`处理文件失败: ${filePath}`, err);
    errorCount++;
  }
}

/**
 * 递归遍历目录，处理所有 .md 文件
 */
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

console.log('开始修复 YAML front matter 缺少结束标记 --- 的问题...');
console.log('');

walkDir(SOURCE_DIR);

console.log('');
console.log('修复完成！');
console.log(`修复: ${fixedCount} 个文件`);
console.log(`跳过: ${skippedCount} 个文件`);
console.log(`错误: ${errorCount} 个文件`);
