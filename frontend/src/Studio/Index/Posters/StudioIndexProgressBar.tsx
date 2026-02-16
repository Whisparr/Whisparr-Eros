import { round } from 'lodash';
import React from 'react';
import ProgressBar from 'Components/ProgressBar';
import { kinds, sizes } from 'Helpers/Props';
import { Kind } from 'Helpers/Props/kinds';
import Studio from 'Studio/Studio';
import styles from './StudioIndexProgressBar.css';

interface StudioIndexProgressBarProps {
  Studio: Studio;
  width: number;
  detailedProgressBar?: boolean;
  bottomRadius?: boolean;
  isStandAlone?: boolean;
}

function StudioIndexProgressBar({
  Studio,
  width,
  detailedProgressBar,
  bottomRadius,
  isStandAlone,
}: StudioIndexProgressBarProps) {
  const sceneCount = Studio.sceneCount;
  const movieCount = Studio.movieCount;
  const totalSceneCount = Studio.totalSceneCount;
  const totalMovieCount = Studio.totalMovieCount;
  const withFiles = sceneCount + movieCount;
  const total = totalSceneCount + totalMovieCount;
  const progressText = `${withFiles} / ${total}`;
  const attachedClassName = bottomRadius
    ? styles.progressRadius
    : styles.progress;
  const containerClassName = isStandAlone ? undefined : attachedClassName;
  let kind: Kind = kinds.DEFAULT;

  const rawProgress =
    ((sceneCount + movieCount) / (totalSceneCount + totalMovieCount)) * 100;
  const progress = rawProgress < 1 && rawProgress > 0 ? 1 : round(rawProgress);
  const monitored = Studio.monitored || Studio.moviesMonitored;

  let progressBar = progress;

  if (progress === 0) {
    kind = monitored ? kinds.DANGER : kinds.DEFAULT;
    progressBar = 100; // Show full bar for 0 progress
  } else if (progress < 100) {
    kind = monitored ? kinds.WARNING : kinds.DEFAULT;
  }

  if (progressBar < 10) {
    progressBar = 10; // Ensure minimum visibility
  }

  return (
    <ProgressBar
      className={styles.progressBar}
      containerClassName={containerClassName}
      progress={progressBar}
      kind={kind}
      size={detailedProgressBar ? sizes.MEDIUM : sizes.SMALL}
      showText={detailedProgressBar}
      width={width}
      title={progressText}
      text={progressText}
    />
  );
}

export default StudioIndexProgressBar;
