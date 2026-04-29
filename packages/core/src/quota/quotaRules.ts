export interface QuotaContext {
  isPaid: boolean;
  usageCountToday: number;
  dailyFreeLimit?: number;
}

export interface QuotaAllowed {
  allowed: true;
  remaining: number;
}

export interface QuotaDenied {
  allowed: false;
  reason: 'quota_exceeded';
  limit: number;
}

export type QuotaDecision = QuotaAllowed | QuotaDenied;

const DEFAULT_FREE_DAILY_LIMIT = 5;

export function evaluateDailyQuota(context: QuotaContext): QuotaDecision {
  if (context.isPaid) {
    return {
      allowed: true,
      remaining: Number.POSITIVE_INFINITY
    };
  }

  const limit = context.dailyFreeLimit ?? DEFAULT_FREE_DAILY_LIMIT;
  if (context.usageCountToday >= limit) {
    return {
      allowed: false,
      reason: 'quota_exceeded',
      limit
    };
  }

  return {
    allowed: true,
    remaining: limit - context.usageCountToday
  };
}
