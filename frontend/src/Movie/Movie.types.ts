// Types for paged movie API
import { SortDirection } from 'Helpers/Props/sortDirections';

export interface MovieFilterResource {
  key: string;
  type?: string;
  value: string | number | boolean;
}

export interface MoviePagingRequest {
  page?: number;
  pageSize?: number;
  sortKey?: string;
  sortDirection?: SortDirection;
  filters?: MovieFilterResource[];
}

export interface PagingResource<T> {
  page: number;
  pageSize: number;
  sortKey?: string;
  sortDirection?: SortDirection;
  totalRecords: number;
  records: T[];
}
