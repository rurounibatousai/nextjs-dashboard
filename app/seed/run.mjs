// ES模块包装器来运行TypeScript seed文件
import { register } from 'ts-node/esm';

// 注册ts-node来处理TypeScript文件
const { pathToFileURL } = await import('url');
const { fileURLToPath } = await import('url');
const { dirname } = await import('path');

// 设置基础路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 动态导入TypeScript文件
async function runSeed() {
  try {
    console.log('执行seed脚本...');
    
    // 动态导入TypeScript文件
    const seedModule = await import('./route.ts', { assert: { type: 'module' } });
    
    // 如果seedModule有导出的GET函数，执行它
    if (seedModule.GET) {
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