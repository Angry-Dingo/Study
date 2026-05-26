# A股每日自动分析系统

自动选取3只A股股票，结合未来3年发展预期进行估值分析，并推送到飞书群聊。

## 功能特点

- 随机选取3只A股（避免重复分析）
- 从多个维度进行评分：成长潜力、估值水平、财务状况、风险控制
- 计算合理估值和上涨空间
- 工作日早上8:40自动执行
- 通过飞书机器人推送分析报告

## 快速开始

### 1. Fork本仓库

点击右上角的Fork按钮，将仓库复制到您的GitHub账号下。

### 2. 配置飞书Webhook

1. 在飞书群聊中添加群机器人
2. 获取Webhook地址
3. 在仓库Settings > Secrets and variables > Actions中添加一个名为 `FEISHU_WEBHOOK` 的Secret，值为您的Webhook地址

### 3. 启用GitHub Actions

1. 进入仓库的Actions标签
2. 启用工作流
3. 可以手动触发测试一下

## 文件说明

- `stock_analyzer.py` - 主要的股票分析脚本
- `.github/workflows/stock-analysis.yml` - GitHub Actions定时任务配置
- `requirements.txt` - Python依赖库列表
- `used_stocks.json` - 已分析股票记录（自动生成）

## 本地测试

如需本地运行测试：

```bash
# 安装依赖
pip install -r requirements.txt

# 设置飞书Webhook（可选）
export FEISHU_WEBHOOK="your_webhook_url"

# 运行分析
python stock_analyzer.py
```

## 注意事项

- 分析报告仅供参考，不构成投资建议
- 定时任务基于UTC时间，已设置为中国工作日早上8:40
- 已分析股票会自动记录，避免重复分析，当可用股票不足时会自动重置
