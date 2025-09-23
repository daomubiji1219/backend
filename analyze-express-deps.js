// analyze-express-deps.js
// 分析 Express.js 的间接依赖

const fs = require('fs');
const path = require('path');

// Express.js 常见的间接依赖列表
const EXPRESS_INDIRECT_DEPS = [
  'accepts',
  'array-flatten',
  'body-parser',
  'content-disposition',
  'content-type',
  'cookie',
  'cookie-signature',
  'debug',
  'depd',
  'encodeurl',
  'escape-html',
  'etag',
  'finalhandler',
  'fresh',
  'http-errors',
  'merge-descriptors',
  'methods',
  'on-finished',
  'parseurl',
  'path-to-regexp',
  'proxy-addr',
  'qs',
  'range-parser',
  'safe-buffer',
  'send',
  'serve-static',
  'setprototypeof',
  'statuses',
  'type-is',
  'utils-merge',
  'vary'
];

// CORS 的间接依赖
const CORS_INDIRECT_DEPS = [
  'object-assign',
  'vary'
];

// cookie-parser 的间接依赖
const COOKIE_PARSER_INDIRECT_DEPS = [
  'cookie',
  'cookie-signature'
];

// serverless-http 的间接依赖
const SERVERLESS_HTTP_INDIRECT_DEPS = [
  'binary-case'
];

function getPackageJson() {
  const packagePath = path.join(__dirname, 'package.json');
  return JSON.parse(fs.readFileSync(packagePath, 'utf8'));
}

function checkIndirectDependencies() {
  const packageJson = getPackageJson();
  const allDependencies = {
    ...packageJson.dependencies || {},
    ...packageJson.devDependencies || {}
  };
  
  console.log('🔍 分析 Express.js 及相关包的间接依赖...');
  console.log('=' .repeat(60));
  
  const allIndirectDeps = [
    ...EXPRESS_INDIRECT_DEPS,
    ...CORS_INDIRECT_DEPS,
    ...COOKIE_PARSER_INDIRECT_DEPS,
    ...SERVERLESS_HTTP_INDIRECT_DEPS
  ];
  
  const uniqueIndirectDeps = [...new Set(allIndirectDeps)];
  const missingDeps = [];
  const presentDeps = [];
  
  console.log(`\n📦 检查 ${uniqueIndirectDeps.length} 个可能的间接依赖:\n`);
  
  uniqueIndirectDeps.forEach(dep => {
    if (allDependencies[dep]) {
      presentDeps.push(dep);
      console.log(`✅ ${dep.padEnd(20)} - 已在 package.json 中`);
    } else {
      missingDeps.push(dep);
      console.log(`❌ ${dep.padEnd(20)} - 缺失`);
    }
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 间接依赖分析结果:');
  console.log('='.repeat(60));
  
  console.log(`\n✅ 已存在的间接依赖 (${presentDeps.length}):`);
  if (presentDeps.length > 0) {
    presentDeps.sort().forEach(dep => console.log(`   - ${dep}`));
  } else {
    console.log('   无');
  }
  
  console.log(`\n❌ 缺失的间接依赖 (${missingDeps.length}):`);
  if (missingDeps.length > 0) {
    missingDeps.sort().forEach(dep => console.log(`   - ${dep}`));
    
    console.log('\n🔧 建议的修复命令:');
    console.log(`pnpm add ${missingDeps.join(' ')}`);
    
    console.log('\n💡 或者分批安装:');
    const batchSize = 5;
    for (let i = 0; i < missingDeps.length; i += batchSize) {
      const batch = missingDeps.slice(i, i + batchSize);
      console.log(`pnpm add ${batch.join(' ')}`);
    }
  } else {
    console.log('   无');
  }
  
  // 特别标注 Netlify 报错的依赖
  console.log('\n🚨 Netlify 部署中报错的依赖:');
  const netlifyErrors = ['accepts', 'body-parser', 'array-flatten'];
  netlifyErrors.forEach(dep => {
    const status = allDependencies[dep] ? '✅ 已安装' : '❌ 缺失';
    console.log(`   - ${dep.padEnd(15)} ${status}`);
  });
  
  return missingDeps.length === 0;
}

// 生成完整的依赖安装脚本
function generateInstallScript() {
  const packageJson = getPackageJson();
  const allDependencies = {
    ...packageJson.dependencies || {},
    ...packageJson.devDependencies || {}
  };
  
  const allIndirectDeps = [
    ...EXPRESS_INDIRECT_DEPS,
    ...CORS_INDIRECT_DEPS,
    ...COOKIE_PARSER_INDIRECT_DEPS,
    ...SERVERLESS_HTTP_INDIRECT_DEPS
  ];
  
  const uniqueIndirectDeps = [...new Set(allIndirectDeps)];
  const missingDeps = uniqueIndirectDeps.filter(dep => !allDependencies[dep]);
  
  if (missingDeps.length > 0) {
    const scriptContent = `#!/bin/bash
# 自动安装缺失的 Express.js 间接依赖
# 生成时间: ${new Date().toISOString()}

echo "🔧 开始安装缺失的依赖..."

# 安装所有缺失的依赖
pnpm add ${missingDeps.join(' ')}

echo "✅ 依赖安装完成！"
echo "📝 请提交更新后的 package.json 和 pnpm-lock.yaml"
`;
    
    fs.writeFileSync('install-missing-deps.sh', scriptContent);
    console.log('\n📝 已生成安装脚本: install-missing-deps.sh');
  }
}

if (require.main === module) {
  const success = checkIndirectDependencies();
  generateInstallScript();
  
  if (!success) {
    console.log('\n⚠️  建议先安装缺失的依赖，然后重新部署到 Netlify');
  }
}

module.exports = { checkIndirectDependencies, EXPRESS_INDIRECT_DEPS };