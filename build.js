const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const yaml = require('js-yaml');

// 配置参数
const config = {
  // 源文件目录（Markdown文件）
  sourceDir: path.resolve(__dirname, 'source'),
  // 输出目录
  outputDir: path.resolve(__dirname, 'know'),
  // 分类输出目录
  categoryDir: path.resolve(__dirname, 'know', 'category'),
  // 标签输出目录
  tagDir: path.resolve(__dirname, 'know', 'tag'),
  // 详情输出目录
  detailDir: path.resolve(__dirname, 'know', 'detail'),
  // 分页输出目录
  pageDir: path.resolve(__dirname, 'know', 'page'),
  // 搜索索引文件
  searchIndexFile: path.resolve(__dirname, 'know', 'search-index.json'),
  // 分类树文件
  categoryTreeFile: path.resolve(__dirname, 'know', 'category-tree.json'),
  // 标签输出文件
  tagsFile: path.resolve(__dirname, 'know', 'tags.json'),
  // 文章列表文件
  articlesFile: path.resolve(__dirname, 'know', 'articles.json'),
  // 首页索引文件
  indexFile: path.resolve(__dirname, 'know', 'index.json'),
  // 知识库索引文件
  knowledgeFile: path.resolve(__dirname, 'know', 'knowledge.json'),
  // 分页大小
  pageSize: 20
};

// 确保目录存在
function ensureDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

function normalizePath(value) {
  return String(value || '').replace(/\\/g, '/');
}

function normalizeCategory(category) {
  return normalizePath(category)
    .split('/')
    .map(level => level.trim())
    .filter(Boolean)
    .join('/');
}

// 解析分类层级
function parseCategoryHierarchy(category) {
  const normalized = normalizeCategory(category) || '未分类';
  const levels = normalized.split('/').map(level => level.trim()).filter(Boolean);
  return {
    full: normalized,
    levels,
    depth: levels.length
  };
}

// 构建分类树（父节点 count 为子孙文章聚合数）
function buildCategoryTree(categories) {
  const tree = { name: 'root', path: '', count: 0, children: {} };

  Object.entries(categories).forEach(([category, count]) => {
    const { levels } = parseCategoryHierarchy(category);
    tree.count += count;
    let current = tree;

    levels.forEach((level, index) => {
      if (!current.children[level]) {
        current.children[level] = {
          name: level,
          path: levels.slice(0, index + 1).join('/'),
          count: 0,
          children: {}
        };
      }
      current.children[level].count += count;
      current = current.children[level];
    });
  });

  return tree;
}

function createStableArticleId(relativePath) {
  return crypto
    .createHash('md5')
    .update(normalizePath(relativePath))
    .digest('hex')
    .slice(0, 16);
}

function createDetailFilename(relativePath) {
  const rawBaseName = normalizePath(relativePath).split('/').pop() || 'article.md';
  return rawBaseName.replace(/\.md$/i, '.json');
}



function deriveCategory(relativePath, frontMatterCategory) {
  const normalizedRelativePath = normalizePath(relativePath);
  const relativeDir = normalizePath(path.dirname(normalizedRelativePath));
  const directoryCategory = relativeDir && relativeDir !== '.' ? normalizeCategory(relativeDir) : '';
  const metadataCategory = normalizeCategory(frontMatterCategory || '');

  if (directoryCategory && metadataCategory && directoryCategory !== metadataCategory) {
    console.warn(`⚠️ 分类不一致，已以目录为准: ${normalizedRelativePath} | 目录=${directoryCategory} | frontmatter=${metadataCategory}`);
  }

  return directoryCategory || metadataCategory || '未分类';
}

function buildListItem(article, includeId = false) {
  const item = {
    filename: article.filename,
    title: article.title,
    description: article.description,
    category: article.category,
    tags: article.tags,
    wordCount: article.wordCount,
    order: article.order
  };

  if (includeId) {
    item.id = article.id;
  }

  return item;
}

// 生成分页数据
function generatePagination(items, pageSize) {
  const pages = [];
  const totalPages = Math.ceil(items.length / pageSize);

  for (let i = 0; i < totalPages; i++) {
    const start = i * pageSize;
    const end = start + pageSize;
    const pageItems = items.slice(start, end);

    pages.push({
      page: i + 1,
      totalPages,
      totalItems: items.length,
      items: pageItems.map(item => buildListItem(item, true))
    });
  }

  return pages;
}

