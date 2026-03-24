/**
 * AI模型配置模块
 * 负责配置和导出AI模型调用函数，用于与阿里云通义千问模型交互
 */

require('dotenv').config();

// 获取调用模型API的必要参数
const API_KEY = process.env.QWEN_API_KEY || 'sk-95096d623f5d4fcfacc36a6307e6880c'; // API密钥
const BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';        // 阿里云通义千问API基础URL
const MODEL = 'qwen-turbo';                                                   // 使用的模型名称

// 验证API密钥是否存在
if (!API_KEY) {
  throw new Error('请在 .env 中设置 QWEN_API_KEY');
}

/**
 * 调用通义千问API
 * @param {Array} messages - 消息数组
 * @param {boolean} streaming - 是否启用流式响应
 * @returns {Promise} API响应
 */
async function callQwenAPI(messages, streaming = false) {
  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: messages,
        stream: streaming,
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      throw new Error(`API调用失败: ${response.status}`);
    }
    
    if (streaming) {
      return response;
    } else {
      const data = await response.json();
      return data.choices[0].message.content;
    }
  } catch (error) {
    console.error('AI模型调用失败:', error);
    throw error;
  }
}

module.exports = {
  callQwenAPI
};