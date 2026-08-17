# Getting eros-develop off Redux

Status assessment and playbook for migrating the Whisparr Eros frontend from Redux to
React Query + zustand, benchmarked against Sonarr's completed `v5-develop` migration.

Sources: `Whisparr/Whisparr-Eros@eros-develop` at `1d75cc96` ·
`Sonarr/Sonarr@v5-develop` at `7e627f69`.
Counts are file-level `react-redux` imports across 1,255 frontend source files.
Sonarr commit hashes are short refs on `v5-develop`.

---

## 1. Where we actually are

| Metric | Count |
| --- | --- |
| Files importing `react-redux` | 327 of 1,255 |
| Lines under `frontend/src/Store/` | 15,374 across 138 files |
| Remaining `*Connector` files | 66 |
| Files touching `@tanstack/react-query` | 13 |
| zustand stores | 0 (dependency not installed) |

Roughly: **4% migrated, 22% hybrid, 74% untouched.**

### The domains are started, not done

Movie, Scene, Performer and Studio each have a read hook, and each index page still runs
on Redux underneath it. `useMovie`, `usePerformer` and `useStudio` are real React Query
hooks that work — but they only cover fetching one record. The index page, filter set,
persisted view options, selection footer, bulk edit/delete modals and refresh buttons are
all still Redux. The clearest tell is that the new hooks themselves call `useSelector`:

| File | Redux it still depends on |
| --- | --- |
| `Movie/Index/useMovieIndexQuery.ts` | `state.movieIndex.selectedFilterKey`, `createCustomFiltersSelector`, `movieActions.filters` |
| `Movie/Index/useMovieIndex.ts` | 8 × `movieIndexActions` dispatches (`setMovieTableOption`, `setMoviePosterOption`, …) |
| `Scene/Index/useSceneIndexQuery.ts` | `sceneIndexActions`, `state.sceneIndex` |
| `Tags/useTags.ts` | `createTagsSelector` — react-query-shaped name, selector body |

### The ordering problem

Eros went domain-first (Movie, Scene, Performer, Studio). Sonarr went the other way —
peripheral pages first, then shared plumbing, and only reached Series in month four.

That wasn't arbitrary. A domain index page sits on top of five shared systems: persisted
view options, row selection, custom filters, command dispatch, and paging. In Eros **none
of those five exist off Redux yet.** So each domain gets ~80% converted and then stalls
against the same missing floor — which is exactly the hybrid state above.

**Recommendation:** pause domain work, build the foundation (phase A), then close
Movie/Scene/Performer/Studio in one pass each. The high-value instinct was right; the
sequencing is what's costing you.

---

## 2. Sonarr's proven sequence

Sonarr finished this in **54 commits between Sep 2025 and Jun 2026**. Their tree has no
`Store/` directory and no redux dependency at all.

| Period | Commits | What |
| --- | --- | --- |
| Sep–Oct 25 | 4 | Queue, Blocklist, History, Log Files. Queue first (58 files) to force the primitives into existence. |
| Nov 25 | 16 | System, Health, Disk Space, Tasks, Backups, Calendar, Parse, Wanted, Tags, Root Folders, Custom Filters, Interactive Search, Episodes. |
| Dec 25 | 14 | Series (91 files), Commands (51 files), and `Convert app state to zustand stores`. |
| Jan–Apr 26 | 11 | Settings, one section per fortnight, never batched. |
| May–Jun 26 | 9 | Custom Formats, Import Lists, Delay Profiles, Download Clients — then `Goodbye Redux`. |

### Three things worth copying exactly

1. **One page per commit, never batched.** Even the tiny ones (disk space: 4 files, 19
   insertions) shipped alone. Bisectable, reviewable, revertable.
2. **zustand arrived late, deliberately.** `878f879c` lands in month four, after ~20 pages
   had already proven what client state actually still needed. They did not design the
   store layer up front.
3. **A dedicated correctness pass near the end.** `9bed77c6` "Avoid mutation for
   react-query data" — 37 files — cleaning up code that mutated cached objects in place, a
   habit carried over from reducers. Budget for this; it will bite here too.

---

## 3. Phase A — the missing floor

Blocking. ~5 PRs. Everything downstream needs these. Sonarr has all of them; Eros has
none. Port close to verbatim — this is not the place to invent.

