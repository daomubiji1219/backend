#!/usr/bin/env node

/**
 * Vercel 部署准备脚本
 * 运行此脚本来验证项目是否准备好进行 Vercel 部署
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 检查 Vercel 部署准备状态...');

// 检查必要的文件
const requiredFiles = [
  'vercel.json',
  'app.js',
  'package.json',
  'public/dist/index.html'
];

let allFilesExist = true;

console.log('\n📁 检查必要文件:');
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - 文件不存在`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ 部分必要文件缺失，请检查项目结构');
  process.exit(1);
}

// 检查 package.json 配置
console.log('\n📦 检查 package.json 配置:');
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));

// 检查必要的依赖
const requiredDeps = ['express', 'cors', 'dotenv'];
const missingDeps = [];

requiredDeps.forEach(dep => {
  if (packageJson.dependencies && packageJson.dependencies[dep]) {
    console.log(`✅ ${dep} 依赖已安装`);
  } else {
    console.log(`❌ ${dep} 依赖缺失`);
    missingDeps.push(dep);
  }
});

if (missingDeps.length > 0) {
  console.log(`\n❌ 缺少必要依赖: ${missingDeps.join(', ')}`);
  console.log('请运行: pnpm add ' + missingDeps.join(' '));
  process.exit(1);
}

// 检查 vercel.json 配置
console.log('\n⚙️  检查 vercel.json 配置:');
const vercelConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'vercel.json'), 'utf8'));

if (vercelConfig.version === 2) {
  console.log('✅ Vercel 配置版本正确');
} else {
  console.log('❌ Vercel 配置版本不正确');
}

if (vercelConfig.builds && vercelConfig.builds.length > 0) {
  console.log('✅ 构建配置存在');
  
  // 检查 Node.js 构建配置
  const nodeBuilds = vercelConfig.builds.filter(build => build.use === '@vercel/node');
  if (nodeBuilds.length > 0) {
    console.log('✅ Node.js 构建配置正确');
  } else {
    console.log('❌ 缺少 Node.js 构建配置');
  }
  
  // 检查静态文件构建配置
  const staticBuilds = vercelConfig.builds.filter(build => build.use === '@vercel/static');
  if (staticBuilds.length > 0) {
    console.log('✅ 静态文件构建配置正确');
  } else {
    console.log('⚠️  缺少静态文件构建配置');
  }
} else {
  console.log('❌ 缺少构建配置');
}

if (vercelConfig.routes && vercelConfig.routes.length > 0) {
  console.log('✅ 路由配置存在');
  
  // 检查 API 路由
  const apiRoutes = vercelConfig.routes.filter(route => route.src.includes('/api/'));
  if (apiRoutes.length > 0) {
    console.log('✅ API 路由配置正确');
  } else {
    console.log('❌ 缺少 API 路由配置');
  }
} else {
  console.log('❌ 缺少路由配置');
}

// 检查静态文件目录
console.log('\n📂 检查静态文件目录:');
const distPath = path.join(__dirname, 'public/dist');
if (fs.existsSync(distPath)) {
  const files = fs.readdirSync(distPath);
  if (files.length > 0) {
    console.log(`✅ public/dist 目录存在，包含 ${files.length} 个文件`);
    
    // 检查关键文件
    if (files.includes('index.html')) {
      console.log('✅ index.html 存在');
    } else {
      console.log('❌ index.html 不存在');
    }
    
    if (files.some(file => file.endsWith('.js'))) {
      console.log('✅ JavaScript 文件存在');
    } else {
      console.log('⚠️  没有找到 JavaScript 文件');
    }
    
    if (files.some(file => file.endsWith('.css'))) {
      console.log('✅ CSS 文件存在');
    } else {
      console.log('⚠️  没有找到 CSS 文件');
    }
  } else {
    console.log('❌ public/dist 目录为空');
  }
} else {
  console.log('❌ public/dist 目录不存在');
}

// 检查环境变量示例
console.log('\n🔐 检查环境变量配置:');
if (fs.existsSync(path.join(__dirname, '.env.example'))) {
  console.log('✅ .env.example 文件存在');
} else {
  console.log('⚠️  .env.example 文件不存在');
}

// 检查 .gitignore
console.log('\n🚫 检查 .gitignore 配置:');
if (fs.existsSync(path.join(__dirname, '.gitignore'))) {
  const gitignore = fs.readFileSync(path.join(__dirname, '.gitignore'), 'utf8');
  if (gitignore.includes('.vercel')) {
    console.log('✅ .gitignore 包含 Vercel 相关配置');
  } else {
    console.log('⚠️  .gitignore 缺少 Vercel 相关配置');
  }
  
  if (gitignore.includes('node_modules')) {
    console.log('✅ .gitignore 包含 node_modules');
  } else {
    console.log('❌ .gitignore 缺少 node_modules');
  }
  
  if (gitignore.includes('.env')) {
    console.log('✅ .gitignore 包含环境变量文件');
  } else {
    console.log('❌ .gitignore 缺少环境变量文件');
  }
} else {
  console.log('❌ .gitignore 文件不存在');
}

// 总结
console.log('\n' + '='.repeat(50));
console.log('🎉 Vercel 部署准备检查完成!');
console.log('\n📋 下一步操作:');
console.log('1. 确保代码已推送到 Git 仓库');
console.log('2. 在 Vercel 控制台导入项目');
console.log('3. 配置环境变量');
console.log('4. 部署项目');
console.log('\n📖 详细说明请查看 VERCEL_DEPLOYMENT.md');
console.log('\n🔗 Vercel 控制台: https://vercel.com/dashboard');