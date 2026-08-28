import Column from 'Components/Table/Column';

export interface TableOptionsChangePayload {
  pageSize?: number;
  // `TableOptionsModal` sends the page size on its own, without the columns;
  // `columns` was declared required, which every handler below believed.
  columns?: Column[];
}
