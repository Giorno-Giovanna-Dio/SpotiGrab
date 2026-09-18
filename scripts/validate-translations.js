#!/usr/bin/env node

/**
 * 驗證翻譯文件的腳本
 * 確保所有語言文件有相同的鍵值結構
 */

const fs = require('fs');
const path = require('path');

const messagesDir = path.join(__dirname, '../messages');
const languages = ['zh', 'en'];

function flattenObject(obj, prefix = '') {
  return Object.keys(obj).reduce((acc, key) => {
    const newPrefix = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      return { ...acc, ...flattenObject(obj[key], newPrefix) };
    }
    return { ...acc, [newPrefix]: obj[key] };
  }, {});
}

function validateTranslations() {
  console.log('🔍 驗證翻譯文件...\n');
  
  const translations = {};
  let hasErrors = false;

  // 讀取所有翻譯文件
  for (const lang of languages) {
    const filePath = path.join(messagesDir, `${lang}.json`);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      translations[lang] = JSON.parse(content);
      console.log(`✅ 成功載入 ${lang}.json`);
    } catch (error) {
      console.error(`❌ 無法載入 ${lang}.json:`, error.message);
      hasErrors = true;
      return false;
    }
  }

  // 扁平化翻譯物件以便比較
  const flatTranslations = {};
  for (const lang of languages) {
    flatTranslations[lang] = flattenObject(translations[lang]);
  }

  // 取得所有鍵值
  const allKeys = new Set();
  for (const lang of languages) {
    Object.keys(flatTranslations[lang]).forEach(key => allKeys.add(key));
  }

  console.log(`\n📊 總共找到 ${allKeys.size} 個翻譯鍵值\n`);

  // 檢查每個鍵值在所有語言中是否都存在
  const missingKeys = {};
  for (const key of allKeys) {
    for (const lang of languages) {
      if (!(key in flatTranslations[lang])) {
        if (!missingKeys[lang]) {
          missingKeys[lang] = [];
        }
        missingKeys[lang].push(key);
        hasErrors = true;
      }
    }
  }

  // 報告結果
  if (Object.keys(missingKeys).length === 0) {
    console.log('✅ 所有翻譯鍵值都完整!\n');
    
    // 顯示每個語言的翻譯數量
    for (const lang of languages) {
      const count = Object.keys(flatTranslations[lang]).length;
      console.log(`   ${lang}: ${count} 個翻譯`);
    }
    
    return true;
  } else {
    console.log('❌ 發現缺失的翻譯鍵值:\n');
    for (const [lang, keys] of Object.entries(missingKeys)) {
      console.log(`   ${lang}.json 缺少 ${keys.length} 個鍵值:`);
      keys.forEach(key => console.log(`      - ${key}`));
      console.log();
    }
    return false;
  }
}

// 執行驗證
const success = validateTranslations();
process.exit(success ? 0 : 1);
