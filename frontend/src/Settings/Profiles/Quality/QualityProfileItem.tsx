import { useSortable } from '@dnd-kit/react/sortable';
import classNames from 'classnames';
import React, { useCallback } from 'react';
import CheckInput from 'Components/Form/CheckInput';
import Icon from 'Components/Icon';
import IconButton from 'Components/Link/IconButton';
import { icons } from 'Helpers/Props';
import { CheckInputChanged } from 'typings/inputs';
import translate from 'Utilities/String/translate';
import { qualityKey, ROOT_CONTAINER } from './useQualityProfileDnd';
import styles from './QualityProfileItem.module.css';

export interface QualityProfileItemProps {
  editGroups?: boolean;
  // The sortable container this quality sits in: the root list or a group.
  containerId: string;
  index: number;
  groupId?: number;
  qualityId: number;
  name: string;
  allowed: boolean;
  onCreateGroupPress?: (qualityId: number) => void;
  onQualityProfileItemAllowedChange?: (
    qualityId: number,
    allowed: boolean
  ) => void;
}

function QualityProfileItem({
  editGroups,
  containerId,
  index,
  groupId,
  qualityId,
  name,
  allowed,
  onCreateGroupPress,
  onQualityProfileItemAllowedChange,
}: Readonly<QualityProfileItemProps>) {
  // A quality in the root list can land on anything; one inside a group only
  // swaps places with other qualities.
  const { ref, handleRef, isDragging } = useSortable({
    id: qualityKey(qualityId),
    index,
    group: containerId,
    type: 'quality',
    accept: containerId === ROOT_CONTAINER ? undefined : ['quality'],
  });

  const handleAllowedChange = useCallback(
    ({ value }: CheckInputChanged) => {
      onQualityProfileItemAllowedChange?.(qualityId, value);
    },
    [qualityId, onQualityProfileItemAllowedChange]
  );

  const handleCreateGroupPress = useCallback(() => {
    onCreateGroupPress?.(qualityId);
  }, [qualityId, onCreateGroupPress]);

  return (
    <div
      ref={ref}
      className={classNames(
        styles.qualityProfileItem,
        isDragging && styles.isDragging,
        groupId && styles.isInGroup
      )}
    >
      <label className={styles.qualityNameContainer}>
        {editGroups && !groupId && (
          <IconButton
            className={styles.createGroupButton}
            name={icons.GROUP}
            title={translate('Group')}
            onPress={handleCreateGroupPress}
          />
        )}

        {!editGroups && (
          <CheckInput
            className={styles.checkInput}
            containerClassName={styles.checkInputContainer}
            name={name}
            value={allowed}
            isDisabled={!!groupId}
            onChange={handleAllowedChange}
          />
        )}

        <div
          className={classNames(
            styles.qualityName,
            groupId && styles.isInGroup,
            !allowed && styles.notAllowed
          )}
        >
          {name}
        </div>
      </label>

      <div ref={handleRef} className={styles.dragHandle}>
        <Icon
          className={styles.dragIcon}
          title={translate('CreateGroup')}
          name={icons.REORDER}
        />
      </div>
    </div>
  );
}

export default QualityProfileItem;
