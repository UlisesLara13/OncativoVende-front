export interface SubscriptionMonthlyCountDto {
  month: string;
  count: number;
}

export interface SubscriptionDashboardDto {
  totalSubscriptions: number;
  totalRevenue: number;

  withDiscount: number;
  withoutDiscount: number;

  activeSubscriptions: number;
  inactiveSubscriptions: number;

  yearAnalize: string;

  subscriptionsByMonth: SubscriptionMonthlyCountDto[];
}