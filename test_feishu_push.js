// 使用ESM模块导入
import fetch from 'node-fetch';

// 发送消息到飞书机器人
async function sendTestMessage() {
  const webhookUrl = process.env.FEISHU_WEBHOOK;
  
  if (!webhookUrl) {
    console.error('飞书webhook地址未配置');
    return;
  }
  
  const now = new Date().toLocaleString('zh-CN');
  const message = `【测试消息】\n\n当前时间: ${now}\n\n这是一条测试消息，用于验证飞书推送功能是否正常。`;
  
  const feishuMessage = {
    msg_type: 'text',
    content: {
      text: message
    }
  };
  
  try {
    console.log('开始发送测试消息...');
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(feishuMessage)
    });
    
    const data = await response.json();
    console.log('飞书消息推送结果:', data);
    console.log('测试消息发送成功！');
  } catch (error) {
    console.error('飞书消息推送失败:', error);
  }
}

// 主函数
async function main() {
  console.log('开始测试飞书推送功能...');
  
  // 立即发送一条测试消息
  await sendTestMessage();
  
  // 每隔一分钟发送一条测试消息
  setInterval(async () => {
    await sendTestMessage();
  }, 60000); // 60秒
  
  console.log('测试脚本已启动，将每隔一分钟发送一条测试消息...');
}

// 运行主函数
main();