import { move } from '@dnd-kit/helpers';
import { DragDropProvider, DragEndEvent, DragOverEvent } from '@dnd-kit/react';
import cloneDeep from 'lodash/cloneDeep';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Form from 'Components/Form/Form';
import FormGroup from 'Components/Form/FormGroup';
import FormInputGroup from 'Components/Form/FormInputGroup';
import FormInputHelpText from 'Components/Form/FormInputHelpText';
import FormLabel from 'Components/Form/FormLabel';
import Button from 'Components/Link/Button';
import Modal from 'Components/Modal/Modal';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import Column from 'Components/Table/Column';
import usePrevious from 'Helpers/Hooks/usePrevious';
import { inputTypes } from 'Helpers/Props';
import { CheckInputChanged, InputChanged } from 'typings/inputs';
import { TableOptionsChangePayload } from 'typings/Table';
import translate from 'Utilities/String/translate';
import TableOptionsColumn from './TableOptionsColumn';
import styles from './TableOptionsModal.module.css';

const DEFAULT_MAX_PAGE_SIZE = 250;

export interface TableOptionsModalProps {
  isOpen: boolean;
  columns: Column[];
  pageSize?: number;
  maxPageSize?: number;
  canModifyColumns?: boolean;
  // Each section supplies its own options form; the modal only hands it the
  // change handler, so the props stay the section's business.
  optionsComponent?: React.ElementType;
  onTableOptionChange: (payload: TableOptionsChangePayload) => void;
  onModalClose: () => void;
}

function TableOptionsModal({
  isOpen,
  columns,
  pageSize,
  maxPageSize = DEFAULT_MAX_PAGE_SIZE,
  canModifyColumns = true,
  optionsComponent: OptionsComponent,
  onTableOptionChange,
  onModalClose,
}: Readonly<TableOptionsModalProps>) {
  // The wrapper mounts the modal once and toggles `isOpen`, so this is fixed
  // at the `pageSize` the section had on its first render.
  const hasPageSize = useRef(!!pageSize).current;
  const [pageSizeValue, setPageSizeValue] = useState(pageSize);
  const [pageSizeError, setPageSizeError] = useState<string | null>(null);
  // While a column is being dragged the list is reordered locally, and only
  // the final order is handed back when the drag ends.
  const [localColumnNames, setLocalColumnNames] = useState<string[] | null>(
    null
  );

  const previousPageSize = usePrevious(pageSize);

  // `componentDidUpdate` compared the *previous* `pageSize` prop against the
  // current state rather than against the current prop, so a value the user
  // typed that the section rejects snaps back to the prop. `NumberInput`
  // keeps its own value while focused, which is what hides it mid-edit.
  // Converted as it stands -- see the migration doc.
  useEffect(() => {
    if (previousPageSize !== pageSizeValue) {
      setPageSizeValue(pageSize);
    }
  }, [pageSize, pageSizeValue, previousPageSize]);

  const handlePageSizeChange = useCallback(
    ({ value }: InputChanged<number | null>) => {
      let newPageSizeError: string | null = null;

      // A cleared input reads as `null`, which the class compared with `<`
      // and so treated as below the minimum.
      if (value === null || value < 5) {
        newPageSizeError = translate('TablePageSizeMinimum', {
          minimumValue: '5',
        });
      } else if (value > maxPageSize) {
        newPageSizeError = translate('TablePageSizeMaximum', {
          maximumValue: `${maxPageSize}`,
        });
      } else {
        onTableOptionChange({ pageSize: value });
      }

      setPageSizeValue(value ?? undefined);
      setPageSizeError(newPageSizeError);
    },
    [maxPageSize, onTableOptionChange]
  );

  const handleVisibleChange = useCallback(
    ({ name, value }: CheckInputChanged) => {
      const newColumns = cloneDeep(columns);
      const column = newColumns.find((c) => c.name === name);

      // The name comes off a column this modal rendered, so it cannot miss.
      if (!column) {
        return;
      }

      column.isVisible = value;

      onTableOptionChange({ columns: newColumns });
    },
    [columns, onTableOptionChange]
  );

  const columnsByName = useMemo(
    () => new Map(columns.map((column) => [column.name, column])),
    [columns]
  );

  const displayedColumns = localColumnNames
    ? localColumnNames.map((name) => columnsByName.get(name)!)
    : columns;

  const handleDragStart = useCallback(() => {
    setLocalColumnNames(columns.map((column) => column.name));
  }, [columns]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    setLocalColumnNames((current) =>
      current ? move(current, event) : current
    );
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setLocalColumnNames((current) => {
        if (current && !event.canceled) {
          onTableOptionChange({
            columns: move(current, event).map((name) =>
              columnsByName.get(name)!
            ),
          });
        }

        return null;
      });
    },
    [columnsByName, onTableOptionChange]
  );

  return (
    <Modal isOpen={isOpen} onModalClose={onModalClose}>
      {isOpen ? (
        <ModalContent onModalClose={onModalClose}>
          <ModalHeader>{translate('TableOptions')}</ModalHeader>

          <ModalBody>
            <Form>
              {hasPageSize ? (
                <FormGroup>
                  <FormLabel>{translate('TablePageSize')}</FormLabel>

                  <FormInputGroup
                    type={inputTypes.NUMBER}
                    name="pageSize"
                    value={pageSizeValue || 0}
                    helpText={translate('TablePageSizeHelpText')}
                    errors={
                      pageSizeError ? [{ message: pageSizeError }] : undefined
                    }
                    onChange={handlePageSizeChange}
                  />
                </FormGroup>
              ) : null}

              {OptionsComponent ? (
                <OptionsComponent onTableOptionChange={onTableOptionChange} />
              ) : null}

              {canModifyColumns ? (
                <FormGroup>
                  <FormLabel>{translate('TableColumns')}</FormLabel>

                  <div>
                    <FormInputHelpText
                      text={translate('TableColumnsHelpText')}
                    />

                    <DragDropProvider
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDragEnd={handleDragEnd}
                    >
                      <div className={styles.columns}>
                        {displayedColumns.map((column, index) => {
                          const {
                            name,
                            label,
                            columnLabel,
                            isVisible,
                            isModifiable = 'enabled',
                          } = column;

                          return (
                            <TableOptionsColumn
                              key={name}
                              name={name}
                              label={columnLabel || label}
                              isVisible={isVisible}
                              isModifiable={isModifiable}
                              index={index}
                              onVisibleChange={handleVisibleChange}
                            />
                          );
                        })}
                      </div>
                    </DragDropProvider>
                  </div>
                </FormGroup>
              ) : null}
            </Form>
          </ModalBody>

          <ModalFooter>
            <Button onPress={onModalClose}>{translate('Close')}</Button>
          </ModalFooter>
        </ModalContent>
      ) : null}
    </Modal>
  );
}

export default TableOptionsModal;
