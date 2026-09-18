"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface OrderData {
  merchantTradeNo: string;
  amount: number;
  itemName: string;
  status: string;
  paidAt?: string;
  tradeNo?: string;
  paymentType?: string;
  tracks?: string[];
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const merchantTradeNo = searchParams.get("MerchantTradeNo");

    if (!merchantTradeNo) {
      setError("找不到訂單編號");
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/payment/verify/${merchantTradeNo}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "查詢訂單失敗");
        }

        setOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "查詢訂單失敗");
      } finally {
        setLoading(false);
      }
    };

    const pollOrder = setInterval(async () => {
      await fetchOrder();
    }, 2000);

    fetchOrder();

    return () => clearInterval(pollOrder);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto mb-4" />
          <p className="text-zinc-400">正在確認付款狀態...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
            <div className="text-4xl mb-4">❌</div>
            <h1 className="text-xl font-semibold mb-2">發生錯誤</h1>
            <p className="text-zinc-400 mb-6">{error || "無法取得訂單資訊"}</p>
            <Link
              href="/"
              className="inline-block rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-400"
            >
              返回首頁
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isPaid = order.status === "paid";
  const isPending = order.status === "pending";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
          <div className="text-center mb-6">
            {isPaid && (
              <>
                <div className="text-6xl mb-4">✅</div>
                <h1 className="text-2xl font-bold mb-2">付款成功！</h1>
                <p className="text-zinc-400">感謝您的購買</p>
              </>
            )}
            {isPending && (
              <>
                <div className="text-6xl mb-4">⏳</div>
                <h1 className="text-2xl font-bold mb-2">等待付款確認</h1>
                <p className="text-zinc-400">
                  如果您已完成付款，請稍候片刻
                  <br />
                  系統正在確認中...
                </p>
              </>
            )}
            {!isPaid && !isPending && (
              <>
                <div className="text-6xl mb-4">❌</div>
                <h1 className="text-2xl font-bold mb-2">付款失敗</h1>
                <p className="text-zinc-400">請稍後再試或聯繫客服</p>
              </>
            )}
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">訂單編號</span>
              <span className="font-mono text-xs">{order.merchantTradeNo}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">商品</span>
              <span>{order.itemName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">金額</span>
              <span className="text-emerald-400 font-semibold">NT$ {order.amount}</span>
            </div>
            {order.tradeNo && (
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">交易編號</span>
                <span className="font-mono text-xs">{order.tradeNo}</span>
              </div>
            )}
            {order.paymentType && (
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">付款方式</span>
                <span>{order.paymentType}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">狀態</span>
              <span
                className={`font-semibold ${
                  isPaid
                    ? "text-emerald-400"
                    : isPending
                      ? "text-yellow-400"
                      : "text-red-400"
                }`}
              >
                {isPaid ? "已付款" : isPending ? "處理中" : "失敗"}
              </span>
            </div>
          </div>

          {isPaid && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 mb-6">
              <p className="text-sm text-emerald-300">
                付款完成後，您可以開始下載您購買的歌曲。
              </p>
            </div>
          )}

          <Link
            href="/"
            className="block w-full rounded-lg bg-emerald-500 py-3 text-center text-sm font-semibold text-black transition hover:bg-emerald-400"
          >
            返回首頁
          </Link>
        </div>
      </div>
    </div>
  );
}
