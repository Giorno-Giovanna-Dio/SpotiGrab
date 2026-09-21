# 綠界金流整合說明

本專案已整合綠界科技 (ECPay) 金流服務，支援信用卡、ATM、超商代碼等多種付款方式。

## 📋 功能說明

- ✅ 支援多種付款方式（信用卡、ATM、超商代碼、超商條碼）
- ✅ 安全的 CheckMacValue 驗證機制
- ✅ 付款完成後自動回調通知
- ✅ 訂單管理系統
- ✅ 付款狀態即時查詢
- ✅ **訂閱制方案**（月費、季度、年度）
- ✅ **單曲付費選項**
- ✅ 免費試用（每日 3 首限額）

## 🔧 環境設定

### 1. 環境變數設定

複製 `.env.example` 到 `.env.local`：

```bash
cp .env.example .env.local
```

### 2. 測試環境設定（已預設）

測試環境使用綠界提供的測試商店編號和金鑰，可直接使用：

```env
ECPAY_MERCHANT_ID=3002607
ECPAY_HASH_KEY=pwFHCqoQZGmho4w6
ECPAY_HASH_IV=EkRm7iFT261dpevs
ECPAY_API_URL=https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5
```

### 3. 回調網址設定

**重要：** 綠界需要能夠訪問您的回調網址來通知付款結果。

#### 本地開發

本地開發時，需要使用內網穿透工具讓綠界能夠訪問您的本地伺服器：

**選項 1: 使用 ngrok**

```bash
# 安裝 ngrok
npm install -g ngrok

# 啟動內網穿透（在另一個終端）
ngrok http 3000

# 將 ngrok 提供的 URL 設定到 .env.local
# 例如：https://abc123.ngrok.io
ECPAY_RETURN_URL=https://abc123.ngrok.io/api/payment/callback
ECPAY_CLIENT_BACK_URL=https://abc123.ngrok.io/payment/success
NEXT_PUBLIC_APP_URL=https://abc123.ngrok.io
```

**選項 2: 使用 localtunnel**

```bash
# 安裝 localtunnel
npm install -g localtunnel

# 啟動內網穿透
lt --port 3000
```

#### 正式環境

部署到正式環境後，使用實際的網域名稱：

```env
ECPAY_RETURN_URL=https://yourdomain.com/api/payment/callback
ECPAY_CLIENT_BACK_URL=https://yourdomain.com/payment/success
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 4. 申請正式環境帳號

測試完成後，需要申請綠界正式環境帳號：

1. 前往 [綠界科技官網](https://www.ecpay.com.tw/)
2. 註冊成為特約商戶（需提供營業登記證或個人資料）
3. 申請開通金流服務
4. 取得正式環境的 MerchantID、HashKey、HashIV
5. 更新 `.env.local` 使用正式環境設定：

```env
ECPAY_MERCHANT_ID=your_merchant_id
ECPAY_HASH_KEY=your_hash_key
ECPAY_HASH_IV=your_hash_iv
ECPAY_API_URL=https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5
```

## 🚀 使用方式

### 啟動開發伺服器

```bash
npm run dev
```

### 測試付款流程

1. 訪問 http://localhost:3000
2. 貼上 Spotify 播放清單網址並解析
3. 選擇要下載的歌曲
4. 點擊「付費下載」
5. 在付款確認視窗點擊「前往付款」
6. 進入綠界測試付款頁面
7. 使用測試信用卡資料進行付款

### 測試信用卡資料

綠界測試環境提供以下測試卡號：

**信用卡一次付清：**
- 卡號：`4311-9522-2222-2222`
- 有效期限：任意未來日期（例如：12/25）
- 安全碼：任意 3 碼（例如：123）

**更多測試卡號請參考：**
https://developers.ecpay.com.tw/9168/

## 📁 檔案結構

```
src/
├── lib/
│   ├── ecpay.ts           # 綠界金流核心功能
│   └── orders.ts          # 訂單管理系統
├── app/
│   ├── api/
│   │   └── payment/
│   │       ├── create/
│   │       │   └── route.ts        # 建立付款訂單
│   │       ├── callback/
│   │       │   └── route.ts        # 接收付款結果通知
│   │       └── verify/
│   │           └── [merchantTradeNo]/
│   │               └── route.ts    # 查詢訂單狀態
│   └── payment/
│       └── success/
│           └── page.tsx    # 付款完成頁面
```

## 🔐 安全性說明

1. **CheckMacValue 驗證**：所有付款請求和回調都使用 SHA256 加密驗證
2. **金鑰保護**：HashKey 和 HashIV 僅存於環境變數中，不會暴露在前端
3. **訂單驗證**：回調時會驗證訂單金額是否一致
4. **HTTPS 要求**：正式環境必須使用 HTTPS

## 🔄 付款流程

```
1. 使用者選擇歌曲並點擊「付費下載」
   ↓
