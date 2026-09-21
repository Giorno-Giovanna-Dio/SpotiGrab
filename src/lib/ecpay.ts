import crypto from "crypto";

export interface ECPayConfig {
  merchantId: string;
  hashKey: string;
  hashIv: string;
  apiUrl: string;
  returnUrl: string;
  clientBackUrl: string;
}

export interface ECPayOrderParams {
  merchantTradeNo: string;
  merchantTradeDate: string;
  totalAmount: number;
  tradeDesc: string;
  itemName: string;
  choosePayment: "ALL" | "Credit" | "WebATM" | "ATM" | "CVS" | "BARCODE";
  returnUrl?: string;
  clientBackUrl?: string;
  orderResultUrl?: string;
}

export interface ECPayFormData {
  MerchantID: string;
  MerchantTradeNo: string;
  MerchantTradeDate: string;
  PaymentType: string;
  TotalAmount: string;
  TradeDesc: string;
  ItemName: string;
  ReturnURL: string;
  ChoosePayment: string;
  EncryptType: string;
  CheckMacValue: string;
  ClientBackURL?: string;
  OrderResultURL?: string;
}

const config: ECPayConfig = {
  merchantId: process.env.ECPAY_MERCHANT_ID || "",
  hashKey: process.env.ECPAY_HASH_KEY || "",
  hashIv: process.env.ECPAY_HASH_IV || "",
  apiUrl: process.env.ECPAY_API_URL || "",
  returnUrl: process.env.ECPAY_RETURN_URL || "",
  clientBackUrl: process.env.ECPAY_CLIENT_BACK_URL || "",
};

function genCheckMacValue(params: Record<string, string | number>, hashKey: string, hashIv: string): string {
  const sortedKeys = Object.keys(params).sort((a, b) => {
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();
    if (aLower < bLower) return -1;
    if (aLower > bLower) return 1;
    return 0;
  });

  const paramString = sortedKeys.map((key) => `${key}=${params[key]}`).join("&");

  const rawString = `HashKey=${hashKey}&${paramString}&HashIV=${hashIv}`;

  const urlEncoded = encodeURIComponent(rawString)
    .toLowerCase()
    .replace(/%20/g, "+")
    .replace(/%2d/g, "-")
    .replace(/%5f/g, "_")
    .replace(/%2e/g, ".")
    .replace(/%21/g, "!")
    .replace(/%2a/g, "*")
    .replace(/%28/g, "(")
    .replace(/%29/g, ")");

  return crypto.createHash("sha256").update(urlEncoded).digest("hex").toUpperCase();
}

export function getRequestOrigin(request: Request): string {
  const forwardedHost = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost.split(",")[0].trim()}`;
  }

  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl) {
    try {
      return new URL(envUrl).origin;
    } catch {
      return envUrl.replace(/\/$/, "");
    }
  }

  return "http://localhost:3000";
}

export function createPaymentForm(orderParams: ECPayOrderParams): ECPayFormData {
  const returnUrl = orderParams.returnUrl || config.returnUrl;
  const clientBackUrl = orderParams.clientBackUrl || config.clientBackUrl;
  const orderResultUrl = orderParams.orderResultUrl;

  const params: Record<string, string | number> = {
    MerchantID: config.merchantId,
    MerchantTradeNo: orderParams.merchantTradeNo,
    MerchantTradeDate: orderParams.merchantTradeDate,
    PaymentType: "aio",
    TotalAmount: orderParams.totalAmount,
    TradeDesc: orderParams.tradeDesc,
    ItemName: orderParams.itemName,
    ReturnURL: returnUrl,
    ChoosePayment: orderParams.choosePayment,
    EncryptType: "1",
  };

  if (clientBackUrl) {
    params.ClientBackURL = clientBackUrl;
  }

  if (orderResultUrl) {
    params.OrderResultURL = orderResultUrl;
  }

  const checkMacValue = genCheckMacValue(params, config.hashKey, config.hashIv);

  return {
    ...params,
    CheckMacValue: checkMacValue,
  } as ECPayFormData;
}

export function verifyCallback(callbackData: Record<string, string>): boolean {
  const receivedCheckMac = callbackData.CheckMacValue;
  if (!receivedCheckMac) {
    return false;
  }

  const params = { ...callbackData };
  delete params.CheckMacValue;

  const calculatedCheckMac = genCheckMacValue(params, config.hashKey, config.hashIv);

  return receivedCheckMac === calculatedCheckMac;
}

export function generateMerchantTradeNo(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `SG${timestamp}${random}`.slice(0, 20);
}

export function formatTradeDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
}

export function getConfig(): ECPayConfig {
  return config;
}

export interface PaymentStatus {
  success: boolean;
  merchantTradeNo: string;
  tradeNo?: string;
  amount?: number;
  paymentDate?: string;
  paymentType?: string;
  rtnCode?: number;
  rtnMsg?: string;
}

export function parsePaymentCallback(callbackData: Record<string, string>): PaymentStatus {
  const isValid = verifyCallback(callbackData);

  if (!isValid) {
    return {
      success: false,
      merchantTradeNo: callbackData.MerchantTradeNo || "",
      rtnMsg: "檢查碼驗證失敗",
    };
  }

  const rtnCode = parseInt(callbackData.RtnCode || "0", 10);
  const success = rtnCode === 1;

  return {
    success,
    merchantTradeNo: callbackData.MerchantTradeNo,
    tradeNo: callbackData.TradeNo,
    amount: parseInt(callbackData.TradeAmt || "0", 10),
    paymentDate: callbackData.PaymentDate,
    paymentType: callbackData.PaymentType,
    rtnCode,
    rtnMsg: callbackData.RtnMsg,
  };
}
