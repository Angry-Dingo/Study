# A股股票估值分析系统

每天自动从A股市场随机选择3只股票，进行多维度估值分析，并生成专业报告推送到飞书。

## 功能特点

- 🎲 随机选择3只A股股票进行分析
- 📊 六大维度估值分析：
  - PE（市盈率）分析：对比行业平均和历史分位
  - PB（市净率）分析：评估股价相对净资产溢价
  - 股息率分析：考察现金分红收益率
  - 成长性评估：净利润增速、营收增速
  - 估值趋势：近期估值变化方向
  - 未来预期：基于行业景气度预测未来三年
- 📈 可视化雷达图对比各维度评分
- 📄 生成精美的HTML报告
- 🤖 自动推送到飞书（支持卡片消息）
- ⏰ GitHub Actions定时任务（每天9:30自动运行）

## 项目结构

```
.
├── .github/
│   └── workflows/
│       ├── daily-analysis.yml    # 每日定时分析工作流
│       └── test-feishu.yml       # 飞书推送测试
├── src/
│   ├── main.js                   # 主程序入口
│   ├── stockData.js              # 股票数据模块
│   ├── valuationAnalyzer.js      # 估值分析器
│   ├── reportGenerator.js        # 报告生成器
│   └── feishuNotifier.js         # 飞书推送模块
├── reports/                      # 报告存储目录
├── package.json
└── README.md
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 本地运行

```bash
node src/main.js
```

### 3. 配置飞书推送（可选）

设置环境变量：

```bash
export FEISHU_WEBHOOK="你的飞书机器人webhook地址"
node src/main.js
```

## GitHub Actions配置

### 1. 设置Secrets

在GitHub仓库中添加以下Secret：

- `FEISHU_WEBHOOK`: 飞书机器人的webhook地址

### 2. 定时任务

默认配置为每天北京时间早上9:30自动运行，可在 `.github/workflows/daily-analysis.yml` 中修改cron表达式。

### 3. 手动触发

也可以在GitHub Actions页面手动触发工作流。

## 股票池

当前包含12只A股优质标的，涵盖多个行业：

- 白酒、新能源、银行、汽车、科技、免税、有色、家电、医药、通信、保险

可在 `src/stockData.js` 中扩展股票池。

## 估值评分说明

| 评分区间 | 估值状态 | 建议 |
|---------|---------|------|
| 8-10分 | 低估 | 积极关注，考虑配置 |
| 6-7.9分 | 合理 | 基本面稳健，可择优配置 |
| 6分以下 | 偏贵 | 谨慎观望，等待机会 |

## 免责声明

⚠️ 本系统生成的分析报告仅供参考，不构成任何投资建议。投资有风险，入市需谨慎。请根据自身情况做出投资决策。

## License

MIT