2. 前端呼叫 /api/payment/create 建立訂單
   ↓
3. 後端產生付款表單並返回 HTML
   ↓
4. 在新視窗開啟並自動提交表單到綠界
   ↓
5. 使用者在綠界頁面完成付款
   ↓
6. 綠界發送付款結果到 /api/payment/callback
   ↓
7. 後端驗證回調並更新訂單狀態
   ↓
8. 使用者被導向 /payment/success 查看結果
```

## 📊 訂單管理

目前使用記憶體儲存訂單資料。生產環境建議改用資料庫（如 PostgreSQL、MongoDB）儲存訂單。

### 新增資料庫儲存範例（PostgreSQL + Prisma）

1. 安裝依賴：
```bash
npm install @prisma/client
npm install -D prisma
```

2. 初始化 Prisma：
```bash
npx prisma init
```

3. 定義 Schema（`prisma/schema.prisma`）：
```prisma
model Order {
  id                String   @id @default(cuid())
  merchantTradeNo   String   @unique
  amount            Int
  itemName          String
  status            String
  createdAt         DateTime @default(now())
  paidAt            DateTime?
  tradeNo           String?
  paymentType       String?
  tracks            String[]
}
```

4. 執行遷移：
```bash
npx prisma migrate dev --name init
```

## 💡 常見問題

### Q: 本地測試時綠界無法回調怎麼辦？

A: 請確認：
1. 使用 ngrok 或 localtunnel 建立內網穿透
2. `.env.local` 中的 `ECPAY_RETURN_URL` 設定為公開可訪問的網址
3. 內網穿透工具正在運行

### Q: 付款完成但訂單狀態沒更新？

A: 檢查：
1. Server 端 console 是否有收到回調
2. CheckMacValue 驗證是否通過
3. 訂單金額是否一致

### Q: 如何切換到正式環境？

A: 
1. 申請綠界正式商戶帳號
2. 取得正式環境金鑰
3. 更新 `.env.local` 的 API URL 和金鑰
4. 確保網站使用 HTTPS

## 📚 參考資源

- [綠界 API 文檔](https://developers.ecpay.com.tw/)
- [綠界全方位金流](https://developers.ecpay.com.tw/2864/)
- [付款結果通知](https://developers.ecpay.com.tw/2865/)
- [測試環境說明](https://developers.ecpay.com.tw/9168/)

## 💳 費率說明

- 信用卡：2.75%（未稅）+ 每筆 1 元處理費
- ATM 虛擬帳號：1%（未稅），每筆最低 15 元
- 超商代碼：31 元（未稅）
- 超商條碼：16 元（未稅）

更多費率資訊請參考：https://www.ecpay.com.tw/Business/payment_fees

## 🎯 下一步

- [ ] 實作資料庫儲存訂單
- [ ] 加入付款失敗重試機制
- [ ] 實作訂單查詢頁面
- [ ] 加入電子發票整合
- [ ] 實作退款功能
