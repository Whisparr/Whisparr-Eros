import React from 'react';
import Icon from 'Components/Icon';
import {
  createOptionsStore,
  PageableOptions,
} from 'Helpers/Hooks/useOptionsStore';
import { icons } from 'Helpers/Props';
import translate from 'Utilities/String/translate';

export type HistoryOptions = PageableOptions;

const { useOptions, useOption, setOptions, setOption, setSort } =
  createOptionsStore<HistoryOptions>('history_options', () => {
    return {
      pageSize: 20,
      selectedFilterKey: 'all',
      sortKey: 'date',
      sortDirection: 'descending',
      columns: [
        {
          name: 'eventType',
          label: '',
          columnLabel: () => translate('EventType'),
          isVisible: true,
          isModifiable: false,
        },
        {
          name: 'movieMetadata.sortTitle',
          label: () => translate('Movie'),
          isSortable: true,
          isVisible: true,
        },
        {
          name: 'languages',
          label: () => translate('Languages'),
          isSortable: true,
          isVisible: true,
        },
        {
          name: 'quality',
          label: () => translate('Quality'),
          isSortable: true,
          isVisible: true,
        },
        {
          name: 'customFormats',
          label: () => translate('Formats'),
          isSortable: false,
          isVisible: true,
        },
        {
          name: 'date',
          label: () => translate('Date'),
          isSortable: true,
          isVisible: true,
        },
        {
          name: 'downloadClient',
          label: () => translate('DownloadClient'),
          isVisible: false,
        },
        {
          name: 'indexer',
          label: () => translate('Indexer'),
          isVisible: false,
        },
        {
          name: 'releaseGroup',
          label: () => translate('ReleaseGroup'),
          isVisible: false,
        },
        {
          name: 'sourceTitle',
          label: () => translate('SourceTitle'),
          isVisible: false,
        },
        {
          name: 'customFormatScore',
          columnLabel: () => translate('CustomFormatScore'),
          label: React.createElement(Icon, {
            name: icons.SCORE,
            title: () => translate('CustomFormatScore'),
          }),
          isVisible: false,
        },
        {
          name: 'details',
          label: '',
          columnLabel: () => translate('Details'),
          isVisible: true,
          isModifiable: false,
        },
      ],
    };
  });

export const useHistoryOptions = useOptions;
export const useHistoryOption = useOption;
export const setHistoryOptions = setOptions;
export const setHistoryOption = setOption;
export const setHistorySort = setSort;
