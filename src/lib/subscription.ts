export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: number;
  features: string[];
  downloadLimit: number | "unlimited";
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  free: {
    id: "free",
    name: "免費方案",
    price: 0,
    duration: 0,
    features: ["每日 3 首下載限額", "標準音質", "廣告支持"],
    downloadLimit: 3,
  },
  monthly: {
    id: "monthly",
    name: "月費會員",
    price: 99,
    duration: 30,
    features: ["無限下載", "高音質 MP3", "批次下載", "無廣告", "優先客服"],
    downloadLimit: "unlimited",
  },
  quarterly: {
    id: "quarterly",
    name: "季度會員",
    price: 249,
    duration: 90,
    features: [
      "無限下載",
      "高音質 MP3",
      "批次下載",
      "無廣告",
      "優先客服",
      "省 16%（原價 NT$ 297）",
    ],
    downloadLimit: "unlimited",
  },
  yearly: {
    id: "yearly",
    name: "年度會員",
    price: 899,
    duration: 365,
    features: [
      "無限下載",
      "高音質 MP3",
      "批次下載",
      "無廣告",
      "優先客服",
      "省 25%（原價 NT$ 1,188）",
    ],
    downloadLimit: "unlimited",
  },
  payPerTrack: {
    id: "payPerTrack",
    name: "單曲付費",
    price: 10,
    duration: 0,
    features: ["單次下載", "高音質 MP3", "不限時效"],
    downloadLimit: 0,
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

export function canDownload(userId: string, trackCount: number = 1): {
  allowed: boolean;
  reason?: string;
  remainingDownloads?: number;
} {
  const subscription = getSubscription(userId);

  if (!subscription || subscription.planId === "free") {
    const dailyDownloads = getDailyDownloadCount(userId);
    const remaining = 3 - dailyDownloads;

    if (dailyDownloads + trackCount > 3) {
      return {
        allowed: false,
        reason: "已達每日免費下載限額（3 首）",
        remainingDownloads: Math.max(0, remaining),
      };
    }

    return {
      allowed: true,
      remainingDownloads: remaining - trackCount,
    };
  }

  if (!isSubscriptionActive(userId)) {
    return {
      allowed: false,
      reason: "訂閱已過期，請續訂以繼續使用",
    };
  }

  const plan = SUBSCRIPTION_PLANS[subscription.planId];
  if (plan.downloadLimit === "unlimited") {
    return { allowed: true };
  }

  return { allowed: true };
}

const dailyDownloads = new Map<string, { date: string; count: number }>();

function getDailyDownloadCount(userId: string): number {
  const today = new Date().toISOString().split("T")[0];
  const record = dailyDownloads.get(userId);

  if (!record || record.date !== today) {
    return 0;
  }

  return record.count;
}

export function recordDownload(userId: string, trackCount: number = 1): void {
  const today = new Date().toISOString().split("T")[0];
  const record = dailyDownloads.get(userId);

  if (!record || record.date !== today) {
    dailyDownloads.set(userId, { date: today, count: trackCount });
  } else {
    record.count += trackCount;
    dailyDownloads.set(userId, record);
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
