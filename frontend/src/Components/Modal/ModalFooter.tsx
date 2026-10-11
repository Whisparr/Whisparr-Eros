import React from 'react';
import styles from './ModalFooter.module.css';

interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

function ModalFooter({ children, ...otherProps }: ModalFooterProps) {
  return (
    <div className={styles.modalFooter} {...otherProps}>
      {children}
    </div>
  );
}

export default ModalFooter;
