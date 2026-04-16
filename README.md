# PortableKnowledge

个人知识库项目，用于支撑小程序「随身工具宝 · 随身百科」的内容数据。

## 目录结构

```
PortableKnowledge/
├── source/          原始 Markdown 源文件（YAML frontmatter 格式）
├── know/            构建产物（JSON 数据，供小程序 CDN 读取）
└── memory/          个人记忆文档
```

## know/ 目录说明

| 文件 | 说明 |
|------|------|
| `articles.json` | 全量文章索引（标题、分类、标签、字数等） |
| `knowledge.json` | 分类树元数据 |
| `tags.json` | 全量标签列表 |
| `category-tree.json` | 分类树结构（嵌套层级） |
| `search-index.json` | 搜索索引 |
| `category/*.json` | 每个分类的文章列表 |
| `tag/*.json` | 每个标签的文章列表 |
| `detail/*.json` | 每篇文章的详细内容（Markdown 正文） |
| `page/*.json` | 分页列表 |
| `know-category-theme.json` | **分类主题配置**（渐变色 + emoji，见下） |

## know-category-theme.json（分类主题配置）

**用途：** 为小程序知识库页面的分类徽章提供渐变色和 emoji 图标配置，通过 CDN 动态加载，无需发版即可实时更新主题样式。

**CDN 地址：**  
`https://cdn.jsdelivr.net/gh/ddabb/PortableKnowledge@main/know/know-category-theme.json`

**数据结构：**

```json
{
  "version": "20260416",
  "categories": {
    "category-product-usage": { "gradient": "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", "icon": "📖" },
    "category-product-design": { "gradient": "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", "icon": "🎨" },
    "category-product-thinking": { "gradient": "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", "icon": "💡" },
    "category-dev-practice": { "gradient": "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", "icon": "🔧" },
    "category-dev-story": { "gradient": "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)", "icon": "💻" },
    "category-project-mgmt": { "gradient": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", "icon": "📋" },
    "category-pmp": { "gradient": "linear-gradient(135deg, #f6d365 0%, #fda085 100%)", "icon": "🎓" },
    "category-agile": { "gradient": "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)", "icon": "🏃" },
    "category-soft-exam": { "gradient": "linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%)", "icon": "🎯" },
    "category-legal": { "gradient": "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)", "icon": "⚖️" },
    "category-safety": { "gradient": "linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)", "icon": "🛡️" },
    "category-calculation": { "gradient": "linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%)", "icon": "🧮" },
    "category-uncategorized": { "gradient": "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)", "icon": "📚" }
  }
}
```

**key 命名规则：** `category-` + 分类 className（与 `knowledgeCategory.js` 中的 `CATEGORY_META_MAP` 对应）

**使用方式：** 小程序 `app.js` onLaunch 时静默预加载，Storage 缓存 7 天，后续更改只需修改本文件并 push GitHub，用户下次打开自动生效，无需发版。

**修改主题步骤：**
1. 编辑 `know-category-theme.json`
2. 提交：`git add know/know-category-theme.json && git commit -m "chore: 更新分类主题"`
3. 推送：`git push origin main`（jsDelivr CDN 通常 1-5 分钟生效）

## 构建

```bash
cd PortableKnowledge
node build.js
```

构建脚本会读取 `source/` 下的 Markdown 文件，生成 `know/` 下所有 JSON 产物。
