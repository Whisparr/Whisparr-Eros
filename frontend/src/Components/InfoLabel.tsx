import classNames from 'classnames';
import React, { ComponentProps, ReactNode } from 'react';
import { sizes } from 'Helpers/Props';
import { Kind } from 'Helpers/Props/kinds';
import { Size } from 'Helpers/Props/sizes';
import styles from './InfoLabel.css';

export interface InfoLabelProps extends ComponentProps<'span'> {
  name: string;
  // InfoLabel.css has an empty `/** Kinds **/` section, so unlike Label the
  // kind never resolves to a class. The prop stays because a consumer passes
  // it; the lookup is gone because it could only ever produce `undefined`.
  kind?: Kind;
  size?: Extract<Size, keyof typeof styles>;
  outline?: boolean;
  children: ReactNode;
}

export default function InfoLabel({
  className = styles.label,
  name,
  kind,
  // Destructured out rather than spread, which is what has always happened
  // here: two MovieDetails labels pass a `title` that never reaches the span.
  title,
  size = sizes.SMALL,
  outline = false,
  children,
  ...otherProps
}: InfoLabelProps) {
  return (
    <span
      className={classNames(className, styles[size], outline && styles.outline)}
      {...otherProps}
    >
      <div className={styles.name}>{name}</div>
      <div>{children}</div>
    </span>
  );
}
