import React, { useMemo } from 'react';
import Alert from 'Components/Alert';
import Button from 'Components/Link/Button';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import { CustomFilter as CustomFilterModel } from 'Filters/Filter';
import sortByProp from 'Utilities/Array/sortByProp';
import translate from 'Utilities/String/translate';
import CustomFilter from './CustomFilter';
import styles from './CustomFiltersModalContent.css';

interface CustomFiltersModalContentProps {
  selectedFilterKey: string | number;
  customFilters: CustomFilterModel[];
  dispatchSetFilter: (payload: { selectedFilterKey: string | number }) => void;
  onAddCustomFilter: () => void;
  onEditCustomFilter: (id: number) => void;
  onModalClose: () => void;
}

function CustomFiltersModalContent({
  selectedFilterKey,
  customFilters,
  dispatchSetFilter,
  onAddCustomFilter,
  onEditCustomFilter,
  onModalClose,
}: CustomFiltersModalContentProps) {
  const sorted = useMemo(
    () => [...customFilters].sort(sortByProp('label')),
    [customFilters]
  );

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>{translate('CustomFilters')}</ModalHeader>

      <ModalBody>
        {sorted.map((customFilter) => {
          return (
            <CustomFilter
              key={customFilter.id}
              id={customFilter.id}
              label={customFilter.label}
              selectedFilterKey={selectedFilterKey}
              dispatchSetFilter={dispatchSetFilter}
              onEditPress={onEditCustomFilter}
            />
          );
        })}

        <div className={styles.addButtonContainer}>
          <Button onPress={onAddCustomFilter}>
            {translate('AddCustomFilter')}
          </Button>
        </div>
        <Alert kind="info">
          {translate('FilterMoviePropertiesOnlyNotFileWarning')}
        </Alert>
      </ModalBody>

      <ModalFooter>
        <Button onPress={onModalClose}>{translate('Close')}</Button>
      </ModalFooter>
    </ModalContent>
  );
}

export default CustomFiltersModalContent;
