/**
 * list-models.mjs
 * 列出您的 API Key 下所有可用的 Gemini 模型
 * 用法: node list-models.mjs
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';

// 读取 .env 文件
const envPath = resolve('.env');
const envContent = readFileSync(envPath, 'utf-8');
const match = envContent.match(/^GEMINI_API_KEY="?([^"\n]+)"?/m);
const API_KEY = match?.[1];

if (!API_KEY) {
  console.error('❌ 未找到 GEMINI_API_KEY，请检查根目录 .env 文件');
  process.exit(1);
}

const res = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}&pageSize=100`
);
const data = await res.json();

if (!data.models) {
  console.error('❌ API 请求失败:', JSON.stringify(data, null, 2));
  process.exit(1);
}

// 按类别分组
const groups = {};
for (const m of data.models) {
  // 判断是否支持 generateContent
  const supportsGenerate = m.supportedGenerationMethods?.includes('generateContent');
  const supportsPredict  = m.supportedGenerationMethods?.includes('predict');

  let category = '其他';
  if (m.name.includes('gemini'))  category = '📝 Gemini 文本模型';
  if (m.name.includes('imagen'))  category = '🖼️  Imagen 图像模型';
  if (m.name.includes('veo'))     category = '🎬 Veo 视频模型';
  if (m.name.includes('embed'))   category = '🔢 Embedding 模型';

  if (!groups[category]) groups[category] = [];
  groups[category].push({
    id: m.name.replace('models/', ''),
    displayName: m.displayName,
    supportsGenerate,
    supportsPredict,
  });
}

// 打印结果
console.log('\n========================================');
console.log('  您的 API Key 下可用的全部模型');
console.log('========================================\n');

for (const [category, models] of Object.entries(groups)) {
  console.log(`${category}`);
  console.log('─'.repeat(60));
  for (const m of models) {
    const genTag  = m.supportsGenerate ? '✅ generateContent' : '                  ';
    const predTag = m.supportsPredict  ? ' | ✅ predict' : '';
    console.log(`  ${m.id.padEnd(48)} ${genTag}${predTag}`);
  }
  console.log('');
}

console.log('========================================');
console.log('💡 适合文本改写 (generateContent) 的模型已标记 ✅');
console.log('💡 适合图像生成 (predict) 的模型已标记 ✅');
console.log('========================================\n');
