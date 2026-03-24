/**
 * 上下文管理模块
 * 负责管理聊天消息历史和转换消息格式供AI模型使用
 */

/**
 * 全局消息历史数组
 * 存储所有的聊天消息，包括系统消息、用户消息和助手消息
 */
const messages = [
  {
    type: 'system',
    payload: {
      content: '您是一名代码审查助理，为提高代码质量提供具体、可操作的建议',
    },
  },
];

/**
 * 转换消息格式为OpenAI格式
 * 将ChatMessage格式转换为OpenAI API的消息格式
 * @returns Array - 转换后的消息数组
 */
function convertMessagesToOpenAI(messages) {
  return messages.map(msg => {
    if (msg.type === 'system') {
      return { role: 'system', content: msg.payload.content };
    } else if (msg.type === 'user') {
      return { role: 'user', content: msg.payload.content };
    } else if (msg.type === 'assistant') {
      if (msg.payload.subtype === 'websearch-keywords') {
        return { role: 'assistant', content: `正在搜索：${msg.payload.content}` };
      } else if (msg.payload.subtype === 'websearch-results') {
        return { role: 'assistant', content: `搜索结果：${msg.payload.content}` };
      } else if (msg.payload.subtype === 'reply') {
        return { role: 'assistant', content: msg.payload.content };
      }
    }
    return null;
  }).filter(msg => msg !== null);
}

module.exports = {
  messages,
  convertMessagesToOpenAI
};