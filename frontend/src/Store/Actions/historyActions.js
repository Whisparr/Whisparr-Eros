import React from 'react';
import { createAction } from 'redux-actions';
import Icon from 'Components/Icon';
import {
  filterBuilderTypes,
  filterBuilderValueTypes,
  filterTypes,
  icons,
  sortDirections,
} from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import createHandleActions from './Creators/createHandleActions';
import createSetClientSideCollectionFilterReducer from './Creators/Reducers/createSetClientSideCollectionFilterReducer';
import createSetClientSideCollectionSortReducer from './Creators/Reducers/createSetClientSideCollectionSortReducer';
import createSetTableOptionReducer from './Creators/Reducers/createSetTableOptionReducer';

//
// Variables

export const section = 'history';

//
// State

export const defaultState = {
  isFetching: false,
  isPopulated: false,
  error: null,
  pageSize: 20,
  sortKey: 'date',
  sortDirection: sortDirections.DESCENDING,
  items: [],

  columns: [
    {
      name: 'eventType',
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
      columnLabel: () => translate('Details'),
      isVisible: true,
      isModifiable: false,
    },
  ],

  selectedFilterKey: 'all',

  filters: [
    {
      key: 'all',
      label: () => translate('All'),
      filters: [],
    },
    {
      key: 'grabbed',
      label: () => translate('Grabbed'),
      filters: [
        {
          key: 'eventType',
          value: '1',
          type: filterTypes.EQUAL,
        },
      ],
    },
    {
      key: 'imported',
      label: () => translate('Imported'),
      filters: [
        {
          key: 'eventType',
          value: '3',
          type: filterTypes.EQUAL,
        },
      ],
    },
    {
      key: 'failed',
      label: () => translate('Failed'),
      filters: [
        {
          key: 'eventType',
          value: '4',
          type: filterTypes.EQUAL,
        },
      ],
    },
    {
      key: 'deleted',
      label: () => translate('Deleted'),
      filters: [
        {
          key: 'eventType',
          value: '6',
          type: filterTypes.EQUAL,
        },
      ],
    },
    {
      key: 'renamed',
      label: () => translate('Renamed'),
      filters: [
        {
          key: 'eventType',
          value: '8',
          type: filterTypes.EQUAL,
        },
      ],
    },
    {
      key: 'ignored',
      label: () => translate('Ignored'),
      filters: [
        {
          key: 'eventType',
          value: '9',
          type: filterTypes.EQUAL,
        },
      ],
    },
  ],

  filterBuilderProps: [
    {
      name: 'eventType',
      label: () => translate('EventType'),
      type: filterBuilderTypes.EQUAL,
      valueType: filterBuilderValueTypes.HISTORY_EVENT_TYPE,
    },
    {
      name: 'movieIds',
      label: () => translate('Movie'),
      type: filterBuilderTypes.EQUAL,
      valueType: filterBuilderValueTypes.MOVIE,
    },
    {
      name: 'quality',
      label: () => translate('Quality'),
      type: filterBuilderTypes.EQUAL,
      valueType: filterBuilderValueTypes.QUALITY,
    },
    {
      name: 'languages',
      label: () => translate('Languages'),
      type: filterBuilderTypes.CONTAINS,
      valueType: filterBuilderValueTypes.LANGUAGE,
    },
  ],
};

export const persistState = [
  'history.pageSize',
  'history.sortKey',
  'history.sortDirection',
  'history.selectedFilterKey',
  'history.columns',
];

//
// Action Types

export const SET_HISTORY_SORT = 'history/setHistorySort';
export const SET_HISTORY_FILTER = 'history/setHistoryFilter';
export const SET_HISTORY_TABLE_OPTION = 'history/setHistoryTableOption';

//
// Action Creators

export const setHistorySort = createAction(SET_HISTORY_SORT);
export const setHistoryFilter = createAction(SET_HISTORY_FILTER);
export const setHistoryTableOption = createAction(SET_HISTORY_TABLE_OPTION);

//
// Reducers

export const reducers = createHandleActions(
  {
    [SET_HISTORY_SORT]: createSetClientSideCollectionSortReducer(section),
    [SET_HISTORY_FILTER]: createSetClientSideCollectionFilterReducer(section),
    [SET_HISTORY_TABLE_OPTION]: createSetTableOptionReducer(section),
  },
  defaultState,
  section
);
