export default interface IndexerOptions {
  id: number;
  minimumAge: number;
  retention: number;
  searchStudioCode: boolean;
  searchStudioDate: boolean;
  searchStudioFormat: string;
  searchStudioTitle: boolean;
  searchDateFormat: string;
  searchTitleDate: boolean;
  searchTitleOnly: boolean;
  maximumSize: number;
  rssSyncInterval: number;
  preferIndexerFlags: boolean;
  availabilityDelay: number;
  // The endpoint sends and takes one comma-separated string, which
  // `TextTagInput` splits for display and the change handler joins back. The
  // interface said `string[]`, which nothing on either side ever produced.
  whitelistedHardcodedSubs: string;
  allowHardcodedSubs: boolean;
}
