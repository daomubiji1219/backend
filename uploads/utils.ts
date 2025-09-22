  
//   // 生成文件哈希
//   const generateFileHash = async (file: File): Promise<string> => {
//     // 需要先安装crypto-js依赖: npm install crypto-js @types/crypto-js
//     const crypto = await import('crypto-js') as typeof import('crypto-js');
//     return new Promise((resolve) => {
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         const hash = crypto.MD5(e.target?.result as string).toString();
//         resolve(hash);
//       };
//       reader.readAsArrayBuffer(file);
//     });
//   };

//   // 文件分片
//   const createFileChunks = (file: File): Blob[] => {
//     const chunks: Blob[] = [];
//     let start = 0;
    
//     while (start < file.size) {
//       const end = Math.min(start + chunkSize, file.size);
//       chunks.push(file.slice(start, end));
//       start = end;
//     }
    
//     return chunks;
//   };

//   // 检查已上传的分片
//   const checkUploadedChunks = async (hash: string): Promise<number[]> => {
//     try {
//       const response = await fetch(`${action}/check`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ hash })
//       });
      
//       if (response.ok) {
//         const data = await response.json();
//         return data.uploadedChunks || [];
//       }
//     } catch (error) {
//       console.warn('检查已上传分片失败:', error);
//     }
    
//     return [];
//   };


//   export {
//     generateFileHash,
//     createFileChunks,
//     checkUploadedChunks
//   }
