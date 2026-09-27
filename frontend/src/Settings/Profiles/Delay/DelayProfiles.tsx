import { move } from '@dnd-kit/helpers';
import { DragDropProvider, DragEndEvent, DragOverEvent } from '@dnd-kit/react';
import React, { useCallback, useMemo, useState } from 'react';
import FieldSet from 'Components/FieldSet';
import IconButton from 'Components/Link/IconButton';
import PageSectionContent from 'Components/Page/PageSectionContent';
import Scroller from 'Components/Scroller/Scroller';
import useModalOpenState from 'Helpers/Hooks/useModalOpenState';
import { icons, scrollDirections } from 'Helpers/Props';
import { useTagList } from 'Tags/useTags';
import sortByProp from 'Utilities/Array/sortByProp';
import translate from 'Utilities/String/translate';
import DelayProfile from './DelayProfile';
import EditDelayProfileModal from './EditDelayProfileModal';
import {
  DEFAULT_DELAY_PROFILE_ID,
  DelayProfile as DelayProfileModel,
  useDelayProfiles,
  useReorderDelayProfile,
} from './useDelayProfiles';
import styles from './DelayProfiles.css';

function DelayProfiles() {
  const { data, isFetching, isFetched, error } = useDelayProfiles();
  const tagList = useTagList();
  const reorderDelayProfile = useReorderDelayProfile();

  // The list is reordered locally while a profile is dragged; the server is
  // only told where it landed once the drag ends.
  const [localItems, setLocalItems] = useState<DelayProfileModel[] | null>(
    null
  );

  const [
    isAddDelayProfileModalOpen,
    setAddDelayProfileModalOpen,
    setAddDelayProfileModalClosed,
  ] = useModalOpenState(false);

  const defaultProfile = useMemo(() => {
    return data.find(
      (delayProfile) => delayProfile.id === DEFAULT_DELAY_PROFILE_ID
    );
  }, [data]);

  const items = useMemo(() => {
    return data
      .filter((delayProfile) => delayProfile.id !== DEFAULT_DELAY_PROFILE_ID)
      .sort(sortByProp('order'));
  }, [data]);

  const displayedItems = localItems ?? items;

  const handleDragStart = useCallback(() => {
    setLocalItems([...items]);
  }, [items]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    setLocalItems((current) => (current ? move(current, event) : current));
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setLocalItems((current) => {
        if (current && !event.canceled) {
          const moved = move(current, event);
          const id = event.operation.source?.id as number | undefined;
          const index = moved.findIndex((item) => item.id === id);

          // Dropped where it started, so there is nothing to save.
          if (id !== undefined && index !== -1 && items[index]?.id !== id) {
            reorderDelayProfile(
              id,
              index > 0 ? moved[index - 1].id : undefined
            );
          }
        }

        return null;
      });
    },
    [items, reorderDelayProfile]
  );

  return (
    <FieldSet legend={translate('DelayProfiles')}>
      <PageSectionContent
        errorMessage={translate('DelayProfilesLoadError')}
        isFetching={isFetching}
        isPopulated={isFetched}
        error={error ?? undefined}
      >
        <Scroller
          className={styles.horizontalScroll}
          scrollDirection={scrollDirections.HORIZONTAL}
          autoFocus={false}
        >
          <div>
            <div className={styles.delayProfilesHeader}>
              <div className={styles.column}>
                {translate('PreferredProtocol')}
              </div>
              <div className={styles.column}>{translate('UsenetDelay')}</div>
              <div className={styles.column}>{translate('TorrentDelay')}</div>
              <div className={styles.tags}>{translate('Tags')}</div>
            </div>

            <DragDropProvider
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <div className={styles.delayProfiles}>
                {displayedItems.map((item, index) => {
                  return (
                    <DelayProfile
                      key={item.id}
                      delayProfile={item}
                      tagList={tagList}
                      index={index}
                    />
                  );
                })}
              </div>
            </DragDropProvider>

            {defaultProfile ? (
              <div>
                <DelayProfile
                  delayProfile={defaultProfile}
                  tagList={tagList}
                  index={-1}
                />
              </div>
            ) : null}
          </div>
        </Scroller>

        <div className={styles.addDelayProfile}>
          <IconButton
            className={styles.addButton}
            name={icons.ADD}
            aria-label={translate('AddDelayProfile')}
            title={translate('AddDelayProfile')}
            onPress={setAddDelayProfileModalOpen}
          />
        </div>

        <EditDelayProfileModal
          isOpen={isAddDelayProfileModalOpen}
          onModalClose={setAddDelayProfileModalClosed}
        />
      </PageSectionContent>
    </FieldSet>
  );
}

export default DelayProfiles;
