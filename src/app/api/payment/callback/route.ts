import { NextRequest, NextResponse } from "next/server";
import { parsePaymentCallback } from "@/lib/ecpay";
import { updateOrderStatus, getOrder } from "@/lib/orders";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const callbackData: Record<string, string> = {};

    formData.forEach((value, key) => {
      callbackData[key] = value.toString();
    });

    console.log("收到綠界付款回調:", callbackData);

    const paymentStatus = parsePaymentCallback(callbackData);

    if (!paymentStatus.success) {
      console.error("付款失敗或驗證失敗:", paymentStatus);

      updateOrderStatus(paymentStatus.merchantTradeNo, "failed", {
        tradeNo: paymentStatus.tradeNo,
        paymentType: paymentStatus.paymentType,
      });

      return new NextResponse("0|驗證失敗", {
        headers: { "Content-Type": "text/plain" },
      });
    }

    const order = getOrder(paymentStatus.merchantTradeNo);
    if (!order) {
      console.error("找不到訂單:", paymentStatus.merchantTradeNo);
      return new NextResponse("0|找不到訂單", {
        headers: { "Content-Type": "text/plain" },
      });
    }

    if (order.amount !== paymentStatus.amount) {
      console.error(
        "金額不符:",
        `訂單金額 ${order.amount}`,
        `付款金額 ${paymentStatus.amount}`
      );
      return new NextResponse("0|金額不符", {
        headers: { "Content-Type": "text/plain" },
      });
    }

    updateOrderStatus(paymentStatus.merchantTradeNo, "paid", {
      tradeNo: paymentStatus.tradeNo,
      paymentType: paymentStatus.paymentType,
      paidAt: new Date(),
    });

    console.log("付款成功:", paymentStatus);

    return new NextResponse("1|OK", {
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("處理付款回調失敗:", error);
    return new NextResponse("0|系統錯誤", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
