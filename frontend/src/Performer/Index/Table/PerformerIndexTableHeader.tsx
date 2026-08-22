import classNames from 'classnames';
import React, { useCallback } from 'react';
import { useSelect } from 'App/SelectContext';
import IconButton from 'Components/Link/IconButton';
import Column from 'Components/Table/Column';
import TableOptionsModalWrapper from 'Components/Table/TableOptions/TableOptionsModalWrapper';
import VirtualTableHeader from 'Components/Table/VirtualTableHeader';
import VirtualTableHeaderCell from 'Components/Table/VirtualTableHeaderCell';
import VirtualTableSelectAllHeaderCell from 'Components/Table/VirtualTableSelectAllHeaderCell';
import { icons } from 'Helpers/Props';
import { SortDirection } from 'Helpers/Props/sortDirections';
import {
  PerformerIndexOptions,
  setPerformerIndexSort,
  setPerformerIndexTableOption,
} from 'Performer/Index/performerIndexOptionsStore';
import { CheckInputChanged } from 'typings/inputs';
import PerformerIndexTableOptions from './PerformerIndexTableOptions';
import styles from './PerformerIndexTableHeader.css';

interface PerformerIndexTableHeaderProps {
  columns: Column[];
  sortKey?: string;
  sortDirection?: SortDirection;
  isSelectMode: boolean;
}

function PerformerIndexTableHeader(props: PerformerIndexTableHeaderProps) {
  const { columns, sortKey, sortDirection, isSelectMode } = props;
  const [selectState, selectDispatch] = useSelect();

  // Sorting from a column header now resets to page one, as it already did
  // from the toolbar's sort menu and as the movie, scene and studio headers
  // do. Sorting while on page three otherwise left you on page three of a
  // different ordering.
  const onSortPress = useCallback((value: string) => {
    setPerformerIndexSort(value);
  }, []);

  const onTableOptionChange = useCallback(
    (
      payload: Partial<Pick<PerformerIndexOptions, 'columns' | 'tableOptions'>>
    ) => {
      setPerformerIndexTableOption(payload);
    },
    []
  );

  const onSelectAllChange = useCallback(
    ({ value }: CheckInputChanged) => {
      selectDispatch({
        type: value ? 'selectAll' : 'unselectAll',
      });
    },
    [selectDispatch]
  );

  return (
    <VirtualTableHeader>
      {isSelectMode ? (
        <VirtualTableSelectAllHeaderCell
          allSelected={selectState.allSelected}
          allUnselected={selectState.allUnselected}
          onSelectAllChange={onSelectAllChange}
        />
      ) : null}

      {columns.map((column) => {
        const { name, label, isSortable, isVisible } = column;

        if (!isVisible) {
          return null;
        }

        if (name === 'actions') {
          return (
            <VirtualTableHeaderCell
              key={name}
              className={styles[name]}
              name={name}
              isSortable={false}
            >
              <TableOptionsModalWrapper
                columns={columns}
                optionsComponent={PerformerIndexTableOptions}
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
            className={classNames(
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              styles[name]
            )}
            name={name}
            sortKey={sortKey}
            sortDirection={sortDirection}
            isSortable={isSortable}
            onSortPress={onSortPress}
          >
            {typeof label === 'function' ? label() : label}
          </VirtualTableHeaderCell>
        );
      })}
    </VirtualTableHeader>
  );
}

export default PerformerIndexTableHeader;
