import classNames from 'classnames';
import React, { useCallback } from 'react';
import { ConnectDragSource } from 'react-dnd';
import CheckInput from 'Components/Form/CheckInput';
import TextInput from 'Components/Form/TextInput';
import Icon from 'Components/Icon';
import Label from 'Components/Label';
import IconButton from 'Components/Link/IconButton';
import { icons } from 'Helpers/Props';
import { CheckInputChanged, InputChanged } from 'typings/inputs';
import { QualityProfileQualityItem } from 'typings/QualityProfile';
import translate from 'Utilities/String/translate';
import QualityProfileItemDragSource, {
  DragMoveOptions,
} from './QualityProfileItemDragSource';
import styles from './QualityProfileItemGroup.css';

export interface QualityProfileItemGroupProps {
  editGroups?: boolean;
  groupId: number;
  name: string;
  allowed: boolean;
  items: QualityProfileQualityItem[];
  qualityIndex: string;
  isDragging: boolean;
  isDraggingUp: boolean;
  isDraggingDown: boolean;
  // The drag preview renders the group without a drag handle to connect.
  connectDragSource?: ConnectDragSource;
  // A group can only hold qualities, so the sources below never need the
  // handlers that act on a group.
  onItemGroupAllowedChange?: (groupId: number, allowed: boolean) => void;
  onItemGroupNameChange?: (groupId: number, name: string) => void;
  onDeleteGroupPress?: (groupId: number) => void;
  onQualityProfileItemAllowedChange: (
    qualityId: number,
    allowed: boolean
  ) => void;
  onQualityProfileItemDragMove: (options: DragMoveOptions) => void;
  onQualityProfileItemDragEnd: (didDrop: boolean) => void;
}

function QualityProfileItemGroup({
  editGroups,
  groupId,
  name,
  allowed,
  items,
  qualityIndex,
  isDragging,
  isDraggingUp,
  isDraggingDown,
  connectDragSource,
  onItemGroupAllowedChange,
  onItemGroupNameChange,
  onDeleteGroupPress,
  onQualityProfileItemAllowedChange,
  onQualityProfileItemDragMove,
  onQualityProfileItemDragEnd,
}: Readonly<QualityProfileItemGroupProps>) {
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
                {items
                  .map(({ quality }) => {
                    return <Label key={quality.id}>{quality.name}</Label>;
                  })
                  .reverse()}
              </div>
            </div>
          </label>
        )}

        {!!connectDragSource &&
          connectDragSource(
            <div className={styles.dragHandle}>
              <Icon
                className={styles.dragIcon}
                name={icons.REORDER}
                title={translate('Reorder')}
              />
            </div>
          )}
      </div>

      {editGroups && (
        <div className={styles.items}>
          {items
            .map(({ quality }, index) => {
              return (
                <QualityProfileItemDragSource
                  key={quality.id}
                  editGroups={editGroups}
                  groupId={groupId}
                  qualityId={quality.id}
                  name={quality.name}
                  allowed={allowed}
                  items={items}
                  qualityIndex={`${qualityIndex}.${index + 1}`}
                  isDraggingUp={isDraggingUp}
                  isDraggingDown={isDraggingDown}
                  onQualityProfileItemAllowedChange={
                    onQualityProfileItemAllowedChange
                  }
                  onQualityProfileItemDragMove={onQualityProfileItemDragMove}
                  onQualityProfileItemDragEnd={onQualityProfileItemDragEnd}
                />
              );
            })
            .reverse()}
        </div>
      )}
    </div>
  );
}

export default QualityProfileItemGroup;
