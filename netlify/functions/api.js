const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const OpenAI = require('openai');
const { initDatabase } = require('../../config/sqlite');
const authRoutes = require('../../routes/auth');
const uploadRoutes = require('../../routes/upload');

require('dotenv').config();

const app = express();

// 中间件配置
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// CORS 配置 - 适配 Netlify
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5175', 
    'http://localhost:5174',
    /\.netlify\.app$/,  // 允许所有 Netlify 部署域名
    /\.netlify\.com$/   // 允许 Netlify 预览域名
  ],
  credentials: true,
}));

// API配置端点
app.get('/config', (req, res) => {
  const baseURL = process.env.NODE_ENV === 'production' 
    ? `https://${req.get('host')}` 
    : `http://localhost:${process.env.PORT || 3001}`;
  
  res.json({
    apiBaseURL: baseURL,
    environment: process.env.NODE_ENV || 'development'
  });
});

// 集成认证路由
app.use('/auth', authRoutes);
app.use('/', uploadRoutes);

// DeepSeek API 代理
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY || 'sk-76505256423a47af86c96269ead40c03'
});

app.post('/deepseek', async (req, res) => {
  try {
    const completion = await openai.chat.completions.create(req.body);
    res.json(completion);
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 初始化数据库（在 Netlify Functions 中）
let dbInitialized = false;

const initializeDatabase = async () => {
  if (!dbInitialized) {
    try {
      await initDatabase();
      dbInitialized = true;
      console.log('数据库初始化完成');
    } catch (error) {
      console.error('数据库初始化失败:', error);
    }
  }
};

// 在每个请求前确保数据库已初始化
app.use(async (req, res, next) => {
  await initializeDatabase();
  next();
});

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// 导出为 Netlify Function
module.exports.handler = serverless(app);