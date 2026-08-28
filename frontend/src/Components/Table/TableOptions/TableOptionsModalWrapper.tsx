import React from 'react';
import useModalOpenState from 'Helpers/Hooks/useModalOpenState';
import TableOptionsModal, { TableOptionsModalProps } from './TableOptionsModal';

export interface TableOptionsModalWrapperProps extends Omit<
  TableOptionsModalProps,
  'isOpen' | 'onModalClose'
> {
  // The toolbar button or header cell icon the wrapper hangs the modal off;
  // it is cloned with the press handler that opens it.
  children: React.ReactElement<{ onPress?: () => void }>;
}

function TableOptionsModalWrapper({
  children,
  ...otherProps
}: Readonly<TableOptionsModalWrapperProps>) {
  const [
    isTableOptionsModalOpen,
    setTableOptionsModalOpen,
    setTableOptionsModalClosed,
  ] = useModalOpenState(false);

  return (
    <>
      {React.cloneElement(children, { onPress: setTableOptionsModalOpen })}

      <TableOptionsModal
        {...otherProps}
        isOpen={isTableOptionsModalOpen}
        onModalClose={setTableOptionsModalClosed}
      />
    </>
  );
}

export default TableOptionsModalWrapper;
