import fetch from 'node-fetch';
import fs from 'fs';

class FeishuNotifier {
  constructor(webhookUrl) {
    this.webhookUrl = webhookUrl;
  }

  async sendTextMessage(content) {
    const message = {
      msg_type: 'text',
      content: {
        text: content
      }
    };

    return this.sendMessage(message);
  }

  async sendCardMessage(analysisResults, reportUrl) {
    const elements = [];
    const stockNames = analysisResults.map(r => r.stock.name).join('、');
    const avgScore = analysisResults.reduce((sum, r) => sum + r.overallScore, 0) / analysisResults.length;
    
    let valuationStatus = '';
    let statusEmoji = '';
    if (avgScore >= 7.5) {
      valuationStatus = '总体低估';
      statusEmoji = '✨';
    } else if (avgScore >= 6) {
      valuationStatus = '总体合理';
      statusEmoji = '⚖️';
    } else {
      valuationStatus = '总体偏贵';
      statusEmoji = '⚠️';
    }

    elements.push({
      tag: 'div',
      text: {
        tag: 'lark_md',
        content: `**📊 A股股票估值分析报告**`
      }
    });

    elements.push({ tag: 'hr' });

    elements.push({
      tag: 'div',
      text: {
        tag: 'lark_md',
        content: `**分析标的：** ${stockNames}`
      }
    });

    elements.push({
      tag: 'div',
      text: {
        tag: 'lark_md',
        content: `**总体评级：** ${statusEmoji} ${valuationStatus}`
      }
    });

    elements.push({
      tag: 'div',
      text: {
        tag: 'lark_md',
        content: `**平均得分：** ${avgScore.toFixed(1)} / 10.0`
      }
    });

    elements.push({ tag: 'hr' });

    analysisResults.forEach((result, index) => {
      const { stock, overallScore, conclusion } = result;
      
      elements.push({
        tag: 'div',
        text: {
          tag: 'lark_md',
          content: `**${index + 1}. ${stock.name} (${stock.code})**`
        }
      });

      elements.push({
        tag: 'div',
        fields: [
          {
            is_short: true,
            text: {
              tag: 'lark_md',
              content: `**收盘价：** ¥${stock.closePrice.toFixed(2)}`
            }
          },
          {
            is_short: true,
            text: {
              tag: 'lark_md',
              content: `**估值评分：** ${overallScore}/10`
            }
          },
          {
            is_short: true,
            text: {
              tag: 'lark_md',
              content: `**PE：** ${stock.pe}倍`
            }
          },
          {
            is_short: true,
            text: {
              tag: 'lark_md',
              content: `**股息率：** ${stock.dividendYield}%`
            }
          }
        ]
      });

      elements.push({
        tag: 'div',
        text: {
          tag: 'lark_md',
          content: `> ${conclusion.conclusion1}`
        }
      });

      if (index < analysisResults.length - 1) {
        elements.push({ tag: 'hr' });
      }
    });

    elements.push({ tag: 'hr' });

    elements.push({
      tag: 'action',
      actions: [
        {
          tag: 'button',
          text: {
            tag: 'lark_md',
            content: '📄 查看完整报告'
          },
          url: reportUrl,
          type: 'primary'
        }
      ]
    });

    elements.push({
      tag: 'note',
      elements: [
        {
          tag: 'plain_text',
          content: '⚠️ 本报告仅供参考，不构成投资建议'
        }
      ]
    });

    const message = {
      msg_type: 'interactive',
      card: {
        elements,
        header: {
          title: {
            tag: 'plain_text',
            content: '📈 每日A股估值分析'
          },
          template: avgScore >= 7.5 ? 'green' : avgScore >= 6 ? 'blue' : 'orange'
        }
      }
    };

    return this.sendMessage(message);
  }

  async sendMessage(message) {
    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
      });

      const data = await response.json();
      
      if (data.code === 0) {
        console.log('✅ 飞书消息推送成功');
        return { success: true, data };
      } else {
        console.error('❌ 飞书消息推送失败:', data);
        return { success: false, error: data };
      }
    } catch (error) {
      console.error('❌ 飞书消息推送异常:', error);
      return { success: false, error };
    }
  }
}

export { FeishuNotifier };
