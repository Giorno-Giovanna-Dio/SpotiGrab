# 國際化 (i18n) 功能說明

## 概述

SpotiGrab 現在支援繁體中文和英文雙語介面,讓不同語言的使用者都能輕鬆使用。

## 功能特點

- 🌏 支援繁體中文(預設)和英文
- 🔄 即時語言切換,無需重新載入頁面
- 💾 自動儲存語言偏好設定(使用 cookie,有效期一年)
- 🎨 美觀的語言切換器介面

## 如何使用

### 切換語言

1. 在頁面右上角找到語言切換器
2. 點擊按鈕會顯示下拉選單
3. 選擇你想要的語言:
   - 🇹🇼 繁體中文
   - 🇺🇸 English

### 技術實現

#### 套件與工具

- **next-intl**: Next.js 的國際化解決方案
- **Cookie**: 儲存用戶語言偏好

#### 文件結構

```
├── messages/
│   ├── zh.json          # 繁體中文翻譯
│   └── en.json          # 英文翻譯
├── src/
│   ├── i18n/
│   │   └── request.ts   # i18n 配置
│   ├── app/
│   │   ├── api/
│   │   │   └── language/
│   │   │       └── route.ts  # 語言切換 API
│   │   ├── layout.tsx   # 根佈局(整合 i18n)
│   │   └── page.tsx     # 主頁面
│   └── components/
│       └── LanguageSwitcher.tsx  # 語言切換器組件
```

#### 翻譯文件格式

```json
{
  "home": {
    "title": "SpotiGrab",
    "subtitle": "描述文字..."
  },
  "errors": {
    "unknownError": "錯誤訊息..."
  }
}
```

## 開發者指南

### 添加新的翻譯文字

1. 在 `messages/zh.json` 和 `messages/en.json` 中添加新的鍵值對
2. 在組件中使用 `useTranslations` hook:

```tsx
import { useTranslations } from 'next-intl';

export default function MyComponent() {
  const t = useTranslations('sectionName');
  
  return <div>{t('keyName')}</div>;
}
```

### 添加新語言

1. 在 `messages/` 目錄下創建新的語言文件,例如 `ja.json`
2. 更新 `src/app/api/language/route.ts` 的語言驗證邏輯
3. 在 `LanguageSwitcher.tsx` 中添加新語言選項

### API 端點

**POST /api/language**

設定用戶的語言偏好。

請求體:
```json
{
  "locale": "zh" // 或 "en"
}
```

回應:
```json
{
  "success": true
}
```

## 瀏覽器支援

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## 已知限制

- 目前只支援繁體中文和英文
- 語言切換需要刷新頁面來重新載入所有內容

## 未來改進計劃

- [ ] 添加更多語言支援(日文、韓文等)
- [ ] 自動偵測瀏覽器語言
- [ ] 無需刷新的即時語言切換
- [ ] 支援 RTL(從右到左)語言

## 相關資源

- [next-intl 文件](https://next-intl-docs.vercel.app/)
- [Next.js 國際化指南](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
