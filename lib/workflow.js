/**
 * 聊天工作流模块
 * 负责协调整个聊天流程，包括网络搜索和AI回复生成
 */

const { messages, convertMessagesToOpenAI } = require('./context');
const { callQwenAPI } = require('./llm');
const { websearch } = require('./tools');

/**
 * 流式处理函数
 * 协调整个聊天流程：网络搜索（可选）-> AI回复生成
 * @param {Object} options - 流式处理选项
 * @param {string} options.query - 用户查询内容
 * @param {boolean} options.websearch - 是否启用网络搜索
 * @param {Object} res - Express响应对象
 */
async function handleChatStream(options, res) {
  const { query, websearch: websearchEnabled = false } = options;
  
  // 添加用户消息到历史
  messages.push({
    type: 'user',
    payload: { content: query },
  });
  
  try {
    // 如果启用网络搜索
    if (websearchEnabled) {
      // 生成搜索关键词
      const keywordMessages = convertMessagesToOpenAI([
        ...messages,
        {
          type: 'user',
          payload: { content: '根据当前问题和历史消息，设计一组简洁、精准的搜索关键词，用空格分隔。' }
        }
      ]);
      
      const keywords = await callQwenAPI(keywordMessages);
      
      const keywordMessage = {
        type: 'assistant',
        payload: {
          subtype: 'websearch-keywords',
          content: keywords,
        },
      };
      
      messages.push(keywordMessage);
      res.write(`data: ${JSON.stringify(keywordMessage)}\n\n`);
      
      // 执行网络搜索
      const searchResults = await websearch(keywords);
      
      const searchMessage = {
        type: 'assistant',
        payload: {
          subtype: 'websearch-results',
          content: JSON.stringify(searchResults),
        },
      };
      
      messages.push(searchMessage);
      res.write(`data: ${JSON.stringify(searchMessage)}\n\n`);
    }
    
    // 生成AI回复
    const openAIMessages = convertMessagesToOpenAI(messages);
    const response = await callQwenAPI(openAIMessages, true);
    
    let reply = '';
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content || '';
            
            if (content) {
              reply += content;
              
              const partialMessage = {
                type: 'assistant',
                partial: true,
                payload: { subtype: 'reply', content },
              };
              
              res.write(`data: ${JSON.stringify(partialMessage)}\n\n`);
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }
    
    // 保存完整回复
    messages.push({
      type: 'assistant',
      payload: { subtype: 'reply', content: reply },
    });
    
  } catch (error) {
    console.error('聊天处理错误:', error);
    const errorMessage = {
      type: 'error',
      payload: { content: '抱歉，处理您的请求时出现了错误。' },
    };
    res.write(`data: ${JSON.stringify(errorMessage)}\n\n`);
  }
}

module.exports = {
  handleChatStream
};