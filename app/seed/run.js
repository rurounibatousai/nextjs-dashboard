// 这个文件作为TypeScript seed文件的包装器
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createRequire } from 'module';

// 配置ES模块环境
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 使用require导入TypeScript文件
const require = createRequire(import.meta.url);
// 动态导入并执行TypeScript文件
async function runSeed() {
  try {
    // 使用ts-node/register来处理TypeScript文件
    require('ts-node/register');
    // 现在导入TypeScript文件
    const seedModule = require('./route.ts');
    
    // 如果seedModule有导出的GET函数，执行它
    if (seedModule.GET) {
      console.log('执行seed脚本...');
      const response = await seedModule.GET();
      console.log('Seed执行完成');
      return response;
    } else {
      console.error('seed模块没有导出GET函数');
      process.exit(1);
    }
  } catch (error) {
    console.error('执行seed脚本时出错:', error);
    process.exit(1);
  }
}

runSeed();