#!/bin/bash
# 自动安装缺失的 Express.js 间接依赖
# 生成时间: 2025-09-23T01:24:50.352Z

echo "🔧 开始安装缺失的依赖..."

# 安装所有缺失的依赖
pnpm add content-disposition content-type cookie cookie-signature debug depd encodeurl escape-html etag finalhandler fresh http-errors merge-descriptors methods on-finished parseurl path-to-regexp proxy-addr qs range-parser safe-buffer send serve-static setprototypeof statuses type-is utils-merge vary object-assign binary-case

echo "✅ 依赖安装完成！"
echo "📝 请提交更新后的 package.json 和 pnpm-lock.yaml"
