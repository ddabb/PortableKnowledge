const fs = require('fs');
const path = require('path');

const files = [
  // 心理学相关 - 6个
  'source/心理学/基础心理学/感知觉与基本规律.md',
  'source/心理学/基础心理学/记忆系统.md',
  'source/心理学/发展心理学/皮亚杰认知发展阶段.md',
  'source/心理学/发展心理学/维果茨基与社会文化理论.md',
  'source/心理学/心理测量/信度与效度.md',
  'source/心理学/基础心理学/心理学研究方法.md',
  
  // 认知偏差 - 多个
  'source/认知思维/认知偏差/习得性无助.md',
  'source/认知思维/认知偏差/认知失调.md',
  'source/认知思维/认知偏差/邓宁-克鲁格效应.md',
  'source/认知思维/认知偏差/可得性启发.md',
  'source/认知思维/认知偏差/损失厌恶.md',
  'source/认知思维/认知偏差/沉没成本谬误.md',
  'source/认知思维/认知偏差/破窗效应.md',
  'source/认知思维/认知偏差/锚定效应.md',
  
  // 学习方法
  'source/认知思维/学习方法/间隔重复.md',
  'source/认知思维/学习方法/刻意练习.md',  // 已拆
  
  // 思维工具
  'source/认知思维/思维工具/fermi-estimation.md',
];

function splitFile(file) {
  if (!fs.existsSync(file)) {
    console.log('不存在: ' + file);
    return false;
  }
  
  const content = fs.readFileSync(file, 'utf8');
  const h2s = (content.match(/^## .+$/gm) || []).length;
  
  if (h2s < 3) {
    console.log('跳过(H2<3): ' + file);
    return false;
  }
  
  console.log('拆分: ' + file + ' (' + h2s + '个H2)');
  try {
    require('child_process').execSync('node split-articles.js "' + file + '"', { stdio: 'inherit' });
    return true;
  } catch(e) {
    console.log('错误: ' + e.message);
    return false;
  }
}

let count = 0;
for (const f of files) {
  if (splitFile(f)) count++;
}

console.log('\n完成！共拆分 ' + count + ' 个文件');