| Build | Retires | Sonarr ref |
| --- | --- | --- |
| zustand + `createPersist` | `Store/Middleware/createPersistState.js`, `redux-localstorage`, `Store/Migrators/` | `Helpers/createPersist.ts` |
| `useOptionsStore` factory — per-page columns, sort, filter key, view mode, poster/overview options | `movieIndexActions`, `sceneIndexActions`, `createSetTableOptionReducer` | `878f879c` |
| `useSelectStore` — row selection for every index and manage modal | `App/SelectContext.tsx`, `Helpers/Hooks/useSelectState.tsx` | `App/Select/useSelectStore.ts` |
| `usePagedApiQuery` — server-side paging with `keepPreviousData` | `createFetchServerSideCollectionHandler.js`, `Components/Table/usePaging.ts` | `Helpers/Hooks/usePagedApiQuery.ts` |
| `clientSideFilterAndSort` — the filter/sort engine every index shares | `createClientSideCollectionSelector.js`, `create*ClientSideCollectionItemsSelector` ×4 | `Utilities/Filter/` |
| Pending-changes stores (×3) — defer to phase E, only Settings needs them | `createSetSettingValueReducer.js`, `createSetProviderFieldValueReducer.js` | `7e702380` |

### Also fix while you're in here

Eros's `useApiQuery` has drifted from Sonarr's. Ours `JSON.stringify`s query params and
bodies into the cache key and hardcodes `placeholderData: (prev) => prev` as a default.
Sonarr passes params as a structural key and leaves placeholder behaviour to the caller.
The stringify keys work, but they make cache invalidation by prefix impossible — which
you will want the moment SignalR starts driving invalidations. Align it now while there
are only 13 callers.

Same for the ad-hoc `apiPut`/`apiPatch` helpers and the two `// TODO: Move to
useApiMutation` markers in `Movie/useMovie.ts` — fold those in before the pattern gets
copied into three more domains.

---

## 4. Phase B — leaf pages

~12 PRs. Low risk, high clearance. Self-contained pages with few dependents; each removes
a whole state slice. Take them roughly in Sonarr's order.

| Page | Retires | Sonarr ref |
| --- | --- | --- |
| **Queue** — biggest leaf, 16 consumers, SignalR-driven, drives sidebar badge | `queueActions` (539 loc), `QueueAppState` | `ae201f52` (58 files) |
| **Blocklist** — incl. per-movie blocklist tab | `blocklistActions`, `movieBlocklistActions` | `a4f21085` |
| **History** *(hybrid)* — `useHistory` covers paged list + movie history; finish details modal | `historyActions`, `movieHistoryActions`, `HistoryDetailsConnector` ×2 | `a45b0776`, `6b479a5a` |
| **System: Status / Health / Disk Space** — three commits; Health has the sidebar dependency | `systemActions` (400 loc, 20 consumers), `createHealthCheckSelector.js`, `createSystemStatusSelector.ts` | `49c52c2e`, `0552a811`, `871ae955` |
| **System: Tasks / Backups / Log Files / Events** | `BackupsConnector.js`, `RestoreBackupModal*Connector.js`, `LogsTableConnector.js` | `3091f40c`, `c295e24f`, `ff5e7327` |
| **Calendar** — 12 files; needs the options store from phase A | `calendarActions` (443 loc), `CalendarAppState` | `ccb7f07c` (28 files) |
| **Parse** — small, isolated; Sonarr's deleted 333 lines for 55 | `parseActions.ts`, `ParseAppState` | `263f4839` |
| **Wanted: Missing + Cutoff Unmet** — one commit; first real `usePagedApiQuery` consumer | `wantedActions` (342 loc), `WantedAppState` | `40712781` |
| **Organize preview + Unmapped Files** — two small pages, one PR | `organizePreviewActions`, `unmappedMovieFileActions` | `10c0e18a` |

---

## 5. Phase C — shared plumbing

~7 PRs. Wide, shallow changes: a small hook plus a long list of import rewrites. Sonarr's
commands commit touched 51 files, custom filters 44. Ship them alone.

