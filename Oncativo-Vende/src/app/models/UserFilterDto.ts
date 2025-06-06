export interface UserFilterDto {
  searchTerm?: string;
  active?: boolean;
  verified?: boolean;
  roles?: string[];
  location?: string;
  createdFrom?: string; 
  createdTo?: string;   
  sortBy?: string;      
  sortDir?: 'asc' | 'desc'; 
  page?: number;        
  size?: number;        
}