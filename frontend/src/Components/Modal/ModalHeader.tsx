import React from 'react';
import { useModalContext } from './ModalContext';
import styles from './ModalHeader.css';

interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

function ModalHeader({ children, ...otherProps }: ModalHeaderProps) {
  const { headerId } = useModalContext();

  return (
    <div id={headerId} className={styles.modalHeader} {...otherProps}>
      {children}
    </div>
  );
}

export default ModalHeader;
