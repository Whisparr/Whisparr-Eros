// Import List Exclusions is the only page left that fetches through a redux
// thunk, so a SignalR reconnect cannot reach it by invalidating a query key.
// Every other page is on React Query and is refreshed by invalidation instead.
// This goes away with Phase E.
let currentPopulator = null;

export function registerPagePopulator(populator) {
  currentPopulator = populator;
}

export function unregisterPagePopulator(populator) {
  if (currentPopulator === populator) {
    currentPopulator = null;
  }
}

export function repopulatePage() {
  if (currentPopulator) {
    currentPopulator();
  }
}
