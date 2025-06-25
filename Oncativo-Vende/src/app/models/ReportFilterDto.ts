export interface ReportFilterDto {
searchTerm?: string;
status?: string;
sortBy?: string;        
sortDir?: 'asc' | 'desc';
page?: number;
size?: number;
}