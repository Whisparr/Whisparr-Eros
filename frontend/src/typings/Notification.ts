import Provider from './Provider';

// Every trigger comes in a pair: `onX` is what the user asked for and
// `supportsOnX` is what the implementation can actually deliver, so the UI
// disables the checkbox rather than hiding it, and a connection that no longer
// supports a trigger keeps the stored answer.
interface Notification extends Provider {
  enable: boolean;
  onGrab: boolean;
  onDownload: boolean;
  onUpgrade: boolean;
  onRename: boolean;
  onMovieAdded: boolean;
  onMovieDelete: boolean;
  onMovieFileDelete: boolean;
  onMovieFileDeleteForUpgrade: boolean;
  onHealthIssue: boolean;
  includeHealthWarnings: boolean;
  onHealthRestored: boolean;
  onApplicationUpdate: boolean;
  onManualInteractionRequired: boolean;
  supportsOnGrab: boolean;
  supportsOnDownload: boolean;
  supportsOnUpgrade: boolean;
  supportsOnRename: boolean;
  supportsOnMovieAdded: boolean;
  supportsOnMovieDelete: boolean;
  supportsOnMovieFileDelete: boolean;
  supportsOnMovieFileDeleteForUpgrade: boolean;
  supportsOnHealthIssue: boolean;
  supportsOnHealthRestored: boolean;
  supportsOnApplicationUpdate: boolean;
  supportsOnManualInteractionRequired: boolean;
  tags: number[];

  // Schema responses only: the canned configurations an implementation offers.
  presets?: Notification[];
}

export default Notification;
