import React from 'react';
import Icon from 'Components/Icon';
import {
  createOptionsStore,
  PageableOptions,
} from 'Helpers/Hooks/useOptionsStore';
import { icons } from 'Helpers/Props';
import translate from 'Utilities/String/translate';

export interface QueueOptions extends PageableOptions {
  // Sonarr dropped this in favour of an `excludeUnknownSeriesItems` filter.
  // Eros still exposes it as a checkbox in QueueOptions, and the sidebar badge
  // derives its count from it.
  includeUnknownMovieItems: boolean;
}

const { useOptions, useOption, setOptions, setOption, setSort } =
  createOptionsStore<QueueOptions>('queue_options', (): QueueOptions => {
    return {
      pageSize: 20,
      selectedFilterKey: 'all',
      sortKey: 'timeleft',
      sortDirection: 'ascending',
      includeUnknownMovieItems: true,
      columns: [
        {
          name: 'status',
          label: '',
          columnLabel: () => translate('Status'),
          isSortable: true,
          isVisible: true,
          isModifiable: 'onlyPosition',
        },
        {
          name: 'movies.sortTitle',
          label: () => translate('Movie'),
          isSortable: true,
          isVisible: true,
        },
        {
          name: 'year',
          label: () => translate('Year'),
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
          name: 'customFormatScore',
          columnLabel: () => translate('CustomFormatScore'),
          label: React.createElement(Icon, {
            name: icons.SCORE,
            title: () => translate('CustomFormatScore'),
          }),
          isSortable: true,
          isVisible: false,
        },
        {
          name: 'protocol',
          label: () => translate('Protocol'),
          isSortable: true,
          isVisible: false,
        },
        {
          name: 'indexer',
          label: () => translate('Indexer'),
          isSortable: true,
          isVisible: false,
        },
        {
          name: 'downloadClient',
          label: () => translate('DownloadClient'),
          isSortable: true,
          isVisible: false,
        },
        {
          name: 'size',
          label: () => translate('Size'),
          isSortable: true,
          isVisible: false,
        },
        {
          name: 'title',
          label: () => translate('ReleaseTitle'),
          isSortable: true,
          isVisible: false,
        },
        {
          name: 'outputPath',
          label: () => translate('OutputPath'),
          isSortable: false,
          isVisible: false,
        },
        {
          name: 'estimatedCompletionTime',
          label: () => translate('Timeleft'),
          isSortable: true,
          isVisible: true,
        },
        {
          name: 'added',
          label: () => translate('Added'),
          isSortable: true,
          isVisible: false,
        },
        {
          name: 'progress',
          label: () => translate('Progress'),
          isSortable: true,
          isVisible: true,
        },
        {
          name: 'actions',
          label: '',
          columnLabel: () => translate('Actions'),
          isSortable: false,
          isVisible: true,
          isModifiable: 'onlyPosition',
        },
      ],
    };
  });

export const useQueueOptions = useOptions;
export const useQueueOption = useOption;
export const setQueueOptions = setOptions;
export const setQueueOption = setOption;
export const setQueueSort = setSort;
