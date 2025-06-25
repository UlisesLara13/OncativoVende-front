import { UserGet } from "./UserGet";


export interface PaginatedUsers {
  content: UserGet[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  pageable: {
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
    sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
    };
  };
}