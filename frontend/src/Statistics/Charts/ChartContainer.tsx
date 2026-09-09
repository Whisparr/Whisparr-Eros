import React, { ReactNode } from 'react';
import styles from './ChartContainer.css';

interface ChartContainerProps {
  title: string;
  children: ReactNode;
}

export default function ChartContainer({
  title,
  children,
}: Readonly<ChartContainerProps>) {
  return (
    <div className={styles.container}>
      <div className={styles.title}>{title}</div>
      <div className={styles.chart}>{children}</div>
    </div>
  );
}
