const fs = require('fs');
const path = require('path');

const sourceDir = path.resolve(__dirname, 'source');

// 递归查找所有 .md 文件
function findAllMdFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(findAllMdFiles(fullPath));
    } else if (file.endsWith('.md')) {
      results.push(fullPath);
    }
  }
  return results;
}

// 从文件路径提取正确的 category（完整目录路径）
function extractCategoryFromPath(filePath) {
  const relativePath = path.relative(sourceDir, filePath);
  const parts = relativePath.split(path.sep);
  // 移除文件名，保留所有目录部分
  // 例如: ['01_技术IT领域', '数字营销', '分析', '数字营销分析.md']
  // 应该返回: '01_技术IT领域/数字营销/分析'
  if (parts.length >= 2) {
    return parts.slice(0, -1).join('/'); // 移除最后一个（文件名），用 / 连接
  }
  return '';
}

// 更新文件的 frontmatter
function updateFrontmatter(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  if (!content.startsWith('---')) {
    return false; // 没有 frontmatter
  }

  const endOfFrontmatter = content.indexOf('---', 3);
  if (endOfFrontmatter === -1) {
    return false;
  }

  const frontmatter = content.substring(3, endOfFrontmatter);
  const body = content.substring(endOfFrontmatter + 3);

  // 提取当前 category
  const categoryMatch = frontmatter.match(/^category:\s*(.+)$/m);
  if (!categoryMatch) {
    return false; // 没有 category 字段
  }

  const oldCategory = categoryMatch[1].trim();
  const newCategory = extractCategoryFromPath(filePath);

  if (!newCategory) {
    return false;
  }

  if (oldCategory === newCategory) {
    return true; // 已经正确，无需修改
  }

  console.log(`修复: ${path.relative(sourceDir, filePath)}`);
  console.log(`  旧 category: ${oldCategory}`);
  console.log(`  新 category: ${newCategory}`);

  // 替换 category 行
  const newFrontmatter = frontmatter.replace(
    /^category:\s*.+$/m,
    `category: ${newCategory}`
  );

  const newContent = '---' + newFrontmatter + '---' + body;
  fs.writeFileSync(filePath, newContent, 'utf-8');
  return true;
}

// 主函数
function main() {
  console.log('开始修复 frontmatter category...');
  const files = findAllMdFiles(sourceDir);
  console.log(`找到 ${files.length} 个 .md 文件`);

  let fixedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const file of files) {
    try {
      const result = updateFrontmatter(file);
      if (result === true) {
        fixedCount++;
      } else {
        skippedCount++;
      }
    } catch (err) {
      console.error(`错误: ${path.relative(sourceDir, file)}`);
      console.error(`  ${err.message}`);
      errorCount++;
    }
  }

  console.log(`\n完成:`);
  console.log(`  修复: ${fixedCount}`);
  console.log(`  跳过: ${skippedCount}`);
  console.log(`  错误: ${errorCount}`);
}

main();
