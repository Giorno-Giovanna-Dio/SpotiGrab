# Vercel 部署設定指南

## 🚀 環境變數設定

在 Vercel Dashboard 中設定以下環境變數：

### 測試環境設定

```env
# 綠界測試商店設定
ECPAY_MERCHANT_ID=3002607
ECPAY_HASH_KEY=pwFHCqoQZGmho4w6
ECPAY_HASH_IV=EkRm7iFT261dpevs

# API 端點（測試環境）
ECPAY_API_URL=https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5

# 回調網址（請替換為您的 Vercel 網址）
ECPAY_RETURN_URL=https://your-app.vercel.app/api/payment/callback
ECPAY_CLIENT_BACK_URL=https://your-app.vercel.app/payment/success

# 應用程式網址（請替換為您的 Vercel 網址）
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### ⚠️ 重要步驟

1. **替換網址**：將 `your-app.vercel.app` 替換為您實際的 Vercel 網址
   - 例如：`spotigrab-abc123.vercel.app`

2. **設定環境**：選擇要套用的環境
   - ✅ Production
   - ✅ Preview
   - ✅ Development

3. **儲存後重新部署**：
   - 設定完環境變數後
   - 觸發新的部署（Deployments → Redeploy）
   - 或推送新的 commit

## 📝 設定步驟

### 步驟 1：進入專案設定
```
Vercel Dashboard → 選擇您的專案 → Settings
```

### 步驟 2：新增環境變數
```
Settings → Environment Variables → Add New
```

### 步驟 3：逐一新增
對每個環境變數：
1. 輸入 Key（變數名稱）
2. 輸入 Value（變數值）
3. 選擇環境（Production、Preview、Development）
4. 點擊 Save

### 步驟 4：重新部署
```
Deployments → 最新的部署 → ⋯ → Redeploy
```

## 🧪 測試付款流程

部署完成後：

### 1. 訪問您的網站
```
https://your-app.vercel.app
```

### 2. 測試訂閱制流程
1. 貼上 Spotify 播放清單網址
2. 解析並選擇歌曲
3. 點擊「查看方案」
4. 選擇任一訂閱方案：
   - 月費會員（NT$ 99）
   - 季度會員（NT$ 249）- 最超值
   - 年度會員（NT$ 899）
   - 或單曲付費（NT$ 10/首）

### 3. 使用測試信用卡
```
卡號：4311-9522-2222-2222
有效期限：12/25（或任意未來日期）
安全碼：123（或任意 3 碼）
```

### 4. 完成付款
- 綠界會導向付款頁面
- 完成付款後會回調您的網站
- 查看付款結果頁面

## 🔍 除錯技巧

### 查看部署日誌
```
Vercel Dashboard → Deployments → 點擊部署 → Function Logs
```

### 查看回調是否成功
1. 付款完成後
2. 前往 Function Logs
3. 搜尋 "payment/callback"
4. 查看是否有收到綠界的回調

### 常見問題

#### 1. 付款完成但沒有回調
**原因**：ECPAY_RETURN_URL 設定錯誤

**解決**：
- 確認網址格式正確
- 必須是 https://
- 確認沒有多餘的空格

#### 2. CheckMacValue 驗證失敗
**原因**：HashKey 或 HashIV 設定錯誤

**解決**：
- 檢查環境變數是否正確複製
- 測試環境使用上述提供的測試金鑰

#### 3. 無法開啟付款頁面
**原因**：瀏覽器封鎖彈出視窗

**解決**：
- 允許網站彈出視窗
- 或在 Function Logs 查看錯誤訊息

## 📊 監控付款狀態

### 開發者工具
打開瀏覽器開發者工具（F12）：
- Console：查看前端錯誤
- Network：查看 API 請求

### Vercel Logs
```
Vercel Dashboard → Functions → 選擇函數 → Logs
```

可以看到：
- `/api/payment/create` - 建立訂單的請求
- `/api/payment/callback` - 綠界回調的資料
- `/api/payment/verify/*` - 訂單狀態查詢

## 🎯 正式環境切換

測試完成後，切換到正式環境：

### 1. 申請綠界正式帳號
前往：https://www.ecpay.com.tw/

### 2. 取得正式金鑰
- MerchantID
- HashKey
- HashIV

### 3. 更新 Vercel 環境變數
```env
ECPAY_MERCHANT_ID=your_merchant_id
ECPAY_HASH_KEY=your_hash_key
ECPAY_HASH_IV=your_hash_iv
ECPAY_API_URL=https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5
```

### 4. 重新部署

## 💡 小技巧

### 1. 使用預覽部署測試
在推送到 main 之前：
- 建立 Pull Request
- Vercel 會自動建立預覽部署
- 使用預覽網址測試

### 2. 設定不同環境的變數
- Production：正式環境金鑰
- Preview：測試環境金鑰
- Development：測試環境金鑰

### 3. 保護敏感資訊
- 不要將正式環境金鑰提交到 Git
- 只在 Vercel Dashboard 設定
- 使用環境變數而非硬編碼

## 🔐 安全檢查清單

- [ ] ECPAY_HASH_KEY 和 ECPAY_HASH_IV 未出現在程式碼中
- [ ] 環境變數只在 Vercel Dashboard 設定
- [ ] .env.local 已加入 .gitignore
- [ ] HTTPS 已啟用（Vercel 預設啟用）
- [ ] 回調網址使用 HTTPS

## 📞 需要協助？

如果遇到問題：
1. 查看 Vercel Function Logs
2. 檢查環境變數是否正確
3. 確認網址格式正確
4. 測試信用卡資料是否正確輸入

---

祝您部署順利！🚀
