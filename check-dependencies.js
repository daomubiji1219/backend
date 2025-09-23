// check-dependencies.js
// 用于检测 Netlify Functions 缺失依赖的脚本

const fs = require('fs');
const path = require('path');

// 读取 package.json
function getPackageJson() {
  const packagePath = path.join(__dirname, 'package.json');
  return JSON.parse(fs.readFileSync(packagePath, 'utf8'));
}

// 提取文件中的 require 语句
function extractRequires(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const requireRegex = /require\(['"]([^'"]+)['"]\)/g;
  const requires = [];
  let match;
  
  while ((match = requireRegex.exec(content)) !== null) {
    const moduleName = match[1];
    // 只关注非相对路径的模块（npm 包）
    if (!moduleName.startsWith('.') && !moduleName.startsWith('/')) {
      // 提取包名（处理 @scope/package 格式）
      const packageName = moduleName.startsWith('@') 
        ? moduleName.split('/').slice(0, 2).join('/')
        : moduleName.split('/')[0];
      requires.push(packageName);
    }
  }
  
  return [...new Set(requires)]; // 去重
}

// 检查依赖是否在 package.json 中
function checkDependencies() {
  const packageJson = getPackageJson();
  const allDependencies = {
    ...packageJson.dependencies || {},
    ...packageJson.devDependencies || {}
  };
  
  // 检查 Netlify Functions
  const functionsDir = path.join(__dirname, 'netlify', 'functions');
  const missingDeps = new Set();
  const foundDeps = new Set();
  
  if (fs.existsSync(functionsDir)) {
    const files = fs.readdirSync(functionsDir).filter(f => f.endsWith('.js'));
    
    files.forEach(file => {
      const filePath = path.join(functionsDir, file);
      const requires = extractRequires(filePath);
      
      console.log(`\n📁 检查文件: ${file}`);
      console.log(`发现的依赖: ${requires.join(', ')}`);
      
      requires.forEach(dep => {
        if (allDependencies[dep]) {
          foundDeps.add(dep);
          console.log(`✅ ${dep} - 已在 package.json 中`);
        } else {
          // 检查是否是 Node.js 内置模块
          const builtinModules = [
            'fs', 'path', 'http', 'https', 'url', 'querystring', 'crypto',
            'util', 'events', 'stream', 'buffer', 'os', 'child_process',
            'cluster', 'dgram', 'dns', 'net', 'tls', 'readline', 'repl',
            'string_decoder', 'timers', 'tty', 'vm', 'zlib', 'assert',
            'constants', 'domain', 'punycode', 'v8'
          ];
          
          if (builtinModules.includes(dep)) {
            console.log(`🔧 ${dep} - Node.js 内置模块`);
          } else {
            missingDeps.add(dep);
            console.log(`❌ ${dep} - 缺失依赖！`);
          }
        }
      });
    });
  }
  
  // 输出总结
  console.log('\n' + '='.repeat(50));
  console.log('📊 依赖检查总结:');
  console.log('='.repeat(50));
  
  if (foundDeps.size > 0) {
    console.log(`\n✅ 已找到的依赖 (${foundDeps.size}):`);
    [...foundDeps].sort().forEach(dep => console.log(`   - ${dep}`));
  }
  
  if (missingDeps.size > 0) {
    console.log(`\n❌ 缺失的依赖 (${missingDeps.size}):`);
    [...missingDeps].sort().forEach(dep => console.log(`   - ${dep}`));
    
    console.log('\n🔧 修复命令:');
    console.log(`pnpm add ${[...missingDeps].join(' ')}`);
    
    return false;
  } else {
    console.log('\n🎉 所有依赖都已正确配置！');
    return true;
  }
}

// 运行检查
if (require.main === module) {
  console.log('🔍 开始检查 Netlify Functions 依赖...');
  const success = checkDependencies();
  process.exit(success ? 0 : 1);
}

module.exports = { checkDependencies, extractRequires };