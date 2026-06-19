import { round } from 'lodash';
import React from 'react';
import ProgressBar from 'Components/ProgressBar';
import { kinds, sizes } from 'Helpers/Props';
import { Kind } from 'Helpers/Props/kinds';
import Performer from 'Performer/Performer';
import styles from './PerformerIndexProgressBar.css';

interface PerformerIndexProgressBarProps {
  performer: Performer;
  width: number;
  detailedProgressBar?: boolean;
  bottomRadius?: boolean;
  isStandAlone?: boolean;
}

function PerformerIndexProgressBar({
  performer,
  width,
  detailedProgressBar,
  bottomRadius,
  isStandAlone,
}: PerformerIndexProgressBarProps) {
  const sceneCount = performer.sceneCount;
  const movieCount = performer.movieCount;
  const totalSceneCount = performer.totalSceneCount;
  const totalMovieCount = performer.totalMovieCount;
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
  const monitored = performer.monitored || performer.moviesMonitored;

  let progressBar = progress;

  if (progress === 0) {
    kind = monitored ? kinds.DANGER : kinds.DEFAULT;
    progressBar = 100; // Show full bar for 0 progress
  } else if (progress < 100) {
    kind = monitored ? kinds.WARNING : kinds.DEFAULT;
  } else if (progress === 100) {
    kind = monitored ? kinds.SUCCESS : kinds.DEFAULT;
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

export default PerformerIndexProgressBar;
