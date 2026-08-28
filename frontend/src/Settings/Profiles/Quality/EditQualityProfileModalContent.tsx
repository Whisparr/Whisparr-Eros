import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Alert from 'Components/Alert';
import Form from 'Components/Form/Form';
import FormGroup from 'Components/Form/FormGroup';
import FormInputGroup from 'Components/Form/FormInputGroup';
import FormLabel from 'Components/Form/FormLabel';
import Button from 'Components/Link/Button';
import SpinnerErrorButton from 'Components/Link/SpinnerErrorButton';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import Measure from 'Components/Measure';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import usePrevious from 'Helpers/Hooks/usePrevious';
import { inputTypes, kinds, sizes } from 'Helpers/Props';
import { useFilteredLanguages } from 'Language/useLanguages';
import dimensions from 'Styles/Variables/dimensions';
import { InputChanged } from 'typings/inputs';
import QualityProfile, {
  QualityProfileGroup,
  QualityProfileItem,
  QualityProfileQualityItem,
} from 'typings/QualityProfile';
import translate from 'Utilities/String/translate';
import QualityProfileFormatItems from './QualityProfileFormatItems';
import { DragMoveOptions } from './QualityProfileItemDragSource';
import QualityProfileItems from './QualityProfileItems';
import useQualityProfileInUse from './useQualityProfileInUse';
import { useManageQualityProfile } from './useQualityProfiles';
import styles from './EditQualityProfileModalContent.css';

const MODAL_BODY_PADDING = Number.parseInt(dimensions.modalBodyPadding, 10);

// A profile's language is what a release must match, and `Unknown` is what the
// parser reports when it could not tell -- matching on it is not a choice the
// profile offers.
const UNPROFILED_LANGUAGES = ['Unknown'];

interface DragState {
  dragQualityIndex: string | null;
  dropQualityIndex: string | null;
  dropPosition: string | null;
}

const NO_DRAG: DragState = {
  dragQualityIndex: null,
  dropQualityIndex: null,
  dropPosition: null,
};

function parseIndex(index: string): [number | null, number] {
  const split = index.split('.');

  if (split.length === 1) {
    return [null, Number.parseInt(split[0], 10) - 1];
  }

  return [Number.parseInt(split[0], 10) - 1, Number.parseInt(split[1], 10) - 1];
}

function getQualityItemGroupId(items: QualityProfileItem[]) {
  const ids = items
    .map((item) => item.id)
    .filter((id): id is number => id != null);

  return Math.max(1000, ...ids) + 1;
}

interface EditQualityProfileModalContentProps {
  id?: number;
  cloneId?: number;
  onContentHeightChange: (height: number) => void;
  onDeleteQualityProfilePress?: () => void;
  onModalClose: () => void;
}

