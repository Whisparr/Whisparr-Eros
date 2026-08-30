import React from 'react';
import Scroller from 'Components/Scroller/Scroller';
import { HORIZONTAL } from 'Helpers/Props/scrollDirections';
import { SortDirection } from 'Helpers/Props/sortDirections';
import Movie from 'Movie/Movie';
import { useSceneIndexOption } from '../sceneIndexOptionsStore';
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

function SceneIndexTable(props: SceneIndexTableProps) {
  const { items, sortKey, sortDirection, isSelectMode } = props;
  const columns = useSceneIndexOption('columns');

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
