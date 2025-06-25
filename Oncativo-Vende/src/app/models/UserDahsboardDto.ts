export interface LocationCountDto {
  location: string;
  count: number;
}

export interface UserDashboardDto {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  premiumUsers: number;
  standardUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  usersByLocation: LocationCountDto[];
}