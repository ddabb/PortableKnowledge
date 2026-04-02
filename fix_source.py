import os, re

source_dir = r'f:\SelfJob\PortableKnowledge\source'

# 生活通识/子目录名 -> 对应的完整category前缀
subdir_to_category = {
    'heart': '生活通识/心理学',
    'health': '生活通识/健康养生',
    'growth': '生活通识/学习成长',
    'finance': '生活通识/财务理财',
    'lifestyle': '生活通识/生活方式',
}

# 旧category名 -> 新category（带层级路径）
# 规则：移入 生活通识/X 子目录的文件，category 改成 生活通识/X
old_to_new = {
    '情绪管理':    '生活通识/心理学',
    '心理学':      '生活通识/心理学',
    '积极心理学':  '生活通识/心理学',
    '压力管理':    '生活通识/心理学',
    '健康养生':    '生活通识/健康养生',
    '学习方法':    '生活通识/学习成长',
    '个人成长':    '生活通识/学习成长',
    '知识管理':    '生活通识/学习成长',
    '工具方法':    '生活通识/学习成长',
    '生活方式':    '生活通识/生活方式',
    '财务知识':    '生活通识/财务理财',
    '消费心理学':  '生活通识/财务理财',
    '创业指南':    '生活通识/财务理财',
}

updated = 0
skipped = 0

# 只处理 生活通识/ 下的文件
shenghuo_dir = os.path.join(source_dir, '生活通识')
for root, dirs, files in os.walk(shenghuo_dir):
    for f in files:
        if not f.endswith('.md'):
            continue
        fp = os.path.join(root, f)
        with open(fp, 'r', encoding='utf-8') as fh:
            content = fh.read()

        m = re.search(r'^category:\s*(.+)$', content, re.MULTILINE)
        if not m:
            print('NO CATEGORY: {}'.format(fp))
            continue

        old_cat = m.group(1).strip().strip('"')

        # 已经有层级了，跳过
        if '/' in old_cat:
            skipped += 1
            continue

        new_cat = old_to_new.get(old_cat)
        if not new_cat:
            print('UNKNOWN CATEGORY: {} in {}'.format(old_cat, f))
            skipped += 1
            continue

        new_content = re.sub(
            r'^(category:\s*)(.+)$',
            'category: {}'.format(new_cat),
            content,
            flags=re.MULTILINE
        )
        with open(fp, 'w', encoding='utf-8') as fh:
            fh.write(new_content)
        print('FIXED: {} | {} -> {}'.format(f, old_cat, new_cat))
        updated += 1

print('\nFixed: {}, Skipped: {}'.format(updated, skipped))

# 验证最终分类分布
print('\n=== 最终分类分布 ===')
categories = {}
for root, dirs, files in os.walk(source_dir):
    for f in files:
        if not f.endswith('.md'):
            continue
        fp = os.path.join(root, f)
        with open(fp, 'r', encoding='utf-8') as fh:
            content = fh.read()
        m = re.search(r'^category:\s*(.+)$', content, re.MULTILINE)
        cat = m.group(1).strip().strip('"') if m else 'MISSING'
        categories.setdefault(cat, 0)
        categories[cat] += 1

for cat, cnt in sorted(categories.items(), key=lambda x: x[0]):
    print('  [{:3d}] {}'.format(cnt, cat))
print('\nTotal categories: {}, Total files: {}'.format(
    len(categories), sum(categories.values())))