function EditQualityProfileModalContent({
  id,
  cloneId,
  onContentHeightChange,
  onDeleteQualityProfilePress,
  onModalClose,
}: Readonly<EditQualityProfileModalContentProps>) {
  const {
    item,
    isSaving,
    saveError,
    isSchemaFetching,
    isSchemaFetched,
    schemaError,
    validationErrors,
    validationWarnings,
    updateValue,
    saveProvider,
  } = useManageQualityProfile(id, cloneId);

  const isInUse = useQualityProfileInUse(id);
  const wasSaving = usePrevious(isSaving);

  const [editGroups, setEditGroups] = useState(false);
  const [dragState, setDragState] = useState<DragState>(NO_DRAG);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [bodyHeight, setBodyHeight] = useState(0);
  const [footerHeight, setFooterHeight] = useState(0);

  const {
    name,
    fallback,
    upgradeAllowed,
    cutoff,
    minFormatScore,
    minUpgradeFormatScore,
    cutoffFormatScore,
    language,
    items,
    formatItems,
  } = item;

  const { data: languageItems } = useFilteredLanguages(UNPROFILED_LANGUAGES);

  const languages = useMemo(() => {
    return languageItems.map((languageItem) => ({
      key: languageItem.id,
      value: languageItem.name,
    }));
  }, [languageItems]);

  const qualities = useMemo(() => {
    if (!items?.value) {
      return [];
    }

    return items.value.reduceRight<{ key: number; value: string }[]>(
      (acc, quality) => {
        if (quality.allowed) {
          if (quality.quality) {
            acc.push({ key: quality.quality.id, value: quality.quality.name });
          } else {
            acc.push({ key: quality.id, value: quality.name });
          }
        }

        return acc;
      },
      []
    );
  }, [items]);

  const setItems = useCallback(
    (newItems: QualityProfileItem[]) => {
      updateValue('items', newItems);
    },
    [updateValue]
  );

  const handleInputChange = useCallback(
    ({ name, value }: InputChanged) => {
      updateValue(
        name as keyof QualityProfile,
        value as QualityProfile[keyof QualityProfile]
      );
    },
    [updateValue]
  );

  const handleCutoffChange = useCallback(
    ({ value }: InputChanged) => {
      const cutoffId = Number.parseInt(String(value), 10);

      const cutoffItem = items.value.find((profileItem) =>
        profileItem.quality
          ? profileItem.quality.id === cutoffId
          : profileItem.id === cutoffId
      );

      if (cutoffItem) {
        updateValue(
          'cutoff',
          cutoffItem.quality ? cutoffItem.quality.id : cutoffItem.id
        );
      }
    },
    [items, updateValue]
  );

  const handleLanguageChange = useCallback(
    ({ value }: InputChanged) => {
      const languageId = Number.parseInt(String(value), 10);
      const selectedLanguage = languages.find(
        (option) => option.key === languageId
      );

      if (selectedLanguage) {
        updateValue('language', {
          id: selectedLanguage.key,
          name: selectedLanguage.value,
        });
      }
    },
    [languages, updateValue]
  );

  const handleSavePress = useCallback(() => {
    saveProvider();
  }, [saveProvider]);

  const handleQualityProfileItemAllowedChange = useCallback(
    (qualityId: number, allowed: boolean) => {
      setItems(
        items.value.map((profileItem) =>
          profileItem.quality && profileItem.quality.id === qualityId
            ? { ...profileItem, allowed }
            : profileItem
        )
      );
    },
    [items, setItems]
  );

  const handleItemGroupAllowedChange = useCallback(
    (groupId: number, allowed: boolean) => {
      setItems(
        items.value.map((profileItem) =>
          !profileItem.quality && profileItem.id === groupId
            ? {
                ...profileItem,
                allowed,

                // Update each item in the group (for consistency only)
                items: profileItem.items.map((groupItem) => ({
                  ...groupItem,
                  allowed,
                })),
              }
            : profileItem
        )
      );
    },
    [items, setItems]
  );

  const handleItemGroupNameChange = useCallback(
    (groupId: number, groupName: string) => {
      setItems(
        items.value.map((profileItem) =>
          !profileItem.quality && profileItem.id === groupId
            ? { ...profileItem, name: groupName }
            : profileItem
        )
      );
    },
    [items, setItems]
  );

  const handleQualityProfileFormatItemScoreChange = useCallback(
    (formatId: number, score: number) => {
      updateValue(
        'formatItems',
        formatItems.value.map((formatItem) =>
          formatItem.format === formatId ? { ...formatItem, score } : formatItem
        )
      );
    },
    [formatItems, updateValue]
  );

  const handleCreateGroupPress = useCallback(
    (qualityId: number) => {
      const groupId = getQualityItemGroupId(items.value);

      // The group takes the quality's place in the list rather than being
      // appended, which is what keeps the drag order stable.
      setItems(
        items.value.map((profileItem) =>
          profileItem.quality && profileItem.quality.id === qualityId
            ? {
                id: groupId,
                name: profileItem.quality.name,
                allowed: profileItem.allowed,
                items: [profileItem],
              }
            : profileItem
        )
      );
    },
    [items, setItems]
  );

  const handleDeleteGroupPress = useCallback(
    (groupId: number) => {
      setItems(
        items.value.reduce<QualityProfileItem[]>((acc, profileItem) => {
          if (!profileItem.quality && profileItem.id === groupId) {
            // Add the items in the same location the group was in
            acc.push(...profileItem.items);
          } else {
            acc.push(profileItem);
          }

          return acc;
        }, [])
      );
    },
    [items, setItems]
  );

  const handleQualityProfileItemDragMove = useCallback(
    (options: DragMoveOptions) => {
      const { dragQualityIndex, dropQualityIndex, dropPosition } = options;

      const [dragGroupIndex, dragItemIndex] = parseIndex(dragQualityIndex);
      const [dropGroupIndex, dropItemIndex] = parseIndex(dropQualityIndex);

      if (
        (dropPosition === 'below' && dropItemIndex - 1 === dragItemIndex) ||
        (dropPosition === 'above' && dropItemIndex + 1 === dragItemIndex)
      ) {
        setDragState((state) =>
          state.dragQualityIndex != null ||
          state.dropQualityIndex != null ||
          state.dropPosition != null
            ? NO_DRAG
            : state
        );

        return;
      }

      let adjustedDropQualityIndex = dropQualityIndex;

      // Correct dragging out of a group to the position above
      if (
        dropPosition === 'above' &&
        dragGroupIndex !== dropGroupIndex &&
        dropGroupIndex != null
      ) {
        // Add 1 to the group index and 2 to the item index so it's inserted above in the correct group
        adjustedDropQualityIndex = `${dropGroupIndex + 1}.${dropItemIndex + 2}`;
      }

      // Correct inserting above outside a group
      if (
        dropPosition === 'above' &&
        dragGroupIndex !== dropGroupIndex &&
        dropGroupIndex == null
      ) {
        // Add 2 to the item index so it's entered in the correct place
        adjustedDropQualityIndex = `${dropItemIndex + 2}`;
      }

      // Correct inserting below a quality within the same group (when moving a lower item)
      if (
        dropPosition === 'below' &&
        dragGroupIndex === dropGroupIndex &&
        dropGroupIndex != null &&
        dragItemIndex < dropItemIndex
      ) {
        // Add 1 to the group index leave the item index
        adjustedDropQualityIndex = `${dropGroupIndex + 1}.${dropItemIndex}`;
      }

      // Correct inserting below a quality outside a group (when moving a lower item)
      if (
        dropPosition === 'below' &&
        dragGroupIndex === dropGroupIndex &&
        dropGroupIndex == null &&
        dragItemIndex < dropItemIndex
      ) {
        // Leave the item index so it's inserted below the item
        adjustedDropQualityIndex = `${dropItemIndex}`;
      }

      setDragState((state) =>
        dragQualityIndex !== state.dragQualityIndex ||
        adjustedDropQualityIndex !== state.dropQualityIndex ||
        dropPosition !== state.dropPosition
          ? {
              dragQualityIndex,
              dropQualityIndex: adjustedDropQualityIndex,
              dropPosition,
            }
          : state
      );
    },
    []
  );

  const handleQualityProfileItemDragEnd = useCallback(
    (didDrop: boolean) => {
      const { dragQualityIndex, dropQualityIndex } = dragState;

      if (didDrop && dragQualityIndex != null && dropQualityIndex != null) {
        // The splices below rearrange this copy, never the query's own items.
        const newItems: QualityProfileItem[] = items.value.map((profileItem) =>
          profileItem.quality
            ? { ...profileItem }
            : { ...profileItem, items: [...profileItem.items] }
        );

        const [dragGroupIndex, dragItemIndex] = parseIndex(dragQualityIndex);
        const [dropGroupIndex, dropItemIndex] = parseIndex(dropQualityIndex);

        // Get the group before moving anything so we know the correct place to drop it.
        const dropGroup =
          dropGroupIndex == null
            ? null
            : (newItems[dropGroupIndex] as QualityProfileGroup);

        const movedItem = ((): QualityProfileQualityItem => {
          if (dragGroupIndex == null) {
            return newItems.splice(
              dragItemIndex,
              1
            )[0] as QualityProfileQualityItem;
          }

          const group = newItems[dragGroupIndex] as QualityProfileGroup;
          const dragged = group.items.splice(dragItemIndex, 1)[0];

          // If the group is now empty, destroy it.
          if (!group.items.length) {
            newItems.splice(dragGroupIndex, 1);
          }

          return dragged;
        })();

        if (dropGroup == null) {
          newItems.splice(dropItemIndex, 0, movedItem);
        } else {
          dropGroup.items.splice(dropItemIndex, 0, movedItem);
        }

        setItems(newItems);
      }

      setDragState(NO_DRAG);
    },
    [dragState, items, setItems]
  );

  const handleToggleEditGroupsMode = useCallback(() => {
    setEditGroups((state) => !state);
  }, []);

  const handleHeaderMeasure = useCallback(({ height }: { height: number }) => {
    setHeaderHeight((currentHeight) =>
      height > currentHeight ? height : currentHeight
    );
  }, []);

  const handleBodyMeasure = useCallback(({ height }: { height: number }) => {
    setBodyHeight((currentHeight) =>
      height > currentHeight ? height : currentHeight
    );
  }, []);

  const handleFooterMeasure = useCallback(({ height }: { height: number }) => {
    setFooterHeight((currentHeight) =>
      height > currentHeight ? height : currentHeight
    );
  }, []);

  useEffect(() => {
    if (headerHeight > 0 && bodyHeight > 0 && footerHeight > 0) {
      const padding = MODAL_BODY_PADDING * 2;

      onContentHeightChange(headerHeight + bodyHeight + footerHeight + padding);
    }
  }, [headerHeight, bodyHeight, footerHeight, onContentHeightChange]);

  useEffect(() => {
    if (wasSaving && !isSaving && !saveError) {
      onModalClose();
    }
  }, [wasSaving, isSaving, saveError, onModalClose]);

  // `ensureCutoff` ran after every edit that touched `items`; as an effect it
  // covers the same edits without each handler having to remember to call it.
  useEffect(() => {
    if (!items?.value) {
      return;
    }

    const cutoffValue = cutoff.value;

    const cutoffItem = items.value.find((profileItem) => {
      if (!cutoffValue) {
        return false;
      }

      return profileItem.quality
        ? profileItem.quality.id === cutoffValue
        : profileItem.id === cutoffValue;
    });

    // If the cutoff isn't allowed anymore or there isn't a cutoff set one
    if (!cutoffValue || !cutoffItem || !cutoffItem.allowed) {
      const firstAllowed = items.value.find(
        (profileItem) => profileItem.allowed
      );

      if (firstAllowed) {
        updateValue(
          'cutoff',
          firstAllowed.quality ? firstAllowed.quality.id : firstAllowed.id
        );
      }
    }
  }, [cutoff, items, updateValue]);

  const formatItemsElement = formatItems ? (
    <QualityProfileFormatItems
      profileFormatItems={formatItems.value}
      errors={formatItems.errors}
      warnings={formatItems.warnings}
      onQualityProfileFormatItemScoreChange={
        handleQualityProfileFormatItemScoreChange
      }
    />
  ) : null;

  return (
    <ModalContent onModalClose={onModalClose}>
      <Measure onMeasure={handleHeaderMeasure}>
        <ModalHeader>
          {id
            ? translate('EditQualityProfile')
            : translate('AddQualityProfile')}
        </ModalHeader>
      </Measure>

      <ModalBody>
        <Measure onMeasure={handleBodyMeasure}>
          <div>
            {isSchemaFetching ? <LoadingIndicator /> : null}

            {!isSchemaFetching && schemaError ? (
              <Alert kind={kinds.DANGER}>
                {translate('AddQualityProfileError')}
              </Alert>
            ) : null}

            {isSchemaFetched && !schemaError && items ? (
              <Form
                validationErrors={validationErrors}
                validationWarnings={validationWarnings}
              >
                <div className={styles.formGroupsContainer}>
                  <div className={styles.formGroupWrapper}>
                    <FormGroup size={sizes.EXTRA_SMALL}>
                      <FormLabel size={sizes.SMALL}>
                        {translate('Name')}
                      </FormLabel>

                      <FormInputGroup
                        type={inputTypes.TEXT}
                        name="name"
                        {...name}
                        onChange={handleInputChange}
                      />
                    </FormGroup>

                    <FormGroup size={sizes.EXTRA_SMALL}>
                      <FormLabel size={sizes.SMALL}>
                        {translate('FallbackQualityProfile')}
                      </FormLabel>

                      <FormInputGroup
                        type={inputTypes.CHECK}
                        name="fallback"
                        {...fallback}
                        helpText={translate('FallbackQualityProfileHelpText')}
                        onChange={handleInputChange}
                      />
                    </FormGroup>

                    <FormGroup size={sizes.EXTRA_SMALL}>
                      <FormLabel size={sizes.SMALL}>
                        {translate('UpgradesAllowed')}
                      </FormLabel>

                      <FormInputGroup
                        type={inputTypes.CHECK}
                        name="upgradeAllowed"
                        {...upgradeAllowed}
                        helpText={translate('UpgradesAllowedHelpText')}
                        onChange={handleInputChange}
                      />
                    </FormGroup>

                    {upgradeAllowed.value ? (
                      <FormGroup size={sizes.EXTRA_SMALL}>
                        <FormLabel size={sizes.SMALL}>
                          {translate('UpgradeUntil')}
                        </FormLabel>

                        <FormInputGroup
                          type={inputTypes.SELECT}
                          name="cutoff"
                          {...cutoff}
                          values={qualities}
                          helpText={translate('UpgradeUntilMovieHelpText')}
                          onChange={handleCutoffChange}
                        />
                      </FormGroup>
                    ) : null}

                    {formatItems.value.length > 0 ? (
                      <FormGroup size={sizes.EXTRA_SMALL}>
                        <FormLabel size={sizes.SMALL}>
                          {translate('MinimumCustomFormatScore')}
                        </FormLabel>

                        <FormInputGroup
                          type={inputTypes.NUMBER}
                          name="minFormatScore"
                          {...minFormatScore}
                          helpText={translate(
                            'MinimumCustomFormatScoreHelpText'
                          )}
                          onChange={handleInputChange}
                        />
                      </FormGroup>
                    ) : null}

                    {upgradeAllowed.value && formatItems.value.length > 0 ? (
                      <FormGroup size={sizes.EXTRA_SMALL}>
                        <FormLabel size={sizes.SMALL}>
                          {translate('UpgradeUntilCustomFormatScore')}
                        </FormLabel>

                        <FormInputGroup
                          type={inputTypes.NUMBER}
                          name="cutoffFormatScore"
                          {...cutoffFormatScore}
                          helpText={translate(
                            'UpgradeUntilCustomFormatScoreMovieHelpText'
                          )}
                          onChange={handleInputChange}
                        />
                      </FormGroup>
                    ) : null}

                    {upgradeAllowed.value && formatItems.value.length > 0 ? (
                      <FormGroup size={sizes.EXTRA_SMALL}>
                        <FormLabel size={sizes.SMALL}>
                          {translate('MinimumCustomFormatScoreIncrement')}
                        </FormLabel>

                        <FormInputGroup
                          type={inputTypes.NUMBER}
                          name="minUpgradeFormatScore"
                          min={1}
                          {...minUpgradeFormatScore}
                          helpText={translate(
                            'MinimumCustomFormatScoreIncrementHelpText'
                          )}
                          onChange={handleInputChange}
                        />
                      </FormGroup>
                    ) : null}

                    <FormGroup size={sizes.EXTRA_SMALL}>
                      <FormLabel size={sizes.SMALL}>
                        {translate('Language')}
                      </FormLabel>

                      <FormInputGroup
                        type={inputTypes.LANGUAGE_SELECT}
                        name="language"
                        values={languages}
                        value={language?.value ? language.value.id : 0}
                        helpText={translate('LanguageHelpText')}
                        onChange={handleLanguageChange}
                      />
                    </FormGroup>

                    <div className={styles.formatItemLarge}>
                      {formatItemsElement}
                    </div>
                  </div>

                  <div className={styles.formGroupWrapper}>
                    <QualityProfileItems
                      editGroups={editGroups}
                      dropQualityIndex={dragState.dropQualityIndex}
                      dropPosition={dragState.dropPosition}
                      qualityProfileItems={items.value}
                      errors={items.errors}
                      warnings={items.warnings}
                      onToggleEditGroupsMode={handleToggleEditGroupsMode}
                      onCreateGroupPress={handleCreateGroupPress}
                      onDeleteGroupPress={handleDeleteGroupPress}
                      onQualityProfileItemAllowedChange={
                        handleQualityProfileItemAllowedChange
                      }
                      onItemGroupAllowedChange={handleItemGroupAllowedChange}
                      onItemGroupNameChange={handleItemGroupNameChange}
                      onQualityProfileItemDragMove={
                        handleQualityProfileItemDragMove
                      }
                      onQualityProfileItemDragEnd={
                        handleQualityProfileItemDragEnd
                      }
                    />
                  </div>

                  <div className={styles.formatItemSmall}>
                    {formatItemsElement}
                  </div>
                </div>
              </Form>
            ) : null}
          </div>
        </Measure>
      </ModalBody>

      <Measure onMeasure={handleFooterMeasure}>
        <ModalFooter>
          {id ? (
            <div
              className={styles.deleteButtonContainer}
              title={
                isInUse
                  ? translate('QualityProfileInUseMovieListCollection')
                  : undefined
              }
            >
              <Button
                kind={kinds.DANGER}
                isDisabled={isInUse}
                onPress={onDeleteQualityProfilePress}
              >
                {translate('Delete')}
              </Button>
            </div>
          ) : null}

          <Button onPress={onModalClose}>{translate('Cancel')}</Button>

          <SpinnerErrorButton
            isSpinning={isSaving}
            error={saveError}
            onPress={handleSavePress}
          >
            {translate('Save')}
          </SpinnerErrorButton>
        </ModalFooter>
      </Measure>
    </ModalContent>
  );
}

export default EditQualityProfileModalContent;