| System | Retires | Sonarr ref |
| --- | --- | --- |
| **Commands** — 44 live consumers; every refresh/search button. SignalR-fed. | `commandActions` (207 loc), `createCommandSelector.ts`, `createExecutingCommandsSelector.ts`, `createCommandExecutingSelector.ts` | `dec6f4b5` (51 files) |
| **Custom filters** — prerequisite for every index filter modal | `customFilterActions`, `CustomFiltersModalContentConnector.js`, `CustomFiltersAppState` | `7d2e01d5` (44 files) |
| **Tags** — rewrite `useTags` for real, plus tag details and filter-builder rows | `tagActions`, `createTagsSelector.ts`, `createTagDetailsSelector.ts`, `TagFilterBuilderRowValueConnector.js` | `0809a72c` (40 files) |
| **Root folders** — 17 consumers across Settings, Add flows, edit modals | `rootFolderActions`, `createRootFoldersSelector.ts` | `7a5157df` |
| **Paths + file browser** *(hybrid)* — `usePaths` exists; finish `PathInput`, `FileBrowserModalContent` | `pathActions`, `PathsAppState` | `91b24290` |
| **Provider options + captcha** — feeds every provider settings form; do before phase E | `providerOptionActions`, `captchaActions`, `oAuthActions` | `cd7adba1` |
| **SignalR → query invalidation** — the pivot: `SignalRConnector.js` dispatches actions today; becomes a listener that invalidates query keys | `Components/SignalRConnector.js`, `Store/thunks.ts`, `redux-batched-actions` | `Components/SignalRListener.tsx` |
| **App shell** — messages, dimensions, theme, advanced settings. zustand, not React Query. 34 files import `baseActions`. | `appActions`, `MessagesAppState`, `createDimensionsSelector.ts` | `878f879c`, `7e702380` |

---

## 6. Phase D — close out the domains

~9 PRs. Each domain is one commit in Sonarr's model (Series was 91 files). Eros has four
parallel domains where Sonarr had one — budget four Series-sized commits, but they share a
shape: convert one properly, then the other three are largely mechanical.

| Domain | Remaining work | Sonarr ref |
| --- | --- | --- |
| **Movie** *(hybrid)* — do first, set the template. 39 redux files. | Index options → `movieOptionsStore`; filters → `FILTERS`/`FILTER_BUILDER` in `useMovie`; select footer; Edit/Delete/Tags/Organize modals. Retires `movieActions`, `movieIndexActions`, `movieTitlesActions`. | `0521a6c3` (91 files) |
| **Scene** *(hybrid)* — 24 redux files. Shares the `Movie` model, so hooks can share a generic base. | `sceneIndexActions`, `createAllScenesSelector.ts`, `DeleteSceneModalContentConnector.js` | — |
| **Performer** *(hybrid)* — 23 redux files. Details, scenes tab, add flow, edit modal. | `performerActions` (676 loc), `performerScenesActions`, `addPerformerActions`, `EditPerformerModalContentConnector.js` | — |
| **Studio** *(hybrid)* — 22 redux files. Same shape as Performer. | `studioActions` (510 loc), `studioMoviesActions`, `studioScenesActions`, `DeleteStudioModalConnector.js` | — |
| **Collection** — untouched, fully connector-based. 7 of the 66 connectors live here. | `movieCollectionActions` (572 loc), `Collection*Connector.js` ×7, `createCollectionSelector.ts` | — |
| **Movie files + credits** *(hybrid)* — `useMovieFile` covers most; credits and titles still redux | `movieFileActions`, `movieCreditsActions`, `MovieCreditPosterConnector.tsx` | `44fc1e0e` |
| **Interactive search** — release list, override match, download client picker | `releaseActions` (365 loc), `ReleasesAppState` | `8f95849e` (41 files) |
| **Interactive import** — folder picker, quality/language selects, row grid | `interactiveImportActions` (366 loc), `InteractiveImportAppState` | `ec44e1c5` |
| **Add / Import Movie** *(hybrid)* — `useAddNewMovie` and `useImportMutation` exist; finish folder-select and import-list flows | `addMovieActions` | `ad57cf4b` |

---

## 7. Phase E — Settings

~14 PRs, 87 files. The long grind. `settingsActions` has 77 live consumers, and 37 of the
66 remaining connectors are in here. Sonarr spent six months at roughly one section per
fortnight and never batched two together. Do the same.

