import React, { useCallback, useState } from 'react';
import Alert from 'Components/Alert';
import Form from 'Components/Form/Form';
import FormGroup from 'Components/Form/FormGroup';
import FormInputGroup from 'Components/Form/FormInputGroup';
import FormLabel from 'Components/Form/FormLabel';
import Button from 'Components/Link/Button';
import SpinnerErrorButton from 'Components/Link/SpinnerErrorButton';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import { inputTypes, kinds, sizes } from 'Helpers/Props';
import { CustomFormatSpecification } from 'typings/CustomFormat';
import Field from 'typings/Field';
import { InputChanged } from 'typings/inputs';
import translate from 'Utilities/String/translate';
import { useCustomFormatSpecificationSchema } from './useCustomFormats';
import styles from './ImportCustomFormatModalContent.css';

export interface ImportedCustomFormat {
  name?: string;
  includeCustomFormatWhenRenaming?: boolean;
  specifications: CustomFormatSpecification[];
}

interface ImportCustomFormatModalContentProps {
  onImport: (customFormat: ImportedCustomFormat) => void;
  onModalClose: () => void;
}

// A condition in the JSON names an implementation and a bag of field values. It
// is built back up from the schema entry, so a format exported by an older
// version still arrives with every field the server now knows about, and an
// implementation or option that no longer exists is a parse error rather than a
// 400 on save. That is what the connector's `selectCustomFormatSpecificationSchema`
// plus `setCustomFormatSpecificationFieldValue` pair did, one dispatch at a time.
function parseSpecification(
  specification: Record<string, unknown>,
  schema: readonly CustomFormatSpecification[],
  id: number
): CustomFormatSpecification {
  const { id: _id, fields: importedFields, ...rest } = specification;

  const selected = schema.find(
    (s) => s.implementation === specification.implementation
  );

  if (!selected) {
    throw new Error(
      translate('CustomFormatUnknownCondition', {
        implementation: String(specification.implementation),
      })
    );
  }

  const { presets, ...base } = selected;

  const fields: Field[] = base.fields.map((field) => ({ ...field }));

  for (const [key, value] of Object.entries(importedFields ?? {})) {
    const field = fields.find((f) => f.name === key);

    if (!field) {
      throw new Error(
        translate('CustomFormatUnknownConditionOption', {
          key,
          implementation: base.implementationName,
        })
      );
    }

    field.value = value as Field['value'];
  }

  return {
    ...base,
    ...rest,
    fields,
    id,
  } as CustomFormatSpecification;
}

function parseCustomFormat(
  json: string,
  schema: readonly CustomFormatSpecification[]
): ImportedCustomFormat {
  const {
    id: _id,
    specifications = [],
    ...rest
  } = JSON.parse(json) as Record<string, unknown> & {
    specifications?: Record<string, unknown>[];
  };

  return {
    ...rest,
    specifications: specifications.map((specification, index) =>
      parseSpecification(specification, schema, index + 1)
    ),
  };
}

export default function ImportCustomFormatModalContent({
  onImport,
  onModalClose,
}: Readonly<ImportCustomFormatModalContentProps>) {
  const { schema, isSchemaFetching, isSchemaFetched, schemaError } =
    useCustomFormatSpecificationSchema();

  const [json, setJson] = useState('');
  const [parseError, setParseError] = useState<Error | null>(null);

  const handleChange = useCallback(({ value }: InputChanged) => {
    setJson(value as string);
  }, []);

  // Parsing is synchronous, so the 250ms `setTimeout` the class component used
  // to make its spinner render at all goes with it: there is nothing to wait
  // for, and the modal closes on the same tick as the press.
  const handleImportPress = useCallback(() => {
    try {
      onImport(parseCustomFormat(json, schema));
    } catch (error) {
      setParseError(error as Error);

      return;
    }

    setParseError(null);
    onModalClose();
  }, [json, schema, onImport, onModalClose]);

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>{translate('ImportCustomFormat')}</ModalHeader>

      <ModalBody>
        <div>
          {isSchemaFetching ? <LoadingIndicator /> : null}

          {!isSchemaFetching && !!schemaError ? (
            <Alert kind={kinds.DANGER}>
              {translate('CustomFormatsLoadError')}
            </Alert>
          ) : null}

          {isSchemaFetched && !schemaError ? (
            <Form>
              <FormGroup size={sizes.MEDIUM}>
                <FormLabel>{translate('CustomFormatJson')}</FormLabel>

                <FormInputGroup
                  type={inputTypes.TEXT_AREA}
                  name="customFormatJson"
                  value={json}
                  inputClassName={styles.input}
                  placeholder={'{\n  "name": "Custom Format"\n}'}
                  errors={parseError ? [{ message: parseError.message }] : []}
                  onChange={handleChange}
                />
              </FormGroup>
            </Form>
          ) : null}
        </div>
      </ModalBody>

      <ModalFooter>
        <Button onPress={onModalClose}>{translate('Cancel')}</Button>

        <SpinnerErrorButton
          isSpinning={false}
          error={parseError?.message}
          onPress={handleImportPress}
        >
          {translate('Import')}
        </SpinnerErrorButton>
      </ModalFooter>
    </ModalContent>
  );
}
