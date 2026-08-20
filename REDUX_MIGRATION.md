# Getting eros-develop off Redux

Status assessment and playbook for migrating the Whisparr Eros frontend from Redux to
React Query + zustand, benchmarked against Sonarr's completed `v5-develop` migration.

Sources: `Whisparr/Whisparr-Eros@eros-develop` at
[1d75cc96](https://github.com/Whisparr/Whisparr-Eros/commit/1d75cc96) ·
`Sonarr/Sonarr@v5-develop` at
[7e627f69](https://github.com/Sonarr/Sonarr/commit/7e627f69).
Counts are file-level `react-redux` imports across the frontend source tree.
Every commit reference below links to the Sonarr commit it names; all were
verified to resolve against the public repo.

**Status: Phase A complete, Phase B started.** See §11 for the running log.

---

## 1. Where we actually are

| Metric | At assessment | Now |
| --- | --- | --- |
| Files importing `react-redux` | 327 of 1,255 | **305** of 1,255 |
| Lines under `frontend/src/Store/` | 15,374 across 138 files | **12,630** across 124 |
| Redux slices registered in `Store/Actions/index.js` | 35 | **25** |
| Remaining `*Connector` files | 66 | **59** |
| Files touching React Query | 35 | **53** |
| zustand stores | 0 (not installed) | **installed, 3 primitives + 8 option stores** |

> **Recomputed in #464.** Three rows previously carried figures that no command
> reproduced — `react-redux` read 316 where the same command that yields the
> assessment column gives 320 on `eros-develop`, and the slice and React Query rows
> used definitions that were never written down. The assessment column is unchanged;
> it reproduces exactly at
> [1d75cc96](https://github.com/Whisparr/Whisparr-Eros/commit/1d75cc96). To keep this
> honest, the commands are now fixed:
>
> **#475 correction.** The denominator was never pinned, and the 1,257 recorded at
> #474 does not reproduce — the command below gives 1,259 at
> [f0b74bea](https://github.com/Whisparr/Whisparr-Eros/commit/f0b74bea). The
> assessment figure of 1,255 does reproduce, so the method is the one recorded here
> and the earlier entry was simply miscounted.
>
> **#478 correction.** The 308 recorded at #477 does not reproduce either — the command
> below gives 309 at
> [02d0c714](https://github.com/Whisparr/Whisparr-Eros/commit/02d0c714). History moves it
> to 307: it drops three importers (`HistoryFilterModal`, both `HistoryDetailsConnector`
> files) and adds one, because `useHistory` now reads custom filters from Redux itself.
>
> ```sh
> # react-redux importers
> git grep -l "from 'react-redux'" <ref> -- 'frontend/src/*.ts' 'frontend/src/*.tsx' \
>   'frontend/src/*.js' | grep -v '\.css\.d\.ts' | wc -l
> # total source files (the denominator — pinned in #475)
> git ls-tree -r --name-only <ref> -- frontend/src | grep -E '\.(ts|tsx|js)$' \
>   | grep -v '\.css\.d\.ts' | wc -l
> # slices
> grep -cE '^import \* as' frontend/src/Store/Actions/index.js
> # React Query
> grep -rl -E 'useApiQuery|useApiMutation|usePagedApiQuery|@tanstack/react-query' \
>   --include='*.ts' --include='*.tsx' frontend/src | wc -l
> # connectors (pinned in #471 — the "60" recorded at #470 did not reproduce)
> git ls-files 'frontend/src/*Connector*' | grep -vE '\.css(\.d\.ts)?$' | wc -l
> ```

The headline number barely moves early on, and that is expected: Phase A added the
foundation without converting any page, and Phase B is starting with the smallest pages
by design. The slice count is the number to watch — but only where a page owns its slice
outright. `systemActions` serves six areas, so System Status came out of it without
moving that row at all.

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
2. **zustand arrived late, deliberately.** [Sonarr/Sonarr@878f879c](https://github.com/Sonarr/Sonarr/commit/878f879c) lands in month four, after ~20 pages
   had already proven what client state actually still needed. They did not design the
   store layer up front.
3. **A dedicated correctness pass near the end.** [Sonarr/Sonarr@9bed77c6](https://github.com/Sonarr/Sonarr/commit/9bed77c6) "Avoid mutation for
   react-query data" — 37 files — cleaning up code that mutated cached objects in place, a
   habit carried over from reducers. Budget for this; it will bite here too.

---

## 3. Phase A — the missing floor

**Done** — #452, #454, #455. Everything downstream needed these; all are now on
`eros-develop`. Kept for reference, and because the "retires" column records what each
primitive is expected to replace as the pages convert.

| Build | Retires | Sonarr ref |
| --- | --- | --- |
| zustand + `createPersist` | `Store/Middleware/createPersistState.js`, `redux-localstorage`, `Store/Migrators/` | `Helpers/createPersist.ts` |
| `useOptionsStore` factory — per-page columns, sort, filter key, view mode, poster/overview options | `movieIndexActions`, `sceneIndexActions`, `createSetTableOptionReducer` | [Sonarr/Sonarr@878f879c](https://github.com/Sonarr/Sonarr/commit/878f879c) |
| `useSelectStore` — row selection for every index and manage modal | `App/SelectContext.tsx`, `Helpers/Hooks/useSelectState.tsx` | `App/Select/useSelectStore.ts` |
| `usePagedApiQuery` — server-side paging with `keepPreviousData` | `createFetchServerSideCollectionHandler.js`, `Components/Table/usePaging.ts` | `Helpers/Hooks/usePagedApiQuery.ts` |
| `clientSideFilterAndSort` — the filter/sort engine every index shares | `createClientSideCollectionSelector.js`, `create*ClientSideCollectionItemsSelector` ×4 | `Utilities/Filter/` |
| Pending-changes stores (×3) — defer to phase E, only Settings needs them | `createSetSettingValueReducer.js`, `createSetProviderFieldValueReducer.js` | [Sonarr/Sonarr@7e702380](https://github.com/Sonarr/Sonarr/commit/7e702380) |

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
| ~~**Queue**~~ — **done, #472 / #473 / #474.** Biggest leaf, 14 importers, SignalR-driven, drives sidebar badge. Split three ways rather than Sonarr's single commit | ~~`queueActions` (539 loc), `QueueAppState`~~ | [Sonarr/Sonarr@ae201f52](https://github.com/Sonarr/Sonarr/commit/ae201f52) (58 files) |
| ~~**Blocklist** — the page~~ — **done, #477.** `movieBlocklistActions` stays: it feeds one selector in `InteractiveSearchRow` jointly with `movieHistory`, so it converts with History | ~~`blocklistActions`, `BlocklistAppState`~~ | [Sonarr/Sonarr@a4f21085](https://github.com/Sonarr/Sonarr/commit/a4f21085) |
| ~~**History**~~ — **done, #478.** Was a hybrid: React Query fetched, redux still held the options. Took `movieBlocklistActions` with it, as planned | ~~`historyActions`, `movieHistoryActions`, `movieBlocklistActions`, `HistoryAppState`, `MovieBlocklistAppState`, `HistoryDetailsConnector` ×2~~ | [Sonarr/Sonarr@a45b0776](https://github.com/Sonarr/Sonarr/commit/a45b0776), [Sonarr/Sonarr@6b479a5a](https://github.com/Sonarr/Sonarr/commit/6b479a5a) |
| ~~**System: Status / Health**~~ — **done, #461 / #463 / #464 / #465.** Health had the sidebar dependency, so it went last | `systemActions` (391 loc after #461), `createHealthCheckSelector.js`, `createSystemStatusSelector.ts` | [Sonarr/Sonarr@49c52c2e](https://github.com/Sonarr/Sonarr/commit/49c52c2e), [Sonarr/Sonarr@0552a811](https://github.com/Sonarr/Sonarr/commit/0552a811), ~~[Sonarr/Sonarr@871ae955](https://github.com/Sonarr/Sonarr/commit/871ae955)~~ |
| ~~**System: Tasks / Backups / Events**~~ — **done, #462 / #466 / #467 / #468 / #469.** | `BackupsConnector.js`, `RestoreBackupModal*Connector.js`, `LogsTableConnector.js` | [Sonarr/Sonarr@3091f40c](https://github.com/Sonarr/Sonarr/commit/3091f40c), [Sonarr/Sonarr@c295e24f](https://github.com/Sonarr/Sonarr/commit/c295e24f), [Sonarr/Sonarr@ff5e7327](https://github.com/Sonarr/Sonarr/commit/ff5e7327) |
| ~~**Calendar**~~ — **done, #481.** 12 files. Range derivation ported unchanged; the visible range lives in a second, non-persisted store beside the options one | ~~`calendarActions` (443 loc), `CalendarAppState`~~ | [Sonarr/Sonarr@ccb7f07c](https://github.com/Sonarr/Sonarr/commit/ccb7f07c) (28 files) |
| ~~**Parse**~~ — **done, #458.** 14 files, +77/−337 | ~~`parseActions.ts`, `ParseAppState`~~ | [Sonarr/Sonarr@263f4839](https://github.com/Sonarr/Sonarr/commit/263f4839) |
| ~~**Wanted: Missing + Cutoff Unmet**~~ — **done, #475.** One PR, as Sonarr did; first page pair to share an options-store shape | ~~`wantedActions` (342 loc), `WantedAppState`~~ | [Sonarr/Sonarr@40712781](https://github.com/Sonarr/Sonarr/commit/40712781) |
| ~~**Organize preview + Unmapped Files**~~ — **done, #471.** Two small pages, one PR | ~~`organizePreviewActions`, `unmappedMovieFileActions`, `OrganizePreviewAppState`~~ | [Sonarr/Sonarr@10c0e18a](https://github.com/Sonarr/Sonarr/commit/10c0e18a) |

---

## 5. Phase C — shared plumbing

~7 PRs. Wide, shallow changes: a small hook plus a long list of import rewrites. Sonarr's
commands commit touched 51 files, custom filters 44. Ship them alone.

| System | Retires | Sonarr ref |
| --- | --- | --- |
| **Commands** — 44 live consumers; every refresh/search button. SignalR-fed. | `commandActions` (207 loc), `createCommandSelector.ts`, `createExecutingCommandsSelector.ts`, `createCommandExecutingSelector.ts` | [Sonarr/Sonarr@dec6f4b5](https://github.com/Sonarr/Sonarr/commit/dec6f4b5) (51 files) |
| **Custom filters** — prerequisite for every index filter modal | `customFilterActions`, `CustomFiltersModalContentConnector.js`, `CustomFiltersAppState` | [Sonarr/Sonarr@7d2e01d5](https://github.com/Sonarr/Sonarr/commit/7d2e01d5) (44 files) |
| **Tags** — rewrite `useTags` for real, plus tag details and filter-builder rows | `tagActions`, `createTagsSelector.ts`, `createTagDetailsSelector.ts`, `TagFilterBuilderRowValueConnector.js` | [Sonarr/Sonarr@0809a72c](https://github.com/Sonarr/Sonarr/commit/0809a72c) (40 files) |
| **Root folders** — 17 consumers across Settings, Add flows, edit modals | `rootFolderActions`, `createRootFoldersSelector.ts` | [Sonarr/Sonarr@7a5157df](https://github.com/Sonarr/Sonarr/commit/7a5157df) |
| **Paths + file browser** *(hybrid)* — `usePaths` exists; finish `PathInput`, `FileBrowserModalContent` | `pathActions`, `PathsAppState` | [Sonarr/Sonarr@91b24290](https://github.com/Sonarr/Sonarr/commit/91b24290) |
| **Provider options + captcha** — feeds every provider settings form; do before phase E | `providerOptionActions`, `captchaActions`, `oAuthActions` | [Sonarr/Sonarr@cd7adba1](https://github.com/Sonarr/Sonarr/commit/cd7adba1) |
| **SignalR → query invalidation** — the pivot: `SignalRConnector.js` dispatches actions today; becomes a listener that invalidates query keys | `Components/SignalRConnector.js`, `Store/thunks.ts`, `redux-batched-actions` | `Components/SignalRListener.tsx` |
| **App shell** — messages, dimensions, theme, advanced settings. zustand, not React Query. 34 files import `baseActions`. | `appActions`, `MessagesAppState`, `createDimensionsSelector.ts` | [Sonarr/Sonarr@878f879c](https://github.com/Sonarr/Sonarr/commit/878f879c), [Sonarr/Sonarr@7e702380](https://github.com/Sonarr/Sonarr/commit/7e702380) |

---

## 6. Phase D — close out the domains

~9 PRs. Each domain is one commit in Sonarr's model (Series was 91 files). Eros has four
parallel domains where Sonarr had one — budget four Series-sized commits, but they share a
shape: convert one properly, then the other three are largely mechanical.

| Domain | Remaining work | Sonarr ref |
| --- | --- | --- |
| **Movie** *(hybrid)* — do first, set the template. 39 redux files. | Index options → `movieOptionsStore`; filters → `FILTERS`/`FILTER_BUILDER` in `useMovie`; select footer; Edit/Delete/Tags/Organize modals. Retires `movieActions`, `movieIndexActions`, `movieTitlesActions`. | [Sonarr/Sonarr@0521a6c3](https://github.com/Sonarr/Sonarr/commit/0521a6c3) (91 files) |
| **Scene** *(hybrid)* — 24 redux files. Shares the `Movie` model, so hooks can share a generic base. | `sceneIndexActions`, `createAllScenesSelector.ts`, `DeleteSceneModalContentConnector.js` | — |
| **Performer** *(hybrid)* — 23 redux files. Details, scenes tab, add flow, edit modal. | `performerActions` (676 loc), `performerScenesActions`, `addPerformerActions`, `EditPerformerModalContentConnector.js` | — |
| **Studio** *(hybrid)* — 22 redux files. Same shape as Performer. | `studioActions` (510 loc), `studioMoviesActions`, `studioScenesActions`, `DeleteStudioModalConnector.js` | — |
| **Collection** — untouched, fully connector-based. 7 of the 66 connectors live here. | `movieCollectionActions` (572 loc), `Collection*Connector.js` ×7, `createCollectionSelector.ts` | — |
| **Movie files + credits** *(hybrid)* — `useMovieFile` covers most; credits and titles still redux | `movieFileActions`, `movieCreditsActions`, `MovieCreditPosterConnector.tsx` | [Sonarr/Sonarr@44fc1e0e](https://github.com/Sonarr/Sonarr/commit/44fc1e0e) |
| **Interactive search** — release list, override match, download client picker | `releaseActions` (365 loc), `ReleasesAppState` | [Sonarr/Sonarr@8f95849e](https://github.com/Sonarr/Sonarr/commit/8f95849e) (41 files) |
| **Interactive import** — folder picker, quality/language selects, row grid | `interactiveImportActions` (366 loc), `InteractiveImportAppState` | [Sonarr/Sonarr@ec44e1c5](https://github.com/Sonarr/Sonarr/commit/ec44e1c5) |
| **Add / Import Movie** *(hybrid)* — `useAddNewMovie` and `useImportMutation` exist; finish folder-select and import-list flows | `addMovieActions` | [Sonarr/Sonarr@ad57cf4b](https://github.com/Sonarr/Sonarr/commit/ad57cf4b) |

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
| 1 | **UI settings** — smallest, 32 files read it. Good pathfinder. | `Settings/ui.js`, `UISettingsConnector.js`, `createUISettingsSelector.ts` | [Sonarr/Sonarr@74e6ce43](https://github.com/Sonarr/Sonarr/commit/74e6ce43) |
| 2 | Remote path mappings · Release profiles | `Settings/remotePathMappings.js`, `Settings/releaseProfiles.js` | [Sonarr/Sonarr@8fcab2d3](https://github.com/Sonarr/Sonarr/commit/8fcab2d3), [Sonarr/Sonarr@4713615b](https://github.com/Sonarr/Sonarr/commit/4713615b) |
| 3 | Quality profiles · Quality definitions (4 connectors incl. reset modal) | `Settings/qualityProfiles.js`, `Settings/qualityDefinitions.js`, `Quality*Connector.js` ×4 | [Sonarr/Sonarr@21ca65a0](https://github.com/Sonarr/Sonarr/commit/21ca65a0), [Sonarr/Sonarr@cf593b1f](https://github.com/Sonarr/Sonarr/commit/cf593b1f) |
| 4 | Connections (Notifications) | `Settings/notifications.js`, `DeviceInput.tsx` | [Sonarr/Sonarr@6d49b41d](https://github.com/Sonarr/Sonarr/commit/6d49b41d) |
| 5 | Naming · Media Management · Metadata | `Settings/naming.js`, `Settings/namingExamples.js`, `Settings/mediaManagement.js`, `Settings/metadata.js` | [Sonarr/Sonarr@677c588a](https://github.com/Sonarr/Sonarr/commit/677c588a), [Sonarr/Sonarr@bbb4c671](https://github.com/Sonarr/Sonarr/commit/bbb4c671), [Sonarr/Sonarr@c0a56586](https://github.com/Sonarr/Sonarr/commit/c0a56586) |
| 6 | Languages · General (partial `useGeneralSettings` exists) | `Settings/languages.js`, `Settings/general.js`, `GeneralSettingsConnector.js` | [Sonarr/Sonarr@5bac016f](https://github.com/Sonarr/Sonarr/commit/5bac016f), [Sonarr/Sonarr@6764cf1c](https://github.com/Sonarr/Sonarr/commit/6764cf1c) |
| 7 | Indexers · Indexer Options · Indexer Flags (11 files, three commits) | `Settings/indexers.js`, `Settings/indexerOptions.js`, `Settings/indexerFlags.js`, `IndexerFilterBuilderRowValueConnector.js` | [Sonarr/Sonarr@c4c0ec25](https://github.com/Sonarr/Sonarr/commit/c4c0ec25), [Sonarr/Sonarr@7a455dd0](https://github.com/Sonarr/Sonarr/commit/7a455dd0), [Sonarr/Sonarr@fbb70519](https://github.com/Sonarr/Sonarr/commit/fbb70519) |
| 8 | Auto tagging · Import list exclusions | `Settings/autoTaggings.js`, `Settings/autoTaggingSpecifications.js`, `Settings/importListExclusions.js` | [Sonarr/Sonarr@0ebda892](https://github.com/Sonarr/Sonarr/commit/0ebda892), [Sonarr/Sonarr@b0fac152](https://github.com/Sonarr/Sonarr/commit/b0fac152) |
| 9 | Import lists + options (16 files — largest subtree) | `Settings/importLists.js`, `Settings/importListOptions.js`, `ImportListFilterBuilderRowValueConnector.js` | [Sonarr/Sonarr@75d1a958](https://github.com/Sonarr/Sonarr/commit/75d1a958), [Sonarr/Sonarr@ba7b6b03](https://github.com/Sonarr/Sonarr/commit/ba7b6b03) |
| 10 | Custom formats (10 files, 6 connectors, import/export modals) | `Settings/customFormats.js`, `Settings/customFormatSpecifications.js`, `CustomFormat*Connector.js` ×6 | [Sonarr/Sonarr@06aa7d57](https://github.com/Sonarr/Sonarr/commit/06aa7d57) (38 files) |
| 11 | Delay profiles · Download clients + options | `Settings/delayProfiles.js`, `Settings/downloadClients.js`, `Settings/downloadClientOptions.js`, `createEnabledDownloadClientsSelector.ts` | [Sonarr/Sonarr@ed1d92c5](https://github.com/Sonarr/Sonarr/commit/ed1d92c5), [Sonarr/Sonarr@7be32b0c](https://github.com/Sonarr/Sonarr/commit/7be32b0c), [Sonarr/Sonarr@d04e2996](https://github.com/Sonarr/Sonarr/commit/d04e2996) |

---

## 8. Phase F — teardown

Sonarr's ending was two commits: a correctness sweep, then the delete.

### F1 — Avoid mutation for react-query data

Reducer habits produce code that mutates objects in place. Under Redux that was contained;
under React Query a cached object is shared across every component reading that key, so
in-place edits corrupt other views silently. Sonarr's sweep hit 37 files ([Sonarr/Sonarr@9bed77c6](https://github.com/Sonarr/Sonarr/commit/9bed77c6)). Do
this **before** the delete, while the old code is still there to compare against.

Sonarr also switched `useApiQuery`'s generic to `Readonly<T>` so the compiler catches it —
Eros's copy has not.

### F2 — Goodbye Redux

Sonarr's final commit ([Sonarr/Sonarr@0460281f](https://github.com/Sonarr/Sonarr/commit/0460281f)) removed 1,996 lines across 51 files. The Eros equivalent:

- Delete `frontend/src/Store/` — 138 files, 15,374 lines.
- Delete surviving `App/State/*AppState.ts` slices (33 today; most disappear with their phase).
- Drop `<Provider>` from `frontend/src/bootstrap.tsx`.
- Remove from `package.json`: `react-redux`, `redux`, `redux-actions`,
  `redux-batched-actions`, `redux-localstorage`, `redux-thunk`, `@types/redux-actions`.
- Re-home the Sentry middleware — `createSentryMiddleware.js` is a redux middleware and
  needs a non-redux home before the store goes.

---

## 9. Where Eros diverges from Sonarr

Five places where you cannot just copy their commit.

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
5. **The SignalR container, and the cache helpers inside it.** Two separate things, and it
   is worth not conflating them:

   *The container is converted as of #470; what follows is why it was safe to do early.* Ours is `SignalRConnector.js` — a `connect()`ed
   class with a `createMapStateToProps` and 15 dispatch props. Sonarr's is
   `SignalRListener.tsx`, a function component on `useQueryClient()`. Sonarr made that
   change in [c3f9cd12](https://github.com/Sonarr/Sonarr/commit/c3f9cd12)
   "Convert signalR to TypeScript" on **2025-01-18 — eight months before their React Query
   migration started — and kept redux**, 37 `dispatch()` calls still in the new file.
   react-redux did not leave it until
   [be3b015b](https://github.com/Sonarr/Sonarr/commit/be3b015b) on 2026-05-29. So the shape
   change is a standalone refactor available at any time; it does not wait on app-state or
   any domain. It is only worth *deferring* because the diff shrinks with every domain
   converted first — each one turns a redux dispatch into a two-line `invalidateQueries`
   before the rewrite has to touch it.

   *The helpers are genuinely ours.* Sonarr keeps three generic helpers keyed on
   `id` — `updateQueryClientItem`, `removeQueryClientItem`, `updatePagedItem`. Eros has six
   bespoke ones because the cache shape differs: keys are slug/foreignId
   (`/movie/{titleSlug}`, `/performer/{foreignId}`), movies are nested inside
   `/performer/{id}/works`, and the paged invalidators scan the cache by key prefix. Those
   cannot collapse into Sonarr's helpers without changing the key scheme. Revisit when the
   container converts; do not treat it as drift to be tidied away.

   Common domains have neither problem. `/health` is a flat list on a plain key, so the
   handler is Sonarr's line verbatim.
6. **Updates come from GitHub, not a first-party update server.** Sonarr runs its own, so
   its `Update.changes` is always the structured `{new, fixed}`. Eros reads GitHub
   releases, so `changes` is `Changes | string | null` and there is an extra `body` for
   release-note markdown, rendered through `MarkdownRenderer`. The fetch is safe to take
   from Sonarr; **the parsing and rendering are not** — #468 converted the query and
   deliberately changed nothing below it.

---

## 10. What to do next

Phases A and B are done. Parse, Disk Space, Log Files, System Status, Health, Tasks,
Backups, Updates, Events, the SignalR container, Organize preview + Unmapped Files, Queue,
Wanted, Blocklist, History and Calendar are all converted. Phase C — the shared plumbing —
is next, and it is a step up in blast radius: every item in it has consumers spread across
the whole app rather than one page.

1. ~~**Queue**, in three PRs.~~ **Done.** Sonarr shipped it as one 58-file commit, but the slice already
   has three independent sub-sections and splitting along them gives three merge points
   instead of one:
   - ~~**`queue.status`** — `/queue/status`, drives the sidebar badge. **Done, #472.**~~
   - ~~**`queue.details`** — `/queue/details`, per-movie queue state with no UI of its own.
     **Done, #473.**~~
   - ~~**`queue.paged`** — the Queue page itself. **Done, #474.** Slice retired.~~
2. ~~**Wanted: Missing + Cutoff Unmet.**~~ **Done, #475.**
3. ~~**Blocklist.**~~ **Done, #477.**
4. ~~**History.**~~ **Done, #478.** Took `movieBlocklistActions` with it, as planned.
5. ~~**Calendar.**~~ **Done, #481.** Phase B complete.
6. **Phase C**, starting with **custom filters**. Every conversion since #474 has had to
   leave `createCustomFiltersSelector` on redux and say so in a comment — six pages now
   carry that same note. It is the one Phase C item that unblocks cleanup in code already
   written, so it goes first.

### `/queue/details` takes no filter, so it needs no provider

Sonarr wraps each page in a `QueueDetailsProvider` carrying that page's filter
(`{all}`, `{seriesId}`, `{episodeIds}`) and has descendants read it from context. Eros'
controller binds only `movieId` and `includeMovie`:

```csharp
public List<QueueResource> GetQueue(int? movieId, bool includeMovie = false)
```

The `all`, `movieIds`, `time` and `view` params the redux thunk sent were never bound, so
every caller already received the whole queue — and the slice's `params` memo existed to
replay filters the server ignored. #473 therefore collapsed it to a single query that
every consumer shares, and skipped the provider. One request now feeds 20+ row-level
hooks on a page instead of one page-level dispatch priming a shared collection.

That also removes a real hazard: `MovieDetails` read `state.queue.details.items` without
ever dispatching a fetch, so what it displayed depended on which page you had visited
first.

### `includeUnknownMovieItems` is an option in Eros and a filter in Sonarr

Sonarr deleted the "show unknown items" checkbox and replaced it with an
`excludeUnknownSeriesItems` filter plus a filter-builder prop, so their `useQueueStatus`
always reports `totalCount` and `errors || unknownErrors`. Eros still has the checkbox in
`QueueOptions.tsx`, backed by `queue.options`, and the sidebar badge honours it. #472 kept
that: the hook reads the flag from redux and derives the badge from it. The option moves
with `queue.paged`, which is also where the paged fetch that injects the flag lives —
converting the badge to Sonarr's unconditional shape first would have silently started
counting unknown items for anyone who had unticked it.

### Wanted keeps its two built-in filters and gains no filter modal

Sonarr's Wanted conversion ([Sonarr/Sonarr@40712781](https://github.com/Sonarr/Sonarr/commit/40712781))
also added a `FILTER_BUILDER`, a `MissingFilterModal`, a `CutoffUnmetFilterModal` and
custom-filter support, none of which the Eros pages have ever had — they pass
`customFilters={[]}` and no `filterModalConnectorComponent`, so the filter menu offers
Monitored and Unmonitored and nothing else. #475 converted the plumbing and left the
filter surface exactly where it was. Adding custom filters here is a feature, and it
wants the shared filter-builder work in Phase C behind it rather than a drive-by inside
a slice retirement.

One thing did have to change. `PropertyFilter['value']` in `Filters/Filter.ts` has no
scalar boolean, so the redux filters' `value: false` becomes `value: [false]` — the same
`monitored=false` on the wire, because `getQueryString` stringifies it. But the old
`getFilterValue` helper returned that value straight into a `!!`, and `!![false]` is
`true`, which would have labelled the toolbar button "Unmonitor Selected" while the
unmonitored filter was active. `Wanted/getMonitoredValue.ts` unwraps the array instead.
`getFilterValue.ts` had no other callers and was deleted with the pages.

### An empty 200 was breaking every `void` delete

`fetchJson` short-circuited on 204 and called `response.json()` on everything else. Two
endpoints answer 200 with *no body at all* — `[RestDeleteById]` actions declared `void`,
which is what `DELETE /blocklist/{id}` and `DELETE /queue/{id}` are — so the parse threw,
the mutation landed in `onError`, and its `onSuccess` invalidation never ran. The row
stayed on screen after a successful delete, and nothing surfaced an error either. The
redux path never saw this: `createAjaxRequest` tolerated the empty body and
`createRemoveItemHandler` spliced the item out of the collection locally.

#477 reads the body as text and treats empty as `{}`. That is what made Blocklist's
per-row remove work, and it repairs the queue's per-row remove at the same time —
`useRemoveQueueItem` has had the same silent failure since #474. Both bulk endpoints
return `new { }` explicitly and were never affected, which is why the bug survived
review: the toolbar button worked and only the row button did not.

### `VirtualTable` blocks two connector removals

`UnmappedFilesTableConnector.tsx` survived #471 even though the slice under it did not.
Its own state moved to zustand, but it still dispatches `executeCommand` ×2,
`deleteMovieFile` and `deleteMovieFiles`, and collapsing it into `UnmappedFilesTable`
needs that table converted class → function. That conversion is entangled with
`VirtualTable` itself: Eros still has the old `scroller`-prop API, which depends on the
parent having already rendered so `scrollerRef.current` is populated — a pattern that does
not survive a function component without extra state. Sonarr replaced it with a
react-window API (`itemCount` / `itemData` / `Header`), so the fix is to port
`VirtualTable` in Phase C and let the tables above it convert afterwards.

### A class component does not block the conversion below it

System Status part 2 (#464) had to get four status values out of redux while
`GeneralSettings` was still a `connect()`-wrapped class — and `mapStateToProps` cannot
call a hook. The instinct is to convert the class first. That is Phase E work and a much
larger change than the one being made.

What worked instead, and generalises: **push each read down to the lowest component that
can call a hook, and bridge only what is left.** Three of the four values were consumed by
`HostSettings` and `UpdateSettings`, which are plain function components — those call
`useSystemStatusData()` directly and the prop-drilling through the class disappears
permanently, exactly as Sonarr has it. Only the fourth (`isWindowsService`, one string in
one modal) genuinely needed the class, so the connector's default export became a small
function component that reads the hook and passes that one prop in.

Two notes on doing this:

- Whisparr's ESLint enforces `filenames/match-exported`, so the new exported wrapper has
  to take the file's name; rename the inner class rather than the export.
- `connect()`'s default `mergeProps` is `{...ownProps, ...stateProps, ...dispatchProps}`,
  so a prop passed in from the wrapper reaches the component untouched as long as
  `mapStateToProps` no longer returns a key of the same name.

### The per-page PR shape, as established by Parse (#458)

Worth repeating verbatim on each page:

1. Move the model out of `App/State/*AppState.ts` into the feature folder as `*Model.ts`,
   dropping the `AppSectionItemState` wrapper. `git mv` so history follows.
2. Add `use<Feature>.ts` wrapping `useApiQuery` / `usePagedApiQuery`.
3. Convert the component. Watch two things the thunks did by hand that React Query already
   does: debouncing via `setTimeout`, and request cancellation via a stashed
   `abortRequest`. Both go.
4. Prefer `isLoading` over `isFetching` for the main spinner, so a refetch keeps the
   previous result on screen instead of blanking the panel. Add a small secondary spinner
   if the page needs background-fetch feedback.
5. Delete the slice, its selector, and its entries in `App/State/AppState.ts` and
   `Store/Actions/index.js`. Where the slice serves more than one page — `systemActions`
   does — take out only that page's pieces and leave the rest, retiring the slice with the
   last page that uses it.
6. Grep for every removed symbol before committing — the action file, the selector, the
   AppState type, and the component if one was deleted. **Include `--include=*.js`.**
   `checkJs` is false, so `tsc` cannot see the connectors; a dangling import in one only
   surfaces when webpack runs. #463 hit exactly this.
7. Verify with `tsc --noEmit`, `eslint frontend/`, `yarn build`, and where the change is
   behavioural, a local run against a real library.
8. **Update this document in the same PR** — the metrics table in §1, the page's row in
   its phase table, the next-up list above, and a row in the §11 log. It is the progress
   tracker; keeping it current is part of the work, not a follow-up. It costs a minute
   while the numbers are in front of you and is archaeology later.

**A component can convert halfway, and often should.** Log Files (#462) moved its data
fetching to React Query but kept `useDispatch` and `createCommandExecutingSelector` for
the delete-logs command, because commands are Phase C. Sonarr's version of that page uses
their `Commands/useCommands` hooks, which do not exist here yet — porting it wholesale
would have dragged the 44-consumer commands slice into a four-file PR. Convert the concern
the PR is about and leave the rest; the file will be visited again.

The consequence is that the `react-redux` import count moves more slowly than the work
does. A page can be most of the way converted and still import `react-redux` for one
selector. The slice line count and the phase tables are the better progress signal.

**Split a conversion when it reaches the boot path.** System Status touched 16 files and
`useAppPage`, which gates the entire app render. It went out as #463 (move every reader
onto the query, delete the duplicate redux paths) and a follow-up for the slice and boot
rewiring. Readers are mechanical and reviewable in bulk; the boot gate is neither, and a
mistake there is a blank screen rather than one broken page.

**`tsc` is not enough on a shared symbol, and neither is a page-level check.** Removing
`createSystemStatusSelector` left a dangling import in a `.js` connector that `tsc` cannot
see. Run `yarn build`. And where the change touches app startup, boot the app — a headless
Chrome over CDP asserting `#root` has children and the body has text catches a spinner
lock that no static check will.

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

### The Sonar coverage gate — resolved

This was flagged as a risk and it was real. #452 failed the quality gate on
`0.0% Coverage on New Code (required ≥ 80%)`, on 106 lines of new TypeScript with no other
condition unmet, because the frontend produces no coverage report and Sonar scored the
absence as zero.

Fixed in #453 with `sonar.coverage.exclusions=frontend/**` — note `coverage.exclusions`,
not `exclusions`, so frontend files stay under analysis for bugs and smells and only drop
out of the coverage metric. Confirmed working: #454 added more frontend TypeScript and
came back green. Sonarr has no SonarQube workflow at all, so there was no upstream
precedent to copy here.

If a JS test runner is ever added, remove that line and set
`sonar.javascript.lcov.reportPaths` instead.

---

## 11. Log

| Date | PR | What |
| --- | --- | --- |
| 2026-08-16 | #452 | zustand, `createPersist`, `createOptionsStore`, `useSelectStore`. Foundation only, no consumers. |
| 2026-08-16 | #453 | `sonar.coverage.exclusions=frontend/**`, plus linking the commit references in this file. |
| 2026-08-16 | #454 | `usePagedApiQuery`, `clientSideFilterAndSort`, `getFilterTypePredicate`, `findSelectedFilters` to TypeScript. |
| 2026-08-16 | #455 | `Readonly<T>` on query results, and movie mutations onto `useApiMutation`. |
| 2026-08-16 | #456 | Dependabot: ignore the redux family — it is being removed, not upgraded. |
| 2026-08-17 | #458 | **Parse.** First page conversion. Slice retired; unreachable `Parse.tsx` deleted. |
| 2026-08-17 | #461 | **Disk Space.** 4 files, +19/−34. Partial trim of `systemActions`; slice survives for status, health, tasks, backups, logs, updates. |
| 2026-08-17 | #462 | **Log Files.** App and update logs. First *partial component* conversion — the fetch half moves, the command half stays on redux until Phase C. |
| 2026-08-17 | #463 | **System Status, part 1.** All 12 readers onto React Query; duplicate `useIsWindows` and `createSystemStatusSelector` deleted. Slice and boot path retained for part 2. |
| 2026-08-17 | #464 | **System Status, part 2.** `status` slice, `FETCH_STATUS` and `SystemStatusAppState` deleted; `useAppPage` gate is now the query alone. Metrics table recomputed. |
| 2026-08-18 | #465 | **Health.** First conversion to move a SignalR handler onto React Query rather than shim it. Two dead selectors deleted. |
| 2026-08-18 | #466 | **Tasks.** `handleSystemTask` now invalidates instead of refetching commands, which let the per-row `setTimeout` refresh go. |
| 2026-08-18 | #467 | **Backups.** First conversion with mutations rather than reads alone, and the first to retire connectors — 66 to 62. Four files to TSX. |
| 2026-08-18 | #468 | **Updates.** Fetch only; the GitHub release-note parsing is Eros-specific and was left untouched. |
| 2026-08-18 | #469 | **Events.** First paged page. `usePage` added; the system slice is down to restart/shutdown. Three type holes fixed that only `.js` files had been hiding. |
| 2026-08-18 | #470 | **SignalR container.** Class + `connect()` → function component, as Sonarr did in Jan 2025. Redux stays inside. |
| 2026-08-18 | #471 | **Organize preview + Unmapped Files.** Two slices retired. First conversion where a page's table prefs move to a zustand options store rather than to React Query. |
| 2026-08-20 | #481 | **Calendar.** `calendarActions` and `CalendarAppState` deleted; Phase B complete. Options and view to a persisted zustand store, the visible range to a second non-persisted one, `/calendar` to `useApiQuery`. Also fixes `executeCommandHelper` never returning the created command, which had left *Search for Missing* throwing and its spinner dead. |
| 2026-08-19 | #478 | **History.** `historyActions`, `movieHistoryActions`, `movieBlocklistActions`, `HistoryAppState` and `MovieBlocklistAppState` deleted, plus two dead `HistoryDetailsConnector` files. The page was already a hybrid — React Query fetched, Redux still held the options — so this is mostly the options store plus the two per-movie reads the interactive search needs. |
| 2026-08-19 | #477 | **Blocklist.** `blocklistActions` and `BlocklistAppState` deleted. Also fixes `fetchJson` on empty 200 bodies, without which the per-row delete does not invalidate — see §10. `movieBlocklistActions` deferred to History; it shares a selector with `movieHistory`. |
| 2026-08-19 | #476 | **Queue custom filters.** Regression fix, not a conversion: #474 resolved the filter key against the built-ins only, so selecting a custom filter stored the key and changed nothing on the wire. |
| 2026-08-18 | #475 | **Wanted: Missing + Cutoff Unmet.** `wantedActions` and `WantedAppState` deleted; both pages onto `usePagedApiQuery` with one options store each. Batch monitor-toggle becomes a `/movie/editor` mutation, which retires `createBatchToggleMovieMonitoredHandler` and the `isSaving` row flag. |
| 2026-08-18 | #474 | **Queue, part 3 of 3 — paged.** `queueActions` and `QueueAppState` deleted. Options to zustand, page to `usePagedApiQuery`, grab/remove to `useApiMutation`. The `isQueuePopulated` ref from #470 goes: React Query only refetches observed queries. |
| 2026-08-18 | #473 | **Queue, part 2 of 3 — details.** Three selectors and nine fetch/clear dispatch sites replaced by one shared query. Collapsed rather than ported to Sonarr's context provider, because our endpoint takes no filter. |
| 2026-08-18 | #472 | **Queue, part 1 of 3 — status.** Sidebar badge onto React Query; `queue/status` SignalR handler onto `setQueryData`; the reconnect refetch moves from the component into `handleReconnected`. |

### Open threads

- **Blocklist's two API filters 500** — `BlocklistController` builds
  `movieIds.Contains(b.MovieId)` and `protocols.Contains(b.Protocol)`, and
  `WhereBuilderSqlite.ParseEnumerableContains` rejects both with
  `Unexpected form of Enumerable.Contains`, so any filter built from the Blocklist filter
  builder returns a 500. `HistoryController` already works around this with hand-built
  `Expression.OrElse` chains (`BuildOrMovieIdFilter`, `BuildOrEventTypeFilter`); Blocklist
  is the only paged controller left using the array form. Backend, pre-existing, and
  entirely independent of the migration — #477 verified that the frontend now puts the
  filter on the wire and stopped there.
- **Retired slices warn on upgrade** — `redux-localstorage` persists whatever the slice
  declared in `persistState`, so a browser that used the app before a conversion still
  has e.g. `blocklist` in its persisted blob. `createStore` then logs
  `Unexpected key "blocklist" found in preloadedState`. Cosmetic — redux drops the key —
  but it fires once per retired slice per user, and every conversion so far has added one.
  `Store/Migrators/migrate.js` is where a sweep would go, and it wants doing once at the
  end rather than per-PR.
- **Whisparr/Whisparr#1132** — `App/queryClient.ts` builds the client with no defaults, so
  `staleTime` is 0 and every observer that mounts after the first refetches. Measured on
  `eros-develop` before Calendar was touched: `/queue/details` ×2 and `/movie/stats` ×2 on
  the calendar, `/queue/details` ×3 on `/scenes`, `/system/status` ×2 everywhere. #481 adds
  `/calendar` to that list — 9 requests against the thunk's 6 over the same six-step
  session — because the page gates its body on a measurement and so mounts consumers in two
  commits. The fix is a client default; it changes behaviour for every converted page and
  should not ride along in a page conversion.
- **Whisparr/Whisparr#1131** — `SET_CALENDAR_VIEW` read
  `view === FORECAST || AGENDA`, always truthy, so every calendar view change reset the
  date to today. #481 preserves it deliberately and links the issue from
  `setCalendarView`. Sonarr's converted calendar drops the reset entirely; the original
  intent was to reset only for the two "from now" views.
- **Whisparr/Whisparr#1123** — `AUTH_HEADERS` and hand-rolled fetch helpers still
  duplicated in `useStudio`, `usePerformer`, `useAddNewMovie`. Not on the critical path;
  filed rather than folded into #455. `useHistory` came off it in #478 — its `apiPost`
  helper is now `useApiMutation`.
- **Whisparr/Whisparr#1127** — the interactive search's "blocked" badge reads
  `/blocklist/movie` only, so an item excluded through an import list exclusion shows
  nothing. Exclusions are keyed by `ForeignId`, not `MovieId`, which is why they never made
  it into that cell. Filed off the back of #478's badge verification; the fix is a third
  sibling read keyed by `foreignId`, or an `isExcluded` flag on `ReleaseResource` if the
  extra dip is unwanted.
- **Whisparr/Whisparr#1126** — `DiskScanImported` (`MovieHistoryEventType` `10`) was never
  added to the History page's built-in filter list, so the one event that means "a file
  changed underneath us" — a rename or a transcode outside the app — is reachable only
  under *All*. Pre-existing; #478 copied the list over verbatim rather than change what the
  page filters on, and filed it. One entry in `FILTERS` fixes it.
- **Two `Filter` type definitions** — `App/State/AppState.ts` and `Filters/Filter.ts`
  differ in how strictly `type` and `value` are typed. 21 files import from the former.
  `History.tsx` carries a cast and a TODO. Collapse them with the custom filters work in
  Phase C.
- **Two live "toggle movie monitored" implementations** — the React Query hook serves
  movie/scene details and the studio and performer scene rows; the Collection overview
  connectors still dispatch the redux thunk. They do not share cache invalidation.
  Resolves when Collection converts in Phase D.
- **`getErrorMessage(error as Error)` in `AddNewPerformer.tsx`** — the cast is harmless
  today because the value is redux-sourced, but it will silently lie once that page moves
  to React Query and the value becomes an `ApiError`. Remove the cast then.
- **The queue Movie filter mixes scenes and movies** — `MovieFilterBuilderRowValue` lists
  every record in the movie table by title, with no `itemType` distinction, so the queue's
  `movieIds` filter cannot tell a scene from a movie. Shared filter-builder plumbing backed
  by `state.movies`, so it belongs with custom filters in Phase C, not with a slice
  retirement. Carried over unchanged by #474.
- **Unmapped Files' delete state is inert** — `UnmappedFilesTableConnector` hardcodes
  `isDeleting = false`, so the Delete Selected spinner never spins and the
  deselect-after-delete branch never fires. Pre-existing; #471 left it alone rather than
  fold a behaviour change into a slice retirement. `useDeleteMovieFiles` already exists in
  `MovieFile/useMovieFile.ts` and would supply a real `isPending` — do it with the
  connector removal.
- **"Open Browser on Start" is Windows-only in Eros** — `HostSettings` gates it on
  `isWindows && mode !== 'service'`, so the option is invisible on macOS and Linux.
  Sonarr gates the same field on `isWindowsService` alone and shows it everywhere else.
  Preserved verbatim in #464 rather than quietly adopting Sonarr's condition; if it is a
  bug it deserves its own PR, since the setting does work off Windows.
- **`NaN` progress bars on zero-size mounts** — `/diskspace` returns entries with
  `totalSpace: 0` for synthetic mounts (`/System/Volumes/Data/home` and similar). Disk
  Space computes `100 - (freeSpace / totalSpace) * 100`, so those rows render a `NaN`-width
  `ProgressBar`. Predates the migration and was left alone in #461 to keep that conversion
  mechanical. A one-line guard fixes it, but it is a rendering change, not a migration one.
