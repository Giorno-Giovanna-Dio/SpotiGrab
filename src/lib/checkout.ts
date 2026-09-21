export interface CheckoutPayload {
  planId: string;
  trackCount?: number;
  tracks?: string[];
}

export interface CheckoutError {
  reason: "request" | "popup";
  message?: string;
}

/**
 * 建立綠界訂單並在新視窗送出付款表單。
 * 成功回傳 null，失敗回傳失敗原因讓呼叫端決定要顯示的訊息。
 */
export async function startCheckout(
  payload: CheckoutPayload
): Promise<CheckoutError | null> {
  const res = await fetch("/api/payment/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let message: string | undefined;
    try {
      const data = await res.json();
      message = typeof data?.error === "string" ? data.error : undefined;
    } catch {
      message = undefined;
    }
    return { reason: "request", message };
  }

  const html = await res.text();
  const paymentWindow = window.open("", "_blank");

  if (!paymentWindow) {
    return { reason: "popup" };
  }

  paymentWindow.document.write(html);
  paymentWindow.document.close();
  return null;
}
