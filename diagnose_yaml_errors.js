/**
 * 诊断 YAML front matter 解析错误
 * 
 * 遍历所有 .md 文件，尝试解析 YAML front matter，
 * 报告所有解析失败的文件。
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml'); // 假设 build.js 使用 js-yaml

const SOURCE_DIR = path.join(__dirname, 'source');

let errorCount = 0;
let successCount = 0;

/**
 * 尝试解析单个文件的 YAML front matter
 */
function diagnoseFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    // 检查文件是否以 --- 开头（是否有 YAML front matter）
    if (lines[0] !== '---') {
      // 没有 YAML front matter，跳过
      successCount++;
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
    
    if (endMarkerIndex === -1) {
      console.error(`YAML 解析错误（缺少结束标记 ---）: ${filePath}`);
      errorCount++;
      return;
    }
    
    // 提取 YAML front matter 内容
    const yamlContent = lines.slice(1, endMarkerIndex).join('\n');
    
    // 尝试解析 YAML
    try {
      yaml.load(yamlContent);
      successCount++;
    } catch (yamlErr) {
      console.error(`YAML 解析错误: ${filePath}`);
      console.error(`  错误: ${yamlErr.message}`);
      errorCount++;
    }
    
  } catch (err) {
    console.error(`读取文件失败: ${filePath}`, err);
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
      diagnoseFile(filePath);
    }
  }
}

console.log('开始诊断 YAML front matter 解析错误...');
console.log('');

walkDir(SOURCE_DIR);

console.log('');
console.log('诊断完成！');
console.log(`成功: ${successCount} 个文件`);
console.log(`错误: ${errorCount} 个文件`);
