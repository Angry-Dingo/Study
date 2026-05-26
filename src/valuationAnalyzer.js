// 股票估值分析器
class ValuationAnalyzer {
  constructor(stock) {
    this.stock = stock;
    this.scores = {};
    this.overallScore = 0;
  }

  // 1. 市盈率（PE）分析
  analyzePE() {
    const { pe, industryPeAverage, peHistoricalPercentile } = this.stock;
    let score = 5;
    
    if (pe < industryPeAverage * 0.8) {
      score += 3;
    } else if (pe < industryPeAverage) {
      score += 1.5;
    } else if (pe > industryPeAverage * 1.2) {
      score -= 2;
    }

    if (peHistoricalPercentile < 30) {
      score += 2;
    } else if (peHistoricalPercentile < 50) {
      score += 1;
    } else if (peHistoricalPercentile > 70) {
      score -= 1;
    }

    this.scores.pe = Math.max(1, Math.min(10, score));
    return this.scores.pe;
  }

  // 2. 市净率（PB）分析
  analyzePB() {
    const { pb, industryPbAverage } = this.stock;
    let score = 5;

    if (pb < industryPbAverage * 0.8) {
      score += 3;
    } else if (pb < industryPbAverage) {
      score += 1.5;
    } else if (pb > industryPbAverage * 1.2) {
      score -= 2;
    }

    this.scores.pb = Math.max(1, Math.min(10, score));
    return this.scores.pb;
  }

  // 3. 股息率分析
  analyzeDividendYield() {
    const { dividendYield, industryDividendYieldAverage } = this.stock;
    let score = 5;

    if (dividendYield > industryDividendYieldAverage * 1.2) {
      score += 3;
    } else if (dividendYield > industryDividendYieldAverage) {
      score += 1.5;
    } else if (dividendYield < industryDividendYieldAverage * 0.8) {
      score -= 1.5;
    }

    this.scores.dividendYield = Math.max(1, Math.min(10, score));
    return this.scores.dividendYield;
  }

  // 4. 成长性评估
  analyzeGrowth() {
    const { 
      netProfitGrowth, 
      revenueGrowth, 
      industryNetProfitGrowthAverage, 
      industryRevenueGrowthAverage 
    } = this.stock;
    let score = 5;

    if (netProfitGrowth > industryNetProfitGrowthAverage * 1.3) {
      score += 3;
    } else if (netProfitGrowth > industryNetProfitGrowthAverage) {
      score += 1.5;
    } else if (netProfitGrowth < industryNetProfitGrowthAverage * 0.7) {
      score -= 2;
    }

    if (revenueGrowth > industryRevenueGrowthAverage * 1.3) {
      score += 2;
    } else if (revenueGrowth > industryRevenueGrowthAverage) {
      score += 1;
    } else if (revenueGrowth < industryRevenueGrowthAverage * 0.7) {
      score -= 1;
    }

    this.scores.growth = Math.max(1, Math.min(10, score));
    return this.scores.growth;
  }

  // 5. 估值趋势
  analyzeValuationTrend() {
    const { valuationTrend } = this.stock;
    let score = 5;

    if (valuationTrend === 'up') {
      score += 3;
    } else if (valuationTrend === 'down') {
      score -= 2;
    }

    this.scores.trend = Math.max(1, Math.min(10, score));
    return this.scores.trend;
  }

  // 6. 未来三年预期
  analyzeFutureExpectation() {
    const { 
      expectedGrowthYear1, 
      expectedGrowthYear2, 
      expectedGrowthYear3,
      expectedRevenueGrowthYear1,
      expectedRevenueGrowthYear2,
      expectedRevenueGrowthYear3
    } = this.stock;
    let score = 5;

    const avgGrowth = (expectedGrowthYear1 + expectedGrowthYear2 + expectedGrowthYear3) / 3;
    const avgRevenueGrowth = (expectedRevenueGrowthYear1 + expectedRevenueGrowthYear2 + expectedRevenueGrowthYear3) / 3;

    if (avgGrowth > 25) {
      score += 3;
    } else if (avgGrowth > 15) {
      score += 1.5;
    } else if (avgGrowth < 5) {
      score -= 2;
    }

    if (avgRevenueGrowth > 20) {
      score += 2;
    } else if (avgRevenueGrowth > 10) {
      score += 1;
    } else if (avgRevenueGrowth < 5) {
      score -= 1;
    }

    this.scores.expectation = Math.max(1, Math.min(10, score));
    return this.scores.expectation;
  }

  // 综合分析
  analyze() {
    this.analyzePE();
    this.analyzePB();
    this.analyzeDividendYield();
    this.analyzeGrowth();
    this.analyzeValuationTrend();
    this.analyzeFutureExpectation();

    const weights = {
      pe: 0.2,
      pb: 0.15,
      dividendYield: 0.15,
      growth: 0.2,
      trend: 0.1,
      expectation: 0.2
    };

    this.overallScore = 0;
    for (const [key, weight] of Object.entries(weights)) {
      this.overallScore += this.scores[key] * weight;
    }
    this.overallScore = Math.round(this.overallScore * 10) / 10;

    return {
      stock: this.stock,
      scores: this.scores,
      overallScore: this.overallScore,
      conclusion: this.generateConclusion()
    };
  }

  // 生成结论
  generateConclusion() {
    let conclusion1 = '';
    let conclusion2 = '';
    let valuationStatus = '';

    if (this.overallScore >= 8) {
      valuationStatus = '低估';
      conclusion1 = `${this.stock.name}当前估值处于${valuationStatus}水平，PE/PB均低于行业均值，具备较高投资价值。`;
      conclusion2 = `公司成长性良好，未来三年增长预期明确，股息率稳定，适合长期持有。`;
    } else if (this.overallScore >= 6) {
      valuationStatus = '合理';
      conclusion1 = `${this.stock.name}当前估值处于${valuationStatus}区间，各项指标表现均衡，与行业水平基本匹配。`;
      conclusion2 = `公司基本面稳健，未来增长预期稳定，可作为中长期配置标的。`;
    } else {
      valuationStatus = '高估';
      conclusion1 = `${this.stock.name}当前估值相对${valuationStatus}，部分指标高于行业均值，需谨慎关注风险。`;
      conclusion2 = `建议等待估值回调或等待基本面进一步验证后再做决策。`;
    }

    return {
      valuationStatus,
      conclusion1,
      conclusion2
    };
  }
}

export { ValuationAnalyzer };
