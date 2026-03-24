/**
 * 聊天路由模块
 * 提供聊天接口、历史消息查询和SSE流式通信功能
 */

const express = require('express');
const router = express.Router();

const { messages } = require('../lib/context');
const { handleChatStream } = require('../lib/workflow');

/**
 * 历史消息查询接口
 * GET /history - 获取过滤后的聊天历史（不包含系统消息）
 */
router.get('/history', (req, res) => {
  // 过滤掉系统消息，只返回用户和助手消息
  const historyMessages = messages.filter((message) => {
    // 系统消息不能传给前端
    if (message.type === 'system') {
      return false;
    }
    return true;
  });

  res.json(historyMessages);
});

/**
 * 全量消息查询接口（方便调试）
 * GET /messages - 获取所有消息，包括系统消息
 */
router.get('/messages', (req, res) => {
  res.json(messages);
});

/**
 * SSE 通信接口（EventSource GET 版本）
 * GET /sse - 处理基于EventSource的SSE请求
 */
router.get('/sse', handleSSEChat);

/**
 * SSE 通信接口（fetch POST 版本）
 * POST /sse - 处理基于fetch的SSE请求，支持更复杂的请求体
 */
router.post('/sse', handleSSEChat);

/**
 * SSE请求处理函数
 * 统一处理GET和POST方式的SSE请求
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
async function handleSSEChat(req, res) {
  let query = '';
  let websearch = false;

  // 根据请求方法解析参数
  if (req.method === 'GET') {
    // GET请求从查询参数获取数据
    query = req.query.query;
    websearch = req.query.websearch === 'true';
  }

  if (req.method === 'POST') {
    // POST请求从请求体获取数据
    query = req.body.query;
    websearch = req.body.websearch;
  }

  if (!query) {
    return res.status(400).json({ error: '缺少查询参数' });
  }

  // 设置 SSE 响应头
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

  // 提前发送响应头
  res.flushHeaders();

  // 处理聊天流
  await handleChatStream({ query, websearch }, res);

  // 最后发送一个 close 事件，触发前端 EventSource 的自定义 close 事件
  res.end('event: close\ndata:\n\n');
}

/**
 * 保存分析报告接口
 * POST /report - 接收前端的分析结果并保存为助手消息
 */
router.post('/report', (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: '缺少分析内容' });
  }

  // 将分析结果作为助手消息添加到历史记录中
  messages.push({
    type: 'system',
    payload: {
      content: content,
      subtype: 'reply',
    },
  });

  res.json({ message: '分析结果已保存到上下文' });
});

/**
 * 清空聊天历史接口
 * DELETE /history - 清空聊天历史并重置为初始状态
 */
router.delete('/history', (req, res) => {
  // 清空消息数组
  messages.length = 0;
  
  // 重新添加系统消息
  messages.push({
    type: 'system',
    payload: {
      content: '你是一位乐于助人的 AI 助手，可以帮助用户解决各种问题。',
    },
  });
  
  res.json({ message: '聊天历史已清空' });
});

module.exports = router;