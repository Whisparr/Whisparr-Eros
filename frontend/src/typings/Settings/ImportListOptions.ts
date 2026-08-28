export type ListSyncLevel =
  | 'disabled'
  | 'logOnly'
  | 'keepAndUnmonitor'
  | 'removeAndKeep'
  | 'removeAndDelete';

export default interface ImportListOptions {
  id: number;
  listSyncLevel: ListSyncLevel;
}
