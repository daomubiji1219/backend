const {ESLint}=require('eslint')
const path=require('path')

/**
 * 对项目进行ESLint静态分析
 * @param {string} projectPath - 项目根目录路径（如上传后的目录、克隆后的tempDir）
 * @returns {Promise<{
 *   success: boolean,
 *   totalErrors: number,
 *   totalWarnings: number,
 *   issues: Array<{file: string, line: number, column: number, message: string, type: string}>
 * }>} 分析结果
 */

async function lintProject(projectPath){
    try{
        const eslint=new ESLint({
            cwd:projectPath,
            fix:false,
            extensions:['.js','.jsx','.ts','.tsx'],
            ignore:true
        })

        const results=await eslint.lintFiles('.')
        const formatter=await eslint.loadFormatter('stylish')
        const resultText=await formatter.format(results)

        let totalErrors=0
        let totalWarnings=0
        const issues=[]

        results.forEach(result=>{
            totalErrors+=result.errorCount
            totalWarnings+=result.warningCount
        })

        results.messages.forEach(msg=>{
            issues.push({
                filePath:path.relative(projectPath,msg.filePath),
                line:msg.line,
                column:msg.column,
                message:msg.message,
                type:msg.severity===2?'error':'warning',
                ruleId:msg.ruleId
            })
        })
    }catch{
        console.error('ESLint分析项目失败:',error.message)
        return {
            success:false,
            totalErrors:0,
            totalWarnings:0,
            issues:[]
        }
    }
}