// 生成搜索索引（不含 content，只保留搜索必需字段以减小体积）
function generateSearchIndex(articles) {
  return articles.map(article => ({
    id: article.id,
    title: article.title,
    description: article.description,
    category: article.category,
    tags: article.tags,
    filename: article.filename
  }));
}

// 递归清空目录（删除所有文件和子目录）
function emptyDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        emptyDirectory(filePath);
        fs.rmdirSync(filePath);
      } else {
        fs.unlinkSync(filePath);
      }
    });
  }
}

// 提取Front-matter元数据并计算字数
function extractFrontMatterAndCountWords(content) {
  const fmRegex = /^(\uFEFF)?(?:---|\+\+\+)\r?\n([\s\S]*?)\r?\n(?:---|\+\+\+)(?:\s*?$)/m;
  const match = content.match(fmRegex);

  let frontMatter = {};
  if (match) {
    try {
      frontMatter = yaml.load(match[2]) || {};
    } catch (e) {
      console.warn('YAML解析错误:', e.message);
    }
  }

  const bodyText = content.substring(match ? match[0].length : 0);
  const wordCount = bodyText.replace(/\s+/g, '').length;
  return { frontMatter, wordCount, body: bodyText };
}

function scanMarkdownFiles(dir, baseDir = dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results = [];

  entries.forEach(entry => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...scanMarkdownFiles(fullPath, baseDir));
      return;
    }

    if (entry.isFile() && path.extname(entry.name).toLowerCase() === '.md') {
      results.push({
        fullPath,
        relativePath: normalizePath(path.relative(baseDir, fullPath))
      });
    }
  });

  return results;
}

// 生成分类/标签统计
function generateTaxonomy(items, field) {
  return items.reduce((acc, item) => {
    const values = Array.isArray(item[field]) ? item[field] : [item[field]];
    values.forEach(value => {
      if (value) acc[value] = (acc[value] || 0) + 1;
    });
    return acc;
  }, {});
}

function compareArticles(a, b) {
  return a.category.localeCompare(b.category, 'zh-CN')
    || a.title.localeCompare(b.title, 'zh-CN')
    || a.relativePath.localeCompare(b.relativePath, 'zh-CN');
}

function createCategoryFilePath(category) {
  const { levels } = parseCategoryHierarchy(category);
  return path.join(config.categoryDir, ...levels) + '.json';
}

