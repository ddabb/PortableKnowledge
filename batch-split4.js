const fs = require('fs');

const files = [
  // 生活通识 - 健康养生
  'source/生活通识/健康养生/呼吸系统疾病预防指南.md',
  'source/生活通识/健康养生/消化系统疾病预防指南.md',
  'source/生活通识/健康养生/心脑血管疾病预防指南.md',
  'source/生活通识/健康养生/糖尿病预防与控制指南.md',
  'source/生活通识/健康养生/癌症预防与早期筛查指南.md',
  'source/生活通识/健康养生/抗生素使用指南.md',
  'source/生活通识/健康养生/疫苗接种完全指南.md',
  'source/生活通识/健康养生/体检项目选择完全指南.md',
  'source/生活通识/健康养生/常见症状自我判断指南.md',
  
  // 职场生存 - 情绪与压力（更多）
  'source/职场生存/情绪与压力/如何应对焦虑_寻找内心的平静.md',
  'source/职场生存/情绪与压力/如何管理愤怒情绪_平息内心的火焰.md',
  'source/职场生存/情绪与压力/如何克服悲伤_在失落中寻找光明.md',
  'source/职场生存/情绪与压力/如何培养自我接纳.md',
  'source/职场生存/情绪与压力/如何应对压力_在风暴中保持平衡.md',
  
  // 家庭理财 - 更多
  'source/家庭理财/合理避税与税务规划指南.md',  // 已拆
  
  // 营销增长 - 更多
  'source/营销增长/内容创作/内容选题策划完全指南.md',  // 已拆
  
  // 产品研发 - 更多
  'source/产品研发/产品使用/用户使用指南.md',  // 已拆
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