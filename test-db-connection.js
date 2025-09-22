// test-db-connection.js
const { pool, initDatabase } = require('./config/database');
require('dotenv').config();

async function testConnection() {
  console.log('🔍 开始测试数据库连接...');
  console.log('📋 当前配置:');
  console.log(`   主机: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`   端口: ${process.env.DB_PORT || 3306}`);
  console.log(`   用户: ${process.env.DB_USER || 'root'}`);
  console.log(`   密码: ${process.env.DB_PASSWORD ? '***已设置***' : '***未设置***'}`);
  console.log(`   数据库: ${process.env.DB_NAME || 'ai_code_reviewer'}`);
  console.log('');
  
  try {
    // 测试基本连接
    console.log('1️⃣ 测试数据库连接...');
    const connection = await pool.getConnection();
    console.log('✅ 数据库连接成功!');
    
    // 测试查询
    console.log('2️⃣ 测试数据库查询...');
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ 数据库查询成功:', rows);
    
    // 释放连接
    connection.release();
    
    // 测试数据库初始化
    console.log('3️⃣ 初始化数据库表...');
    await initDatabase();
    console.log('✅ 数据库初始化完成!');
    
    // 测试用户表查询
    console.log('4️⃣ 测试用户表查询...');
    const [users] = await pool.execute('SELECT COUNT(*) as count FROM users');
    console.log('✅ 用户表查询成功，当前用户数量:', users[0].count);
    
    console.log('\n🎉 所有数据库测试通过!');
    console.log('\n📝 默认管理员账户信息:');
    console.log('   用户名: admin');
    console.log('   密码: admin123');
    console.log('\n🚀 现在可以启动后端服务: npm run dev');
    
  } catch (error) {
    console.error('\n❌ 数据库连接测试失败:');
    console.error('错误代码:', error.code);
    console.error('错误详情:', error.message);
    
    console.error('\n💡 解决建议:');
    if (error.code === 'ECONNREFUSED') {
      console.error('🔧 连接被拒绝 - MySQL服务未运行');
      console.error('   1. 启动 MySQL 服务');
      console.error('   2. 如果使用 XAMPP，请在控制面板中启动 MySQL');
      console.error('   3. 检查端口 3306 是否被占用');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('🔧 数据库不存在');
      console.error('   1. 登录 MySQL: mysql -u root -p');
      console.error('   2. 创建数据库: CREATE DATABASE ai_code_reviewer;');
      console.error('   3. 或使用 phpMyAdmin 创建数据库');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('🔧 访问被拒绝 - 用户名或密码错误');
      console.error('   1. 检查 .env 文件中的 DB_PASSWORD');
      console.error('   2. 如果使用 XAMPP，密码通常为空');
      console.error('   3. 如果设置了密码，请确保密码正确');
    } else {
      console.error('🔧 其他错误');
      console.error('   1. 检查 MySQL 是否正确安装');
      console.error('   2. 验证网络连接');
      console.error('   3. 查看 MySQL 错误日志');
    }
    
    console.error('\n📖 详细设置指南请查看: DATABASE_SETUP.md');
  } finally {
    // 关闭连接池
    await pool.end();
    console.log('\n🔒 数据库连接池已关闭');
  }
}

// 运行测试
testConnection();