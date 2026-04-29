export interface QuotaDecisionAllowed {
  allowed: true;
  remaining: number;
}

export interface QuotaDecisionDenied {
  allowed: false;
  reason: 'quota_exceeded';
  limit: number;
}

export type QuotaDecision = QuotaDecisionAllowed | QuotaDecisionDenied;

export interface UsageLookup {
  isPaid: boolean;
  usageCountToday: number;
  dailyFreeLimit?: number;
}

const DEFAULT_FREE_DAILY_LIMIT = 5;

export function enforceQuota(usage: UsageLookup): QuotaDecision {
  if (usage.isPaid) {
    return {
      allowed: true,
      remaining: Number.POSITIVE_INFINITY
    };
  }

  const limit = usage.dailyFreeLimit ?? DEFAULT_FREE_DAILY_LIMIT;
  if (usage.usageCountToday >= limit) {
    return {
      allowed: false,
      reason: 'quota_exceeded',
      limit
    };
  }

  return {
    allowed: true,
    remaining: limit - usage.usageCountToday
  };
}
