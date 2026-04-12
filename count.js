const fs = require('fs');
const path = require('path');

// 统计目录下所有 md 文件的字数
function countWords(dir) {
  const result = [];
  const directoryStats = {};
  
  function traverse(currentPath) {
    try {
      const files = fs.readdirSync(currentPath);
      
      files.forEach(file => {
        try {
          const fullPath = path.join(currentPath, file);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            traverse(fullPath);
          } else if (path.extname(file) === '.md') {
            const content = fs.readFileSync(fullPath, 'utf8');
            // 统计字数（去除 YAML front matter）
            const contentWithoutFrontMatter = content.replace(/^---[\s\S]*?---\n/, '');
            // 改进的字数统计方法：中文字符算1个，英文字符和数字算0.5个
            const chineseChars = (contentWithoutFrontMatter.match(/[\u4e00-\u9fa5]/g) || []).length;
            const otherChars = (contentWithoutFrontMatter.match(/[a-zA-Z0-9]/g) || []).length * 0.5;
            const wordCount = Math.round(chineseChars + otherChars);
            
            // 提取目录信息用于统计
            const relativePath = fullPath.replace('f:\\SelfJob\\PortableKnowledge\\', '');
            // 提取source后的第一个目录作为分类目录
            const pathParts = relativePath.split(path.sep);
            let directory = '其他';
            if (pathParts.length >= 2 && pathParts[0] === 'source') {
              directory = pathParts[1];
            }
            
            // 更新目录统计
            if (!directoryStats[directory]) {
              directoryStats[directory] = {
                count: 0,
                words: 0
              };
            }
            directoryStats[directory].count++;
            directoryStats[directory].words += wordCount;
            
            result.push({
              file: relativePath,
              words: wordCount,
              directory: directory
            });
          }
        } catch (error) {
          console.warn(`处理文件 ${file} 时出错: ${error.message}`);
        }
      });
    } catch (error) {
      console.warn(`遍历目录 ${currentPath} 时出错: ${error.message}`);
    }
  }
  
  traverse(dir);
  return { result, directoryStats };
}

// 按字数升序排序
function sortByWords(data) {
  return data.sort((a, b) => a.words - b.words);
}

// 生成 Markdown 统计文件
function generateReport(data, directoryStats) {
  let markdown = '# 字数统计\n\n';
  markdown += '| 序号 | 文件路径 | 字数 |\n';
  markdown += '|------|---------|------|\n';
  
  data.forEach((item, index) => {
    markdown += `| ${index + 1} | ${item.file} | ${item.words} |\n`;
  });
  
  // 添加统计信息
  const totalFiles = data.length;
  const totalWords = data.reduce((sum, item) => sum + item.words, 0);
  const averageWords = Math.round(totalWords / totalFiles);
  const maxWords = Math.max(...data.map(item => item.words));
  const minWords = Math.min(...data.map(item => item.words));
  
  // 计算中位数
  const sortedWords = data.map(item => item.words).sort((a, b) => a - b);
  const medianIndex = Math.floor(sortedWords.length / 2);
  const medianWords = sortedWords.length % 2 === 0 
    ? Math.round((sortedWords[medianIndex - 1] + sortedWords[medianIndex]) / 2)
    : sortedWords[medianIndex];
  
  markdown += '\n## 统计信息\n\n';
  markdown += `| 统计项 | 数值 |\n`;
  markdown += `|--------|------|\n`;
  markdown += `| 文件总数 | ${totalFiles} |\n`;
  markdown += `| 总字数 | ${totalWords} |\n`;
  markdown += `| 平均字数 | ${averageWords} |\n`;
  markdown += `| 中位数字数 | ${medianWords} |\n`;
  markdown += `| 最大字数 | ${maxWords} |\n`;
  markdown += `| 最小字数 | ${minWords} |\n`;
  
  // 添加按目录统计
  markdown += '\n## 按目录分类统计\n\n';
  markdown += `| 目录 | 文件数 | 总字数 | 平均字数 |\n`;
  markdown += `|------|--------|--------|----------|\n`;
  
  Object.entries(directoryStats).forEach(([directory, stats]) => {
    const avgWords = Math.round(stats.words / stats.count);
    markdown += `| ${directory} | ${stats.count} | ${stats.words} | ${avgWords} |\n`;
  });
  
  // 添加字数分布统计
  markdown += '\n## 字数分布分析\n\n';
  markdown += `| 字数区间 | 文件数 | 占比 |\n`;
  markdown += `|----------|--------|------|\n`;
  
  const ranges = [
    { min: 0, max: 500, label: '0-500字' },
    { min: 500, max: 1000, label: '500-1000字' },
    { min: 1000, max: 2000, label: '1000-2000字' },
    { min: 2000, max: 3000, label: '2000-3000字' },
    { min: 3000, max: 5000, label: '3000-5000字' },
    { min: 5000, max: Infinity, label: '5000字以上' }
  ];
  
  ranges.forEach(range => {
    const count = data.filter(item => item.words >= range.min && item.words < range.max).length;
    const percentage = ((count / totalFiles) * 100).toFixed(1);
    markdown += `| ${range.label} | ${count} | ${percentage}% |\n`;
  });
  
  return markdown;
}

// 主函数
function main() {
  const sourceDir = 'f:\\SelfJob\\PortableKnowledge\\source';
  const outputFile = 'f:\\SelfJob\\PortableKnowledge\\字数统计.md';
  
  console.log('开始统计...');
  try {
    const { result, directoryStats } = countWords(sourceDir);
    const sortedData = sortByWords(result);
    const report = generateReport(sortedData, directoryStats);
    
    fs.writeFileSync(outputFile, report, 'utf8');
    console.log(`统计完成，结果已输出到 ${outputFile}`);
    console.log(`共统计 ${sortedData.length} 个文件`);
  } catch (error) {
    console.error(`统计过程中发生错误: ${error.message}`);
  }
}

main();