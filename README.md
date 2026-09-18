# SpotiGrab

將 Spotify 播放清單一鍵下載到本地端的 Web 工具。

**流程：** Spotify 播放清單 URL → 解析曲目 → 自動在 YouTube 搜尋對應 → 下載 MP3 → 打包 ZIP

## 功能

- 貼上 Spotify 公開播放清單連結即可解析
- 自動在 YouTube 搜尋每首歌的最佳對應
- 可勾選/取消個別曲目
- 批次下載為 MP3 並打包成 ZIP

## 前置需求

1. **Node.js 18+**
2. **yt-dlp** 與 **ffmpeg**（YouTube 下載與 MP3 轉檔）
   ```bash
   # Linux（Cloud Agent / Ubuntu）
   pip install yt-dlp
   sudo apt install ffmpeg
   export PATH="$HOME/.local/bin:$PATH"   # pip 安裝後需加 PATH

   # macOS
   brew install yt-dlp ffmpeg
   ```

   檢查是否就緒：
   ```bash
   npm run check-tools
   ```
3. **Spotify API 憑證**（免費）
   - 前往 [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - 建立 App，取得 Client ID 與 Client Secret

## 安裝與啟動

```bash
# 安裝依賴
npm install

# 設定環境變數
cp .env.example .env.local
# 編輯 .env.local，填入 SPOTIFY_CLIENT_ID 與 SPOTIFY_CLIENT_SECRET

# 開發模式
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000)

## 環境變數

| 變數 | 必填 | 說明 |
|------|------|------|
| `YT_DLP_COOKIES_FROM_BROWSER` | 建議 | 修復 YouTube 403。Mac 填 `safari` 或 `chrome` |
| `YT_DLP_PATH` | 否 | yt-dlp 執行檔路徑 |
| `FFMPEG_PATH` | 否 | ffmpeg 執行檔路徑 |
| `SPOTIFY_CLIENT_ID` | 否 | 選填，解析清單已可不靠 Spotify API |

## YouTube 403 下載失敗？

若看到 `HTTP Error 403: Forbidden`：

1. **更新 yt-dlp**
   ```bash
   brew upgrade yt-dlp    # Mac
   pip install -U yt-dlp  # Linux
   ```

2. **在 `.env.local` 加入瀏覽器 cookies（Mac 強烈建議）**
   ```env
   YT_DLP_COOKIES_FROM_BROWSER=safari
   ```
   或用 Chrome：`YT_DLP_COOKIES_FROM_BROWSER=chrome`

3. **重啟 dev server**
   ```bash
   npm run dev
   ```

> 需先在 Safari/Chrome 登入 YouTube，且 Mac 可能需允許 Terminal 存取瀏覽器資料。

## 技術架構

- **前端：** Next.js 16 + React 19 + Tailwind CSS
- **Spotify API：** Client Credentials 流程讀取公開播放清單
- **YouTube 搜尋：** yt-search
- **下載：** yt-dlp（音訊轉 MP3）

## 免責聲明

本工具僅供個人備份已合法取得使用權的音樂。請尊重音樂創作者版權，支持正版音樂平台（Spotify、Apple Music 等）。

## License

MIT
