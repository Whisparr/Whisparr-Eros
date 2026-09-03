import React from 'react';
import Icon from 'Components/Icon';
import { getGenderDetails } from './Gender';

interface PerformerGenderIconProps {
  gender: string;
  size?: number;
  className?: string;
  // Defaults to the gender itself. Pass a caller-supplied string to describe a
  // group of icons, or null to leave the tooltip to a wrapping element.
  title?: string | null;
}

function PerformerGenderIcon({
  gender,
  size,
  className,
  title,
}: Readonly<PerformerGenderIconProps>) {
  const icon = getGenderDetails(gender).icon;

  return (
    <Icon
      name={icon}
      size={size}
      title={title === undefined ? gender : title}
      className={className}
    />
  );
}

export default PerformerGenderIcon;
