import classNames from 'classnames';
import React, { useCallback } from 'react';
import { ConnectDragSource } from 'react-dnd';
import CheckInput from 'Components/Form/CheckInput';
import Icon from 'Components/Icon';
import IconButton from 'Components/Link/IconButton';
import { icons } from 'Helpers/Props';
import { CheckInputChanged } from 'typings/inputs';
import translate from 'Utilities/String/translate';
import styles from './QualityProfileItem.css';

export interface QualityProfileItemProps {
  editGroups?: boolean;
  isPreview?: boolean;
  groupId?: number;
  qualityId: number;
  name: string;
  allowed: boolean;
  isDragging: boolean;
  // The drag preview renders the quality without a drag handle to connect.
  connectDragSource?: ConnectDragSource;
  onCreateGroupPress?: (qualityId: number) => void;
  onQualityProfileItemAllowedChange?: (
    qualityId: number,
    allowed: boolean
  ) => void;
}

function QualityProfileItem({
  editGroups,
  isPreview = false,
  groupId,
  qualityId,
  name,
  allowed,
  isDragging,
  connectDragSource,
  onCreateGroupPress,
  onQualityProfileItemAllowedChange,
}: Readonly<QualityProfileItemProps>) {
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
      className={classNames(
        styles.qualityProfileItem,
        isDragging && styles.isDragging,
        isPreview && styles.isPreview,
        groupId && styles.isInGroup
      )}
    >
      <label className={styles.qualityNameContainer}>
        {editGroups && !groupId && !isPreview && (
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

      {!!connectDragSource &&
        connectDragSource(
          <div className={styles.dragHandle}>
            <Icon
              className={styles.dragIcon}
              title={translate('CreateGroup')}
              name={icons.REORDER}
            />
          </div>
        )}
    </div>
  );
}

export default QualityProfileItem;
