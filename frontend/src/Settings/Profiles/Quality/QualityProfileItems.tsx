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
import translate from 'Utilities/String/translate';
import QualityProfileItem from './QualityProfileItem';
import QualityProfileItemGroup from './QualityProfileItemGroup';
import { DisplayItem, ROOT_CONTAINER } from './useQualityProfileDnd';
import styles from './QualityProfileItems.css';

interface QualityProfileItemsProps {
  editGroups: boolean;
  // Highest quality first, in the order the drag has them right now.
  displayItems: DisplayItem[];
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
}

function QualityProfileItems({
  editGroups,
  displayItems,
  errors = [],
  warnings = [],
  onToggleEditGroupsMode,
  onCreateGroupPress,
  onDeleteGroupPress,
  onQualityProfileItemAllowedChange,
  onItemGroupAllowedChange,
  onItemGroupNameChange,
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
            {displayItems.map((entry, index) => {
              if (entry.kind === 'group') {
                const { group, items } = entry;

                return (
                  <QualityProfileItemGroup
                    key={`group-${group.id}`}
                    editGroups={editGroups}
                    index={index}
                    groupId={group.id}
                    name={group.name}
                    allowed={group.allowed}
                    items={items}
                    onItemGroupAllowedChange={onItemGroupAllowedChange}
                    onItemGroupNameChange={onItemGroupNameChange}
                    onDeleteGroupPress={onDeleteGroupPress}
                    onQualityProfileItemAllowedChange={
                      onQualityProfileItemAllowedChange
                    }
                  />
                );
              }

              const { quality, allowed } = entry.item;

              return (
                <QualityProfileItem
                  key={quality.id}
                  editGroups={editGroups}
                  containerId={ROOT_CONTAINER}
                  index={index}
                  qualityId={quality.id}
                  name={quality.name}
                  allowed={allowed}
                  onCreateGroupPress={onCreateGroupPress}
                  onQualityProfileItemAllowedChange={
                    onQualityProfileItemAllowedChange
                  }
                />
              );
            })}
          </div>
        </Measure>
      </div>
    </FormGroup>
  );
}

export default QualityProfileItems;
