import os, re

source_dir = r'f:\SelfJob\PortableKnowledge\source'

subdirs = []
for item in sorted(os.listdir(source_dir)):
    fp = os.path.join(source_dir, item)
    if os.path.isdir(fp):
        subdirs.append(item)

print("Subdirectories:", subdirs)
print()

for subdir in subdirs:
    d = os.path.join(source_dir, subdir)
    categories = {}
    for root, dirs, files in os.walk(d):
        for f in files:
            if not f.endswith('.md'):
                continue
            fp = os.path.join(root, f)
            with open(fp, 'r', encoding='utf-8') as fh:
                content = fh.read()
            m = re.search(r'^category:\s*(.+)$', content, re.MULTILINE)
            cat = m.group(1).strip().strip('"') if m else 'MISSING'
            categories.setdefault(cat, []).append(f[:-3])
    total = sum(len(v) for v in categories.values())
    print("=== {} ({} files) ===".format(subdir, total))
    for cat, files in sorted(categories.items(), key=lambda x: -len(x[1])):
        print("  [{:3d}] {}".format(len(files), cat))
    print()
