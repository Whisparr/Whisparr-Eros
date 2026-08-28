import { cloneDeep } from 'lodash';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  DndProvider,
  HTML5DragTransition,
  TouchTransition,
} from 'react-dnd-multi-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
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
import TableOptionsColumnDragPreview from './TableOptionsColumnDragPreview';
import TableOptionsColumnDragSource from './TableOptionsColumnDragSource';
import styles from './TableOptionsModal.css';

const HTML5toTouch = {
  backends: [
    { id: 'html5', backend: HTML5Backend, transition: HTML5DragTransition },
    {
      id: 'touch',
      backend: TouchBackend,
      options: { enableMouseEvents: true },
      preview: true,
      transition: TouchTransition,
    },
  ],
};

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
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

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

  const handleColumnDragMove = useCallback(
    (newDragIndex: number, newDropIndex: number) => {
      setDragIndex(newDragIndex);
      setDropIndex(newDropIndex);
    },
    []
  );

  const handleColumnDragEnd = useCallback(
    (didDrop: boolean) => {
      // The two indexes are only ever set together, so the class checked the
      // drop index alone.
      if (didDrop && dropIndex !== null && dragIndex !== null) {
        const newColumns = cloneDeep(columns);
        const items = newColumns.splice(dragIndex, 1);
        newColumns.splice(dropIndex, 0, items[0]);

        onTableOptionChange({ columns: newColumns });
      }

      setDragIndex(null);
      setDropIndex(null);
    },
    [columns, dragIndex, dropIndex, onTableOptionChange]
  );

  const isDragging = dropIndex !== null && dragIndex !== null;
  const isDraggingUp = isDragging && dropIndex < dragIndex;
  const isDraggingDown = isDragging && dropIndex > dragIndex;

  return (
    <DndProvider options={HTML5toTouch}>
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

                      <div className={styles.columns}>
                        {columns.map((column, index) => {
                          const {
                            name,
                            label,
                            columnLabel,
                            isVisible,
                            isModifiable,
                          } = column;

                          if (isModifiable !== false) {
                            return (
                              <TableOptionsColumnDragSource
                                key={name}
                                name={name}
                                label={columnLabel || label}
                                isVisible={isVisible}
                                isModifiable={true}
                                index={index}
                                isDraggingUp={isDraggingUp}
                                isDraggingDown={isDraggingDown}
                                onVisibleChange={handleVisibleChange}
                                onColumnDragMove={handleColumnDragMove}
                                onColumnDragEnd={handleColumnDragEnd}
                              />
                            );
                          }

                          return (
                            <TableOptionsColumn
                              key={name}
                              name={name}
                              label={columnLabel || label}
                              isVisible={isVisible}
                              isModifiable={false}
                              onVisibleChange={handleVisibleChange}
                            />
                          );
                        })}

                        <TableOptionsColumnDragPreview />
                      </div>
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
    </DndProvider>
  );
}

export default TableOptionsModal;