// 主构建函数
async function build() {
  console.log('开始构建知识库...');

  ensureDirectory(config.sourceDir);

  if (fs.existsSync(config.outputDir)) {
    emptyDirectory(config.outputDir);
    console.log('✅ 已清空输出目录');
  }

  ensureDirectory(config.categoryDir);
  ensureDirectory(config.tagDir);
  ensureDirectory(config.detailDir);
  ensureDirectory(config.pageDir);

  try {
    const mdFiles = scanMarkdownFiles(config.sourceDir).map(file => {
      const content = fs.readFileSync(file.fullPath, 'utf8');
      const { frontMatter, wordCount, body } = extractFrontMatterAndCountWords(content);
      const title = frontMatter.title || path.basename(file.relativePath, '.md');
      const category = deriveCategory(file.relativePath, frontMatter.category);
      const tags = Array.isArray(frontMatter.tags)
        ? frontMatter.tags.map(tag => String(tag).trim()).filter(Boolean)
        : (typeof frontMatter.tags === 'string'
          ? frontMatter.tags.split(',').map(tag => tag.trim()).filter(Boolean)
          : []);

      return {
        id: createStableArticleId(file.relativePath),
        name: path.basename(file.relativePath),
        relativePath: file.relativePath,
        filename: createDetailFilename(file.relativePath),
        title,
        description: frontMatter.description || '',
        category,
        tags,
        wordCount,
        body
      };
    });

    mdFiles.sort(compareArticles);
    mdFiles.forEach((file, index) => {
      file.order = index + 1;
    });

    const taxonomy = {
      categories: generateTaxonomy(mdFiles, 'category'),
      tags: generateTaxonomy(mdFiles, 'tags')
    };

    const articlesData = {
      meta: {
        version: '1.0.0',
        totalArticles: mdFiles.length,
        totalCategories: Object.keys(taxonomy.categories).length,
        totalTags: Object.keys(taxonomy.tags).length
      },
      taxonomy,
      articles: mdFiles.map(file => buildListItem(file, true))
    };

    fs.writeFileSync(config.articlesFile, JSON.stringify(articlesData, null, 2));
    console.log(`✅ 已更新: ${config.articlesFile}`);

    Object.keys(taxonomy.categories).forEach(category => {
      const articlesInCategory = mdFiles.filter(file => file.category === category);
      const categoryData = {
        meta: {
          category,
          count: articlesInCategory.length
        },
        articles: articlesInCategory.map(file => buildListItem(file, true))
      };
      const categoryFilePath = createCategoryFilePath(category);
      ensureDirectory(path.dirname(categoryFilePath));
      fs.writeFileSync(categoryFilePath, JSON.stringify(categoryData, null, 2));
      console.log(`✅ 已生成分类文件: ${categoryFilePath}`);
    });

    Object.keys(taxonomy.tags).forEach(tag => {
      const articlesWithTag = mdFiles.filter(file => file.tags.includes(tag));
      const tagData = {
        meta: {
          tag,
          count: articlesWithTag.length
        },
        articles: articlesWithTag.map(file => buildListItem(file, true))
      };
      const tagFilePath = path.join(config.tagDir, `${tag}.json`);
      fs.writeFileSync(tagFilePath, JSON.stringify(tagData, null, 2));
      console.log(`✅ 已生成标签文件: ${tagFilePath}`);
    });

    mdFiles.forEach(file => {
      const detailData = {
        filename: file.filename,
        title: file.title,
        description: file.description,
        category: file.category,
        tags: file.tags,
        wordCount: file.wordCount,
        content: file.body
      };
      const detailFilePath = path.join(config.detailDir, file.filename);
      ensureDirectory(path.dirname(detailFilePath));
      fs.writeFileSync(detailFilePath, JSON.stringify(detailData, null, 2));
      console.log(`✅ 已生成详情文件: ${detailFilePath}`);
    });

    const tagsData = {
      meta: {
        totalTags: Object.keys(taxonomy.tags).length
      },
      tags: Object.keys(taxonomy.tags)
        .map(tag => ({
          name: tag,
          count: taxonomy.tags[tag]
        }))
        .sort((a, b) => b.count - a.count)
    };
    fs.writeFileSync(config.tagsFile, JSON.stringify(tagsData, null, 2));
    console.log(`✅ 已更新: ${config.tagsFile}`);

    const indexData = {
      meta: {
        totalArticles: mdFiles.length,
        totalCategories: Object.keys(taxonomy.categories).length,
        totalTags: Object.keys(taxonomy.tags).length
      },
      categories: Object.keys(taxonomy.categories)
        .map(category => ({
          name: category,
          count: taxonomy.categories[category]
        }))
        .sort((a, b) => b.count - a.count),
      recentArticles: mdFiles.slice(0, 5).map(file => buildListItem(file, true)),
      popularTags: Object.keys(taxonomy.tags)
        .sort((a, b) => taxonomy.tags[b] - taxonomy.tags[a])
        .slice(0, 10)
    };
    fs.writeFileSync(config.indexFile, JSON.stringify(indexData, null, 2));
    console.log(`✅ 已更新: ${config.indexFile}`);

    const categoryTree = buildCategoryTree(taxonomy.categories);
    fs.writeFileSync(config.categoryTreeFile, JSON.stringify(categoryTree, null, 2));
    console.log(`✅ 已生成分类树: ${config.categoryTreeFile}`);

    const pages = generatePagination(mdFiles, config.pageSize);
    pages.forEach(page => {
      const pageFileName = `page-${page.page}.json`;
      const pageFilePath = path.join(config.pageDir, pageFileName);
      fs.writeFileSync(pageFilePath, JSON.stringify(page, null, 2));
      console.log(`✅ 已生成分页文件: ${pageFilePath}`);
    });

    const searchIndex = generateSearchIndex(mdFiles);
    fs.writeFileSync(config.searchIndexFile, JSON.stringify(searchIndex, null, 2));
    console.log(`✅ 已生成搜索索引: ${config.searchIndexFile}`);

    fs.writeFileSync(config.knowledgeFile, JSON.stringify(indexData, null, 2));
    console.log(`✅ 已更新: ${config.knowledgeFile}`);

    console.log('\n📊 构建统计:');
    console.log(`📄 文章总数: ${mdFiles.length}篇`);
    console.log(`📂 分类数量: ${Object.keys(taxonomy.categories).length}个`);
    console.log(`🏷️ 标签数量: ${Object.keys(taxonomy.tags).length}个`);
    console.log(`📑 分页数量: ${pages.length}页`);
    console.log('\n✅ 知识库构建完成！');
  } catch (error) {
    console.error('❌ 构建失败:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  build();
}

module.exports = { build, scanMarkdownFiles, deriveCategory, createDetailFilename };
