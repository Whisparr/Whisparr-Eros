import React from 'react';
import IconButton from 'Components/Link/IconButton';
import Column from 'Components/Table/Column';
import TableOptionsModalWrapper from 'Components/Table/TableOptions/TableOptionsModalWrapper';
import VirtualTableHeader from 'Components/Table/VirtualTableHeader';
import VirtualTableHeaderCell from 'Components/Table/VirtualTableHeaderCell';
import VirtualTableSelectAllHeaderCell from 'Components/Table/VirtualTableSelectAllHeaderCell';
import { icons } from 'Helpers/Props';
import { SortDirection } from 'Helpers/Props/sortDirections';
import { TableOptionsChangePayload } from 'typings/Table';
import translate from 'Utilities/String/translate';
import styles from './UnmappedFilesTableHeader.css';

export interface UnmappedFilesTableHeaderProps {
  columns: Column[];
  allSelected: boolean;
  allUnselected: boolean;
  onSelectAllChange: (value: { value: boolean }) => void;
  onTableOptionChange: (payload: TableOptionsChangePayload) => void;
  sortKey: string;
  sortDirection: SortDirection;
  onSortPress: (name: string) => void;
}

function UnmappedFilesTableHeader({
  columns,
  onTableOptionChange,
  allSelected,
  allUnselected,
  onSelectAllChange,
  sortKey,
  sortDirection,
  onSortPress,
}: UnmappedFilesTableHeaderProps) {
  return (
    <VirtualTableHeader>
      {columns.map((column) => {
        const { name, label, isSortable, isVisible } = column;

        if (!isVisible) {
          return null;
        }

        if (name === 'select') {
          return (
            <VirtualTableSelectAllHeaderCell
              key={name}
              allSelected={allSelected}
              allUnselected={allUnselected}
              onSelectAllChange={onSelectAllChange}
            />
          );
        }

        if (name === 'actions') {
          return (
            <VirtualTableHeaderCell
              key={name}
              className={(styles as unknown as Record<string, string>)[name]}
              name={name}
              isSortable={false}
            >
              <TableOptionsModalWrapper
                columns={columns}
                onTableOptionChange={onTableOptionChange}
              >
                <IconButton
                  name={icons.ADVANCED_SETTINGS}
                  aria-label={translate('TableOptionsButton')}
                />
              </TableOptionsModalWrapper>
            </VirtualTableHeaderCell>
          );
        }

        return (
          <VirtualTableHeaderCell
            key={name}
            className={(styles as unknown as Record<string, string>)[name]}
            name={name}
            isSortable={!!isSortable}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSortPress={onSortPress}
          >
            {typeof label === 'function' ? label() : label}
          </VirtualTableHeaderCell>
        );
      })}
    </VirtualTableHeader>
  );
}

export default UnmappedFilesTableHeader;
