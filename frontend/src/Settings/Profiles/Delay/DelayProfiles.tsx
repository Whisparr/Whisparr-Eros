import React, { useCallback, useMemo, useState } from 'react';
import FieldSet from 'Components/FieldSet';
import Icon from 'Components/Icon';
import Link from 'Components/Link/Link';
import PageSectionContent from 'Components/Page/PageSectionContent';
import Scroller from 'Components/Scroller/Scroller';
import useMeasure from 'Helpers/Hooks/useMeasure';
import useModalOpenState from 'Helpers/Hooks/useModalOpenState';
import { icons, scrollDirections } from 'Helpers/Props';
import { useTagList } from 'Tags/useTags';
import sortByProp from 'Utilities/Array/sortByProp';
import translate from 'Utilities/String/translate';
import DelayProfile from './DelayProfile';
import DelayProfileDragPreview from './DelayProfileDragPreview';
import DelayProfileDragSource from './DelayProfileDragSource';
import EditDelayProfileModal from './EditDelayProfileModal';
import {
  DEFAULT_DELAY_PROFILE_ID,
  useDelayProfiles,
  useReorderDelayProfile,
} from './useDelayProfiles';
import styles from './DelayProfiles.css';

function DelayProfiles() {
  const { data, isFetching, isFetched, error } = useDelayProfiles();
  const tagList = useTagList();
  const reorderDelayProfile = useReorderDelayProfile();

  const [measureRef, { width }] = useMeasure();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

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

  const handleDelayProfileDragMove = useCallback(
    (dragIndex: number, dropIndex: number) => {
      setDragIndex(dragIndex);
      setDropIndex(dropIndex);
    },
    []
  );

  const handleDelayProfileDragEnd = useCallback(
    (id: number, didDrop: boolean) => {
      if (didDrop && dropIndex !== null) {
        reorderDelayProfile(id, dropIndex - 1);
      }

      setDragIndex(null);
      setDropIndex(null);
    },
    [dropIndex, reorderDelayProfile]
  );

  const isDragging = dropIndex !== null;
  const isDraggingUp = isDragging && dropIndex < (dragIndex ?? 0);
  const isDraggingDown = isDragging && dropIndex > (dragIndex ?? 0);

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
          <div ref={measureRef}>
            <div className={styles.delayProfilesHeader}>
              <div className={styles.column}>
                {translate('PreferredProtocol')}
              </div>
              <div className={styles.column}>{translate('UsenetDelay')}</div>
              <div className={styles.column}>{translate('TorrentDelay')}</div>
              <div className={styles.tags}>{translate('Tags')}</div>
            </div>

            <div className={styles.delayProfiles}>
              {items.map((item) => {
                return (
                  <DelayProfileDragSource
                    key={item.id}
                    delayProfile={item}
                    tagList={tagList}
                    isDraggingUp={isDraggingUp}
                    isDraggingDown={isDraggingDown}
                    onDelayProfileDragMove={handleDelayProfileDragMove}
                    onDelayProfileDragEnd={handleDelayProfileDragEnd}
                  />
                );
              })}

              <DelayProfileDragPreview width={width} />
            </div>

            {defaultProfile ? (
              <div>
                <DelayProfile
                  delayProfile={defaultProfile}
                  tagList={tagList}
                  isDragging={false}
                />
              </div>
            ) : null}
          </div>
        </Scroller>

        <div className={styles.addDelayProfile}>
          <Link
            className={styles.addButton}
            onPress={setAddDelayProfileModalOpen}
          >
            <Icon name={icons.ADD} />
          </Link>
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
