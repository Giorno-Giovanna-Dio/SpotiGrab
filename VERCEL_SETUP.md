# 把正式站改掛到 spotigrab

你的判斷是對的：太早把未完成的專案掛上 Vercel，後來又新增 `spotigrab`，兩個專案搶同一個 GitHub repo，正式網域還留在失敗的舊專案上。

這件事 **沒辦法從程式碼修好**。Vercel 網域綁在 Dashboard，必須用你的帳號改。下面是最短路徑。

## 現況（2026-09-21 實測）

| 網址 | 狀態 |
|------|------|
| `https://spotify-music-downloader-khaki.vercel.app` | 整站 404。這是舊專案 `spotify-music-downloader` 的正式別名，已沒有有效部署。**不能搬到 spotigrab。** |
| `https://spotigrab-davids-projects-57841fbe.vercel.app` | `spotigrab` 正式站，部署是成功的，但開了 Vercel Authentication，未登入會被轉去登入頁。 |
| `https://spotigrab-git-cursor-ecpay-paym-bf1eb4-davids-projects-57841fbe.vercel.app` | 付款 PR 的 Preview，同樣被登入牆擋住。 |

`*.vercel.app` 系統網域跟專案綁死。`*-khaki.vercel.app` 屬於舊專案，加到 `spotigrab` 不會成功。正式站請改用 `spotigrab` 自己的網址。

## 請依序做這 5 步

### 1. 打開 spotigrab 專案

https://vercel.com/davids-projects-57841fbe/spotigrab

確認最新 Production 是 Ready（main 分支）。

### 2. 關掉登入牆（這步不做，外人 / 綠界永遠進不去）

1. 進入 **Settings → Deployment Protection**
2. Protection 選 **None**（或至少不要保護 Production）
3. 儲存

然後用無痕視窗打開：

https://spotigrab-davids-projects-57841fbe.vercel.app

應該要看到 SpotiGrab 首頁，而不是 Vercel 登入或 404。

### 3. 把 Git 連動只留給 spotigrab

舊專案：https://vercel.com/davids-projects-57841fbe/spotify-music-downloader

1. **Settings → Git → Disconnect**
2. 之後可直接 **Delete Project**（`khaki` 網址本來就 404，刪了沒差）

只讓 `spotigrab` 連 `Giorno-Giovanna-Dio/SpotiGrab`。

### 4. 環境變數加在 spotigrab

**Settings → Environment Variables**，Production 與 Preview 都加：

```
ECPAY_MERCHANT_ID=3002607
ECPAY_HASH_KEY=pwFHCqoQZGmho4w6
ECPAY_HASH_IV=EkRm7iFT261dpevs
ECPAY_API_URL=https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5
SPOTIFY_CLIENT_ID=你的 ID
SPOTIFY_CLIENT_SECRET=你的 Secret
```

回調網址不用填，程式會用目前網域自動組。填完後 **Deployments → Redeploy**。

### 5. 之後用這個當正式網址

```
https://spotigrab-davids-projects-57841fbe.vercel.app
```

GitHub repo 的 Website 請改成上面這個，不要再用 `spotify-music-downloader-khaki.vercel.app`。

若想要比較好記的網址：

- **Settings → General → Project Name** 可改名（之後新部署會用新的 `新名字-davids-projects-57841fbe.vercel.app`）
- 或 **Settings → Domains** 綁自己的網域（例如 `spotigrab.com`）

不要再嘗試把 `khaki` 那條加進 spotigrab。

## 付款功能什麼時候會出現在正式站

`spotigrab` 正式站跟的是 `main`。金流在 PR #4 分支。

- 現在關掉登入牆：正式站會是 **還沒有付款** 的 main 版（i18n 播放清單工具）
- 要把訂閱 / 綠界放到正式站：把 PR #4 merge 進 `main`，Vercel 會自動 Production Deploy

測金流可先用 Preview（登入牆關掉之後）：

https://spotigrab-git-cursor-ecpay-paym-bf1eb4-davids-projects-57841fbe.vercel.app
