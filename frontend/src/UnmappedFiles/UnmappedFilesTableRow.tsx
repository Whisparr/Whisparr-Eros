type HandleSelectedChangeOptions = {
  id: number | string;
  value: boolean | null;
  shiftKey: boolean;
};
import React, { Component } from 'react';
import IconButton from 'Components/Link/IconButton';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import RelativeDateCell from 'Components/Table/Cells/RelativeDateCell';
import VirtualTableRowCell from 'Components/Table/Cells/VirtualTableRowCell';
import VirtualTableSelectCell from 'Components/Table/Cells/VirtualTableSelectCell';
import { icons, kinds } from 'Helpers/Props';
import InteractiveImportModal from 'InteractiveImport/InteractiveImportModal';
import MovieQuality from 'Movie/MovieQuality';
import FileDetailsModal from 'MovieFile/FileDetailsModal';
import { QualityModel } from 'Quality/Quality';
import MediaInfo from 'typings/MediaInfo';
import formatBytes from 'Utilities/Number/formatBytes';
import translate from 'Utilities/String/translate';
import styles from './UnmappedFilesTableRow.css';

interface UnmappedFilesTableRowProps {
  id: number;
  originalFilePath: string;
  size: number;
  quality: QualityModel;
  dateAdded: string;
  mediaInfo: MediaInfo;
  columns: Array<{ name: string; isVisible: boolean }>;
  isSelected?: boolean;
  onSelectedChange: (args: {
    id: number | string;
    value: boolean;
    shiftKey?: boolean;
  }) => void;
  deleteUnmappedFile: (id: number) => void;
  [key: string]: unknown;
}

interface UnmappedFilesTableRowState {
  isDetailsModalOpen: boolean;
  isInteractiveImportModalOpen: boolean;
  isConfirmDeleteModalOpen: boolean;
  sortColumn: string | null;
  sortDirection: 'asc' | 'desc';
}

class UnmappedFilesTableRow extends Component<
  UnmappedFilesTableRowProps,
  UnmappedFilesTableRowState
> {
  constructor(props: UnmappedFilesTableRowProps, context?: unknown) {
    super(props, context);
    this.state = {
      isDetailsModalOpen: false,
      isInteractiveImportModalOpen: false,
      isConfirmDeleteModalOpen: false,
      sortColumn: null,
      sortDirection: 'asc',
    };
  }

  onSelectedChangeHandler = (options: HandleSelectedChangeOptions) => {
    this.props.onSelectedChange({
      id: options.id,
      value: options.value ?? false,
      shiftKey: options.shiftKey,
    });
  };

  onDetailsPress = () => {
    this.setState({ isDetailsModalOpen: true });
  };

  onDetailsModalClose = () => {
    this.setState({ isDetailsModalOpen: false });
  };

  onInteractiveImportPress = () => {
    this.setState({ isInteractiveImportModalOpen: true });
  };

  onInteractiveImportModalClose = () => {
    this.setState({ isInteractiveImportModalOpen: false });
  };

  onDeleteFilePress = () => {
    this.setState({ isConfirmDeleteModalOpen: true });
  };

  onConfirmDelete = () => {
    this.setState({ isConfirmDeleteModalOpen: false });
    this.props.deleteUnmappedFile(this.props.id);
  };

  onConfirmDeleteModalClose = () => {
    this.setState({ isConfirmDeleteModalOpen: false });
  };

  render() {
    const {
      id,
      originalFilePath,
      size,
      dateAdded,
      mediaInfo,
      quality,
      columns,
      isSelected,
    } = this.props;

    const folder = originalFilePath.substring(
      0,
      Math.max(
        originalFilePath.lastIndexOf('/'),
        originalFilePath.lastIndexOf('\\')
      )
    );

    const {
      isInteractiveImportModalOpen,
      isDetailsModalOpen,
      isConfirmDeleteModalOpen,
    } = this.state;

    return (
      <>
        {columns.map((column) => {
          const { name, isVisible } = column;
          if (!isVisible) {
            return null;
          }
          // Type-safe dynamic CSS module access
          const cellClass = (styles as unknown as Record<string, string>)[name];
          if (name === 'select') {
            return (
              <VirtualTableSelectCell
                key={name}
                inputClassName={
                  (styles as unknown as Record<string, string>).checkInput
                }
                id={id}
                isSelected={isSelected}
                isDisabled={false}
                onSelectedChange={this.onSelectedChangeHandler}
              />
            );
          }
          if (name === 'path') {
            return (
              <VirtualTableRowCell
                key={name}
                className={cellClass}
                title={originalFilePath?.toString() ?? ''}
              >
                {originalFilePath}
              </VirtualTableRowCell>
            );
          }
          if (name === 'size') {
            return (
              <VirtualTableRowCell key={name} className={cellClass}>
                {formatBytes(size)}
              </VirtualTableRowCell>
            );
          }
          if (name === 'dateAdded') {
            return (
              <RelativeDateCell
                key={name}
                className={cellClass}
                date={dateAdded}
                component={VirtualTableRowCell}
              />
            );
          }
          if (name === 'quality') {
            return (
              <VirtualTableRowCell key={name} className={cellClass}>
                <MovieQuality quality={quality} />
              </VirtualTableRowCell>
            );
          }
          if (name === 'actions') {
            return (
              <VirtualTableRowCell key={name} className={cellClass}>
                <IconButton
                  name={icons.INFO}
                  aria-label={translate('Details')}
                  onPress={this.onDetailsPress}
                />
                <IconButton
                  name={icons.INTERACTIVE}
                  aria-label={translate('ManualImport')}
                  onPress={this.onInteractiveImportPress}
                />
                <IconButton
                  name={icons.DELETE}
                  aria-label={translate('Delete')}
                  onPress={this.onDeleteFilePress}
                />
              </VirtualTableRowCell>
            );
          }
          return null;
        })}

        <InteractiveImportModal
          isOpen={isInteractiveImportModalOpen}
          folder={folder}
          showFilterExistingFiles={true}
          filterExistingFiles={true}
          showImportMode={false}
          onModalClose={this.onInteractiveImportModalClose}
        />

        <FileDetailsModal
          isOpen={isDetailsModalOpen}
          mediaInfo={mediaInfo}
          onModalClose={this.onDetailsModalClose}
        />

        <ConfirmModal
          isOpen={isConfirmDeleteModalOpen}
          kind={kinds.DANGER}
          title={translate('DeleteSelectedMovieFiles')}
          message={translate('DeleteSelectedMovieFilesHelpText', {
            file: originalFilePath,
          })}
          confirmLabel={translate('Delete')}
          onConfirm={this.onConfirmDelete}
          onCancel={this.onConfirmDeleteModalClose}
        />
      </>
    );
  }
}

export default UnmappedFilesTableRow;
