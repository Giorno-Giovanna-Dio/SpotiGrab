import { NextRequest, NextResponse } from "next/server";
import {
  createPaymentForm,
  generateMerchantTradeNo,
  formatTradeDate,
  getConfig,
} from "@/lib/ecpay";
import { createOrder } from "@/lib/orders";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, itemName, tracks } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "無效的金額" }, { status: 400 });
    }

    if (!itemName) {
      return NextResponse.json({ error: "缺少商品名稱" }, { status: 400 });
    }

    const merchantTradeNo = generateMerchantTradeNo();
    const merchantTradeDate = formatTradeDate();

    const formData = createPaymentForm({
      merchantTradeNo,
      merchantTradeDate,
      totalAmount: amount,
      tradeDesc: "SpotiGrab 歌曲下載",
      itemName,
      choosePayment: "ALL",
    });

    createOrder({
      merchantTradeNo,
      amount,
      itemName,
      tracks,
    });

    const config = getConfig();

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>前往付款頁面...</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(to bottom right, #0f172a, #1e293b);
      color: white;
    }
    .loading {
      text-align: center;
    }
    .spinner {
      border: 3px solid rgba(255, 255, 255, 0.1);
      border-top: 3px solid #10b981;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="loading">
    <div class="spinner"></div>
    <p>正在前往綠界付款頁面...</p>
    <p style="font-size: 14px; opacity: 0.7;">請稍候，不要關閉此頁面</p>
  </div>
  <form id="ecpayForm" method="post" action="${config.apiUrl}">
    ${Object.entries(formData)
      .map(([key, value]) => `<input type="hidden" name="${key}" value="${value}" />`)
      .join("\n    ")}
  </form>
  <script>
    document.getElementById('ecpayForm').submit();
  </script>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("建立付款訂單失敗:", error);
    return NextResponse.json(
      { error: "建立付款訂單失敗，請稍後再試" },
      { status: 500 }
    );
  }
}
