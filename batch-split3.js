const fs = require('fs');

const files = [
  // 产品研发
  'source/产品研发/产品思考/免费是最贵的.md',
  'source/产品研发/产品思考/数据驱动产品决策.md',
  
  // 家庭理财
  'source/家庭理财/个人所得税申报完全指南.md',
  'source/家庭理财/信用卡使用完全指南.md',
  'source/家庭理财/基金投资入门完全指南.md',
  'source/家庭理财/家庭资产配置完全指南.md',
  'source/家庭理财/保险配置完全指南.md',
  
  // 职场生存
  'source/职场生存/劳动权益/租房避坑指南.md',
  'source/职场生存/劳动权益/被裁员了怎么办.md',
  'source/职场生存/情绪与压力/如何正确面对拖延症.md',
  'source/职场生存/情绪与压力/如何缓解焦虑_寻找内心的平静.md',
  'source/职场生存/情绪与压力/如何管理愤怒情绪_平息内心的火焰.md',
  'source/职场生存/情绪与压力/如何克服悲伤_在失落中寻找光明.md',
  'source/职场生存/情绪与压力/如何培养自我接纳.md',
  'source/职场生存/情绪与压力/如何应对压力_在风暴中保持平衡.md',
  
  // 生活通识
  'source/生活通识/安全防范/日常生活诈骗防范.md',
  'source/生活通识/安全防范/谨防电信网络诈骗.md',
  'source/生活通识/安全防范/远离黄赌毒.md',
  'source/生活通识/急救知识/心肺复苏步骤.md',
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