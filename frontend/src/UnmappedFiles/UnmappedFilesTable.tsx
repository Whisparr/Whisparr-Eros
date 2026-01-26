import React, { Component, RefObject } from 'react';
import ModelBase from 'App/ModelBase';
import Alert from 'Components/Alert';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import PageToolbar from 'Components/Page/Toolbar/PageToolbar';
import PageToolbarButton from 'Components/Page/Toolbar/PageToolbarButton';
import PageToolbarSection from 'Components/Page/Toolbar/PageToolbarSection';
import TableOptionsModalWrapper from 'Components/Table/TableOptions/TableOptionsModalWrapper';
import VirtualTable from 'Components/Table/VirtualTable';
import VirtualTableRow from 'Components/Table/VirtualTableRow';
import { align, icons } from 'Helpers/Props';
import MediaInfo from 'typings/MediaInfo';
import hasDifferentItemsOrOrder from 'Utilities/Object/hasDifferentItemsOrOrder';
import translate from 'Utilities/String/translate';
import getSelectedIds from 'Utilities/Table/getSelectedIds';
import selectAll from 'Utilities/Table/selectAll';
import toggleSelected from 'Utilities/Table/toggleSelected';
import UnmappedFilesTableHeader from './UnmappedFilesTableHeader';
import UnmappedFilesTableRow from './UnmappedFilesTableRow';
import styles from './UnmappedFilesTable.css';

interface UnmappedFile extends ModelBase {
  originalFilePath: string;
  size: number;
  quality?: { quality?: { name?: string } } | { name?: string } | string;
  dateAdded: string;
  mediaInfo: MediaInfo;
  [key: string]: unknown;
}

export interface UnmappedFilesTableProps {
  isFetching: boolean;
  isPopulated: boolean;
  isDeleting: boolean;
  deleteError?: object;
  error?: object;
  items: UnmappedFile[];
  columns: Array<{ name: string; isVisible: boolean }>;
  onTableOptionChange: (payload: unknown) => void;
  fetchUnmappedFiles: () => void;
  deleteUnmappedFile: (id: number) => void;
  deleteUnmappedFiles: (ids: number[]) => void;
  isScanningFolders: boolean;
  isCleaningUnmappedFiles: boolean;
  onAddScenesPress: () => void;
  onCleanUnmappedFilesPress: () => void;
}

interface UnmappedFilesTableState {
  allSelected: boolean;
  allUnselected: boolean;
  lastToggled: number | null;
  selectedState: Record<number, boolean>;
  sortKey: string | null;
  sortDirection: 'asc' | 'desc';
}

class UnmappedFilesTable extends Component<
  UnmappedFilesTableProps,
  UnmappedFilesTableState
