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
import { CheckInputChanged } from 'typings/inputs';
import translate from 'Utilities/String/translate';
import {
  SceneIndexTableOptions as SceneIndexTableOptionsState,
  setSceneIndexSort,
  setSceneIndexTableOption,
} from '../sceneIndexOptionsStore';
import SceneIndexTableOptions from './SceneIndexTableOptions';
import styles from './SceneIndexTableHeader.css';

interface SceneIndexTableHeaderProps {
  columns: Column[];
  sortKey?: string;
  sortDirection?: SortDirection;
  isSelectMode: boolean;
}

function SceneIndexTableHeader(props: SceneIndexTableHeaderProps) {
  const { columns, sortKey, sortDirection, isSelectMode } = props;
  const [selectState, selectDispatch] = useSelect();

  const onSortPress = useCallback((value: string) => {
    setSceneIndexSort(value);
  }, []);

  const onTableOptionChange = useCallback(
    (payload: {
      columns?: Column[];
      tableOptions?: SceneIndexTableOptionsState;
    }) => {
      setSceneIndexTableOption(payload);
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

        if (!isVisible || name === 'select') {
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
                optionsComponent={SceneIndexTableOptions}
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

export default SceneIndexTableHeader;
