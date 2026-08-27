import { useMemo } from 'react';
import {
  useManageProviderSettings,
  useProviderSettings,
} from 'Settings/useProviderSettings';
import Metadata from 'typings/Metadata';
import sortByProp from 'Utilities/Array/sortByProp';

export const METADATA_PATH = '/metadata';

export const useMetadata = () => {
  return useProviderSettings<Metadata>(METADATA_PATH);
};

export const useSortedMetadata = () => {
  const { data } = useMetadata();

  return useMemo(() => [...data].sort(sortByProp('name')), [data]);
};

// The consumers cannot be added, deleted or tested -- the list is whatever
// implementations the server ships -- so this is `useManageProviderSettings`
// with nothing seeded and nothing dropped. There is no schema query and no
// `id === 0` case, which is why no `defaultMetadata` is needed: `useProvider`
// only reaches for one when the id is zero, and nothing here passes zero.
export const useManageMetadata = (id: number) => {
  const { testProvider, isTesting, ...manage } =
    useManageProviderSettings<Metadata>(id, {} as Metadata, METADATA_PATH);

  return manage;
};
