import React, { useCallback, useMemo } from 'react';
import Alert from 'Components/Alert';
import Form from 'Components/Form/Form';
import FormGroup from 'Components/Form/FormGroup';
import FormInputGroup from 'Components/Form/FormInputGroup';
import FormLabel from 'Components/Form/FormLabel';
import ProviderFieldFormGroup from 'Components/Form/ProviderFieldFormGroup';
import Button from 'Components/Link/Button';
import SpinnerErrorButton from 'Components/Link/SpinnerErrorButton';
import InlineMarkdown from 'Components/Markdown/InlineMarkdown';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import { usePendingChangesStore } from 'Helpers/Hooks/usePendingChangesStore';
import { usePendingFieldsStore } from 'Helpers/Hooks/usePendingFieldsStore';
import { inputTypes, kinds } from 'Helpers/Props';
import selectSettings from 'Helpers/selectSettings';
import { useShowAdvancedSettings } from 'Settings/advancedSettingsStore';
import { AutoTaggingSpecification } from 'typings/AutoTagging';
import { InputChanged } from 'typings/inputs';
import translate from 'Utilities/String/translate';
import styles from './EditSpecificationModalContent.css';

interface EditSpecificationModalContentProps {
  specification: AutoTaggingSpecification;
  onSave: (specification: AutoTaggingSpecification) => void;
  onDeleteSpecificationPress?: () => void;
  onModalClose: () => void;
}

// The only form in Settings that saves nowhere. A condition is a piece of the
// auto tag, so Save here hands the edited copy back to the parent, which holds
// it as a pending change until the auto tag itself is saved. The pending stores
// are wired by hand rather than through `useManageProviderSettings` for the
// same reason: there is no provider on the other end to PUT it to, and so no
// save error to route back onto the fields.
export default function EditSpecificationModalContent({
  specification,
  onSave,
  onDeleteSpecificationPress,
  onModalClose,
}: Readonly<EditSpecificationModalContentProps>) {
  const advancedSettings = useShowAdvancedSettings();

  const { pendingChanges, setPendingChange } =
    usePendingChangesStore<AutoTaggingSpecification>({});

  const { pendingFields, setPendingField, hasPendingFields } =
    usePendingFieldsStore();

  const {
    settings: item,
    validationErrors,
    validationWarnings,
  } = useMemo(() => {
    return selectSettings<AutoTaggingSpecification>(
      specification,
      hasPendingFields
        ? { ...pendingChanges, fields: Object.fromEntries(pendingFields) }
        : pendingChanges
    );
  }, [specification, pendingChanges, pendingFields, hasPendingFields]);

  // Set unconditionally, with no is-it-a-change comparison: the slice this
  // replaces reached for `newState.item` to compare against, and a list section
  // has no `item`, so nothing was ever unset here either.
  const handleInputChange = useCallback(
    ({ name, value }: InputChanged) => {
      setPendingChange(
        name as keyof AutoTaggingSpecification,
        value as AutoTaggingSpecification[keyof AutoTaggingSpecification]
      );
    },
    [setPendingChange]
  );

  const handleFieldChange = useCallback(
    ({ name, value }: InputChanged) => {
      setPendingField(name, value);
    },
    [setPendingField]
  );

  // The stores unmount with the modal, so a cancelled edit needs nothing
  // cleared -- the same retirement of `clearPendingChanges` #521 made.
  const handleCancelPress = useCallback(() => {
    onModalClose();
  }, [onModalClose]);

  const handleSavePress = useCallback(() => {
    onSave({
      ...specification,
      ...pendingChanges,
      fields: specification.fields.map((field) =>
        pendingFields.has(field.name)
          ? {
              ...field,
              value: pendingFields.get(field.name) as typeof field.value,
            }
          : field
      ),
    });

    onModalClose();
  }, [specification, pendingChanges, pendingFields, onSave, onModalClose]);

  const { implementationName, name, negate, required, fields } = item;

  return (
    <ModalContent onModalClose={handleCancelPress}>
      <ModalHeader>
        {specification.id
          ? translate('EditConditionImplementation', { implementationName })
          : translate('AddConditionImplementation', { implementationName })}
      </ModalHeader>

      <ModalBody>
        <Form
          validationErrors={validationErrors}
          validationWarnings={validationWarnings}
        >
          {fields && fields.some((x) => x.label === 'Regular Expression') && (
            <Alert kind={kinds.INFO}>
              <div>
                <InlineMarkdown
                  data={translate('ConditionUsingRegularExpressions')}
                />
              </div>
              <div>
                <InlineMarkdown
                  data={translate('RegularExpressionsTutorialLink', {
                    url: 'https://www.regular-expressions.info/tutorial.html',
                  })}
                />
              </div>
              <div>
                <InlineMarkdown
                  data={translate('RegularExpressionsCanBeTested', {
                    url: 'http://regex101.com/',
                  })}
                />
              </div>
            </Alert>
          )}

          <FormGroup>
            <FormLabel>{translate('Name')}</FormLabel>

            <FormInputGroup
              type={inputTypes.TEXT}
              name="name"
              {...name}
              onChange={handleInputChange}
            />
          </FormGroup>

          {fields?.map((field) => {
            return (
              <ProviderFieldFormGroup
                key={field.name}
                advancedSettings={advancedSettings}
                provider="specifications"
                providerData={item}
                {...field}
                onChange={handleFieldChange}
              />
            );
          })}

          <FormGroup>
            <FormLabel>{translate('Negate')}</FormLabel>

            <FormInputGroup
              type={inputTypes.CHECK}
              name="negate"
              {...negate}
              helpText={translate('AutoTaggingNegateHelpText', {
                implementationName,
              })}
              onChange={handleInputChange}
            />
          </FormGroup>

          <FormGroup>
            <FormLabel>{translate('Required')}</FormLabel>

            <FormInputGroup
              type={inputTypes.CHECK}
              name="required"
              {...required}
              helpText={translate('AutoTaggingRequiredHelpText', {
                implementationName,
              })}
              onChange={handleInputChange}
            />
          </FormGroup>
        </Form>
      </ModalBody>

      <ModalFooter>
        {specification.id ? (
          <Button
            className={styles.deleteButton}
            kind={kinds.DANGER}
            onPress={onDeleteSpecificationPress}
          >
            {translate('Delete')}
          </Button>
        ) : null}

        <Button onPress={handleCancelPress}>{translate('Cancel')}</Button>

        <SpinnerErrorButton isSpinning={false} onPress={handleSavePress}>
          {translate('Save')}
        </SpinnerErrorButton>
      </ModalFooter>
    </ModalContent>
  );
}
