import classNames from 'classnames';
import React, { SyntheticEvent, useCallback, useMemo } from 'react';
import SpinnerIconButton from 'Components/Link/SpinnerIconButton';
import { icons } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import styles from './MonitorToggleButton.css';

interface MonitorToggleButtonProps {
  className?: string;
  monitored: boolean;
  moviesMonitored?: boolean;
  type?: string;
  size?: number;
  isDisabled?: boolean;
  tooltip?: string;
  isSaving?: boolean;
  onPress: (
    value: MonitorTogglePressValue,
    options: { shiftKey: boolean }
  ) => unknown;
}

// `onPress` is handed an object only when `type` selects one of the two-state
// movie/scene toggles; every other caller gets a bare boolean.
export type MonitorTogglePressValue =
  boolean | { monitored: boolean; moviesMonitored: boolean };

export function getToggledMonitored(value: MonitorTogglePressValue) {
  return typeof value === 'boolean' ? value : value.monitored;
}

function getTooltip(
  monitored: boolean,
  type?: string,
  isDisabled?: boolean,
  tooltip?: string
) {
  if (tooltip) return tooltip;
  if (isDisabled)
    return 'Cannot toggle monitored state when movie is unmonitored';
  if (monitored) {
    const monitoredLabels: Record<string, string> = {
      movieMonitor: translate('ToggleMonitoredToUnmonitoredMovies'),
      sceneMonitor: translate('ToggleMonitoredToUnmonitoredScenes'),
    };
    return monitoredLabels[type ?? ''] ?? 'Monitored, click to unmonitor';
  }
  const unMonitoredLabels: Record<string, string> = {
    movieMonitor: translate('ToggleUnmonitoredToMonitoredMovies'),
    sceneMonitor: translate('ToggleUnmonitoredToMonitoredScenes'),
  };
  return (
    unMonitoredLabels[type ?? ''] ?? translate('ToggleUnmonitoredToMonitored')
  );
}

function MonitorToggleButton(props: MonitorToggleButtonProps) {
  const {
    className = styles.toggleButton,
    monitored,
    moviesMonitored = false,
    type,
    isDisabled = false,
    tooltip,
    isSaving = false,
    size,
    onPress,
    ...otherProps
  } = props;

  let monitorType: 'movie' | 'scene' | undefined = undefined;
  switch (type) {
    case 'movieMonitor':
      monitorType = 'movie';
      break;
    case 'sceneMonitor':
      monitorType = 'scene';
      break;
    default:
      monitorType = undefined;
  }

  const monitoredValue = monitorType === 'movie' ? moviesMonitored : monitored;

  let iconName = icons.UNMONITORED;
  if (monitorType) {
    const iconSet =
      monitorType === 'movie'
        ? { monitored: icons.FILM, unmonitored: icons.FILMUNMONITOR }
        : { monitored: icons.SCENE, unmonitored: icons.SCENEUNMONITOR };
    iconName = monitoredValue ? iconSet.monitored : iconSet.unmonitored;
  } else if (monitoredValue) {
    iconName = icons.MONITORED;
  }

  const title = useMemo(
    () => getTooltip(monitoredValue, type, isDisabled, tooltip),
    [monitoredValue, type, isDisabled, tooltip]
  );

  const handlePress = useCallback(
    (event: SyntheticEvent<HTMLLinkElement, MouseEvent>) => {
      const shiftKey = event.nativeEvent.shiftKey;
      if (type === 'movieMonitor') {
        onPress({ monitored, moviesMonitored: !moviesMonitored }, { shiftKey });
      } else if (type === 'sceneMonitor') {
        onPress({ monitored: !monitored, moviesMonitored }, { shiftKey });
      } else {
        onPress(!monitored, { shiftKey });
      }
    },
    [monitored, moviesMonitored, type, onPress]
  );

  return (
    <SpinnerIconButton
      className={classNames(className, isDisabled && styles.isDisabled)}
      name={iconName}
      size={size}
      title={title}
      isDisabled={isDisabled}
      isSpinning={isSaving}
      {...otherProps}
      onPress={handlePress}
    />
  );
}

export default MonitorToggleButton;
