export interface Order {
  id: string;
  merchantTradeNo: string;
  amount: number;
  itemName: string;
  status: "pending" | "paid" | "failed" | "cancelled";
  createdAt: Date;
  paidAt?: Date;
  tradeNo?: string;
  paymentType?: string;
  tracks?: string[];
}

const orders = new Map<string, Order>();

export function createOrder(data: {
  merchantTradeNo: string;
  amount: number;
  itemName: string;
  tracks?: string[];
}): Order {
  const order: Order = {
    id: data.merchantTradeNo,
    merchantTradeNo: data.merchantTradeNo,
    amount: data.amount,
    itemName: data.itemName,
    status: "pending",
    createdAt: new Date(),
    tracks: data.tracks,
  };

  orders.set(order.id, order);
  return order;
}

export function getOrder(merchantTradeNo: string): Order | undefined {
  return orders.get(merchantTradeNo);
}

export function updateOrderStatus(
  merchantTradeNo: string,
  status: Order["status"],
  paymentData?: {
    tradeNo?: string;
    paymentType?: string;
    paidAt?: Date;
  }
): Order | undefined {
  const order = orders.get(merchantTradeNo);
  if (!order) {
    return undefined;
  }

  order.status = status;
  if (paymentData) {
    if (paymentData.tradeNo) order.tradeNo = paymentData.tradeNo;
    if (paymentData.paymentType) order.paymentType = paymentData.paymentType;
    if (paymentData.paidAt) order.paidAt = paymentData.paidAt;
  }

  orders.set(merchantTradeNo, order);
  return order;
}

export function deleteOrder(merchantTradeNo: string): boolean {
  return orders.delete(merchantTradeNo);
}

export function getAllOrders(): Order[] {
  return Array.from(orders.values());
}
