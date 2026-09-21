export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: number;
  features: string[];
  conversionLimit: number | "unlimited";
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  free: {
    id: "free",
    name: "免費方案",
    price: 0,
    duration: 0,
    features: ["每日 3 次轉換", "每次最多 10 首預覽", "複製 YouTube 連結"],
    conversionLimit: 3,
  },
  monthly: {
    id: "monthly",
    name: "月費會員",
    price: 99,
    duration: 30,
    features: ["無限轉換次數", "不限首數", "一鍵複製全部連結", "無廣告", "優先客服"],
    conversionLimit: "unlimited",
  },
  quarterly: {
    id: "quarterly",
    name: "季度會員",
    price: 249,
    duration: 90,
    features: [
      "無限轉換次數",
      "不限首數",
      "一鍵複製全部連結",
      "無廣告",
      "優先客服",
      "省 16%（原價 NT$ 297）",
    ],
    conversionLimit: "unlimited",
  },
  yearly: {
    id: "yearly",
    name: "年度會員",
    price: 899,
    duration: 365,
    features: [
      "無限轉換次數",
      "不限首數",
      "一鍵複製全部連結",
      "無廣告",
      "優先客服",
      "省 25%（原價 NT$ 1,188）",
    ],
    conversionLimit: "unlimited",
  },
  payPerTrack: {
    id: "payPerTrack",
    name: "單次解鎖",
    price: 10,
    duration: 0,
    features: ["單次完整轉換", "不限首數", "複製全部 YouTube 連結"],
    conversionLimit: 0,
  },
};

export interface UserSubscription {
  userId: string;
  planId: string;
  startDate: Date;
  endDate: Date;
  status: "active" | "expired" | "cancelled";
  autoRenew: boolean;
}

const subscriptions = new Map<string, UserSubscription>();

export function createSubscription(
  userId: string,
  planId: string,
  autoRenew: boolean = false
): UserSubscription {
  const plan = SUBSCRIPTION_PLANS[planId];
  if (!plan) {
    throw new Error("無效的訂閱方案");
  }

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + plan.duration);

  const subscription: UserSubscription = {
    userId,
    planId,
    startDate,
    endDate,
    status: "active",
    autoRenew,
  };

  subscriptions.set(userId, subscription);
  return subscription;
}

export function getSubscription(userId: string): UserSubscription | undefined {
  return subscriptions.get(userId);
}

export function isSubscriptionActive(userId: string): boolean {
  const subscription = subscriptions.get(userId);
  if (!subscription) return false;

  if (subscription.status !== "active") return false;

  const now = new Date();
  if (now > subscription.endDate) {
    subscription.status = "expired";
    subscriptions.set(userId, subscription);
    return false;
  }

  return true;
}

export function canConvert(userId: string, trackCount: number = 1): {
  allowed: boolean;
  reason?: string;
  remainingConversions?: number;
} {
  const subscription = getSubscription(userId);

  if (!subscription || subscription.planId === "free") {
    const dailyConversions = getDailyConversionCount(userId);
    const remaining = 3 - dailyConversions;

    if (dailyConversions + 1 > 3) {
      return {
        allowed: false,
        reason: "已達每日免費轉換限額（3 次）",
        remainingConversions: Math.max(0, remaining),
      };
    }

    if (trackCount > 10) {
      return {
        allowed: false,
        reason: "免費方案每次最多轉換 10 首，請升級以解鎖完整清單",
        remainingConversions: Math.max(0, remaining),
      };
    }

    return {
      allowed: true,
      remainingConversions: remaining - 1,
    };
  }

  if (!isSubscriptionActive(userId)) {
    return {
      allowed: false,
      reason: "訂閱已過期，請續訂以繼續使用",
    };
  }

  const plan = SUBSCRIPTION_PLANS[subscription.planId];
  if (plan.conversionLimit === "unlimited") {
    return { allowed: true };
  }

  return { allowed: true };
}

const dailyConversions = new Map<string, { date: string; count: number }>();

function getDailyConversionCount(userId: string): number {
  const today = new Date().toISOString().split("T")[0];
  const record = dailyConversions.get(userId);

  if (!record || record.date !== today) {
    return 0;
  }

  return record.count;
}

export function recordConversion(userId: string): void {
  const today = new Date().toISOString().split("T")[0];
  const record = dailyConversions.get(userId);

  if (!record || record.date !== today) {
    dailyConversions.set(userId, { date: today, count: 1 });
  } else {
    record.count += 1;
    dailyConversions.set(userId, record);
  }
}

export function getRemainingDays(userId: string): number | null {
  const subscription = getSubscription(userId);
  if (!subscription || subscription.status !== "active") return null;

  const now = new Date();
  const diff = subscription.endDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function cancelSubscription(userId: string): boolean {
  const subscription = getSubscription(userId);
  if (!subscription) return false;

  subscription.status = "cancelled";
  subscription.autoRenew = false;
  subscriptions.set(userId, subscription);
  return true;
}
