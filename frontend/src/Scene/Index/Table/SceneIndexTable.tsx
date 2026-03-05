import React from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import AppState from 'App/State/AppState';
import Scroller from 'Components/Scroller/Scroller';
import { HORIZONTAL } from 'Helpers/Props/scrollDirections';
import { SortDirection } from 'Helpers/Props/sortDirections';
import Movie from 'Movie/Movie';
import SceneIndexRow from './SceneIndexRow';
import SceneIndexTableHeader from './SceneIndexTableHeader';
import styles from './SceneIndexTable.css';

interface SceneIndexTableProps {
  items: Movie[];
  sortKey: string;
  sortDirection?: SortDirection;
  isSelectMode: boolean;
  isSmallScreen: boolean;
}

const columnsSelector = createSelector(
  (state: AppState) => state.sceneIndex.columns,
  (columns) => columns
);

function SceneIndexTable(props: SceneIndexTableProps) {
  const { items, sortKey, sortDirection, isSelectMode } = props;
  const columns = useSelector(columnsSelector);

  return (
    <Scroller className={styles.tableScroller} scrollDirection={HORIZONTAL}>
      <SceneIndexTableHeader
        columns={columns}
        sortKey={sortKey}
        sortDirection={sortDirection}
        isSelectMode={isSelectMode}
      />
      {items.map((scene) => (
        <div key={scene.id} className={styles.row}>
          <SceneIndexRow
            scene={scene}
            sortKey={sortKey}
            columns={columns}
            isSelectMode={isSelectMode}
          />
        </div>
      ))}
    </Scroller>
  );
}

export default SceneIndexTable;
