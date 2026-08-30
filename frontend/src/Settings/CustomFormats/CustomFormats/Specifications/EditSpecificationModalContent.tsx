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
import { CustomFormatSpecification } from 'typings/CustomFormat';
import { InputChanged } from 'typings/inputs';
import translate from 'Utilities/String/translate';
import styles from './EditSpecificationModalContent.css';

interface EditSpecificationModalContentProps {
  specification: CustomFormatSpecification;
  onSave: (specification: CustomFormatSpecification) => void;
  onDeleteSpecificationPress?: () => void;
  onModalClose: () => void;
}

// A condition saves nowhere. It is a piece of the custom format, so Save here
// hands the edited copy back to the parent, which holds it as a pending change
// until the format itself is saved. The pending stores are wired by hand rather
// than through `useManageProviderSettings` for the same reason: there is no
// provider on the other end to PUT it to, and so no save error to route back
// onto the fields. Validation arrives on the parent's save.
export default function EditSpecificationModalContent({
  specification,
  onSave,
  onDeleteSpecificationPress,
  onModalClose,
}: Readonly<EditSpecificationModalContentProps>) {
  const advancedSettings = useShowAdvancedSettings();

  const { pendingChanges, setPendingChange } =
    usePendingChangesStore<CustomFormatSpecification>({});

  const { pendingFields, setPendingField, hasPendingFields } =
    usePendingFieldsStore();

  const {
    settings: item,
    validationErrors,
    validationWarnings,
  } = useMemo(() => {
    return selectSettings<CustomFormatSpecification>(
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
        name as keyof CustomFormatSpecification,
        value as CustomFormatSpecification[keyof CustomFormatSpecification]
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
  // cleared -- the retirement of `clearCustomFormatSpecificationPending`.
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
          {fields?.some(
            (x) =>
              x.label ===
              translate('CustomFormatsSpecificationRegularExpression')
          ) ? (
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
                    url: 'https://regex101.com/',
                  })}
                />
              </div>
            </Alert>
          ) : null}

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
              helpText={translate('NegateHelpText', { implementationName })}
              onChange={handleInputChange}
            />
          </FormGroup>

          <FormGroup>
            <FormLabel>{translate('Required')}</FormLabel>

            <FormInputGroup
              type={inputTypes.CHECK}
              name="required"
              {...required}
              helpText={translate('RequiredHelpText', { implementationName })}
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
