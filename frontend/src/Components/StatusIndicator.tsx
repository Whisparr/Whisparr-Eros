import classNames from 'classnames';
import React, { ComponentProps, ReactNode } from 'react';
import styles from './StatusIndicator.css';

interface StatusIndicatorProps extends ComponentProps<'span'> {
  label: string;
  children: ReactNode;
}

// An icon carries no text, so a `title` alone leaves a screen reader with
// nothing to announce. The label is rendered and visually hidden instead.
export default function StatusIndicator({
  className,
  label,
  children,
  ...otherProps
}: Readonly<StatusIndicatorProps>) {
  return (
    <span className={classNames(styles.status, className)} {...otherProps}>
      <span className={styles.label}>{label}</span>
      {children}
    </span>
  );
}
