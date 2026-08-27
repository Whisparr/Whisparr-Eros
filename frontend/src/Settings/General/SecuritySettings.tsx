import React, { useCallback, useState } from 'react';
import FieldSet from 'Components/FieldSet';
import FormGroup from 'Components/Form/FormGroup';
import FormInputButton from 'Components/Form/FormInputButton';
import FormInputGroup from 'Components/Form/FormInputGroup';
import FormLabel from 'Components/Form/FormLabel';
import { EnhancedSelectInputValue } from 'Components/Form/Select/EnhancedSelectInput';
import Icon from 'Components/Icon';
import ClipboardButton from 'Components/Link/ClipboardButton';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import { icons, inputTypes, kinds } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import { GeneralSettingsSectionProps } from './GeneralSettingsProps';

export const authenticationMethodOptions: EnhancedSelectInputValue<string>[] = [
  {
    key: 'none',
    get value() {
      return translate('None');
    },
    isDisabled: true,
  },
  {
    key: 'external',
    get value() {
      return translate('External');
    },
    isHidden: true,
  },
  {
    key: 'basic',
    get value() {
      return translate('AuthBasic');
    },
    isDisabled: true,
    isHidden: true,
  },
  {
    key: 'forms',
    get value() {
      return translate('AuthForm');
    },
  },
];

export const authenticationRequiredOptions: EnhancedSelectInputValue<string>[] =
  [
    {
      key: 'enabled',
      get value() {
        return translate('Enabled');
      },
    },
    {
      key: 'disabledForLocalAddresses',
      get value() {
        return translate('DisabledForLocalAddresses');
      },
    },
  ];

const certificateValidationOptions: EnhancedSelectInputValue<string>[] = [
  {
    key: 'enabled',
    get value() {
      return translate('Enabled');
    },
  },
  {
    key: 'disabledForLocalAddresses',
    get value() {
      return translate('DisabledForLocalAddresses');
    },
  },
  {
    key: 'disabled',
    get value() {
      return translate('Disabled');
    },
  },
];

interface SecuritySettingsProps extends GeneralSettingsSectionProps {
  isResettingApiKey: boolean;
  onConfirmResetApiKey: () => void;
}

function SecuritySettings({
  settings,
  isResettingApiKey,
  onInputChange,
  onConfirmResetApiKey,
}: Readonly<SecuritySettingsProps>) {
  const [isConfirmApiKeyResetModalOpen, setIsConfirmApiKeyResetModalOpen] =
    useState(false);

  const handleApiKeyFocus = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      event.target.select();
    },
    []
  );

  const handleResetApiKeyPress = useCallback(() => {
    setIsConfirmApiKeyResetModalOpen(true);
  }, []);

  const handleConfirmResetApiKey = useCallback(() => {
    setIsConfirmApiKeyResetModalOpen(false);
    onConfirmResetApiKey();
  }, [onConfirmResetApiKey]);

  const handleCloseResetApiKeyModal = useCallback(() => {
    setIsConfirmApiKeyResetModalOpen(false);
  }, []);

  const {
    authenticationMethod,
    authenticationRequired,
    username,
    password,
    passwordConfirmation,
    apiKey,
    certificateValidation,
  } = settings;

  const authenticationEnabled =
    authenticationMethod && authenticationMethod.value !== 'none';

  return (
    <FieldSet legend={translate('Security')}>
      <FormGroup>
        <FormLabel>{translate('Authentication')}</FormLabel>

        <FormInputGroup
          type={inputTypes.SELECT}
          name="authenticationMethod"
          values={authenticationMethodOptions}
          helpText={translate('AuthenticationMethodHelpText')}
          helpTextWarning={translate('AuthenticationRequiredWarning')}
          onChange={onInputChange}
          {...authenticationMethod}
        />
      </FormGroup>

      {authenticationEnabled ? (
        <FormGroup>
          <FormLabel>{translate('AuthenticationRequired')}</FormLabel>

          <FormInputGroup
            type={inputTypes.SELECT}
            name="authenticationRequired"
            values={authenticationRequiredOptions}
            helpText={translate('AuthenticationRequiredHelpText')}
            onChange={onInputChange}
            {...authenticationRequired}
          />
        </FormGroup>
      ) : null}

      {authenticationEnabled ? (
        <FormGroup>
          <FormLabel>{translate('Username')}</FormLabel>

          <FormInputGroup
            type={inputTypes.TEXT}
            name="username"
            onChange={onInputChange}
            {...username}
          />
        </FormGroup>
      ) : null}

      {authenticationEnabled ? (
        <FormGroup>
          <FormLabel>{translate('Password')}</FormLabel>

          <FormInputGroup
            type={inputTypes.PASSWORD}
            name="password"
            onChange={onInputChange}
            {...password}
          />
        </FormGroup>
      ) : null}

      {authenticationEnabled ? (
        <FormGroup>
          <FormLabel>{translate('PasswordConfirmation')}</FormLabel>

          <FormInputGroup
            type={inputTypes.PASSWORD}
            name="passwordConfirmation"
            onChange={onInputChange}
            {...passwordConfirmation}
          />
        </FormGroup>
      ) : null}

      <FormGroup>
        <FormLabel>{translate('ApiKey')}</FormLabel>

        <FormInputGroup
          type={inputTypes.TEXT}
          name="apiKey"
          readOnly={true}
          helpTextWarning={translate('RestartRequiredHelpTextWarning')}
          buttons={[
            <ClipboardButton
              key="copy"
              value={apiKey.value}
              kind={kinds.DEFAULT}
            />,

            <FormInputButton
              key="reset"
              kind={kinds.DANGER}
              onPress={handleResetApiKeyPress}
            >
              <Icon name={icons.REFRESH} isSpinning={isResettingApiKey} />
            </FormInputButton>,

            <FormInputButton
              key="apidocumentation"
              kind={kinds.PRIMARY}
              to="/docs"
              target="_blank"
              title={translate('ApiDocumentation')}
              noRouter={true}
            >
              <Icon name={icons.DOCUMENTATION} />
            </FormInputButton>,
          ]}
          onChange={onInputChange}
          onFocus={handleApiKeyFocus}
          {...apiKey}
        />
      </FormGroup>

      <FormGroup>
        <FormLabel>{translate('CertificateValidation')}</FormLabel>

        <FormInputGroup
          type={inputTypes.SELECT}
          name="certificateValidation"
          values={certificateValidationOptions}
          helpText={translate('CertificateValidationHelpText')}
          onChange={onInputChange}
          {...certificateValidation}
        />
      </FormGroup>

      <ConfirmModal
        isOpen={isConfirmApiKeyResetModalOpen}
        kind={kinds.DANGER}
        title={translate('ResetAPIKey')}
        message={translate('ResetAPIKeyMessageText')}
        confirmLabel={translate('Reset')}
        onConfirm={handleConfirmResetApiKey}
        onCancel={handleCloseResetApiKeyModal}
      />
    </FieldSet>
  );
}

export default SecuritySettings;
