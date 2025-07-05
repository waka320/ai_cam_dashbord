/* eslint-env node */
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

// サイトのベースURL
const baseUrl = 'ai-camera.lab.mdg-meidai.com';

// 静的ページのリスト
const staticPages = [
  { url: '/', changefreq: 'daily', priority: '1.0' },
  { url: '/terms', changefreq: 'yearly', priority: '0.5' },
  { url: '/sitemap', changefreq: 'monthly', priority: '0.6' }
];

// 現在の日付を取得
const getCurrentDate = () => {
  const now = new Date();
  return now.toISOString().split('T')[0]; // YYYY-MM-DD形式
};

// XMLサイトマップを生成
const generateSitemap = () => {
  const currentDate = getCurrentDate();
  
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return sitemapXml;
};

// サイトマップファイルを保存
const saveSitemap = () => {
  const sitemapContent = generateSitemap();
  const outputPath = path.join(__dirname, '..', 'build', 'sitemap.xml');
  
  // buildディレクトリが存在するかチェック
  const buildDir = path.dirname(outputPath);
  if (!fs.existsSync(buildDir)) {
    console.error('Build directory does not exist. Please run "npm run build" first.');
    process.exit(1);
  }
  
  try {
    fs.writeFileSync(outputPath, sitemapContent, 'utf8');
    console.log('✅ Sitemap generated successfully at:', outputPath);
  } catch (error) {
    console.error('❌ Failed to generate sitemap:', error);
    process.exit(1);
  }
};

// robots.txtも更新
const updateRobotsTxt = () => {
  const robotsContent = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /

# サイトマップの場所
Sitemap: ${baseUrl}/sitemap.xml

# 検索エンジンの巡回を許可するページ
Allow: /
Allow: /terms
Allow: /sitemap

# 静的アセットも許可
Allow: /static/
Allow: /assets/
Allow: /fonts/`;

  const robotsPath = path.join(__dirname, '..', 'build', 'robots.txt');
  
  try {
    fs.writeFileSync(robotsPath, robotsContent, 'utf8');
    console.log('✅ robots.txt updated successfully at:', robotsPath);
  } catch (error) {
    console.error('❌ Failed to update robots.txt:', error);
  }
};

// メイン実行
const main = () => {
  console.log('🚀 Generating SEO files...');
  saveSitemap();
  updateRobotsTxt();
  console.log('🎉 SEO files generated successfully!');
};

// スクリプトが直接実行された場合のみ実行
if (require.main === module) {
  main();
}

module.exports = { generateSitemap, saveSitemap, updateRobotsTxt };
