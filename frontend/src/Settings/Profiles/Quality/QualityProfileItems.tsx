import React, { useCallback, useState } from 'react';
import FormGroup from 'Components/Form/FormGroup';
import FormInputHelpText from 'Components/Form/FormInputHelpText';
import FormLabel from 'Components/Form/FormLabel';
import Icon from 'Components/Icon';
import Button from 'Components/Link/Button';
import Measure from 'Components/Measure';
import { Measurements } from 'Helpers/Hooks/useMeasure';
import { icons, kinds, sizes } from 'Helpers/Props';
import { Failure } from 'typings/pending';
import { QualityProfileItem } from 'typings/QualityProfile';
import translate from 'Utilities/String/translate';
import QualityProfileItemDragPreview from './QualityProfileItemDragPreview';
import QualityProfileItemDragSource, {
  DragMoveOptions,
} from './QualityProfileItemDragSource';
import styles from './QualityProfileItems.css';

interface QualityProfileItemsProps {
  editGroups: boolean;
  dropQualityIndex: string | null;
  dropPosition: string | null;
  qualityProfileItems: QualityProfileItem[];
  errors?: Failure[];
  warnings?: Failure[];
  onToggleEditGroupsMode: () => void;
  onCreateGroupPress: (qualityId: number) => void;
  onDeleteGroupPress: (groupId: number) => void;
  onQualityProfileItemAllowedChange: (
    qualityId: number,
    allowed: boolean
  ) => void;
  onItemGroupAllowedChange: (groupId: number, allowed: boolean) => void;
  onItemGroupNameChange: (groupId: number, name: string) => void;
  onQualityProfileItemDragMove: (options: DragMoveOptions) => void;
  onQualityProfileItemDragEnd: (didDrop: boolean) => void;
}

function QualityProfileItems({
  editGroups,
  dropQualityIndex,
  dropPosition,
  qualityProfileItems,
  errors = [],
  warnings = [],
  onToggleEditGroupsMode,
  onCreateGroupPress,
  onDeleteGroupPress,
  onQualityProfileItemAllowedChange,
  onItemGroupAllowedChange,
  onItemGroupNameChange,
  onQualityProfileItemDragMove,
  onQualityProfileItemDragEnd,
}: Readonly<QualityProfileItemsProps>) {
  // The list is measured in both modes and each height kept, so switching modes
  // does not shrink the container back and forth.
  const [qualitiesHeight, setQualitiesHeight] = useState(0);
  const [qualitiesHeightEditGroups, setQualitiesHeightEditGroups] = useState(0);

  const handleMeasure = useCallback(
    ({ height }: Measurements) => {
      if (editGroups) {
        setQualitiesHeightEditGroups(height);
      } else {
        setQualitiesHeight(height);
      }
    },
    [editGroups]
  );

  const isDragging = dropQualityIndex !== null;
  const isDraggingUp = isDragging && dropPosition === 'above';
  const isDraggingDown = isDragging && dropPosition === 'below';
  const minHeight = editGroups ? qualitiesHeightEditGroups : qualitiesHeight;

  return (
    <FormGroup size={sizes.EXTRA_SMALL}>
      <FormLabel size={sizes.SMALL}>{translate('Qualities')}</FormLabel>

      <div>
        <FormInputHelpText text={translate('QualitiesHelpText')} />

        {errors.map((error, index) => {
          return (
            <FormInputHelpText
              key={index}
              text={error.message}
              isError={true}
              isCheckInput={false}
            />
          );
        })}

        {warnings.map((warning, index) => {
          return (
            <FormInputHelpText
              key={index}
              text={warning.message}
              isWarning={true}
              isCheckInput={false}
            />
          );
        })}

        <Button
          className={styles.editGroupsButton}
          kind={kinds.PRIMARY}
          onPress={onToggleEditGroupsMode}
        >
          <div>
            <Icon
              className={styles.editGroupsButtonIcon}
              name={editGroups ? icons.REORDER : icons.GROUP}
            />

            {editGroups
              ? translate('DoneEditingGroups')
              : translate('EditGroups')}
          </div>
        </Button>

        <Measure onMeasure={handleMeasure}>
          <div
            className={styles.qualities}
            style={{ minHeight: `${minHeight}px` }}
          >
            {qualityProfileItems
              .map((profileItem, index) => {
                // Read off the item rather than destructured: testing
                // `quality` is what tells a group from a quality, and only the
                // item itself narrows with it.
                const { id, allowed, quality, items } = profileItem;
                const identifier = quality ? quality.id : id;

                return (
                  <QualityProfileItemDragSource
                    key={identifier}
                    editGroups={editGroups}
                    groupId={id}
                    qualityId={quality?.id}
                    name={quality ? quality.name : profileItem.name}
                    allowed={allowed}
                    items={items}
                    qualityIndex={`${index + 1}`}
                    isDraggingUp={isDraggingUp}
                    isDraggingDown={isDraggingDown}
                    onCreateGroupPress={onCreateGroupPress}
                    onDeleteGroupPress={onDeleteGroupPress}
                    onQualityProfileItemAllowedChange={
                      onQualityProfileItemAllowedChange
                    }
                    onItemGroupAllowedChange={onItemGroupAllowedChange}
                    onItemGroupNameChange={onItemGroupNameChange}
                    onQualityProfileItemDragMove={onQualityProfileItemDragMove}
                    onQualityProfileItemDragEnd={onQualityProfileItemDragEnd}
                  />
                );
              })
              .reverse()}

            <QualityProfileItemDragPreview />
          </div>
        </Measure>
      </div>
    </FormGroup>
  );
}

export default QualityProfileItems;
