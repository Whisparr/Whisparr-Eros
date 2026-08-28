import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import ModelBase from 'App/ModelBase';
import AppState from 'App/State/AppState';
import FieldSet from 'Components/FieldSet';
import Label from 'Components/Label';
import Button from 'Components/Link/Button';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import { kinds } from 'Helpers/Props';
import { useMoviesByIds } from 'Movie/useMovie';
import { useImportListsWithIds } from 'Settings/ImportLists/ImportLists/useImportLists';
import { useIndexersWithIds } from 'Settings/Indexers/Indexers/useIndexers';
import { useNotificationsWithIds } from 'Settings/Notifications/useNotifications';
import { useReleaseProfilesWithIds } from 'Settings/Profiles/Release/useReleaseProfiles';
import { useAutoTaggingsWithIds } from 'Settings/Tags/AutoTagging/useAutoTaggings';
import sortByProp from 'Utilities/Array/sortByProp';
import translate from 'Utilities/String/translate';
import TagDetailsDelayProfile from './TagDetailsDelayProfile';
import styles from './TagDetailsModalContent.css';

function findMatchingItems<T extends ModelBase>(ids: number[], items: T[]) {
  return items.filter((s) => {
    return ids.includes(s.id);
  });
}

function createMatchingItemSelector<T extends ModelBase>(
  ids: number[],
  selector: (state: AppState) => T[]
) {
  return createSelector(selector, (items) => findMatchingItems<T>(ids, items));
}

export interface TagDetailsModalContentProps {
  label: string;
  isTagUsed: boolean;
  delayProfileIds: number[];
  importListIds: number[];
  notificationIds: number[];
  releaseProfileIds: number[];
  indexerIds: number[];
  downloadClientIds: number[];
  autoTagIds: number[];
  movieIds: number[];
  onModalClose: () => void;
  onDeleteTagPress: () => void;
}

function TagDetailsModalContent({
  label,
  isTagUsed,
  delayProfileIds = [],
  importListIds = [],
  notificationIds = [],
  releaseProfileIds = [],
  indexerIds = [],
  downloadClientIds = [],
  autoTagIds = [],
  movieIds = [],
  onModalClose,
  onDeleteTagPress,
}: Readonly<TagDetailsModalContentProps>) {
  // The tag resource names the movies by id only. This read the `movies` slice,
  // which nothing has populated since the indexes went paged, so the Movies
  // fieldset never rendered however many movies carried the tag.
  const { movies: taggedMovies } = useMoviesByIds(movieIds);

  const movies = useMemo(
    () => [...taggedMovies].sort(sortByProp('sortTitle')),
    [taggedMovies]
  );

  const delayProfiles = useSelector(
    createMatchingItemSelector(
      delayProfileIds,
      (state: AppState) => state.settings.delayProfiles.items
    )
  );

  const importLists = useImportListsWithIds(importListIds);

  const notifications = useNotificationsWithIds(notificationIds);

  const releaseProfiles = useReleaseProfilesWithIds(releaseProfileIds);

  const indexers = useIndexersWithIds(indexerIds);

  const downloadClients = useSelector(
    createMatchingItemSelector(
      downloadClientIds,
      (state: AppState) => state.settings.downloadClients.items
    )
  );

  const autoTags = useAutoTaggingsWithIds(autoTagIds);

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>{translate('TagDetails', { label })}</ModalHeader>

      <ModalBody>
        {!isTagUsed && <div>{translate('TagIsNotUsedAndCanBeDeleted')}</div>}

        {movies.length ? (
          <FieldSet legend={translate('Movies')}>
            {movies.map((item) => {
              return <div key={item.id}>{item.title}</div>;
            })}
          </FieldSet>
        ) : null}

        {delayProfiles.length ? (
          <FieldSet legend={translate('DelayProfile')}>
            {delayProfiles.map((item) => {
              const {
                id,
                preferredProtocol,
                enableUsenet,
                enableTorrent,
                usenetDelay,
                torrentDelay,
              } = item;

              return (
                <TagDetailsDelayProfile
                  key={id}
                  preferredProtocol={preferredProtocol}
                  enableUsenet={enableUsenet}
                  enableTorrent={enableTorrent}
                  usenetDelay={usenetDelay}
                  torrentDelay={torrentDelay}
                />
              );
            })}
          </FieldSet>
        ) : null}

        {notifications.length ? (
          <FieldSet legend={translate('Connections')}>
            {notifications.map((item) => {
              return <div key={item.id}>{item.name}</div>;
            })}
          </FieldSet>
        ) : null}

        {importLists.length ? (
          <FieldSet legend={translate('ImportLists')}>
            {importLists.map((item) => {
              return <div key={item.id}>{item.name}</div>;
            })}
          </FieldSet>
        ) : null}

        {releaseProfiles.length ? (
          <FieldSet legend={translate('ReleaseProfiles')}>
            {releaseProfiles.map((item) => {
              return (
                <div key={item.id} className={styles.restriction}>
                  <div>
                    {item.required.map((r) => {
                      return (
                        <Label key={r} kind={kinds.SUCCESS}>
                          {r}
                        </Label>
                      );
                    })}
                  </div>

                  <div>
                    {item.ignored.map((i) => {
                      return (
                        <Label key={i} kind={kinds.DANGER}>
                          {i}
                        </Label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </FieldSet>
        ) : null}

        {indexers.length ? (
          <FieldSet legend={translate('Indexers')}>
            {indexers.map((item) => {
              return <div key={item.id}>{item.name}</div>;
            })}
          </FieldSet>
        ) : null}

        {downloadClients.length ? (
          <FieldSet legend={translate('DownloadClients')}>
            {downloadClients.map((item) => {
              return <div key={item.id}>{item.name}</div>;
            })}
          </FieldSet>
        ) : null}

        {autoTags.length ? (
          <FieldSet legend={translate('AutoTagging')}>
            {autoTags.map((item) => {
              return <div key={item.id}>{item.name}</div>;
            })}
          </FieldSet>
        ) : null}
      </ModalBody>

      <ModalFooter>
        <Button
          className={styles.deleteButton}
          kind={kinds.DANGER}
          title={
            isTagUsed ? translate('TagCannotBeDeletedWhileInUse') : undefined
          }
          isDisabled={isTagUsed}
          onPress={onDeleteTagPress}
        >
          {translate('Delete')}
        </Button>

        <Button onPress={onModalClose}>{translate('Close')}</Button>
      </ModalFooter>
    </ModalContent>
  );
}

export default TagDetailsModalContent;
