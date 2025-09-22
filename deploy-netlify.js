#!/usr/bin/env node

/**
 * Netlify 部署准备脚本
 * 运行此脚本来准备项目以进行 Netlify 部署
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 准备 Netlify 部署...');

// 检查必要的文件
const requiredFiles = [
  'netlify.toml',
  'netlify/functions/api.js',
  'public/dist/index.html',
  'package.json'
];

let allFilesExist = true;

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} 存在`);
  } else {
    console.log(`❌ ${file} 不存在`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ 部分必要文件缺失，请检查项目结构');
  process.exit(1);
}

// 检查 package.json 中的依赖
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));

if (!packageJson.dependencies['serverless-http']) {
  console.log('❌ 缺少 serverless-http 依赖');
  console.log('请运行: pnpm add serverless-http');
  process.exit(1);
}

console.log('✅ serverless-http 依赖已安装');

// 检查环境变量示例文件
if (fs.existsSync(path.join(__dirname, '.env.netlify.example'))) {
  console.log('✅ .env.netlify.example 文件存在');
} else {
  console.log('⚠️  .env.netlify.example 文件不存在');
}

console.log('\n🎉 项目已准备好进行 Netlify 部署!');
console.log('\n📋 下一步:');
console.log('1. 将代码推送到 Git 仓库');
console.log('2. 在 Netlify 中连接你的仓库');
console.log('3. 配置环境变量（参考 .env.netlify.example）');
console.log('4. 部署!');
console.log('\n📖 详细说明请查看 NETLIFY_DEPLOYMENT.md');