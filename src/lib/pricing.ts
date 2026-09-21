export type PlanId = "free" | "monthly" | "quarterly" | "yearly" | "payPerTrack";

export interface SubscriptionPlan {
  id: PlanId;
  /** 送往綠界的品名，需與金流對帳資料一致 */
  name: string;
  price: number;
  /** 訂閱天數，一次性方案為 0 */
  duration: number;
  /** 計費月數，用於換算月均價與折扣，一次性方案為 0 */
  billingMonths: number;
  /** 對應 messages 的 pricing.features.* */
  featureKeys: string[];
  downloadLimit: number | "unlimited";
}

export const FREE_DAILY_DOWNLOAD_LIMIT = 3;

export const SUBSCRIPTION_PLANS: Record<PlanId, SubscriptionPlan> = {
  free: {
    id: "free",
    name: "免費方案",
    price: 0,
    duration: 0,
    billingMonths: 0,
    featureKeys: ["dailyLimit", "standardQuality", "adSupported"],
    downloadLimit: FREE_DAILY_DOWNLOAD_LIMIT,
  },
  monthly: {
    id: "monthly",
    name: "月費會員",
    price: 99,
    duration: 30,
    billingMonths: 1,
    featureKeys: [
      "unlimitedDownloads",
      "highQualityMp3",
      "batchDownload",
      "noAds",
      "prioritySupport",
    ],
    downloadLimit: "unlimited",
  },
  quarterly: {
    id: "quarterly",
    name: "季度會員",
    price: 249,
    duration: 90,
    billingMonths: 3,
    featureKeys: [
      "unlimitedDownloads",
      "highQualityMp3",
      "batchDownload",
      "noAds",
      "prioritySupport",
    ],
    downloadLimit: "unlimited",
  },
  yearly: {
    id: "yearly",
    name: "年度會員",
    price: 899,
    duration: 365,
    billingMonths: 12,
    featureKeys: [
      "unlimitedDownloads",
      "highQualityMp3",
      "batchDownload",
      "noAds",
      "prioritySupport",
    ],
    downloadLimit: "unlimited",
  },
  payPerTrack: {
    id: "payPerTrack",
    name: "單曲付費",
    price: 10,
    duration: 0,
    billingMonths: 0,
    featureKeys: ["singleDownload", "highQualityMp3", "noExpiry"],
    downloadLimit: 0,
  },
};

/** 價格頁與付款彈窗共用的訂閱方案顯示順序 */
export const SUBSCRIPTION_PLAN_IDS = ["monthly", "quarterly", "yearly"] as const;

export type SubscriptionPlanId = (typeof SUBSCRIPTION_PLAN_IDS)[number];

export const FEATURED_PLAN_ID: SubscriptionPlanId = "quarterly";

export function getPlan(planId: string): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS[planId as PlanId];
}

export function isSubscriptionPlanId(planId: PlanId): planId is SubscriptionPlanId {
  return (SUBSCRIPTION_PLAN_IDS as readonly PlanId[]).includes(planId);
}

/** 千分位格式固定使用 en-US，避免伺端與瀏覽器渲染結果不一致 */
export function formatAmount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export interface PlanPricing {
  plan: SubscriptionPlan;
  /** 換算後的每月平均價格 */
  monthlyAverage: number;
  /** 以月費方案 × 計費月數推算的原價 */
  listPrice: number;
  savings: number;
  savingsPercent: number;
}

export function getPlanPricing(planId: SubscriptionPlanId): PlanPricing {
  const plan = SUBSCRIPTION_PLANS[planId];
  const listPrice = SUBSCRIPTION_PLANS.monthly.price * plan.billingMonths;
  const savings = Math.max(0, listPrice - plan.price);

  return {
    plan,
    monthlyAverage: Math.round(plan.price / plan.billingMonths),
    listPrice,
    savings,
    savingsPercent: listPrice > 0 ? Math.round((savings / listPrice) * 100) : 0,
  };
}

export function getSubscriptionPricing(): PlanPricing[] {
  return SUBSCRIPTION_PLAN_IDS.map(getPlanPricing);
}

export function getPayPerTrackTotal(trackCount: number): number {
  return SUBSCRIPTION_PLANS.payPerTrack.price * Math.max(0, trackCount);
}
