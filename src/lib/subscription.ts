import { FREE_DAILY_DOWNLOAD_LIMIT, getPlan } from "@/lib/pricing";

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
  const plan = getPlan(planId);
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
    const remaining = FREE_DAILY_DOWNLOAD_LIMIT - dailyDownloads;

    if (dailyDownloads + trackCount > FREE_DAILY_DOWNLOAD_LIMIT) {
      return {
        allowed: false,
        reason: `已達每日免費下載限額（${FREE_DAILY_DOWNLOAD_LIMIT} 首）`,
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
