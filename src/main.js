import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { selectRandomStocks } from './stockData.js';
import { ValuationAnalyzer } from './valuationAnalyzer.js';
import { ReportGenerator } from './reportGenerator.js';
import { FeishuNotifier } from './feishuNotifier.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('🚀 开始执行A股股票估值分析...\n');

  try {
    // 1. 随机选择3只股票
    console.log('📋 随机选择股票中...');
    const stocks = selectRandomStocks(3);
    console.log(`✅ 已选择: ${stocks.map(s => s.name).join('、')}\n`);

    // 2. 分析每只股票
    console.log('📊 开始估值分析...');
    const analysisResults = [];
    for (const stock of stocks) {
      const analyzer = new ValuationAnalyzer(stock);
      const result = analyzer.analyze();
      analysisResults.push(result);
      console.log(`   ${stock.name}: 综合评分 ${result.overallScore}/10 - ${result.conclusion.valuationStatus}`);
    }
    console.log('');

    // 3. 生成报告
    console.log('📄 生成HTML报告...');
    const reportGenerator = new ReportGenerator(analysisResults);
    const reportFileName = `valuation-report-${Date.now()}.html`;
    const reportPath = path.join(__dirname, '..', 'reports', reportFileName);
    
    // 确保reports目录存在
    const reportsDir = path.join(__dirname, '..', 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    reportGenerator.saveReport(reportPath);
    console.log('');

    // 4. 推送到飞书（如果配置了webhook）
    const feishuWebhookUrl = process.env.FEISHU_WEBHOOK;
    if (feishuWebhookUrl) {
      console.log('📤 推送到飞书...');
      const notifier = new FeishuNotifier(feishuWebhookUrl);
      
      // 这里我们使用一个本地文件路径作为示例
      // 在实际使用中，你可能需要上传到一个可访问的服务器
      const reportUrl = `file://${reportPath}`;
      
      await notifier.sendCardMessage(analysisResults, reportUrl);
    } else {
      console.log('⚠️  未配置FEISHU_WEBHOOK环境变量，跳过飞书推送');
    }

    console.log('\n🎉 分析完成！');
    return { success: true, analysisResults, reportPath };

  } catch (error) {
    console.error('❌ 执行过程中发生错误:', error);
    return { success: false, error };
  }
}

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main };
