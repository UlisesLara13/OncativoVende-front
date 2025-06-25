export interface LabelCountDto {
  label: string;
  count: number;
}

export interface PublicationDashboardDto {
  totalPublications: number;
  activePublications: number;
  inactivePublications: number;
  totalViews: number;
  averagePrice: number;
  publicationsByCategory: LabelCountDto[];
  publicationsByTag: LabelCountDto[];
  publicationsByLocation: LabelCountDto[];
}