**Prerequisite:** the three pending-changes stores (`usePendingChangesStore`,
`usePendingFieldsStore`, `usePendingItemsStore`), which replace the dirty-form tracking in
`createSetSettingValueReducer` and `createSetProviderFieldValueReducer`. Land those in
their own PR before section one.

| Order | Section | Retires | Sonarr ref |
| --- | --- | --- | --- |
| 1 | **UI settings** — smallest, 32 files read it. Good pathfinder. | `Settings/ui.js`, `UISettingsConnector.js`, `createUISettingsSelector.ts` | `74e6ce43` |
| 2 | Remote path mappings · Release profiles | `Settings/remotePathMappings.js`, `Settings/releaseProfiles.js` | `8fcab2d3`, `4713615b` |
| 3 | Quality profiles · Quality definitions (4 connectors incl. reset modal) | `Settings/qualityProfiles.js`, `Settings/qualityDefinitions.js`, `Quality*Connector.js` ×4 | `21ca65a0`, `cf593b1f` |
| 4 | Connections (Notifications) | `Settings/notifications.js`, `DeviceInput.tsx` | `6d49b41d` |
| 5 | Naming · Media Management · Metadata | `Settings/naming.js`, `Settings/namingExamples.js`, `Settings/mediaManagement.js`, `Settings/metadata.js` | `677c588a`, `bbb4c671`, `c0a56586` |
| 6 | Languages · General (partial `useGeneralSettings` exists) | `Settings/languages.js`, `Settings/general.js`, `GeneralSettingsConnector.js` | `5bac016f`, `6764cf1c` |
| 7 | Indexers · Indexer Options · Indexer Flags (11 files, three commits) | `Settings/indexers.js`, `Settings/indexerOptions.js`, `Settings/indexerFlags.js`, `IndexerFilterBuilderRowValueConnector.js` | `c4c0ec25`, `7a455dd0`, `fbb70519` |
| 8 | Auto tagging · Import list exclusions | `Settings/autoTaggings.js`, `Settings/autoTaggingSpecifications.js`, `Settings/importListExclusions.js` | `0ebda892`, `b0fac152` |
| 9 | Import lists + options (16 files — largest subtree) | `Settings/importLists.js`, `Settings/importListOptions.js`, `ImportListFilterBuilderRowValueConnector.js` | `75d1a958`, `ba7b6b03` |
| 10 | Custom formats (10 files, 6 connectors, import/export modals) | `Settings/customFormats.js`, `Settings/customFormatSpecifications.js`, `CustomFormat*Connector.js` ×6 | `06aa7d57` (38 files) |
| 11 | Delay profiles · Download clients + options | `Settings/delayProfiles.js`, `Settings/downloadClients.js`, `Settings/downloadClientOptions.js`, `createEnabledDownloadClientsSelector.ts` | `ed1d92c5`, `7be32b0c`, `d04e2996` |

---

## 8. Phase F — teardown

Sonarr's ending was two commits: a correctness sweep, then the delete.

### F1 — Avoid mutation for react-query data

Reducer habits produce code that mutates objects in place. Under Redux that was contained;
under React Query a cached object is shared across every component reading that key, so
in-place edits corrupt other views silently. Sonarr's sweep hit 37 files (`9bed77c6`). Do
this **before** the delete, while the old code is still there to compare against.

Sonarr also switched `useApiQuery`'s generic to `Readonly<T>` so the compiler catches it —
Eros's copy has not.

### F2 — Goodbye Redux

Sonarr's final commit (`0460281f`) removed 1,996 lines across 51 files. The Eros equivalent:

- Delete `frontend/src/Store/` — 138 files, 15,374 lines.
- Delete surviving `App/State/*AppState.ts` slices (33 today; most disappear with their phase).
- Drop `<Provider>` from `frontend/src/bootstrap.tsx`.
- Remove from `package.json`: `react-redux`, `redux`, `redux-actions`,
  `redux-batched-actions`, `redux-localstorage`, `redux-thunk`, `@types/redux-actions`.
- Re-home the Sentry middleware — `createSentryMiddleware.js` is a redux middleware and
  needs a non-redux home before the store goes.

---

## 9. Where Eros diverges from Sonarr

