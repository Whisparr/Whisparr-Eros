import React, { useCallback, useState } from 'react';
import FormGroup from 'Components/Form/FormGroup';
import FormInputGroup from 'Components/Form/FormInputGroup';
import FormLabel from 'Components/Form/FormLabel';
import Button from 'Components/Link/Button';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import { inputTypes } from 'Helpers/Props';
import { EnhancedSelectInputChanged } from 'typings/inputs';
import translate from 'Utilities/String/translate';
import styles from './EditStudiosModalContent.css';

interface SavePayload {
  monitored?: boolean;
  moviesMonitored?: boolean;
  qualityProfileId?: number;
  rootFolderPath?: string;
  searchOnAdd?: boolean;
  afterDate?: string;
}

interface EditStudiosModalContentProps {
  studioIds: number[];
  onSavePress(payload: object): void;
  onModalClose(): void;
}

const NO_CHANGE = 'noChange';
const SET_DATE = 'setDate';
const CLEAR_DATE = 'clearDate';

const monitoredOptions = [
  {
    key: NO_CHANGE,
    get value() {
      return translate('NoChange');
    },
    disabled: true,
  },
  {
    key: 'monitored',
    get value() {
      return translate('Monitored');
    },
  },
  {
    key: 'unmonitored',
    get value() {
      return translate('Unmonitored');
    },
  },
];

const searchOnAddOptions = [
  {
    key: NO_CHANGE,
    get value() {
      return translate('NoChange');
    },
    disabled: true,
  },
  {
    key: 'true',
    get value() {
      return translate('Yes');
    },
  },
  {
    key: 'false',
    get value() {
      return translate('No');
    },
  },
];

// A date box on its own can't say whether a blank means "leave every studio alone"
// or "clear them all", so the choice is made in a select and the box only appears
// once the user has asked to set a date.
const afterDateOptions = [
  {
    key: NO_CHANGE,
    get value() {
      return translate('NoChange');
    },
    disabled: true,
  },
  {
    key: SET_DATE,
    get value() {
      return translate('SetDate');
    },
  },
  {
    key: CLEAR_DATE,
    get value() {
      return translate('Clear');
    },
  },
];

