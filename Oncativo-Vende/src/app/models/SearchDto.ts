export class SearchDto {
  searchTerm?: string;
  location?: string;
  minPrice?: number;
  categories?: string[];
  tags?: string[];
  maxPrice?: number;
  sortBy?: string;
  sortDir?: string;
  page?: number;
  size?: number;
  active?: boolean;
}
