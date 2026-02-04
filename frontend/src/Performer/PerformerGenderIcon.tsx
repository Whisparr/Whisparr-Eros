import React from 'react';
import Icon from 'Components/Icon';
import { getGenderDetails } from './Gender';

interface PerformerGenderIconProps {
  gender: string;
  size?: number;
  className?: string;
}

function PerformerGenderIcon({
  gender,
  size,
  className,
}: PerformerGenderIconProps) {
  const icon = getGenderDetails(gender).icon;
  return <Icon name={icon} size={size} title={gender} className={className} />;
}

export default PerformerGenderIcon;
