import React from 'react';
import Icon from 'Components/Icon';
import IconButton from 'Components/Link/IconButton';
import Column from 'Components/Table/Column';
import { createOptionsStore } from 'Helpers/Hooks/useOptionsStore';
import { icons } from 'Helpers/Props';
import { SortDirection } from 'Helpers/Props/sortDirections';
import translate from 'Utilities/String/translate';

export interface MovieFileEditorOptions {
  columns: Column[];
  sortKey: string;
  sortDirection: SortDirection;
}

const { useOptions, setOptions, setSort } =
  createOptionsStore<MovieFileEditorOptions>(
    'movie_file_editor_options',
    (): MovieFileEditorOptions => {
      return {
        sortKey: 'relativePath',
        sortDirection: 'ascending',
        columns: [
          {
            name: 'relativePath',
            label: () => translate('RelativePath'),
            isVisible: true,
            isSortable: true,
          },
          {
            name: 'videoCodec',
            label: () => translate('VideoCodec'),
            isVisible: true,
          },
          {
            name: 'videoDynamicRangeType',
            label: () => translate('VideoDynamicRange'),
            isVisible: false,
          },
          {
            name: 'audioInfo',
            label: () => translate('AudioInfo'),
            isVisible: true,
          },
          {
            name: 'audioLanguages',
            label: () => translate('AudioLanguages'),
            isVisible: false,
          },
          {
            name: 'subtitleLanguages',
            label: () => translate('SubtitleLanguages'),
            isVisible: false,
          },
          {
            name: 'size',
            label: () => translate('Size'),
            isVisible: true,
            isSortable: true,
          },
          {
            name: 'languages',
            label: () => translate('Languages'),
            isVisible: true,
          },
          {
            name: 'quality',
            label: () => translate('Quality'),
            isVisible: true,
          },
          {
            name: 'releaseGroup',
            label: () => translate('ReleaseGroup'),
            isVisible: true,
          },
          {
            name: 'customFormats',
            label: () => translate('Formats'),
            isVisible: true,
          },
          {
            name: 'customFormatScore',
            columnLabel: () => translate('CustomFormatScore'),
            label: React.createElement(Icon, {
              name: icons.SCORE,
              title: () => translate('CustomFormatScore'),
            }),
            isVisible: true,
            isSortable: true,
          },
          {
            name: 'indexerFlags',
            columnLabel: () => translate('IndexerFlags'),
            label: React.createElement(Icon, {
              name: icons.FLAG,
              title: () => translate('IndexerFlags'),
            }),
            isVisible: false,
          },
          {
            name: 'dateAdded',
            label: () => translate('Added'),
            isVisible: false,
            isSortable: true,
          },
          {
            name: 'actions',
            columnLabel: () => translate('Actions'),
            label: React.createElement(IconButton, {
              name: icons.ADVANCED_SETTINGS,
            }),
            isVisible: true,
            isModifiable: false,
          },
        ],
      };
    }
  );

export const useMovieFileEditorOptions = useOptions;
export const setMovieFileEditorOptions = setOptions;
export const setMovieFileEditorSort = setSort;
