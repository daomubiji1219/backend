const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

const router = express.Router();

// 临时目录配置
const TEMP_DIR = path.join(__dirname, '../temp');
const UPLOAD_DIR = path.join(__dirname, '../uploads');

// 确保目录存在
fs.mkdir(TEMP_DIR, { recursive: true }).catch(console.error);
fs.mkdir(UPLOAD_DIR, { recursive: true }).catch(console.error);

// multer 配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, TEMP_DIR);
  },
  filename: (req, file, cb) => {
    const { hash, chunkIndex } = req.body;
    cb(null, `${hash}-${chunkIndex}`);
  }
});

const upload = multer({ storage });

// 检查已上传的分片
router.post('/upload/check', async (req, res) => {
  try {
    const { hash } = req.body;
    
    if (!hash) {
      return res.status(400).json({ error: '缺少文件哈希' });
    }

    // 检查临时目录中的分片文件
    const files = await fs.readdir(TEMP_DIR);
    const uploadedChunks = files
      .filter(file => file.startsWith(`${hash}-`))
      .map(file => parseInt(file.split('-')[1]))
      .filter(index => !isNaN(index))
      .sort((a, b) => a - b);

    res.json({ uploadedChunks });
  } catch (error) {
    console.error('检查分片失败:', error);
    res.status(500).json({ error: '检查分片失败' });
  }
});

// 上传分片
router.post('/upload/chunk', upload.single('chunk'), async (req, res) => {
  try {
    const { hash, chunkIndex, totalChunks, filename } = req.body;
    
    if (!hash || chunkIndex === undefined || chunkIndex === null || !totalChunks || !filename) {
      console.error('参数验证失败:', { hash, chunkIndex, totalChunks, filename });
      return res.status(400).json({ error: '缺少必要参数' });
    }
    
    // 验证参数类型
    if (typeof hash !== 'string' || hash.trim() === '') {
      console.error('hash参数无效:', hash);
      return res.status(400).json({ error: 'hash参数无效' });
    }
    
    const chunkIndexNum = parseInt(chunkIndex);
    if (isNaN(chunkIndexNum) || chunkIndexNum < 0) {
      console.error('chunkIndex参数无效:', chunkIndex);
      return res.status(400).json({ error: 'chunkIndex参数无效' });
    }

    if (!req.file) {
      return res.status(400).json({ error: '未接收到分片文件' });
    }

    // 将临时文件重命名为正确的分片文件名
    const tempPath = req.file.path;
    const chunkPath = path.join(TEMP_DIR, `${hash}-${chunkIndexNum}`);
    
    try {
      // 重命名文件
      await fs.rename(tempPath, chunkPath);
      console.log(`分片文件重命名成功: ${tempPath} -> ${chunkPath}`);
      
      // 验证分片文件
      const stats = await fs.stat(chunkPath);
      
      console.log(`分片 ${chunkIndexNum} 上传成功: ${chunkPath}, 大小: ${stats.size} bytes`);
      
      // 验证文件大小不为0
      if (stats.size === 0) {
        await fs.unlink(chunkPath); // 删除空文件
        return res.status(500).json({ error: `分片 ${chunkIndexNum} 文件为空` });
      }
      
      res.json({ 
        success: true, 
        message: `分片 ${chunkIndexNum} 上传成功`,
        chunkIndex: chunkIndexNum,
        size: stats.size
      });
    } catch (error) {
      console.error(`分片 ${chunkIndexNum} 处理失败:`, error);
      
      // 清理临时文件
      try {
        if (await fs.access(tempPath).then(() => true).catch(() => false)) {
          await fs.unlink(tempPath);
          console.log(`清理临时文件: ${tempPath}`);
        }
      } catch (cleanupError) {
        console.error('清理临时文件失败:', cleanupError);
      }
      
      res.status(500).json({ error: `分片 ${chunkIndexNum} 保存失败: ${error.message}` });
    }
  } catch (error) {
    console.error('上传分片失败:', error);
    res.status(500).json({ error: '上传分片失败' });
  }
});

// 合并分片
router.post('/upload/merge', async (req, res) => {
  try {
    const { hash, filename, totalChunks } = req.body;
    
    if (!hash || !filename || !totalChunks) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    const finalPath = path.join(UPLOAD_DIR, filename);
    const writeStream = require('fs').createWriteStream(finalPath);

    try {
      console.log(`开始合并文件: ${filename}, 哈希: ${hash}, 总分片数: ${totalChunks}`);
      
      // 首先检查所有分片是否都存在
      const missingChunks = [];
      const existingChunks = [];
      
      for (let i = 0; i < totalChunks; i++) {
        const chunkPath = path.join(TEMP_DIR, `${hash}-${i}`);
        try {
          await fs.access(chunkPath);
          const stats = await fs.stat(chunkPath);
          existingChunks.push({ index: i, size: stats.size });
          console.log(`分片 ${i} 存在, 大小: ${stats.size} bytes`);
        } catch {
          missingChunks.push(i);
          console.error(`分片 ${i} 不存在: ${chunkPath}`);
        }
      }
      
      console.log(`存在的分片: ${existingChunks.length}/${totalChunks}`);
      
      if (missingChunks.length > 0) {
        console.error(`缺少分片: ${missingChunks.join(', ')}`);
        throw new Error(`缺少分片: ${missingChunks.join(', ')}`);
      }
      
      // 按顺序合并所有分片
      for (let i = 0; i < totalChunks; i++) {
        const chunkPath = path.join(TEMP_DIR, `${hash}-${i}`);
        
        try {
          const chunkBuffer = await fs.readFile(chunkPath);
          writeStream.write(chunkBuffer);
        } catch (error) {
          writeStream.destroy();
          throw new Error(`分片 ${i} 不存在或读取失败`);
        }
      }

      writeStream.end();

      // 等待写入完成
      await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });

      // 清理临时分片文件
      for (let i = 0; i < totalChunks; i++) {
        const chunkPath = path.join(TEMP_DIR, `${hash}-${i}`);
        try {
          await fs.unlink(chunkPath);
        } catch (error) {
          console.warn(`清理分片文件失败: ${chunkPath}`, error);
        }
      }

      // 验证合并后的文件
      const stats = await fs.stat(finalPath);
      
      res.json({
        success: true,
        message: '文件合并成功',
        filename,
        size: stats.size,
        path: finalPath,
        url: `/files/${filename}`
      });
    } catch (error) {
      // 清理可能创建的不完整文件
      try {
        await fs.unlink(finalPath);
      } catch {}
      throw error;
    }
  } catch (error) {
    console.error('合并分片失败:', error);
    res.status(500).json({ error: error.message || '合并分片失败' });
  }
});

// 提供文件下载服务
router.get('/files/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(UPLOAD_DIR, filename);
  
  res.download(filePath, (err) => {
    if (err) {
      console.error('文件下载失败:', err);
      res.status(404).json({ error: '文件不存在' });
    }
  });
});

// 获取上传文件列表
router.get('/files', async (req, res) => {
  try {
    const files = await fs.readdir(UPLOAD_DIR);
    const fileList = [];
    
    for (const filename of files) {
      const filePath = path.join(UPLOAD_DIR, filename);
      const stats = await fs.stat(filePath);
      
      fileList.push({
        name: filename,
        size: stats.size,
        uploadTime: stats.mtime,
        url: `/files/${filename}`
      });
    }
    
    res.json({ files: fileList });
  } catch (error) {
    console.error('获取文件列表失败:', error);
    res.status(500).json({ error: '获取文件列表失败' });
  }
});

// 健康检查接口
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});


module.exports = router;