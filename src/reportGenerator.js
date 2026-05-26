import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ReportGenerator {
  constructor(analysisResults) {
    this.analysisResults = analysisResults;
    this.reportDate = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  generateHTMLReport() {
    let stockCardsHtml = '';
    let radarDatasets = '';
    const colors = [
      'rgba(54, 162, 235, 0.7)',
      'rgba(255, 99, 132, 0.7)',
      'rgba(75, 192, 192, 0.7)'
    ];
    const borderColors = [
      'rgb(54, 162, 235)',
      'rgb(255, 99, 132)',
      'rgb(75, 192, 192)'
    ];

    this.analysisResults.forEach((result, index) => {
      const { stock, scores, overallScore, conclusion } = result;
      const color = colors[index];
      const borderColor = borderColors[index];

      stockCardsHtml += this.generateStockCard(stock, scores, overallScore, conclusion, index);
      
      radarDatasets += `
        {
          label: '${stock.name}',
          data: [
            ${scores.pe},
            ${scores.pb},
            ${scores.dividendYield},
            ${scores.growth},
            ${scores.trend},
            ${scores.expectation}
          ],
          backgroundColor: '${color}',
          borderColor: '${borderColor}',
          borderWidth: 2,
          pointBackgroundColor: '${borderColor}',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '${borderColor}'
        }${index < this.analysisResults.length - 1 ? ',' : ''}
      `;
    });

    const overallStatus = this.generateOverallStatus();

    const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>A股股票估值分析报告 - ${this.reportDate}</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            background: white;
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            text-align: center;
        }
        .header h1 {
            color: #333;
            font-size: 28px;
            margin-bottom: 10px;
        }
        .header .date {
            color: #666;
            font-size: 14px;
        }
        .overall-status {
            background: white;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            text-align: center;
        }
        .overall-status h2 {
            color: #333;
            margin-bottom: 15px;
            font-size: 20px;
        }
        .status-badge {
            display: inline-block;
            padding: 12px 30px;
            border-radius: 30px;
            font-size: 18px;
            font-weight: bold;
            color: white;
        }
        .status-undervalued { background: linear-gradient(135deg, #11998e, #38ef7d); }
        .status-fair { background: linear-gradient(135deg, #f093fb, #f5576c); }
        .status-overvalued { background: linear-gradient(135deg, #eb3349, #f45c43); }
        .charts-section {
            background: white;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .charts-section h2 {
            color: #333;
            margin-bottom: 20px;
            font-size: 20px;
            text-align: center;
        }
        .chart-container {
            max-width: 600px;
            margin: 0 auto;
        }
        .stock-cards {
            display: grid;
            gap: 20px;
        }
        .stock-card {
            background: white;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .stock-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #f0f0f0;
        }
        .stock-info h3 {
            color: #333;
            font-size: 22px;
            margin-bottom: 5px;
        }
        .stock-info .code {
            color: #666;
            font-size: 14px;
        }
        .stock-price {
            text-align: right;
        }
        .stock-price .price {
            color: #333;
            font-size: 24px;
            font-weight: bold;
        }
        .stock-price .sector {
            color: #666;
            font-size: 12px;
            margin-top: 5px;
        }
        .overall-score {
            text-align: center;
            margin-bottom: 20px;
        }
        .score-circle {
            display: inline-block;
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea, #764ba2);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 10px;
        }
        .score-circle .score {
            color: white;
            font-size: 32px;
            font-weight: bold;
        }
        .score-label {
            color: #666;
            font-size: 14px;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        .metric-item {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
        }
        .metric-item .label {
            color: #666;
            font-size: 12px;
            margin-bottom: 8px;
        }
        .metric-item .value {
            color: #333;
            font-size: 18px;
            font-weight: bold;
        }
        .conclusion {
            background: #f0f7ff;
            border-left: 4px solid #667eea;
            padding: 15px;
            border-radius: 0 8px 8px 0;
        }
        .conclusion p {
            color: #333;
            margin-bottom: 10px;
            line-height: 1.6;
        }
        .conclusion p:last-child {
            margin-bottom: 0;
        }
        .footer {
            text-align: center;
            color: white;
            margin-top: 30px;
            font-size: 12px;
            opacity: 0.8;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 A股股票估值分析报告</h1>
            <div class="date">生成时间：${this.reportDate}</div>
        </div>

        <div class="overall-status">
            <h2>总体估值建议</h2>
            <span class="status-badge ${overallStatus.class}">${overallStatus.text}</span>
        </div>

        <div class="charts-section">
            <h2>📈 估值维度评分对比</h2>
            <div class="chart-container">
                <canvas id="radarChart"></canvas>
            </div>
        </div>

        <div class="stock-cards">
            ${stockCardsHtml}
        </div>

        <div class="footer">
            <p>⚠️ 本报告仅供参考，不构成投资建议。投资有风险，入市需谨慎。</p>
        </div>
    </div>

    <script>
        const ctx = document.getElementById('radarChart').getContext('2d');
        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['PE分析', 'PB分析', '股息率', '成长性', '估值趋势', '未来预期'],
                datasets: [${radarDatasets}]
            },
            options: {
                responsive: true,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 10,
                        ticks: {
                            stepSize: 2
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    </script>
</body>
</html>`;

    return html;
  }

  generateStockCard(stock, scores, overallScore, conclusion, index) {
    return `
        <div class="stock-card">
            <div class="stock-header">
                <div class="stock-info">
                    <h3>${stock.name}</h3>
                    <div class="code">${stock.code}</div>
                </div>
                <div class="stock-price">
                    <div class="price">¥${stock.closePrice.toFixed(2)}</div>
                    <div class="sector">${stock.sector}</div>
                </div>
            </div>

            <div class="overall-score">
                <div class="score-circle">
                    <span class="score">${overallScore}</span>
                </div>
                <div class="score-label">综合估值评分（10分制）</div>
            </div>

            <div class="metrics-grid">
                <div class="metric-item">
                    <div class="label">PE（倍）</div>
                    <div class="value">${stock.pe}</div>
                </div>
                <div class="metric-item">
                    <div class="label">PB（倍）</div>
                    <div class="value">${stock.pb}</div>
                </div>
                <div class="metric-item">
                    <div class="label">股息率</div>
                    <div class="value">${stock.dividendYield}%</div>
                </div>
                <div class="metric-item">
                    <div class="label">净利润增速</div>
                    <div class="value">${stock.netProfitGrowth}%</div>
                </div>
                <div class="metric-item">
                    <div class="label">营收增速</div>
                    <div class="value">${stock.revenueGrowth}%</div>
                </div>
                <div class="metric-item">
                    <div class="label">估值状态</div>
                    <div class="value">${conclusion.valuationStatus}</div>
                </div>
            </div>

            <div class="conclusion">
                <p><strong>分析结论：</strong></p>
                <p>${conclusion.conclusion1}</p>
                <p>${conclusion.conclusion2}</p>
            </div>
        </div>
    `;
  }

  generateOverallStatus() {
    const avgScore = this.analysisResults.reduce((sum, r) => sum + r.overallScore, 0) / this.analysisResults.length;
    
    let text = '';
    let className = '';

    if (avgScore >= 7.5) {
      text = '✨ 总体低估 - 建议积极关注';
      className = 'status-undervalued';
    } else if (avgScore >= 6) {
      text = '⚖️ 总体合理 - 可择优配置';
      className = 'status-fair';
    } else {
      text = '⚠️ 总体偏贵 - 谨慎观望为主';
      className = 'status-overvalued';
    }

    return { text, class: className, avgScore };
  }

  saveReport(filePath) {
    const html = this.generateHTMLReport();
    fs.writeFileSync(filePath, html, 'utf-8');
    console.log(`报告已保存至: ${filePath}`);
    return filePath;
  }
}

export { ReportGenerator };
