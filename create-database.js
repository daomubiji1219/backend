// create-database.js
const mysql = require('mysql2/promise');
require('dotenv').config();

async function createDatabase() {
  console.log('🔧 开始创建数据库...');
  
  let connection;
  
  try {
    console.log('1️⃣ 连接到 MySQL 服务器...');
    
    // 创建不指定数据库的连接
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });
    
    console.log('✅ 成功连接到 MySQL 服务器!');
    
    console.log('2️⃣ 检查数据库是否存在...');
    const dbName = process.env.DB_NAME || 'ai_code_reviewer';
    const [databases] = await connection.execute(
      `SHOW DATABASES LIKE '${dbName}'`
    );
    
    if (databases.length > 0) {
      console.log(`✅ 数据库 '${dbName}' 已存在`);
    } else {
      console.log('3️⃣ 创建数据库...');
      await connection.execute(`CREATE DATABASE \`${dbName}\``);
      console.log(`✅ 数据库 '${dbName}' 创建成功!`);
    }
    
    console.log('\n🎉 数据库准备完成!');
    console.log('\n🚀 现在可以运行测试脚本: node test-db-connection.js');
    
  } catch (error) {
    console.error('\n❌ 创建数据库失败:');
    console.error('错误代码:', error.code);
    console.error('错误详情:', error.message);
    
    console.error('\n💡 解决建议:');
    if (error.code === 'ECONNREFUSED') {
      console.error('🔧 连接被拒绝 - MySQL服务未运行');
      console.error('   1. 启动 MySQL 服务');
      console.error('   2. 如果使用 XAMPP，请在控制面板中启动 MySQL');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('🔧 访问被拒绝 - 用户名或密码错误');
      console.error('   1. 检查 .env 文件中的 DB_PASSWORD');
      console.error('   2. 如果使用 XAMPP，密码通常为空，请设置 DB_PASSWORD=');
      console.error('   3. 如果设置了密码，请确保密码正确');
    } else {
      console.error('🔧 其他错误');
      console.error('   1. 检查 MySQL 是否正确安装');
      console.error('   2. 验证用户权限');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔒 数据库连接已关闭');
    }
  }
}

// 运行创建数据库脚本
createDatabase();