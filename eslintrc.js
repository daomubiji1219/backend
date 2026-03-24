// .eslintrc.js（ESLint配置文件，决定检查什么、怎么检查）
module.exports = {
  // 1. 环境配置：告诉ESLint项目运行的环境（避免误报“window未定义”等）
  env: {
    browser: true, // 若项目是前端项目，开启浏览器环境
    node: true,    // 若项目是Node.js项目，开启Node环境
    es2020: true   // 支持ES2020及以上语法（如let/const/箭头函数）
  },

  // 2. 解析器配置：处理不同语法（如ES6+/JSX/TS）
  parser: "@babel/eslint-parser", // 可选：若用React/ES6+，需此解析器；纯JS项目可省略（用默认解析器）
  parserOptions: {
    ecmaVersion: "latest", // 支持最新ES语法
    sourceType: "module",  // 支持ES模块（import/export）
    ecmaFeatures: {
      jsx: true // 可选：若项目有JSX文件（如React），开启JSX支持
    }
  },

  // 3. 插件配置：引入额外检查能力（如安全风险）
  plugins: ["security"], // 引入安全检查插件

  // 4. 核心规则：对应你的4类检查需求（error=报错，warn=警告，off=关闭）
  rules: {
    // --------------------------
    // ① 未使用变量检查
    // --------------------------
    "no-unused-vars": ["error", {
      vars: "all",          // 检查所有未使用变量（包括全局变量）
      args: "after-used",   // 检查未使用的函数参数（仅在参数后无使用时报警）
      argsIgnorePattern: "^_", // 忽略以“_”开头的参数（如函数参数 _id，避免误报）
      caughtErrors: "none"  // 不检查try/catch中未使用的error（如catch (e) {}）
    }],

    // --------------------------
    // ② 语法错误检查（ESLint默认规则，覆盖常见语法问题）
    // --------------------------
    "semi": ["error", "always"],        // 必须写分号（避免ASI自动分号插入导致的语法错误）
    "quotes": ["error", "single"],      // 字符串必须用单引号（统一风格，避免语法歧义）
    "no-extra-semi": "error",           // 禁止多余分号（如let a = 1;;）
    "no-undef": "error",                // 禁止使用未定义的变量（避免拼写错误导致的语法问题）
    "valid-typeof": "error",            // 禁止typeof结果与字符串比较时的语法错误（如typeof a === 'str'）

    // --------------------------
    // ③ console残留检查
    // --------------------------
    "no-console": ["warn", {
      allow: ["warn", "error"] // 允许console.warn/console.error（调试用），禁止console.log
    }],

    // --------------------------
    // ④ 简单安全风险检查（基于eslint-plugin-security）
    // --------------------------
    "security/no-eval": "error",                // 禁止使用eval（执行字符串代码，易注入恶意代码）
    "security/no-unsafe-innerhtml": "error",    // 禁止使用innerHTML插入未过滤内容（易XSS攻击）
    "security/no-unsafe-optional-chaining": "warn", // 警告不安全的可选链（如obj?.[userInput]）
    "security/no-unused-expressions": "error",  // 禁止未使用的表达式（如可能的逻辑漏洞）
    "security/no-unsafe-regex": "warn"          // 警告不安全的正则（如可能导致性能问题的贪婪匹配）
  },

  // 5. 忽略文件：不检查node_modules、dist等无关目录（提升效率）
  ignorePatterns: ["node_modules/", "dist/", "build/", "temp/repo_*/node_modules/"]
};