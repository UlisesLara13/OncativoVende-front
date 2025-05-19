export class SearchDto {
  searchTerm?: string;
  category?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  tag?: string;
  sortBy?: string;
  sortDir?: string;
  page?: number;
  size?: number;
}
