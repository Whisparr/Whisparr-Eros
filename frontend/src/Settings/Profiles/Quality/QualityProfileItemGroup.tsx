import { CollisionPriority } from '@dnd-kit/abstract';
import { useDragOperation } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import classNames from 'classnames';
import React, { useCallback } from 'react';
import CheckInput from 'Components/Form/CheckInput';
import TextInput from 'Components/Form/TextInput';
import Icon from 'Components/Icon';
import Label from 'Components/Label';
import IconButton from 'Components/Link/IconButton';
import { icons } from 'Helpers/Props';
import { CheckInputChanged, InputChanged } from 'typings/inputs';
import { QualityProfileQualityItem } from 'typings/QualityProfile';
import translate from 'Utilities/String/translate';
import QualityProfileItem from './QualityProfileItem';
import { groupContainerKey, ROOT_CONTAINER } from './useQualityProfileDnd';
import styles from './QualityProfileItemGroup.css';

export interface QualityProfileItemGroupProps {
  editGroups?: boolean;
  groupId: number;
  name: string;
  allowed: boolean;
  items: QualityProfileQualityItem[];
  index: number;
  // A group can only hold qualities, so the sources below never need the
  // handlers that act on a group.
  onItemGroupAllowedChange?: (groupId: number, allowed: boolean) => void;
  onItemGroupNameChange?: (groupId: number, name: string) => void;
  onDeleteGroupPress?: (groupId: number) => void;
  onQualityProfileItemAllowedChange: (
    qualityId: number,
    allowed: boolean
  ) => void;
}

function QualityProfileItemGroup({
  editGroups,
  groupId,
  name,
  allowed,
  items,
  index,
  onItemGroupAllowedChange,
  onItemGroupNameChange,
  onDeleteGroupPress,
  onQualityProfileItemAllowedChange,
}: Readonly<QualityProfileItemGroupProps>) {
  // While editing groups the qualities inside take priority, so dropping onto
  // a group's items puts a quality into the group rather than beside it.
  const { ref, handleRef, isDragging } = useSortable({
    id: groupContainerKey(groupId),
    index,
    group: ROOT_CONTAINER,
    type: 'group',
    accept: ['quality', 'group'],
    collisionPriority: editGroups
      ? CollisionPriority.Low
      : CollisionPriority.Normal,
  });

  const { source } = useDragOperation();
  const handleAllowedChange = useCallback(
    ({ value }: CheckInputChanged) => {
      onItemGroupAllowedChange?.(groupId, value);
    },
    [groupId, onItemGroupAllowedChange]
  );

  const handleNameChange = useCallback(
    ({ value }: InputChanged<string>) => {
      onItemGroupNameChange?.(groupId, value);
    },
    [groupId, onItemGroupNameChange]
  );

  // The class read a `value` off the press event and passed it on as a second
  // argument; `onPress` is handed a click event, and the modal's handler takes
  // the group id alone.
  const handleDeleteGroupPress = useCallback(() => {
    onDeleteGroupPress?.(groupId);
  }, [groupId, onDeleteGroupPress]);

  return (
    <div
      ref={ref}
      className={classNames(
        styles.qualityProfileItemGroup,
        editGroups && styles.editGroups,
        isDragging && styles.isDragging
      )}
    >
      <div className={styles.qualityProfileItemGroupInfo}>
        {editGroups && (
          <div className={styles.qualityNameContainer}>
            <IconButton
              className={styles.deleteGroupButton}
              name={icons.UNGROUP}
              title={translate('Ungroup')}
              onPress={handleDeleteGroupPress}
            />

            <TextInput
              className={styles.nameInput}
              name="name"
              value={name}
              onChange={handleNameChange}
            />
          </div>
        )}

        {!editGroups && (
          <label className={styles.qualityNameLabel}>
            <CheckInput
              className={styles.checkInput}
              containerClassName={styles.checkInputContainer}
              name="allowed"
              value={allowed}
              onChange={handleAllowedChange}
            />

            <div className={styles.nameContainer}>
              <div
                className={classNames(
                  styles.name,
                  !allowed && styles.notAllowed
                )}
              >
                {name}
              </div>

              <div className={styles.groupQualities}>
                {items.map(({ quality }) => {
                  return <Label key={quality.id}>{quality.name}</Label>;
                })}
              </div>
            </div>
          </label>
        )}

        <div ref={handleRef} className={styles.dragHandle}>
          <Icon
            className={styles.dragIcon}
            name={icons.REORDER}
            title={translate('Reorder')}
          />
        </div>
      </div>

      {editGroups && (
        <div
          className={classNames(styles.items, source && styles.isDragActive)}
        >
          {items.map(({ quality }, subIndex) => {
            return (
              <QualityProfileItem
                key={quality.id}
                editGroups={editGroups}
                containerId={groupContainerKey(groupId)}
                index={subIndex}
                groupId={groupId}
                qualityId={quality.id}
                name={quality.name}
                allowed={allowed}
                onQualityProfileItemAllowedChange={
                  onQualityProfileItemAllowedChange
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default QualityProfileItemGroup;
