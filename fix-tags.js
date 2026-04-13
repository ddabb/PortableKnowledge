const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = 'F:/SelfJob/PortableKnowledge/source/职场生存/劳动权益/';

const origTags = '["劳动合同", "合同陷阱", "职场法律", "劳动权益", "合同条款"]';

const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.md'));

files.forEach(file => {
  const filepath = path.join(OUTPUT_DIR, file);
  let content = fs.readFileSync(filepath, 'utf8');
  // Fix the duplicate "tags: tags:" line
  content = content.replace(/^tags: tags: .*/m, 'tags: ' + origTags);
  // Also fix the extra "tags:" prefix
  content = content.replace(/^description: ".*?"\ntags: ".*?"\n/, (m) => {
    const parts = m.split('\n');
    return parts[0] + '\n' + 'tags: ' + origTags + '\n';
  });
  fs.writeFileSync(filepath, content, 'utf8');
  console.log('Fixed: ' + file + ' (' + content.length + ' chars)');
});
console.log('\nDone: ' + files.length + ' files');