Four places where you cannot just copy their commit.

1. **Four domains, not one.** Sonarr had Series; Eros has Movie, Scene, Performer and
   Studio, each with its own index, details, edit, delete and select-footer stack. Biggest
   multiplier on the estimate. Decide early whether the four share a generic
   `createDomainHooks` factory or stay copy-pasted — Scene already reuses the `Movie`
   model, so at minimum those two should share.
2. **Server-side paged indexes.** Sonarr's Series index is client-side filtered over one
   `/series` fetch. Eros's Movie and Scene indexes page on the server. `useSeries`'s
   fetch-all/build-a-Map/filter-in-memory pattern does not port directly; those need
   `usePagedApiQuery` plus server-side filter translation. Performer and Studio indexes are
   closer to Sonarr's model.
3. **Collection has no Sonarr analogue** and is the least-migrated area in the tree — 7
   connectors and a 572-line action file. Needs designing rather than porting.
4. **Safe-for-work mode.** `SafeForWorkContext` and `SafeForWorkButtonConnector.js` are
   Eros-specific global UI state. Belongs in the app zustand store alongside theme and
   advanced-settings, but there is no Sonarr commit to follow.

---

## 10. What to do next

The first four PRs:

1. **Align `useApiQuery` / `useApiMutation` with Sonarr's** and remove the two
   `TODO: Move to useApiMutation` markers in `Movie/useMovie.ts`. Small, and it stops the
   drift compounding.
2. **Add zustand + `createPersist` + `useOptionsStore`.** Port from Sonarr near-verbatim.
3. **Convert one leaf page end-to-end — Parse or Disk Space.** Deliberately trivial. The
   point is to establish the PR shape, test expectations and coverage story before anything
   expensive.
4. **Then Queue**, as Sonarr did, because it forces SignalR-driven invalidation into
   existence early rather than late.

### On testing — what Sonarr actually did

Sonarr shipped this entire migration with **no automated frontend verification at all**:

- No jest, no vitest, no testing-library, no `test` script, zero `*.test.*` files.
- Their Selenium `NzbDrone.Automation.Test` project is six smoke tests that click a nav
  icon and assert a div exists. It was untouched across the whole migration window — the
  only commits touching it were a .NET 10 bump and two tooling simplifications.
- Those Selenium tests **don't run in CI**. `build_v5.yml` filters
  `TestCategory!=AutomationTest` on every leg. Whisparr's `build_v3.yml` has the identical
  exclusion.

Their real safety net was **TypeScript**, plus one-page-per-commit bisectability and a
large beta population. And that is where Eros is not starting from the same place:

| | Sonarr | Whisparr Eros |
| --- | --- | --- |
| `.js` files in `frontend/src` | 23 | **385** |
| `.ts` / `.tsx` files | 878 | 873 |

Sonarr was effectively all-TypeScript before the migration, so `strict: true` +
`noImplicitAny` + `react-hooks/exhaustive-deps: error` caught the class of error a
state-management rewrite produces. Eros's 385 untyped files are concentrated in exactly
the code being migrated — all of `Store/Actions`, all 66 connectors.

**So the migration is also the TypeScript conversion, and that is the test story.** Each
converted page moves code from unchecked to checked. Two consequences worth holding to:

1. Don't leave `.js` shims behind. A converted page that still imports an untyped
   connector keeps the compiler blind on the seam that just changed.
2. Extend the Selenium smoke tests opportunistically. `PageBase` currently has no
   Performer, Studio, Scene or Collection nav icons — the Eros-specific pages aren't
   covered even by the six that exist. Adding them as each page migrates is nearly free
   and uses infrastructure already in the repo. They still won't run in CI, so treat them
   as a local pre-merge check, not a gate.

### Risk to verify on the first PR

Sonar's scanner is `dotnet-sonarscanner` with only `sonar.cs.opencover.reportsPaths` set —
there is no JS/TS coverage report. `frontend/src` is not in `sonar.exclusions`, so those
files are analysed for issues but have no coverage data. **Confirm on the first migration
PR whether new frontend TypeScript counts as uncovered new code against the 80% new-code
gate.** If it does, every PR in this roadmap fails the gate and the scanner config needs a
frontend exclusion or a coverage source before phase B starts.
