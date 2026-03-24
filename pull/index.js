const fs=require('fs')
const path=require('path')
const {exec} =require('child_process')
const {v4:uuidv4}=require('uuid')

const cloneGithubRepo= async(repoUrl)=>{
    return new Promise((resolve,reject)=>{
        
        const tempDir=path.join(__dirname,'temp',`repo_${uuidv4()}`)
        fs.mkdirSync(tempDir,{recursive:true})

        const cmd=`git clone --depth 1 ${repoUrl} ${tempDir}`
        const child=exec(cmd,(error)=>{
            clearTimeout(timer)
            if(error){
                fs.rmSync(tempDir,{recursive:true,force:true})
                return reject(new Error(`克隆仓库失败: ${error.message}`))
            }
            resolve(tempDir)
        })
        let timer=setTimeout(()=>{
            child.kill()
            setTimeout(()=>{
                fs.rmSync(tempDir,{recursive:true,force:true})//避免超时后删除失败
            },10000)
            reject(new Error('克隆仓库超时'))
        },60000)
    })
}


module.exports = {
    cloneGithubRepo
}

//简单测试
cloneGithubRepo('https://github.com/vuejs/vue.git').then((tempDir)=>{
    console.log('仓库克隆成功:',tempDir)
}).catch((error)=>{
    console.error('克隆仓库失败:',error.message)
})
