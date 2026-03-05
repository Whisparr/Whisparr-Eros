import React from 'react';
import Column from 'Components/Table/Column';
import Table from 'Components/Table/Table';
import TableBody from 'Components/Table/TableBody';
import TableRow from 'Components/Table/TableRow';
import { SortDirection } from 'Helpers/Props/sortDirections';
import Studio from 'Studio/Studio';
import StudioIndexRow from './StudioIndexRow';

interface StudioIndexTableProps {
  items: Studio[];
  sortKey: string;
  sortDirection?: SortDirection;
  isSelectMode: boolean;
  columns: Column[];
  onSortPress?: (name: string, sortDirection?: SortDirection) => void;
}

function StudioIndexTable({
  items,
  sortKey,
  sortDirection,
  isSelectMode,
  columns,
  onSortPress,
}: Readonly<StudioIndexTableProps>) {
  return (
    <Table
      columns={columns}
      sortKey={sortKey}
      sortDirection={sortDirection}
      selectAll={false}
      onSortPress={onSortPress}
    >
      <TableBody>
        {items.map((studio: Studio) => (
          <TableRow key={studio.id}>
            <StudioIndexRow
              studio={studio}
              sortKey={sortKey}
              columns={columns}
              isSelectMode={isSelectMode}
            />
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default StudioIndexTable;
