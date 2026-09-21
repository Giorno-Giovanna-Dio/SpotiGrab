import { NextRequest, NextResponse } from "next/server";
import {
  createPaymentForm,
  generateMerchantTradeNo,
  formatTradeDate,
  getConfig,
  getRequestOrigin,
} from "@/lib/ecpay";
import { createOrder } from "@/lib/orders";
import { getPayPerTrackTotal, getPlan } from "@/lib/pricing";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId, trackCount, tracks } = body;

    if (!planId) {
      return NextResponse.json({ error: "缺少方案 ID" }, { status: 400 });
    }

    const plan = getPlan(planId);
    if (!plan) {
      return NextResponse.json({ error: "無效的方案" }, { status: 400 });
    }

    let amount: number;
    let itemName: string;

    if (planId === "payPerTrack") {
      if (!trackCount || trackCount <= 0) {
        return NextResponse.json({ error: "無效的歌曲數量" }, { status: 400 });
      }
      amount = getPayPerTrackTotal(trackCount);
      itemName = `SpotiGrab 單曲下載 ${trackCount} 首`;
    } else {
      amount = plan.price;
      itemName = `SpotiGrab ${plan.name}訂閱`;
    }

    const merchantTradeNo = generateMerchantTradeNo();
    const merchantTradeDate = formatTradeDate();
    const origin = getRequestOrigin(request);
    const returnUrl =
      process.env.ECPAY_RETURN_URL || `${origin}/api/payment/callback`;
    const clientBackUrl =
      process.env.ECPAY_CLIENT_BACK_URL || `${origin}/payment/success`;
    const orderResultUrl = `${origin}/api/payment/result`;

    const formData = createPaymentForm({
      merchantTradeNo,
      merchantTradeDate,
      totalAmount: amount,
      tradeDesc: planId === "payPerTrack" ? "SpotiGrab 單曲下載" : "SpotiGrab 訂閱服務",
      itemName,
      choosePayment: "ALL",
      returnUrl,
      clientBackUrl,
      orderResultUrl,
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
      .map(
        ([key, value]) =>
          `<input type="hidden" name="${key}" value="${String(value)
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")}" />`
      )
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
