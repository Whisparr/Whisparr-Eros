import React from 'react';
import Column from 'Components/Table/Column';
import Table from 'Components/Table/Table';
import TableBody from 'Components/Table/TableBody';
import TableRow from 'Components/Table/TableRow';
import { SortDirection } from 'Helpers/Props/sortDirections';
import Performer from 'Performer/Performer';
import PerformerIndexRow from './PerformerIndexRow';

interface PerformerIndexTableProps {
  items: Performer[];
  sortKey: string;
  sortDirection?: SortDirection;
  isSelectMode: boolean;
  columns: Column[];
  showMovieMonitorToggle?: boolean;
  onSortPress?: (name: string, sortDirection?: SortDirection) => void;
}

function PerformerIndexTable({
  items,
  sortKey,
  sortDirection,
  isSelectMode,
  columns,
  showMovieMonitorToggle,
  onSortPress,
}: PerformerIndexTableProps) {
  return (
    <Table
      columns={columns}
      sortKey={sortKey}
      sortDirection={sortDirection}
      selectAll={false}
      onSortPress={onSortPress}
    >
      <TableBody>
        {items.map((performer: Performer) => (
          <TableRow key={performer.id}>
            <PerformerIndexRow
              performer={performer}
              showMovieMonitorToggle={showMovieMonitorToggle}
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
export default PerformerIndexTable;
