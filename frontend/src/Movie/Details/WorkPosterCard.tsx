import React from 'react';
import Link from 'Components/Link/Link';
import Movie from 'Movie/Movie';
import ScenePoster from 'Scene/ScenePoster';
import styles from './WorkPosterCard.css';

interface WorkPosterCardProps {
  work: Movie;
  posterWidth: number;
  posterHeight: number;
  safeForWorkMode: boolean;
}

function WorkPosterCard(props: WorkPosterCardProps) {
  const { work, posterWidth, posterHeight, safeForWorkMode } = props;
  const { title, titleSlug, year, images } = work;

  const link = `/movie/${titleSlug}`;

  const elementStyle = {
    width: `${posterWidth}px`,
    height: `${posterHeight}px`,
  };

  return (
    <div className={styles.content}>
      <Link className={styles.link} style={elementStyle} to={link}>
        <ScenePoster
          className={styles.poster}
          safeForWorkMode={safeForWorkMode}
          style={elementStyle}
          images={images}
          size={180}
          lazy={true}
          overflow={true}
        />
      </Link>

      <div className={styles.title} title={title}>
        {title}
      </div>

      <div className={styles.year}>{year ? year : null}</div>
    </div>
  );
}

export default WorkPosterCard;
