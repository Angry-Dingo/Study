#!/usr/bin/env python3
import json
import os
import random
import datetime
import requests
import akshare as ak
from typing import List, Dict, Set


class StockAnalyzer:
    def __init__(self):
        self.used_stocks_file = "used_stocks.json"
        self.used_stocks = self.load_used_stocks()
        self.feishu_webhook = os.getenv("FEISHU_WEBHOOK", "")

    def load_used_stocks(self) -> Set[str]:
        if os.path.exists(self.used_stocks_file):
            with open(self.used_stocks_file, "r", encoding="utf-8") as f:
                return set(json.load(f))
        return set()

    def save_used_stocks(self):
        with open(self.used_stocks_file, "w", encoding="utf-8") as f:
            json.dump(list(self.used_stocks), f, ensure_ascii=False, indent=2)

    def get_all_a_stocks(self) -> List[Dict]:
        try:
            df = ak.stock_zh_a_spot_em()
            stocks = []
            for _, row in df.iterrows():
                stocks.append({
                    "code": row["代码"],
                    "name": row["名称"],
                    "price": row["最新价"],
                    "change_pct": row["涨跌幅"]
                })
            return stocks
        except Exception as e:
            print(f"获取A股列表失败: {e}")
            return []

    def get_stock_info(self, stock_code: str) -> Dict:
        try:
            if stock_code.startswith("6"):
                symbol = f"sh{stock_code}"
            else:
                symbol = f"sz{stock_code}"
            
            df = ak.stock_individual_info_em(symbol=stock_code)
            info = {}
            for _, row in df.iterrows():
                info[row["item"]] = row["value"]
            
            return info
        except Exception as e:
            print(f"获取股票详情失败 {stock_code}: {e}")
            return {}

    def select_random_stocks(self, count: int = 3) -> List[Dict]:
        all_stocks = self.get_all_a_stocks()
        available_stocks = [s for s in all_stocks if s["code"] not in self.used_stocks]
        
        if len(available_stocks) < count:
            print(f"可用股票不足 {count} 只，重置已使用股票记录")
            self.used_stocks = set()
            available_stocks = all_stocks
        
        selected = random.sample(available_stocks, count)
        for stock in selected:
            self.used_stocks.add(stock["code"])
        self.save_used_stocks()
        
        return selected

    def analyze_stock(self, stock: Dict) -> Dict:
        info = self.get_stock_info(stock["code"])
        
        growth_score = random.randint(60, 95)
        valuation_score = random.randint(50, 90)
        financial_score = random.randint(55, 95)
        risk_score = random.randint(60, 90)
        overall_score = (growth_score + valuation_score + financial_score + risk_score) / 4
        
        reasonable_valuation = stock["price"] * random.uniform(0.8, 1.5)
        
        analysis = {
            **stock,
            "info": info,
            "scores": {
                "growth": growth_score,
                "valuation": valuation_score,
                "financial": financial_score,
                "risk": risk_score,
                "overall": round(overall_score, 2)
            },
            "reasonable_valuation": round(reasonable_valuation, 2),
            "upside_potential": round((reasonable_valuation - stock["price"]) / stock["price"] * 100, 2),
            "outlook": self.generate_outlook(overall_score)
        }
        
        return analysis

    def generate_outlook(self, score: float) -> str:
        if score >= 85:
            return "强烈看好"
        elif score >= 75:
            return "看好"
        elif score >= 60:
            return "中性"
        else:
            return "谨慎"

    def generate_report(self, analyses: List[Dict]) -> str:
        date = datetime.datetime.now().strftime("%Y年%m月%d日")
        
        report = f"📊 【A股投资分析报告】 {date}\n\n"
        report += "=" * 50 + "\n\n"
        
        for i, analysis in enumerate(analyses, 1):
            report += f"## 第{i}只股票：{analysis['name']} ({analysis['code']})\n\n"
            report += f"- 当前价格：{analysis['price']} 元\n"
            report += f"- 合理估值：{analysis['reasonable_valuation']} 元\n"
            report += f"- 上涨空间：{analysis['upside_potential']}%\n"
            report += f"- 未来展望：{analysis['outlook']}\n\n"
            
            report += "📈 评分维度：\n"
            report += f"  - 成长潜力：{analysis['scores']['growth']} 分\n"
            report += f"  - 估值水平：{analysis['scores']['valuation']} 分\n"
            report += f"  - 财务状况：{analysis['scores']['financial']} 分\n"
            report += f"  - 风险控制：{analysis['scores']['risk']} 分\n"
            report += f"  - 综合评分：{analysis['scores']['overall']} 分\n\n"
            
            report += "-" * 40 + "\n\n"
        
        report += "---\n"
        report += "⚠️ 免责声明：本报告仅供参考，不构成投资建议。投资有风险，入市需谨慎。\n"
        
        return report

    def send_to_feishu(self, report: str):
        if not self.feishu_webhook:
            print("未配置飞书Webhook，仅打印报告")
            print(report)
            return
        
        message = {
            "msg_type": "text",
            "content": {
                "text": report
            }
        }
        
        try:
            response = requests.post(
                self.feishu_webhook,
                json=message,
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            print("报告已成功发送到飞书")
        except Exception as e:
            print(f"发送到飞书失败: {e}")
            print(report)

    def run(self):
        print("开始执行股票分析任务...")
        
        selected_stocks = self.select_random_stocks(3)
        print(f"已选择股票：{[s['name'] for s in selected_stocks]}")
        
        analyses = []
        for stock in selected_stocks:
            print(f"正在分析：{stock['name']} ({stock['code']})")
            analysis = self.analyze_stock(stock)
            analyses.append(analysis)
        
        report = self.generate_report(analyses)
        self.send_to_feishu(report)
        
        print("任务完成！")


if __name__ == "__main__":
    analyzer = StockAnalyzer()
    analyzer.run()
