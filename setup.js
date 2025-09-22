// setup.js - 一键设置脚本
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCommand(command, description) {
  console.log(`\n🔧 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit', cwd: __dirname });
    console.log(`✅ ${description}完成!`);
    return true;
  } catch (error) {
    console.error(`❌ ${description}失败:`, error.message);
    return false;
  }
}

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${description}已存在`);
    return true;
  } else {
    console.log(`❌ ${description}不存在`);
    return false;
  }
}

async function setup() {
  console.log('🚀 AI Code Reviewer 后端设置向导');
  console.log('=' .repeat(50));
  
  // 1. 检查依赖
  console.log('\n📦 检查项目依赖...');
  if (!checkFile(path.join(__dirname, 'node_modules'), 'node_modules目录')) {
    if (!runCommand('npm install', '安装项目依赖')) {
      console.log('\n💡 提示: 如果npm安装失败，请尝试使用pnpm:');
      console.log('   pnpm install');
      return;
    }
  }
  
  // 2. 检查环境配置
  console.log('\n⚙️ 检查环境配置...');
  if (!checkFile(path.join(__dirname, '.env'), '.env配置文件')) {
    console.log('❌ 请先运行数据库连接测试脚本创建.env文件');
    return;
  }
  
  // 3. 创建数据库
  console.log('\n🗄️ 设置数据库...');
  if (!runCommand('node create-database.js', '创建数据库')) {
    console.log('\n💡 数据库创建失败，请检查MySQL服务是否运行');
    return;
  }
  
  // 4. 测试数据库连接
  console.log('\n🔍 测试数据库连接...');
  if (!runCommand('node test-db-connection.js', '测试数据库连接')) {
    console.log('\n💡 数据库连接测试失败，请检查配置');
    return;
  }
  
  console.log('\n🎉 设置完成!');
  console.log('\n📝 默认管理员账户:');
  console.log('   用户名: admin');
  console.log('   密码: admin123');
  console.log('\n🚀 启动后端服务:');
  console.log('   npm run dev');
  console.log('\n📖 更多信息请查看: DATABASE_SETUP.md');
}

// 运行设置
setup().catch(console.error);