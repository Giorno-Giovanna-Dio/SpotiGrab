import { NextRequest, NextResponse } from "next/server";
import { getOrder } from "@/lib/orders";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ merchantTradeNo: string }> }
) {
  try {
    const { merchantTradeNo } = await params;

    if (!merchantTradeNo) {
      return NextResponse.json({ error: "缺少訂單編號" }, { status: 400 });
    }

    const order = getOrder(merchantTradeNo);

    if (!order) {
      return NextResponse.json({ error: "找不到訂單" }, { status: 404 });
    }

    return NextResponse.json({
      merchantTradeNo: order.merchantTradeNo,
      amount: order.amount,
      itemName: order.itemName,
      status: order.status,
      createdAt: order.createdAt,
      paidAt: order.paidAt,
      tradeNo: order.tradeNo,
      paymentType: order.paymentType,
      tracks: order.tracks,
    });
  } catch (error) {
    console.error("查詢訂單失敗:", error);
    return NextResponse.json({ error: "查詢訂單失敗" }, { status: 500 });
  }
}
