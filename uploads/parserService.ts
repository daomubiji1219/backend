import { AnalyzerFactory } from '@/services/analyzers/AnalyzerFactory';
import type { TSAnalysisResult, JSAnalysisResult, SupportedLanguage } from '@/types/analysis';
import { cacheService } from './cacheService';

interface WorkerMessage {
  id?: number;
  type: string;
  payload?: {
    code: string;
    language?: SupportedLanguage;
    filename?: string;
  };
  result?: TSAnalysisResult | JSAnalysisResult;
  error?: string;
}

export class ParserService {
  private worker: Worker | null = null;
  private workerPromises = new Map<number, { 
    resolve: (value: TSAnalysisResult | JSAnalysisResult) => void; 
    reject: (reason?: Error) => void; 
  }>();
  private messageId = 0;

  /**
   * 统一解析入口，自动选择对应的解析器
   * @param code 待解析代码
   * @param language 代码语言（可选，会自动检测）
   * @param filename 文件名（可选，用于语言检测）
   * @returns 解析结果
   */
  async parseCode(
    code: string, 
    language?: SupportedLanguage,
    filename?: string
  ): Promise<TSAnalysisResult | JSAnalysisResult> {
    const detectedLanguage = language || AnalyzerFactory.detectLanguage(code, filename);
    
    // 检查缓存
    const cachedResult = cacheService.get(code, detectedLanguage);
    if (cachedResult) {
      console.log('使用缓存的分析结果');
      return cachedResult;
    }
    
    let result: TSAnalysisResult | JSAnalysisResult;
    
    // 如果代码较大，使用Worker线程
    if (code.length > 1000) {
      result = await this.parseCodeInWorker(code, detectedLanguage, filename);
    } else {
      // 对于小型代码，直接在主线程处理
      const analyzer = AnalyzerFactory.getAnalyzer(detectedLanguage);
      result = analyzer.analyze(code) as TSAnalysisResult | JSAnalysisResult;
    }
    
    // 将结果存入缓存
    cacheService.set(code, detectedLanguage, result);
    console.log('分析结果已缓存');
    
    return result;
  }
  
  /**
   * 在Worker线程中解析代码
   */
  private async parseCodeInWorker(
    code: string,
    language?: SupportedLanguage,
    filename?: string
  ): Promise<TSAnalysisResult | JSAnalysisResult> {
    return new Promise((resolve, reject) => {
      try {
        // 初始化Worker
        if (!this.worker) {
          this.initializeWorker();
        }
        
        const messageId = ++this.messageId;
        this.workerPromises.set(messageId, { resolve, reject });
        
        // 发送解析请求到Worker
        this.worker!.postMessage({
          id: messageId,
          type: 'PARSE_CODE',
          payload: {
            code,
            language,
            filename
          }
        });
        
        // 设置超时
        setTimeout(() => {
          const promise = this.workerPromises.get(messageId);
          if (promise) {
            this.workerPromises.delete(messageId);
            promise.reject(new Error('Worker timeout'));
          }
        }, 30000); // 30秒超时
        
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * 初始化Worker
   */
  private initializeWorker(): void {
    try {
      this.worker = new Worker(
        new URL('../workers/parserWorker.ts', import.meta.url),
        { type: 'module' }
      );
      
      this.worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
        const { id, type, result, error } = event.data;
        
        if (id && this.workerPromises.has(id)) {
          const promise = this.workerPromises.get(id)!;
          this.workerPromises.delete(id);
          
          if (type === 'PARSE_COMPLETE' && result) {
            promise.resolve(result);
          } else if (type === 'PARSE_ERROR') {
            promise.reject(new Error(error || '解析失败'));
          }
        }
      };
      
      this.worker.onerror = (error) => {
        console.error('Worker error:', error);
        // 清理所有待处理的Promise
        this.workerPromises.forEach(({ reject }) => {
          reject(new Error('Worker error'));
        });
        this.workerPromises.clear();
      };
      
    } catch (error) {
      console.error('Failed to initialize worker:', error);
      throw error;
    }
  }
  
  /**
   * 解析文件
   */
  async parseFile(code: string, filename: string): Promise<TSAnalysisResult | JSAnalysisResult> {
    const language = AnalyzerFactory.detectLanguage(code, filename);
    return this.parseCode(code, language, filename);
  }
  
  /**
   * 获取支持的语言列表
   */
  getSupportedLanguages(): SupportedLanguage[] {
    return AnalyzerFactory.getSupportedLanguages();
  }
  
  /**
   * 获取支持的文件扩展名
   */
  getSupportedExtensions(): string[] {
    return AnalyzerFactory.getSupportedExtensions();
  }
  
  /**
   * 清理资源
   */
  dispose(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.workerPromises.clear();
  }
}

// 导出单例实例
export const parserService = new ParserService();