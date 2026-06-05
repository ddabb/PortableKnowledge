const fs = require('fs');
const path = require('path');

const SOURCE_DIR = 'F:\\SelfJob\\PortableKnowledge\\source';

let totalFiles = 0;
let fixedFiles = 0;
let skippedFiles = 0;
let errorFiles = 0;
let noTagsFiles = [];

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            walkDir(fullPath);
        } else if (file.endsWith('.md')) {
            totalFiles++;
            processFile(fullPath);
        }
    }
}

function processFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf-8');
        
        // Check if file has tags field
        if (!content.includes('tags:')) {
            noTagsFiles.push(filePath.replace(SOURCE_DIR + '\\', ''));
            skippedFiles++;
            return;
        }
        
        // Check if tags uses block array format (tags:\n  - item)
        const blockArrayPattern = /tags:\s*\n(\s*-\s*.+\n?)+/;
        
        if (blockArrayPattern.test(content)) {
            // Extract all tags from block format
            const tagPattern = /tags:\s*\n((?:\s*-\s*.+\n?)+)/;
            const match = content.match(tagPattern);
            
            if (match) {
                const blockContent = match[1];
                const tags = blockContent
                    .split('\n')
                    .filter(line => line.trim().startsWith('-'))
                    .map(line => {
                        // Extract tag text, remove "- " and trim
                        let tag = line.replace(/^\s*-\s*/, '').trim();
                        // Remove quotes if present
                        tag = tag.replace(/^["']|["']$/g, '');
                        return tag;
                    })
                    .filter(tag => tag.length > 0);
                
                // Create inline array format
                const inlineTags = 'tags: [' + tags.map(t => `"${t}"`).join(', ') + ']';
                
                // Replace block format with inline format
                content = content.replace(tagPattern, inlineTags + '\n');
                
                fs.writeFileSync(filePath, content, 'utf-8');
                fixedFiles++;
                console.log(`✅ Fixed: ${filePath.replace(SOURCE_DIR + '\\', '')}`);
            }
        } else {
            // Has tags but not block format, assume already correct
            skippedFiles++;
        }
        
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
        errorFiles++;
    }
}

console.log('🔍 Starting tags format fix...\n');
console.log(`📁 Source directory: ${SOURCE_DIR}\n`);

walkDir(SOURCE_DIR);

console.log('\n=============================');
console.log('📊 Summary:');
console.log(`   Total .md files: ${totalFiles}`);
console.log(`   ✅ Fixed: ${fixedFiles}`);
console.log(`   ⏭️  Skipped: ${skippedFiles}`);
console.log(`   ❌ Errors: ${errorFiles}`);
console.log('\n📝 Files missing tags field:');
if (noTagsFiles.length === 0) {
    console.log('   (none)');
} else {
    noTagsFiles.forEach(f => console.log(`   - ${f}`));
}
console.log('\n✅ Done!');
