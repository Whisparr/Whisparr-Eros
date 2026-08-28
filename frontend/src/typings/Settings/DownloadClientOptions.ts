export default interface DownloadClientOptions {
  id: number;
  downloadClientWorkingFolders: string;
  enableCompletedDownloadHandling: boolean;
  checkForFinishedDownloadInterval: number;
  autoRedownloadFailed: boolean;
  autoRedownloadFailedFromInteractiveSearch: boolean;
}
