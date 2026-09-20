# Vercel 部署與 404 排除

## 你現在看到的 404 是什麼

`This page doesn’t exist` + `404 NOT_FOUND` + `hkg1::...` 是 **Vercel 平台層的 404**，不是網頁自己畫出來的錯誤頁。

我實際打過你的正式網址：

- `https://spotify-music-downloader-khaki.vercel.app` **整站（含首頁）都是 404**
- 付款 Preview 網址會被轉去 `vercel.com/login`（Vercel SSO 保護）

所以綠界回調或 ngrok 都開不起來：對方打進來的網址要嘛不存在，要嘛要先登入 Vercel。

**本地 ngrok 不需要再開。** 金流回調請走公開的 Vercel 網址。

## 真正的原因

GitHub 上這個 repo 連了 **兩個 Vercel 專案**：

| 專案 | 狀態 | 結果 |
|------|------|------|
| `spotify-music-downloader` | Error | 正式網域 `*.vercel.app` 變成整站 404 |
| `spotigrab` | Ready | Preview 有部署，但開了 Deployment Protection，訪客 / 綠界打不進去 |

另外，付款路由原本只在這個 PR 分支。若環境變數指到正式網域的 `/payment/success`，而正式站還是舊的 `main`（或部署失敗），也會 404。

## 請在 Vercel 做這三件事

### 1. 只用一個專案

建議只留 `spotigrab`（或只留有自訂網域的那一個），另一個專案取消 Git 連動，避免兩個專案搶同一個 repo。

### 2. 關掉 Preview 的登入牆

`Project Settings → Deployment Protection`

- Production 可維持公開
- Preview 若要給綠界測試，請關掉 Standard Protection，或設定 Bypass
- 否則綠界、瀏覽器未登入都會被轉去 Vercel 登入頁，看起來像壞掉

### 3. 環境變數（Production + Preview 都要）

```
ECPAY_MERCHANT_ID=3002607
ECPAY_HASH_KEY=pwFHCqoQZGmho4w6
ECPAY_HASH_IV=EkRm7iFT261dpevs
ECPAY_API_URL=https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5
SPOTIFY_CLIENT_ID=你的 Spotify Client ID
SPOTIFY_CLIENT_SECRET=你的 Spotify Client Secret
```

回調網址 **可以不填**。程式會用目前網站的 origin 自動組：

- `/api/payment/callback`（綠界伺服器通知，POST）
- `/api/payment/result`（付款後瀏覽器回來，POST → 轉到成功頁）
- `/payment/success`（結果頁）

填完後 **Redeploy**。

## 測試信用卡

- 卡號：`4311-9522-2222-2222`
- 有效期限：任意未來月份
- 安全碼：任意 3 碼

## 怎麼確認修好

1. 正式網址首頁不再 404
2. 打開 `/payment/success` 會看到付款結果頁（沒帶訂單編號時會顯示錯誤，但不是 Vercel 404）
3. 打開 `/api/payment/callback` 會看到純文字說明（不是 404）
