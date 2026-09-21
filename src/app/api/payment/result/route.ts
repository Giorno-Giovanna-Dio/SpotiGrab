import { NextRequest, NextResponse } from "next/server";
import { parsePaymentCallback } from "@/lib/ecpay";
import { updateOrderStatus } from "@/lib/orders";

function redirectToSuccess(request: NextRequest, params: Record<string, string>) {
  const url = request.nextUrl.clone();
  url.pathname = "/payment/success";
  url.search = "";

  const allowed = [
    "MerchantTradeNo",
    "RtnCode",
    "RtnMsg",
    "TradeAmt",
    "TradeNo",
    "PaymentType",
    "PaymentDate",
  ];

  for (const key of allowed) {
    if (params[key]) {
      url.searchParams.set(key, params[key]);
    }
  }

  return NextResponse.redirect(url, 303);
}

export async function GET(request: NextRequest) {
  return redirectToSuccess(request, Object.fromEntries(request.nextUrl.searchParams));
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const callbackData: Record<string, string> = {};

  formData.forEach((value, key) => {
    callbackData[key] = value.toString();
  });

  const paymentStatus = parsePaymentCallback(callbackData);

  if (paymentStatus.success) {
    updateOrderStatus(paymentStatus.merchantTradeNo, "paid", {
      tradeNo: paymentStatus.tradeNo,
      paymentType: paymentStatus.paymentType,
      paidAt: new Date(),
    });
  } else if (paymentStatus.merchantTradeNo) {
    updateOrderStatus(paymentStatus.merchantTradeNo, "failed", {
      tradeNo: paymentStatus.tradeNo,
      paymentType: paymentStatus.paymentType,
    });
  }

  return redirectToSuccess(request, callbackData);
}
