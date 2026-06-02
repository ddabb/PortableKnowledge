const fs = require('fs');
const path = require('path');

const sourceDir = 'F:\\SelfJob\\PortableKnowledge\\source';

function scanDirectory(dir) {
    let results = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
            results = results.concat(scanDirectory(itemPath));
        } else if (item.endsWith('.md')) {
            const fileSize = stat.size;
            const relativePath = path.relative(sourceDir, itemPath);
            results.push({ 
                path: itemPath, 
                size: fileSize, 
                relative: relativePath 
            });
        }
    }
    
    return results;
}

console.log('正在扫描待扩写文件（<1000字节）...\n');

const allFiles = scanDirectory(sourceDir);
const shortFiles = allFiles.filter(f => f.size < 1000).sort((a, b) => a.size - b.size);

console.log(`找到 ${shortFiles.length} 个待扩写文件（<1000字节）\n`);
console.log('='.repeat(60));
console.log('前10个待扩写文件：\n');

if (shortFiles.length > 0) {
    shortFiles.slice(0, 10).forEach((f, i) => {
        console.log(`${i + 1}. [${f.size} 字节] ${f.relative}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log(`\n共 ${shortFiles.length} 个文件待扩写`);
    console.log(`\n下一个待扩写文件：`);
    console.log(`  文件：${shortFiles[0].relative}`);
    console.log(`  大小：${shortFiles[0].size} 字节`);
} else {
    console.log('\n✅ 所有文件均已超过 1000 字节，无需继续扩写。');
}
