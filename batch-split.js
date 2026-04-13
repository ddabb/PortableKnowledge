const fs = require('fs');
const path = require('path');

// 要拆分的文件列表
const files = [
  'source/产品研发/开源生态/MIT开源协议.md',
  'source/产品研发/开源生态/零成本开源.md',
  'source/产品研发/产品使用/用户使用指南.md',
  'source/产品研发/产品思考/少即是多.md',
  'source/产品研发/产品思考/认知科学解释工具焦虑.md',
  'source/家庭理财/合理避税与税务规划指南.md',
  'source/认知思维/学习方法/刻意练习.md',
  'source/营销增长/内容创作/内容选题策划完全指南.md',
  'source/创业指南/创业准备/创业融资基础知识.md',
  'source/职场生存/劳动权益/劳动仲裁全流程.md',
];

function splitFile(file) {
  if (!fs.existsSync(file)) {
    console.log('不存在: ' + file);
    return;
  }
  
  const content = fs.readFileSync(file, 'utf8');
  const h2s = (content.match(/^## .+$/gm) || []).length;
  
  if (h2s < 3) {
    console.log('跳过(H2<3): ' + file);
    return;
  }
  
  console.log('拆分: ' + file + ' (' + h2s + '个H2)');
  require('child_process').execSync('node split-articles.js "' + file + '"', { stdio: 'inherit' });
}

for (const f of files) {
  splitFile(f);
}

console.log('\n完成！');
