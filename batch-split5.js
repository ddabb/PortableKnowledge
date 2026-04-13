const fs = require('fs');

const files = [
  'source/生活通识/社保公积金/社保公积金使用全攻略.md',
  'source/产品研发/开发实践/小程序分类管理功能优化实践.md',
  'source/生活通识/健康养生/癌症预防完全指南.md',
  'source/生活通识/健康养生/糖尿病预防完全指南.md',
  'source/公务员/申论/对策建议.md',
  'source/公务员/申论/应用文.md',
];

for (const f of files) {
  if (fs.existsSync(f)) {
    console.log('拆分: ' + f);
    require('child_process').execSync('node split-articles.js "' + f + '"', { stdio: 'inherit' });
  } else {
    console.log('不存在: ' + f);
  }
}
console.log('完成！');