import React from 'react';
import Label from 'Components/Label';
import Link from 'Components/Link/Link';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import TableRow from 'Components/Table/TableRow';
import { kinds } from 'Helpers/Props';
import { ReviewCandidate, ReviewSceneGrab } from 'typings/Review';
import translate from 'Utilities/String/translate';
import styles from './ReviewSceneGroupRow.module.css';

interface ReviewSceneGroupRowProps {
  scene?: ReviewCandidate;
  releaseCount: number;
  grab?: ReviewSceneGrab | null;
  colSpan: number;
}

export function getGrabStateLabel(state: string) {
  switch (state) {
    case 'downloading':
      return translate('Downloading');
    case 'importpending':
    case 'importing':
    case 'imported':
      return translate('Importing');
    case 'importblocked':
      return translate('ReviewSceneGrabImportBlocked');
    default:
      return translate('Grabbed');
  }
}

// Heads the releases waiting for one scene: the scene, how many releases there are, and the one on its way, if any
function ReviewSceneGroupRow({
  scene,
  releaseCount,
  grab,
  colSpan,
}: ReviewSceneGroupRowProps) {
  const details = [scene?.studioTitle, scene?.releaseDate, scene?.code]
    .filter(Boolean)
    .join(' · ');

  return (
    <TableRow className={styles.row}>
      <TableRowCell className={styles.cell} colSpan={colSpan}>
        <div className={styles.header}>
          <span className={styles.title}>
            {scene?.titleSlug ? (
              <Link to={`/movie/${scene.titleSlug}`}>{scene.title}</Link>
            ) : (
              (scene?.title ?? translate('ReviewSceneMissing'))
            )}
          </span>

          {details ? <span className={styles.details}>{details}</span> : null}

          <span className={styles.details}>
            {translate('ReviewSceneReleaseCount', { count: releaseCount })}
          </span>

          {grab ? (
            <Label kind={kinds.SUCCESS} title={grab.title}>
              {translate('ReviewSceneGrab', {
                state: getGrabStateLabel(grab.state),
                title: grab.title,
              })}
            </Label>
          ) : null}
        </div>
      </TableRowCell>
    </TableRow>
  );
}

export default ReviewSceneGroupRow;