function EditStudiosModalContent(
  props: Readonly<EditStudiosModalContentProps>
) {
  const { studioIds, onSavePress, onModalClose } = props;

  const [monitored, setMonitored] = useState<string | number>(NO_CHANGE);

  const [moviesMonitored, setMoviesMonitored] = useState<string | number>(
    NO_CHANGE
  );

  const [qualityProfileId, setQualityProfileId] = useState<string | number>(
    NO_CHANGE
  );
  const [rootFolderPath, setRootFolderPath] = useState<string | number>(
    NO_CHANGE
  );

  const [searchOnAdd, setSearchOnAdd] = useState<string | number>(NO_CHANGE);

  const [afterDateMode, setAfterDateMode] = useState<string | number>(
    NO_CHANGE
  );
  const [afterDate, setAfterDate] = useState('');

  const save = useCallback(() => {
    let hasChanges = false;
    const payload: SavePayload = {};

    if (monitored !== NO_CHANGE) {
      hasChanges = true;
      payload.monitored = monitored === 'monitored';
    }

    if (moviesMonitored !== NO_CHANGE) {
      hasChanges = true;
      payload.moviesMonitored = moviesMonitored === 'monitored';
    }

    if (qualityProfileId !== NO_CHANGE) {
      hasChanges = true;
      payload.qualityProfileId = qualityProfileId as number;
    }

    if (rootFolderPath !== NO_CHANGE) {
      hasChanges = true;
      payload.rootFolderPath = rootFolderPath as string;
    }

    if (searchOnAdd !== NO_CHANGE) {
      hasChanges = true;
      payload.searchOnAdd = searchOnAdd === 'true';
    }

    if (afterDateMode === CLEAR_DATE) {
      hasChanges = true;
      payload.afterDate = '';
    } else if (afterDateMode === SET_DATE && afterDate) {
      hasChanges = true;
      payload.afterDate = afterDate;
    }

    if (hasChanges) {
      onSavePress(payload);
    }

    onModalClose();
  }, [
    monitored,
    moviesMonitored,
    qualityProfileId,
    rootFolderPath,
    searchOnAdd,
    afterDateMode,
    afterDate,
    onSavePress,
    onModalClose,
  ]);

  const onInputChange = useCallback(
    ({ name, value }: EnhancedSelectInputChanged<string | number>) => {
      switch (name) {
        case 'monitored':
          setMonitored(value);
          break;
        case 'moviesMonitored':
          setMoviesMonitored(value);
          break;
        case 'qualityProfileId':
          setQualityProfileId(value);
          break;
        case 'rootFolderPath':
          setRootFolderPath(value);
          break;
        case 'searchOnAdd':
          setSearchOnAdd(value);
          break;
        case 'afterDateMode':
          setAfterDateMode(value);
          break;
        case 'afterDate':
          setAfterDate(value as string);
          break;
        default:
          console.warn('EditStudiosModalContent Unknown Input');
      }
    },
    [setMonitored]
  );

  const onSavePressWrapper = useCallback(() => {
    save();
  }, [save]);

  const selectedCount = studioIds.length;

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>{translate('EditSelectedStudios')}</ModalHeader>

      <ModalBody>
        <FormGroup>
          <FormLabel>{translate('MonitoredScene')}</FormLabel>

          <FormInputGroup
            type={inputTypes.SELECT}
            name="monitored"
            helpText={translate('MonitoredStudioHelpText')}
            value={monitored}
            values={monitoredOptions}
            onChange={onInputChange}
          />
        </FormGroup>

        <FormGroup>
          <FormLabel>{translate('MonitoredMovie')}</FormLabel>

          <FormInputGroup
            type={inputTypes.SELECT}
            name="moviesMonitored"
            helpText={translate('MonitoredStudioMovieHelpText')}
            value={moviesMonitored}
            values={monitoredOptions}
            onChange={onInputChange}
          />
        </FormGroup>

        <FormGroup>
          <FormLabel>{translate('QualityProfile')}</FormLabel>

          <FormInputGroup
            type={inputTypes.QUALITY_PROFILE_SELECT}
            name="qualityProfileId"
            value={qualityProfileId}
            includeNoChange={true}
            includeNoChangeDisabled={false}
            onChange={onInputChange}
          />
        </FormGroup>

        <FormGroup>
          <FormLabel>{translate('RootFolder')}</FormLabel>

          <FormInputGroup
            type={inputTypes.ROOT_FOLDER_SELECT}
            name="rootFolderPath"
            value={rootFolderPath as string}
            includeNoChange={true}
            includeNoChangeDisabled={false}
            selectedValueOptions={{ includeFreeSpace: false }}
            helpText={translate('MovieEditRootFolderHelpText')}
            onChange={onInputChange}
          />
        </FormGroup>

        <FormGroup>
          <FormLabel>{translate('SearchOnAdd')}</FormLabel>

          <FormInputGroup
            type={inputTypes.SELECT}
            name="searchOnAdd"
            helpText={translate('SearchOnAddStudioHelpText')}
            value={searchOnAdd}
            values={searchOnAddOptions}
            onChange={onInputChange}
          />
        </FormGroup>

        <FormGroup>
          <FormLabel>{translate('MonitorAfter')}</FormLabel>

          <FormInputGroup
            type={inputTypes.SELECT}
            name="afterDateMode"
            value={afterDateMode}
            values={afterDateOptions}
            onChange={onInputChange}
          />
        </FormGroup>

        {afterDateMode === SET_DATE ? (
          <FormGroup>
            <FormLabel>{translate('Date')}</FormLabel>

            <FormInputGroup
              type={inputTypes.DATE}
              name="afterDate"
              helpText={translate('MonitorAfterStudioHelpText')}
              value={afterDate}
              onChange={onInputChange}
            />
          </FormGroup>
        ) : null}
      </ModalBody>

      <ModalFooter className={styles.modalFooter}>
        <div className={styles.selected}>
          {translate('StudiosSelectedInterp', { count: selectedCount })}
        </div>

        <div>
          <Button onPress={onModalClose}>{translate('Cancel')}</Button>

          <Button onPress={onSavePressWrapper}>
            {translate('ApplyChanges')}
          </Button>
        </div>
      </ModalFooter>
    </ModalContent>
  );
}

export default EditStudiosModalContent;
