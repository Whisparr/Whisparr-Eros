import React from 'react';
import IconButton from 'Components/Link/IconButton';
import TableOptionsModalWrapper from 'Components/Table/TableOptions/TableOptionsModalWrapper';
import VirtualTableHeader from 'Components/Table/VirtualTableHeader';
import VirtualTableHeaderCell from 'Components/Table/VirtualTableHeaderCell';
import VirtualTableSelectAllHeaderCell from 'Components/Table/VirtualTableSelectAllHeaderCell';
import { icons } from 'Helpers/Props';
import styles from './UnmappedFilesTableHeader.css';

export interface UnmappedFilesTableHeaderProps {
  columns: Array<{
    name: string;
    label?: string | (() => React.ReactNode);
    isSortable?: boolean;
    isVisible: boolean;
  }>;
  allSelected: boolean;
  allUnselected: boolean;
  onSelectAllChange: (value: { value: boolean }) => void;
  onTableOptionChange: (payload: unknown) => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  onSortColumnPress: (column: string) => void;
}

function UnmappedFilesTableHeader(props: UnmappedFilesTableHeaderProps) {
  const {
    columns,
    onTableOptionChange,
    allSelected,
    allUnselected,
    onSelectAllChange,
    sortKey,
    sortDirection,
    onSortColumnPress,
    ...otherProps
  } = props;

  const renderSortIndicator = (columnName: string) => {
    if (sortKey !== columnName) return null;
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <VirtualTableHeader>
      {columns.map((column) => {
        const { name, label, isSortable, isVisible } = column;
        if (!isVisible) return null;
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
              {...otherProps}
            >
              <TableOptionsModalWrapper
                columns={columns}
                onTableOptionChange={onTableOptionChange}
              >
                <IconButton name={icons.ADVANCED_SETTINGS} />
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
            {...otherProps}
          >
            <span
              {...(isSortable
                ? {
                    onClick: () => onSortColumnPress(name),
                    style: { cursor: 'pointer' },
                  }
                : {})}
            >
              {typeof label === 'function' ? label() : label}
              {isSortable && renderSortIndicator(name)}
            </span>
          </VirtualTableHeaderCell>
        );
      })}
    </VirtualTableHeader>
  );
}

export default UnmappedFilesTableHeader;
