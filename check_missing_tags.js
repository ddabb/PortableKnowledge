const fs = require('fs');
const path = require('path');

// 递归查找所有.md文件
function findMarkdownFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // 跳过node_modules等目录
      if (file !== 'node_modules' && file !== '.git') {
        findMarkdownFiles(filePath, fileList);
      }
    } else if (file.endsWith('.md')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// 检查文件是否有tags字段
function checkTagsField(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // 检查是否有yaml front matter
  const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontMatterMatch) {
    return { hasTags: false, reason: 'No front matter' };
  }
  
  const frontMatter = frontMatterMatch[1];
  
  // 检查是否有tags字段
  const hasTags = frontMatter.includes('tags:');
  
  return { hasTags, frontMatter, content };
}

// 主函数
function main() {
  const sourceDir = 'F:\\SelfJob\\PortableKnowledge\\source';
  const allFiles = findMarkdownFiles(sourceDir);
  
  console.log(`找到 ${allFiles.length} 个.md文件`);
  
  const missingTagsFiles = [];
  
  allFiles.forEach(filePath => {
    const result = checkTagsField(filePath);
    if (!result.hasTags) {
      missingTagsFiles.push({
        filePath,
        reason: result.reason || 'Missing tags field'
      });
    }
  });
  
  console.log(`\n缺少tags字段的文件: ${missingTagsFiles.length} 个`);
  
  // 输出缺少tags的文件列表
  missingTagsFiles.forEach((file, index) => {
    console.log(`${index + 1}. ${file.filePath} - ${file.reason}`);
  });
  
  // 将结果保存到文件
  const resultPath = 'F:\\SelfJob\\PortableKnowledge\\missing_tags_files.json';
  fs.writeFileSync(resultPath, JSON.stringify(missingTagsFiles, null, 2));
  console.log(`\n结果已保存到: ${resultPath}`);
}

main();
