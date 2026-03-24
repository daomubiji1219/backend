/**
 * 工具函数模块
 * 提供网络搜索等工具函数
 */

/**
 * 联网搜索函数，使用 Bing 搜索引擎的 RSS 响应接口
 * @param {string} keywords - 搜索关键词
 * @returns {Promise<Array>} 搜索结果数组
 */
async function websearch(keywords) {
  try {
    const response = await fetch(
      `https://www.bing.com/search?format=rss&q=${encodeURIComponent(keywords)}`
    );
    
    // 获取RSS响应文本
    const rss = await response.text();
    
    // 使用正则表达式匹配所有<item>标签内容
    const matches = rss.match(/<item>(.*?)<\/item>/g);
    
    // 如果没有匹配到任何结果，返回空数组
    if (!matches) {
      return [];
    }
    
    // 解析每个搜索结果项
    const results = matches.map((match) => {
      // 提取标题
      const title = match.match(/<title>(.*?)<\/title>/)?.[1];
      // 提取链接
      const link = match.match(/<link>(.*?)<\/link>/)?.[1];
      // 提取描述
      const description = match.match(/<description>(.*?)<\/description>/)?.[1];
      
      // 如果标题或链接不存在，返回null
      if (!title || !link) {
        return null;
      }
      
      return { title, link, description };
    });
    
    return results.filter((result) => result !== null);
  } catch (error) {
    console.error('网络搜索失败:', error);
    return [];
  }
}

module.exports = {
  websearch
};