import React, { useCallback, useEffect } from 'react';
import Alert from 'Components/Alert';
import Form from 'Components/Form/Form';
import FormGroup from 'Components/Form/FormGroup';
import FormInputGroup from 'Components/Form/FormInputGroup';
import FormLabel from 'Components/Form/FormLabel';
import Button from 'Components/Link/Button';
import SpinnerErrorButton from 'Components/Link/SpinnerErrorButton';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import usePrevious from 'Helpers/Hooks/usePrevious';
import { inputTypes, kinds } from 'Helpers/Props';
import { InputChanged } from 'typings/inputs';
import translate from 'Utilities/String/translate';
import {
  DEFAULT_DELAY_PROFILE_ID,
  DelayProfile,
  useManageDelayProfile,
} from './useDelayProfiles';
import styles from './EditDelayProfileModalContent.css';

const protocolOptions = [
  {
    key: 'preferUsenet',
    get value() {
      return translate('PreferUsenet');
    },
  },
  {
    key: 'preferTorrent',
    get value() {
      return translate('PreferTorrent');
    },
  },
  {
    key: 'onlyUsenet',
    get value() {
      return translate('OnlyUsenet');
    },
  },
  {
    key: 'onlyTorrent',
    get value() {
      return translate('OnlyTorrent');
    },
  },
];

interface EditDelayProfileModalContentProps {
  id?: number;
  onModalClose: () => void;
  onDeleteDelayProfilePress?: () => void;
}

function EditDelayProfileModalContent({
  id,
  onModalClose,
  onDeleteDelayProfilePress,
}: Readonly<EditDelayProfileModalContentProps>) {
  const {
    item,
    isSaving,
    saveError,
    validationErrors,
    validationWarnings,
    updateValue,
    saveProvider,
  } = useManageDelayProfile(id ?? 0);

  const {
    enableUsenet,
    enableTorrent,
    preferredProtocol,
    usenetDelay,
    torrentDelay,
    bypassIfHighestQuality,
    bypassIfAboveCustomFormatScore,
    minimumCustomFormatScore,
    tags,
  } = item;

  const wasSaving = usePrevious(isSaving);

  // The three fields the server keeps are one choice on screen: whether a
  // protocol is enabled at all, and which of the two wins when both are.
  let protocol =
    preferredProtocol.value === 'usenet' ? 'preferUsenet' : 'preferTorrent';

  if (!enableUsenet.value) {
    protocol = 'onlyTorrent';
  }

  if (!enableTorrent.value) {
    protocol = 'onlyUsenet';
  }

  const handleInputChange = useCallback(
    ({ name, value }: InputChanged) => {
      updateValue(
        name as keyof DelayProfile,
        value as DelayProfile[keyof DelayProfile]
      );
    },
    [updateValue]
  );

  const handleProtocolChange = useCallback(
    ({ value }: InputChanged) => {
      switch (value) {
        case 'preferUsenet':
          updateValue('enableUsenet', true);
          updateValue('enableTorrent', true);
          updateValue('preferredProtocol', 'usenet');
          break;
        case 'preferTorrent':
          updateValue('enableUsenet', true);
          updateValue('enableTorrent', true);
          updateValue('preferredProtocol', 'torrent');
          break;
        case 'onlyUsenet':
          updateValue('enableUsenet', true);
          updateValue('enableTorrent', false);
          updateValue('preferredProtocol', 'usenet');
          break;
        case 'onlyTorrent':
          updateValue('enableUsenet', false);
          updateValue('enableTorrent', true);
          updateValue('preferredProtocol', 'torrent');
          break;
        default:
          throw Error(`Unknown protocol option: ${value}`);
      }
    },
    [updateValue]
  );

  const handleSavePress = useCallback(() => {
    saveProvider();
  }, [saveProvider]);

  useEffect(() => {
    if (wasSaving && !isSaving && !saveError) {
      onModalClose();
    }
  }, [wasSaving, isSaving, saveError, onModalClose]);

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>
        {id ? translate('EditDelayProfile') : translate('AddDelayProfile')}
      </ModalHeader>

      <ModalBody>
        <Form
          validationErrors={validationErrors}
          validationWarnings={validationWarnings}
        >
          <FormGroup>
            <FormLabel>{translate('PreferredProtocol')}</FormLabel>

            <FormInputGroup
              type={inputTypes.SELECT}
              name="protocol"
              value={protocol}
              values={protocolOptions}
              helpText={translate('ProtocolHelpText')}
              onChange={handleProtocolChange}
            />
          </FormGroup>

          {enableUsenet.value ? (
            <FormGroup>
              <FormLabel>{translate('UsenetDelay')}</FormLabel>

              <FormInputGroup
                type={inputTypes.NUMBER}
                name="usenetDelay"
                unit="minutes"
                {...usenetDelay}
                helpText={translate('UsenetDelayHelpText')}
                onChange={handleInputChange}
              />
            </FormGroup>
          ) : null}

          {enableTorrent.value ? (
            <FormGroup>
              <FormLabel>{translate('TorrentDelay')}</FormLabel>

              <FormInputGroup
                type={inputTypes.NUMBER}
                name="torrentDelay"
                unit="minutes"
                {...torrentDelay}
                helpText={translate('TorrentDelayHelpText')}
                onChange={handleInputChange}
              />
            </FormGroup>
          ) : null}

          <FormGroup>
            <FormLabel>{translate('BypassDelayIfHighestQuality')}</FormLabel>

            <FormInputGroup
              type={inputTypes.CHECK}
              name="bypassIfHighestQuality"
              {...bypassIfHighestQuality}
              helpText={translate('BypassDelayIfHighestQualityHelpText')}
              onChange={handleInputChange}
            />
          </FormGroup>

          <FormGroup>
            <FormLabel>
              {translate('BypassDelayIfAboveCustomFormatScore')}
            </FormLabel>

            <FormInputGroup
              type={inputTypes.CHECK}
              name="bypassIfAboveCustomFormatScore"
              {...bypassIfAboveCustomFormatScore}
              helpText={translate(
                'BypassDelayIfAboveCustomFormatScoreHelpText'
              )}
              onChange={handleInputChange}
            />
          </FormGroup>

          {bypassIfAboveCustomFormatScore.value ? (
            <FormGroup>
              <FormLabel>
                {translate('BypassDelayIfAboveCustomFormatScoreMinimumScore')}
              </FormLabel>

              <FormInputGroup
                type={inputTypes.NUMBER}
                name="minimumCustomFormatScore"
                {...minimumCustomFormatScore}
                helpText={translate(
                  'BypassDelayIfAboveCustomFormatScoreMinimumScoreHelpText'
                )}
                onChange={handleInputChange}
              />
            </FormGroup>
          ) : null}

          {id === DEFAULT_DELAY_PROFILE_ID ? (
            <Alert>{translate('DefaultDelayProfileMovie')}</Alert>
          ) : (
            <FormGroup>
              <FormLabel>{translate('Tags')}</FormLabel>

              <FormInputGroup
                type={inputTypes.TAG}
                name="tags"
                {...tags}
                helpText={translate('DelayProfileMovieTagsHelpText')}
                onChange={handleInputChange}
              />
            </FormGroup>
          )}
        </Form>
      </ModalBody>

      <ModalFooter>
        {id && id > DEFAULT_DELAY_PROFILE_ID ? (
          <Button
            className={styles.deleteButton}
            kind={kinds.DANGER}
            onPress={onDeleteDelayProfilePress}
          >
            {translate('Delete')}
          </Button>
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
    </ModalContent>
  );
}

export default EditDelayProfileModalContent;