> {
  constructor(props: UnmappedFilesTableProps, context?: unknown) {
    super(props, context);
    this.scrollerRef = React.createRef();
    this.state = {
      allSelected: false,
      allUnselected: false,
      lastToggled: null,
      selectedState: {},
      sortKey: null,
      sortDirection: 'asc',
    };
  }

  componentDidMount() {
    this.setSelectedState();
  }

  componentDidUpdate(prevProps: UnmappedFilesTableProps) {
    const { items, isDeleting, deleteError, isScanningFolders } = this.props;
    if (hasDifferentItemsOrOrder(prevProps.items, items)) {
      this.setSelectedState();
    }
    const hasFinishedDeleting =
      prevProps.isDeleting && !isDeleting && !deleteError;
    if (hasFinishedDeleting) {
      this.onSelectAllChange({ value: false });
    }
    const hasFinishedScanning =
      prevProps.isScanningFolders && !isScanningFolders;
    if (
      hasFinishedScanning &&
      typeof this.props.fetchUnmappedFiles === 'function'
    ) {
      this.props.fetchUnmappedFiles();
    }
  }

  scrollerRef: RefObject<HTMLDivElement>;

  onSortColumnPress = (column: string) => {
    this.setState((prevState) => {
      const isSame = prevState.sortKey === column;
      const direction =
        isSame && prevState.sortDirection === 'asc' ? 'desc' : 'asc';
      return {
        sortKey: column,
        sortDirection: direction,
      };
    });
  };

  getSortedItems() {
    const { items } = this.props;
    const { sortKey, sortDirection } = this.state;
    if (!sortKey) {
      return items;
    }
    return [...items].sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';
      if (sortKey === 'quality') {
        const getQualityName = (
          q:
            | { quality?: { name?: string } }
            | { name?: string }
            | string
            | undefined
        ): string => {
          if (typeof q === 'string') return q.toLowerCase();
          if (q && typeof q === 'object') {
            if (
              'quality' in q &&
              q.quality &&
              typeof q.quality.name === 'string'
            ) {
              return q.quality.name.toLowerCase();
            }
            if (
              'name' in q &&
              typeof (q as { name?: string }).name === 'string'
            ) {
              return ((q as { name?: string }).name as string).toLowerCase();
            }
          }
          return '';
        };
        valA = getQualityName(a.quality);
        valB = getQualityName(b.quality);
      } else if (sortKey === 'path') {
        valA = (a.originalFilePath ?? '').toLowerCase();
        valB = (b.originalFilePath ?? '').toLowerCase();
      } else if (sortKey.toLowerCase().includes('date')) {
        valA =
          typeof a[sortKey] === 'string' || typeof a[sortKey] === 'number'
            ? new Date(a[sortKey] as string | number).getTime()
            : 0;
        valB =
          typeof b[sortKey] === 'string' || typeof b[sortKey] === 'number'
            ? new Date(b[sortKey] as string | number).getTime()
            : 0;
      } else if (sortKey === 'size') {
        valA =
          typeof a[sortKey] === 'number'
            ? (a[sortKey] as number)
            : parseFloat(String(a[sortKey])) || 0;
        valB =
          typeof b[sortKey] === 'number'
            ? (b[sortKey] as number)
            : parseFloat(String(b[sortKey])) || 0;
      } else {
        valA = a[sortKey]?.toString().toLowerCase?.() ?? '';
        valB = b[sortKey]?.toString().toLowerCase?.() ?? '';
      }
      if (valA < valB) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (valA > valB) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  getSelectedIds = () => {
    if (this.state.allUnselected) {
      return [];
    }
    return getSelectedIds(this.state.selectedState);
  };

  setSelectedState() {
    const { items } = this.props;
    const { selectedState } = this.state;
    const newSelectedState: Record<number, boolean> = {};
    items.forEach((file) => {
      newSelectedState[file.id as number] =
        selectedState[file.id as number] || false;
    });
    const selectedCount = getSelectedIds(newSelectedState).length;
    const totalCount = items.length;
    this.setState({
      selectedState: newSelectedState,
      allSelected: selectedCount === totalCount,
      allUnselected: selectedCount === 0,
    });
  }

  onSelectAllChange = ({ value }: { value: boolean }) => {
    this.setState(selectAll(this.state.selectedState, value));
  };

  onSelectAllPress = () => {
    this.onSelectAllChange({ value: !this.state.allSelected });
  };

  onSelectedChange = ({
    id,
    value,
    shiftKey = false,
  }: {
    id: number;
    value: boolean;
    shiftKey?: boolean;
  }) => {
    this.setState((state, props) => {
      // toggleSelected returns a new state object
      return toggleSelected(
        state,
        props.items,
        id,
        value,
        shiftKey
      ) as UnmappedFilesTableState;
    });
  };

  onDeleteUnmappedFilesPress = () => {
    const selectedIds = this.getSelectedIds();
    this.props.deleteUnmappedFiles(selectedIds);
  };

  rowRenderer = ({
    key,
    rowIndex,
    style,
  }: {
    key: string;
    rowIndex: number;
    style: React.CSSProperties;
  }) => {
    const { columns, deleteUnmappedFile } = this.props;
    const { selectedState } = this.state;
    const item = this.getSortedItems()[rowIndex];
    return (
      <VirtualTableRow key={key} style={style} className={styles.row}>
        <UnmappedFilesTableRow
          key={item.id}
          columns={columns}
          isSelected={selectedState[item.id]}
          deleteUnmappedFile={deleteUnmappedFile}
          onSelectedChange={
            this.onSelectedChange as (args: {
              id: number | string;
              value: boolean;
              shiftKey?: boolean;
            }) => void
          }
          {...item}
          mediaInfo={item.mediaInfo}
          quality={item.quality as import('Quality/Quality').QualityModel}
        />
      </VirtualTableRow>
    );
  };

  render() {
    const {
      isFetching,
      isPopulated,
      isDeleting,
      error,
      items,
      columns,
      onTableOptionChange,
      isScanningFolders,
      isCleaningUnmappedFiles,
      onAddScenesPress,
      onCleanUnmappedFilesPress,
      deleteUnmappedFiles,
      ...otherProps
    } = this.props;
    const { allSelected, allUnselected, sortKey, sortDirection } = this.state;
    const selectedTrackFileIds = this.getSelectedIds();
    const sortedItems = this.getSortedItems();
    return (
      <PageContent title={translate('UnmappedFiles')}>
        <PageToolbar>
          <PageToolbarSection>
            <PageToolbarButton
              label={translate('ImportScenes')}
              title={translate('ImportScenesTooltip')}
              iconName={icons.ADD}
              isSpinning={isScanningFolders}
              onPress={onAddScenesPress}
            />
            <PageToolbarButton
              label={translate('CleanUnmappedFiles')}
              title={translate('CleanUnmappedFilesTooltip')}
              iconName={icons.CLEAN}
              isSpinning={isCleaningUnmappedFiles}
              isDisabled={!isPopulated || items.length === 0}
              onPress={onCleanUnmappedFilesPress}
            />
            <PageToolbarButton
              label={translate('DeleteSelected')}
              iconName={icons.DELETE}
              isDisabled={selectedTrackFileIds.length === 0}
              isSpinning={isDeleting}
              onPress={this.onDeleteUnmappedFilesPress}
            />
          </PageToolbarSection>
          <PageToolbarSection alignContent={align.RIGHT}>
            <TableOptionsModalWrapper
              {...otherProps}
              columns={columns}
              onTableOptionChange={onTableOptionChange}
            >
              <PageToolbarButton
                label={translate('Options')}
                iconName={icons.TABLE}
              />
            </TableOptionsModalWrapper>
          </PageToolbarSection>
        </PageToolbar>
        <PageContentBody ref={this.scrollerRef}>
          {isFetching && !isPopulated && <LoadingIndicator />}
          <div>
            {!isPopulated && !isFetching && !error ? (
              <Alert kind="success">
                <div id="AllScannedItemsMapped">
                  {translate('AllScannedItemsMapped')}
                </div>
              </Alert>
            ) : null}
          </div>
          {isPopulated &&
          !error &&
          !!items.length &&
          this.scrollerRef.current ? (
            <VirtualTable<UnmappedFile>
              header={
                <UnmappedFilesTableHeader
                  columns={columns}
                  sortKey={sortKey === null ? undefined : sortKey}
                  sortDirection={
                    sortDirection === null ? undefined : sortDirection
                  }
                  allSelected={allSelected}
                  allUnselected={allUnselected}
                  onSortColumnPress={this.onSortColumnPress}
                  onTableOptionChange={onTableOptionChange}
                  onSelectAllChange={this.onSelectAllChange}
                />
              }
              items={sortedItems}
              scroller={this.scrollerRef.current}
              isSmallScreen={false}
              rowRenderer={this.rowRenderer}
            />
          ) : null}
          <div>
            <Alert kind="info">
              <div className={styles.sceneImportHaveMore}>
                {translate('SceneImportHaveMore')}
              </div>
              <div className={styles.sceneImportStep}>
                {translate('SceneImportStep1')}
              </div>
              <div className={styles.sceneImportStep}>
                {translate('SceneImportStep2')}
              </div>
              <div className={styles.sceneImportStep}>
                {translate('SceneImportStep3')}
              </div>
              <div className={styles.sceneImportStep}>
                {translate('SceneImportStep4')}
              </div>
              <div className={styles.sceneImportNote}>
                {translate('SceneImportNote')}
              </div>
            </Alert>
            <div>
              <Alert kind="info">
                <div className={styles.folderStructureHeading}>
                  {translate('YourFolderStructureShouldLookLikeThis')}:
                </div>
                <code className={styles.folderStructure}>
                  {`${translate('RootFolder')}\n`}
                  {`├─ ${translate(
                    'SceneImportImportDropYourScenesFilesHere'
                  )}\n`}
                  {`├─ ${translate('SceneImportMovieFilesWillBeHere')}\n`}
                  {`└─ ${translate('SceneImportSceneFilesWillBeHere')}`}
                </code>
              </Alert>
            </div>
          </div>
        </PageContentBody>
      </PageContent>
    );
  }
}

export default UnmappedFilesTable;
