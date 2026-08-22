import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Grid, GridCellProps, WindowScroller } from 'react-virtualized';
import { useAppDimension } from 'App/appStore';
import Measure from 'Components/Measure';
import { SelectedState } from 'Helpers/Hooks/useSelectState';
import dimensions from 'Styles/Variables/dimensions';
import getIndexOfFirstCharacter from 'Utilities/Array/getIndexOfFirstCharacter';
import { useCollectionOption } from '../collectionOptionsStore';
import { CollectionItem } from '../useCollectionItems';
import { useCollectionExistingMovies } from '../useMovieCollections';
import CollectionOverview from './CollectionOverview';
import styles from './CollectionOverviews.css';

// Poster container dimensions
const columnPadding = Number.parseInt(dimensions.movieIndexColumnPadding, 10);
const columnPaddingSmallScreen = Number.parseInt(
  dimensions.movieIndexColumnPaddingSmallScreen,
  10
);

function calculatePosterWidth(posterSize: string, isSmallScreen: boolean) {
  const maximumPosterWidth = isSmallScreen ? 152 : 162;

  if (posterSize === 'large') {
    return maximumPosterWidth;
  }

  if (posterSize === 'medium') {
    return Math.floor(maximumPosterWidth * 0.75);
  }

  return Math.floor(maximumPosterWidth * 0.5);
}

function calculatePosterHeight(posterWidth: number) {
  return Math.ceil((250 / 170) * posterWidth);
}

function calculateRowHeight(
  posterHeight: number,
  isSmallScreen: boolean,
  showPosters: boolean
) {
  const heights = [
    showPosters ? posterHeight : 75,
    isSmallScreen ? columnPaddingSmallScreen : columnPadding,
  ];

  return heights.reduce((acc, height) => acc + height + 80, 0);
}

interface CollectionOverviewsProps {
  items: CollectionItem[];
  jumpToCharacter?: string;
  scrollTop?: number;
  scroller: Element;
  selectedState: SelectedState;
  onSelectedChange(change: {
    id: number;
    value: boolean;
    shiftKey?: boolean;
  }): void;
}

function CollectionOverviews({
  items,
  jumpToCharacter,
  scrollTop,
  scroller,
  selectedState,
  onSelectedChange,
}: CollectionOverviewsProps) {
  const isSmallScreen = useAppDimension('isSmallScreen');
  const overviewOptions = useCollectionOption('overviewOptions');
  const existingMovies = useCollectionExistingMovies(items);

  const gridRef = useRef<Grid>(null);
  const [width, setWidth] = useState(0);
  const [scrollRestored, setScrollRestored] = useState(false);

  const { posterWidth, posterHeight, rowHeight } = useMemo(() => {
    const nextPosterWidth = overviewOptions.showPosters
      ? calculatePosterWidth(overviewOptions.size, isSmallScreen)
      : 0;
    const nextPosterHeight = overviewOptions.showPosters
      ? calculatePosterHeight(nextPosterWidth)
      : 0;

    return {
      posterWidth: nextPosterWidth,
      posterHeight: nextPosterHeight,
      rowHeight: calculateRowHeight(
        nextPosterHeight,
        isSmallScreen,
        overviewOptions.showPosters
      ),
    };
  }, [overviewOptions, isSmallScreen]);

  const scrollToPosition = useCallback(
    ({ scrollTop: top = 0, scrollLeft = 0 }) => {
      scroller?.scrollTo({ top, left: scrollLeft });
    },
    [scroller]
  );

  // recomputeGridSize also forces Grid to discard its cache of rendered cells
  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.recomputeGridSize();
    }
  }, [width, rowHeight, items, overviewOptions]);

  useEffect(() => {
    if (gridRef.current && scrollTop !== 0 && !scrollRestored) {
      setScrollRestored(true);
      scrollToPosition({ scrollTop });
    }
  }, [scrollTop, scrollRestored, scrollToPosition]);

  useEffect(() => {
    if (jumpToCharacter == null || !gridRef.current) {
      return;
    }

    const index = getIndexOfFirstCharacter(items, jumpToCharacter);

    if (index != null) {
      scrollToPosition(
        gridRef.current.getOffsetForCell({ rowIndex: index, columnIndex: 0 })
      );
    }
  }, [jumpToCharacter, items, scrollToPosition]);

  const handleMeasure = useCallback(
    ({ width: newWidth }: { width: number }) => {
      setWidth(newWidth);
    },
    []
  );

  const cellRenderer = useCallback(
    ({ key, rowIndex, style }: GridCellProps) => {
      const collection = items[rowIndex];

      if (!collection) {
        return null;
      }

      return (
        <div key={key} className={styles.container} style={style}>
          <CollectionOverview
            collection={collection}
            existingMovies={existingMovies}
            posterWidth={posterWidth}
            posterHeight={posterHeight}
            rowHeight={rowHeight}
            overviewOptions={overviewOptions}
            isSmallScreen={isSmallScreen}
            isSelected={selectedState[collection.id]}
            onSelectedChange={onSelectedChange}
          />
        </div>
      );
    },
    [
      items,
      existingMovies,
      posterWidth,
      posterHeight,
      rowHeight,
      overviewOptions,
      isSmallScreen,
      selectedState,
      onSelectedChange,
    ]
  );

  return (
    <Measure onMeasure={handleMeasure}>
      <div>
        <WindowScroller scrollElement={isSmallScreen ? undefined : scroller}>
          {({
            height,
            registerChild,
            onChildScroll,
            scrollTop: gridScrollTop,
          }) => {
            if (!height) {
              return <div />;
            }

            return (
              <div ref={registerChild}>
                <Grid
                  ref={gridRef}
                  className={styles.grid}
                  autoHeight={true}
                  height={height}
                  columnCount={1}
                  columnWidth={width}
                  rowCount={items.length}
                  rowHeight={rowHeight}
                  width={width}
                  scrollTop={gridScrollTop}
                  overscanRowCount={2}
                  cellRenderer={cellRenderer}
                  scrollToAlignment="start"
                  onScroll={onChildScroll}
                />
              </div>
            );
          }}
        </WindowScroller>
      </div>
    </Measure>
  );
}

export default CollectionOverviews;
