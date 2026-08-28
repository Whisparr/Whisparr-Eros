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

**Status: Phases A, B, C and D complete; Phase E is under way, eight of eleven sections done. Phase E is the whole of what is left, plus the teardown.** See §11 for the running log.

---

## 1. Where we actually are

| Metric | At assessment | Now |
| --- | --- | --- |
| Files importing `react-redux` | 327 of 1,255 | **32** of 1,172 |
| Lines under `frontend/src/Store/` | 15,374 across 138 files | **2,641** across 41 |
| Redux slices registered in `Store/Actions/index.js` | 35 | **1** |
| Remaining `*Connector` files | 66 | **21** |
| Files touching React Query | 35 | **82** |
| zustand stores | 0 (not installed) | **installed, 40 files** |

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
> **#498 corrections.** Three of the figures recorded at #497 do not reproduce at
> [c47f968e](https://github.com/Whisparr/Whisparr-Eros/commit/c47f968e): the `Store/`
> row was measured before `movieTitlesActions.js` was deleted in the same PR, so it
> read 10,586 across 106 where the tree gives 10,511 across 105; the denominator gives
> 1,236, not 1,237; and the zustand row gives 18, not 19. The lesson is procedural
> rather than arithmetic — counts are now taken after the code commit lands, and the
> doc update is a second commit. The zustand row had no pinned command either, so it
> gets one below.
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
> # zustand (pinned in #498)
> git grep -lE "from 'zustand|createPersist|createOptionsStore" <ref> \
>   -- 'frontend/src/*.ts' 'frontend/src/*.tsx' | wc -l
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
| `Movie/Index/useMovieIndexQuery.ts` | ~~`state.movieIndex.selectedFilterKey`, `movieActions.filters`~~ — none, since #496/#497 |
| `Movie/Index/useMovieIndex.ts` | ~~12 × `movieIndexActions` dispatches~~ — none, since #496 |
| `Scene/Index/useSceneIndexQuery.ts` | ~~`state.sceneIndex.selectedFilterKey`~~ — none, since #498 |

Custom filters are no longer among those dependencies: `createCustomFiltersSelector` was
retired in #484 and both query hooks read `useCustomFiltersList` now. As of #498 neither
index hook calls `useSelector` at all, and as of #499 neither domain's editing half does
either. **As of #536 the domains are done**: `Movie/`, `Scene/`, `Performer/` and
`Studio/` contain no `react-redux` import at all. The last one was
`Movie/IndexerFlags.tsx` reading `createIndexerFlagsSelector`; the UI-settings and
quality-profile reads that had been the bulk of the remainder went with sections 1 and 3.
Everything still importing `react-redux` is now Settings (45 files), plus thirteen
scattered across `Components/`, `InteractiveSearch/`, `System/`, `Helpers/`,
`DownloadClient/` and `App/`.

### The ordering problem

Eros went domain-first (Movie, Scene, Performer, Studio). Sonarr went the other way —
peripheral pages first, then shared plumbing, and only reached Series in month four.

That wasn't arbitrary. A domain index page sits on top of five shared systems: persisted
view options, row selection, custom filters, command dispatch, and paging. At assessment
**none of those five existed off Redux**, so each domain got ~80% converted and then
stalled against the same missing floor — which is exactly the hybrid state above.

**All five now exist**: `createOptionsStore`, `useSelectStore`, `useCustomFilters`,
`useCommands` and `usePage`. That was the point of Phases A and C, and it is why the
domains are now unblocked — the recommendation below has been carried out.

**Recommendation (done):** pause domain work, build the foundation (phase A), then close
Movie/Scene/Performer/Studio in one pass each. The high-value instinct was right; the
sequencing is what was costing you.

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

**Still outstanding.** Eros's `useApiQuery` has drifted from Sonarr's. Ours
`JSON.stringify`s query params and bodies into the cache key and hardcodes
`placeholderData: (prev) => prev` as a default. Sonarr passes params as a structural key
and leaves placeholder behaviour to the caller. The stringify keys work, but they make
cache invalidation by prefix impossible — which is why `useProviderOptions` (#490) and
`useTranslations` (#493) both reach past the helper to a raw `useQuery`. The window for
doing this cheaply has closed somewhat: **39 callers today**, against the 13 this line was
written for.

~~Same for the ad-hoc `apiPut`/`apiPatch` helpers and the two `// TODO: Move to
useApiMutation` markers in `Movie/useMovie.ts`.~~ **Done** — both are gone.

---

## 4. Phase B — leaf pages

~12 PRs. Low risk, high clearance. Self-contained pages with few dependents; each removes
a whole state slice. Take them roughly in Sonarr's order.

| Page | Retires | Sonarr ref |
| --- | --- | --- |
| ~~**Queue**~~ — **done, #472 / #473 / #474.** Biggest leaf, 14 importers, SignalR-driven, drives sidebar badge. Split three ways rather than Sonarr's single commit | ~~`queueActions` (539 loc), `QueueAppState`~~ | [Sonarr/Sonarr@ae201f52](https://github.com/Sonarr/Sonarr/commit/ae201f52) (58 files) |
| ~~**Blocklist** — the page~~ — **done, #477.** `movieBlocklistActions` stays: it feeds one selector in `InteractiveSearchRow` jointly with `movieHistory`, so it converts with History | ~~`blocklistActions`, `BlocklistAppState`~~ | [Sonarr/Sonarr@a4f21085](https://github.com/Sonarr/Sonarr/commit/a4f21085) |
| ~~**History**~~ — **done, #478.** Was a hybrid: React Query fetched, redux still held the options. Took `movieBlocklistActions` with it, as planned | ~~`historyActions`, `movieHistoryActions`, `movieBlocklistActions`, `HistoryAppState`, `MovieBlocklistAppState`, `HistoryDetailsConnector` ×2~~ | [Sonarr/Sonarr@a45b0776](https://github.com/Sonarr/Sonarr/commit/a45b0776), [Sonarr/Sonarr@6b479a5a](https://github.com/Sonarr/Sonarr/commit/6b479a5a) |
| ~~**System: Status / Health**~~ — **done, #461 / #463 / #464 / #465.** Health had the sidebar dependency, so it went last | ~~`systemActions` (59 loc today, from 391 after #461)~~ — gone with #534, ~~`createHealthCheckSelector.js`~~, ~~`createSystemStatusSelector.ts`~~ | [Sonarr/Sonarr@49c52c2e](https://github.com/Sonarr/Sonarr/commit/49c52c2e), [Sonarr/Sonarr@0552a811](https://github.com/Sonarr/Sonarr/commit/0552a811), ~~[Sonarr/Sonarr@871ae955](https://github.com/Sonarr/Sonarr/commit/871ae955)~~ |
| ~~**System: Tasks / Backups / Events**~~ — **done, #462 / #466 / #467 / #468 / #469.** | ~~`BackupsConnector.js`, `RestoreBackupModal*Connector.js`~~ (#467), ~~`LogsTableConnector.js`~~ (#469) | [Sonarr/Sonarr@3091f40c](https://github.com/Sonarr/Sonarr/commit/3091f40c), [Sonarr/Sonarr@c295e24f](https://github.com/Sonarr/Sonarr/commit/c295e24f), [Sonarr/Sonarr@ff5e7327](https://github.com/Sonarr/Sonarr/commit/ff5e7327) |
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
| ~~**Commands**~~ — 44 live consumers; every refresh/search button. SignalR-fed. **Done, #486.** | ~~`commandActions` (207 loc)~~, ~~`createCommandSelector.ts`~~, ~~`createExecutingCommandsSelector.ts`~~, ~~`createCommandExecutingSelector.ts`~~ | [Sonarr/Sonarr@dec6f4b5](https://github.com/Sonarr/Sonarr/commit/dec6f4b5) (51 files) |
| ~~**Custom filters**~~ — prerequisite for every index filter modal. Two PRs, split at the mutation boundary. **Done, #483 and #484.** | ~~`customFilterActions`~~, ~~`CustomFiltersModalContentConnector.js`~~, ~~`CustomFiltersAppState`~~ | [Sonarr/Sonarr@7d2e01d5](https://github.com/Sonarr/Sonarr/commit/7d2e01d5) (44 files) |
| ~~**Tags**~~ — rewrite `useTags` for real, plus tag details and filter-builder rows. **Done, #487.** | ~~`tagActions`~~, ~~`createTagsSelector.ts`~~, ~~`createTagDetailsSelector.ts`~~, ~~`TagFilterBuilderRowValueConnector.js`~~, ~~`TagsAppState`~~ | [Sonarr/Sonarr@0809a72c](https://github.com/Sonarr/Sonarr/commit/0809a72c) (40 files) |
| ~~**Root folders**~~ — 17 consumers across Settings, Add flows, edit modals. **Done, #488.** | ~~`rootFolderActions`~~, ~~`createRootFoldersSelector.ts`~~, ~~`RootFolderAppState`~~ | [Sonarr/Sonarr@7a5157df](https://github.com/Sonarr/Sonarr/commit/7a5157df) |
| ~~**Paths + file browser**~~ *(hybrid)* — `usePaths` existed; `PathInput` and `FileBrowserModalContent` finished. **Done, #489.** | ~~`pathActions`~~, ~~`PathsAppState`~~, ~~`createPathsSelector.ts`~~ | [Sonarr/Sonarr@91b24290](https://github.com/Sonarr/Sonarr/commit/91b24290), [Sonarr/Sonarr@9a0e23a9](https://github.com/Sonarr/Sonarr/commit/9a0e23a9) |
| ~~**Provider options + captcha**~~ — feeds every provider settings form. **Done, #490.** | ~~`providerOptionActions`~~, ~~`captchaActions`~~, ~~`oAuthActions`~~, ~~`ProviderOptionsAppState`~~, ~~`CaptchaAppState`~~, ~~`OAuthAppState`~~ | [Sonarr/Sonarr@cd7adba1](https://github.com/Sonarr/Sonarr/commit/cd7adba1), [Sonarr/Sonarr@3c77c4b9](https://github.com/Sonarr/Sonarr/commit/3c77c4b9), [Sonarr/Sonarr@8a68c860](https://github.com/Sonarr/Sonarr/commit/8a68c860) |
| ~~**SignalR → query invalidation**~~ — mostly landed already; the row was written against a `SignalRConnector.js` that no longer exists. **Done, #491**, which fixed the dead `wanted/*` handlers and retired `pagePopulator`'s reason mechanism. | nothing on its own — the 11 dispatches left in the listener all target Phase D (`movieCollections`) and Phase E (`settings.*`) slices | [Sonarr/Sonarr@SignalRListener](https://github.com/Sonarr/Sonarr/blob/v5-develop/frontend/src/Components/SignalRListener.tsx) |
| ~~**App shell**~~ — messages, dimensions, connection state, version, sidebar, translations, advanced settings. Three PRs. **Done, #492, #493 and #494.** | ~~`createDimensionsSelector.ts`~~, ~~`MessagesAppState`~~, ~~`appActions`~~, ~~the `app` slice~~, ~~`settings.advancedSettings`~~ | [Sonarr/Sonarr@878f879c](https://github.com/Sonarr/Sonarr/commit/878f879c), [Sonarr/Sonarr@7e702380](https://github.com/Sonarr/Sonarr/commit/7e702380) |

---

## 6. Phase D — close out the domains

~9 PRs. Each domain is one commit in Sonarr's model (Series was 91 files). Eros has four
parallel domains where Sonarr had one — budget four Series-sized commits, but they share a
shape: convert one properly, then the other three are largely mechanical.

| Domain | Remaining work | Sonarr ref |
| --- | --- | --- |
| ~~**Movie** *(hybrid)* — do first, set the template. 29 redux files, 2 connectors.~~ **Done: #496 (index options), #497 (editing) and #515 (the `movies` slice).** The files left under `Movie/` import `react-redux` for UI settings and the indexer-flag and quality-profile lists only, all Phase E. | ~~Index options → `movieIndexOptionsStore`~~; ~~select footer~~; ~~Delete modal~~; ~~filter modal `sectionItems`~~. ~~`movieActions`~~, ~~`createAllMoviesSelector`~~, ~~`createMovieClientSideCollectionItemsSelector`~~, ~~`createMovieSelector`~~, ~~`createMultiMoviesSelector`~~, ~~`createAllItemsSelector`~~, ~~`MoviesAppState`~~. Retires ~~`movieIndexActions`~~; `movieTitlesActions` was already dead. | [Sonarr/Sonarr@0521a6c3](https://github.com/Sonarr/Sonarr/commit/0521a6c3) (91 files) |
| ~~**Scene** *(hybrid)* — 21 redux files.~~ **Done: #498 (index options, closing Whisparr/Whisparr#1134) and #499 (editing).** The five files left read `settings.safeForWorkMode` and `createUISettingsSelector` only, and are gated on Phase E. | ~~`sceneIndexActions`; select footer; Delete/Tags/Organize modals; `DeleteSceneModalContentConnector.js`, `createAllScenesSelector.ts`~~ | — |
| ~~**Performer** *(hybrid)* — 20 redux files. Details, scenes tab, add flow, edit modal.~~ **Done: #504 (index options), #505 (bulk editing and both delete paths), #506 (edit modal and the `performers` slice), #507 (details), #508 (add flow).** The two files left — `PerformerDetails` and `SceneRow` — import `react-redux` only for `createUISettingsSelector`, which is Phase E. | ~~Index options → `performerIndexOptionsStore`~~; ~~filter modal `sectionItems`~~; ~~select footer~~; ~~tags modal~~; ~~both Delete modals~~; ~~edit modal~~; ~~details → `performerScenesOptionsStore`~~; ~~add flow → `addPerformerDefaultsStore`~~; ~~`performerActions` (675 loc), `performerScenesActions`, `addPerformerActions`, `EditPerformerModalContentConnector.js`, `createAllPerformersSelector.ts`, `createPerformerClientSideCollectionItemsSelector.js`, `createPerformerSelector.js`, `PerformersAppState.ts`~~ | — |
| ~~**Studio** *(hybrid)* — 20 redux files. Same shape as Performer.~~ **Done: #500 (index options), #501 (bulk editing), #502 (edit modal and the slice), #503 (details).** The two files left are `useAddNewStudio` — which dispatches into `addMovieActions`, shared with the movie add flow — and `StudioIndexPoster`, which reads `safeForWorkMode` only. | ~~Index options → `studioIndexOptionsStore`~~; ~~filter modal `sectionItems`~~; ~~select footer~~; ~~both Delete modals~~; ~~edit modal~~; ~~details → `studioScenesOptionsStore`~~; ~~`studioActions` (509 loc), `studioScenesActions`, `studioMoviesActions`, `DeleteStudioModalConnector.js`, `createAllStudiosSelector.ts`, `createStudioSelector.js`~~ | — |
| ~~**Collection** — untouched, fully connector-based. 7 of the 56 connectors live here.~~ **Done, #509.** Nothing under `Collection/` imports `react-redux`. | ~~`movieCollectionActions` (571 loc), `Collection*Connector.js` ×7, `createCollectionSelector.ts`, `createCollectionExistingMovieSelector.js`, `createCollectionClientSideCollectionItemsSelector.js`, `MovieCollectionAppState.ts`~~ | — |
| ~~**Movie files + credits** *(hybrid)* — `useMovieFile` covers most; credits and titles still redux~~ **Done, #512.** `FileEditModal` still imports `react-redux`, but only for the quality-profile schema and the language list, which are Phase E. | ~~`movieFileActions` (332 loc), `movieCreditsActions` (86 loc), `MovieCreditPosterConnector.tsx`, `MovieFilesAppState`, `MovieCreditAppState`~~ | [Sonarr/Sonarr@44fc1e0e](https://github.com/Sonarr/Sonarr/commit/44fc1e0e) |
| ~~**Interactive search** — release list, override match, download client picker~~ **Done, #511.** `OverrideMatchModalContent` still imports `react-redux`, but only for the download-client list, which is Phase E. | ~~`releaseActions` (364 loc), `ReleasesAppState`~~ | [Sonarr/Sonarr@8f95849e](https://github.com/Sonarr/Sonarr/commit/8f95849e) (41 files) |
| ~~**Interactive import** — folder picker, quality/language selects, row grid~~ **Done, #510.** Nothing under `InteractiveImport/` imports `react-redux`. | ~~`interactiveImportActions` (366 loc), `InteractiveImportAppState`~~ | [Sonarr/Sonarr@ec44e1c5](https://github.com/Sonarr/Sonarr/commit/ec44e1c5) |
| ~~**Add / Import Movie** *(hybrid)* — `useAddNewMovie` and `useImportMutation` exist; finish folder-select and import-list flows~~ **Done, #513.** The five files left under `AddMovie/` import `react-redux` for UI settings, naming settings and the quality-profile list only, all Phase E. | ~~`addMovieActions` (264 loc), `migrateMonitorToEnum`~~ | [Sonarr/Sonarr@ad57cf4b](https://github.com/Sonarr/Sonarr/commit/ad57cf4b) |

---

## 7. Phase E — Settings

~14 PRs, 87 files. The long grind. `settingsActions` has 76 live consumers, and 37 of the
56 remaining connectors are in here. Sonarr spent six months at roughly one section per
fortnight and never batched two together. Do the same.

`Settings/useSettings.ts` landed with section one and is the shape a single-object form
takes: `useSettings` reads, `useSaveSettings` PUTs and writes the response into the cache,
and `useManageSettings` puts a `usePendingChangesStore` beside the query and runs both
through `selectSettings`. `Settings/useProviderSettings.ts` landed with section two and is
the shape a **list** section takes -- the same three plus `useProvider`, which picks one
row out of the list query, and `useDeleteProvider`. Sections 3, 4, 7, 8, 9, 10 and 11 are
all list sections, so that is the file most of what is left will call. A provider section
that edits `fields` reaches for `usePendingFieldsStore`, and a section that edits several
rows at once in a table -- delay profiles, quality definitions -- for `usePendingItemsStore`.

~~**Prerequisite:** the three pending-changes stores (`usePendingChangesStore`,
`usePendingFieldsStore`, `usePendingItemsStore`), which replace the dirty-form tracking in
`createSetSettingValueReducer` and `createSetProviderFieldValueReducer`. Land those in
their own PR before section one.~~ **Done, #516.** Copied from Sonarr unchanged; the
reducers themselves stay until their last consumer goes. The stores deliberately do not
decide whether a value is a change — see *The pending stores do not own the
is-it-a-change question* below.

| Order | Section | Retires | Sonarr ref |
| --- | --- | --- | --- |
| 1 | ~~**UI settings** — smallest, 32 files read it. Good pathfinder.~~ **Done, #517.** ~~Safe-for-work mode was split out and landed first in #514~~; the `/config/ui` half followed. It was the pathfinder in both senses — it took `useSettings` with it, and it moved `react-redux` further than any single PR of the migration so far. | ~~`Settings/ui.js`, `UISettingsConnector.js`, `createUISettingsSelector.ts`~~; ~~`settings.safeForWorkMode`, `TOGGLE_SFW_MODE`, `SafeForWorkButtonConnector.js`, `SafeForWorkContext.tsx`~~ | [Sonarr/Sonarr@74e6ce43](https://github.com/Sonarr/Sonarr/commit/74e6ce43) |
| 2 | ~~**Remote path mappings · Release profiles** — two small CRUD lists, taken together because they are the same shape.~~ **Done, #518.** It took `Settings/useProviderSettings.ts` with it, and the three remote path mapping connectors: 42 to 39. | ~~`Settings/remotePathMappings.js`, `Settings/releaseProfiles.js`~~; ~~`ReleaseProfilesAppState`, `RemotePathMappings*Connector.js` ×3~~ | [Sonarr/Sonarr@8fcab2d3](https://github.com/Sonarr/Sonarr/commit/8fcab2d3), [Sonarr/Sonarr@4713615b](https://github.com/Sonarr/Sonarr/commit/4713615b) |
| 3 | ~~**Quality definitions · Quality profiles**~~ — **done, #519 (definitions) and #520 (profiles).** Split in two; between them they took eight connectors, 39 to 31, and the boot gate lost its quality-profile term as predicted. | ~~`Settings/qualityDefinitions.js`, `Quality*Connector.js` ×4~~; ~~`Settings/qualityProfiles.js`, `QualityProfile*Connector.js` ×3, `QualityFilterBuilderRowValueConnector.js`, `createQualityProfileSelector.ts`, `createProfileInUseSelector.ts`~~ | [Sonarr/Sonarr@21ca65a0](https://github.com/Sonarr/Sonarr/commit/21ca65a0), [Sonarr/Sonarr@cf593b1f](https://github.com/Sonarr/Sonarr/commit/cf593b1f) |
| 4 | ~~**Connections (Notifications)**~~ — **done, #521.** Four connectors, 31 to 27, and the first consumer of `usePendingFieldsStore`. `useProviderSettings` grew test and fields support here. | ~~`Settings/notifications.js`, `NotificationsConnector.js`, `EditNotificationModalConnector.js`, `EditNotificationModalContentConnector.js`, `AddNotificationModalContentConnector.js`~~. `DeviceInput.tsx` was on this list and came off it early, in #490. | [Sonarr/Sonarr@6d49b41d](https://github.com/Sonarr/Sonarr/commit/6d49b41d) |
| 5 | ~~**Naming · Media Management · Metadata**~~ — **done, #530** (naming and media management) and **#531** (metadata). Split in two: the first two are one page with one toolbar over two endpoints, and Metadata is a provider list with nothing in common with them. #530 took no connectors; #531 took all three, 27 to **24**. | ~~`Settings/naming.js`, `Settings/namingExamples.js`, `Settings/mediaManagement.js`, `Settings/metadata.js`, `MetadatasConnector.js`, `EditMetadataModalConnector.js`, `EditMetadataModalContentConnector.js`~~ | [Sonarr/Sonarr@677c588a](https://github.com/Sonarr/Sonarr/commit/677c588a), [Sonarr/Sonarr@bbb4c671](https://github.com/Sonarr/Sonarr/commit/bbb4c671), [Sonarr/Sonarr@c0a56586](https://github.com/Sonarr/Sonarr/commit/c0a56586) |
| 6 | ~~**Languages · General**~~ — **done, #532** (languages), **#534** (restart and shutdown, the prerequisite) and **#535** (general). Split three ways: Languages is a read-only list five pages share, General is the largest single-object form in Settings, and General could not start while `restart` was a thunk. Between them 85 to **74**, one connector, and `Store/Actions/index.js` down to one slice. | ~~`Settings/languages.js`, `Settings/general.js`, `GeneralSettingsConnector.js`~~; ~~`systemActions.js`, `actionTypes.js`~~ | [Sonarr/Sonarr@5bac016f](https://github.com/Sonarr/Sonarr/commit/5bac016f), [Sonarr/Sonarr@6764cf1c](https://github.com/Sonarr/Sonarr/commit/6764cf1c) |
| 7 | ~~**Indexers · Indexer Options · Indexer Flags**~~ — **done**, split three ways as Sonarr did: **#536** (flags, a read-only list, the Languages shape again, and the last `react-redux` import out of `Movie/`), **#537** (options, a single-object form on `useManageSettings`, which corrected a wire type the interface had wrong) and **#538** (indexers, the provider list). The row said 11 files and it was 24. One connector — 23 to **22** — and `react-redux` 74 to **58** across the three. | ~~`Settings/indexers.js`, `IndexerFilterBuilderRowValueConnector.js`, `Settings/indexerFlags.js`, `createIndexerFlagsSelector.ts`, `IndexerFlagSettingsAppState`, `Settings/indexerOptions.js`, `IndexerOptionsAppState`, `IndexerAppState`~~ | [Sonarr/Sonarr@c4c0ec25](https://github.com/Sonarr/Sonarr/commit/c4c0ec25), [Sonarr/Sonarr@7a455dd0](https://github.com/Sonarr/Sonarr/commit/7a455dd0), [Sonarr/Sonarr@fbb70519](https://github.com/Sonarr/Sonarr/commit/fbb70519) |
| 8 | ~~**Auto tagging · Import list exclusions**~~ — **done**, split in two as Sonarr shipped it: **#539** (auto tagging) and **#540** (import list exclusions, the only paged section in Settings). No connectors either side, so 22 does not move; between them `react-redux` 58 to **47**. | ~~`Settings/autoTaggings.js`, `Settings/autoTaggingSpecifications.js`, `Settings/importListExclusions.js`, `ImportListExclusionsSettingsAppState`~~ | [Sonarr/Sonarr@0ebda892](https://github.com/Sonarr/Sonarr/commit/0ebda892), [Sonarr/Sonarr@b0fac152](https://github.com/Sonarr/Sonarr/commit/b0fac152) |
| 9 | ~~**Import lists + options**~~ — **done**, split in two as Sonarr shipped it: **#541** (options, a single-object form on `useManageSettings`) and **#542** (import lists, the provider list, and **the end of the boot gate**). One connector — 22 to **21** — and `react-redux` 47 to **32** across the two. | ~~`Settings/importListOptions.js`, `ImportListOptionsSettingsAppState`~~; ~~`Settings/importLists.js`, `ImportListFilterBuilderRowValueConnector.js`, `ImportListAppState`, `createImportListSelector.js`~~. `createProviderSettingsSelector.ts` was on this list and stays: custom formats and download clients still have five callers between them, so it goes with section 11. | [Sonarr/Sonarr@75d1a958](https://github.com/Sonarr/Sonarr/commit/75d1a958), [Sonarr/Sonarr@ba7b6b03](https://github.com/Sonarr/Sonarr/commit/ba7b6b03) |
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

Sonarr also switched `useApiQuery`'s generic to `Readonly<T>` so the compiler catches it.
~~Eros's copy has not.~~ **Done in #455** — `useApiQuery` returns `Readonly<T>` today, so
this sweep starts from the same footing Sonarr's did.

### F2 — Goodbye Redux

Sonarr's final commit ([Sonarr/Sonarr@0460281f](https://github.com/Sonarr/Sonarr/commit/0460281f)) removed 1,996 lines across 51 files. The Eros equivalent:

- Delete `frontend/src/Store/` — 41 files, 2,641 lines today, from 138 files and 15,374
  lines at assessment.
- Delete surviving `App/State/*AppState.ts` slices (1 today — `SettingsAppState` — from 33;
  most disappear with their phase).
- Drop `<Provider>` from `frontend/src/bootstrap.tsx`.
- Remove from `package.json`: `react-redux`, `redux`, `redux-actions`,
  `redux-batched-actions`, `redux-localstorage`, `redux-thunk`, `@types/redux-actions`.
- Re-home the Sentry middleware — `createSentryMiddleware.js` is a redux middleware and
  needs a non-redux home before the store goes.

---

## 9. Where Eros diverges from Sonarr

Six places where you cannot just copy their commit.

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
3. ~~**Collection has no Sonarr analogue** and is the least-migrated area in the tree — 7
   connectors and a 572-line action file. Needs designing rather than porting.~~ **Done,
   #509** — designed rather than ported, and it found two live bugs on the way (below).
4. ~~**Safe-for-work mode.** `SafeForWorkContext` and `SafeForWorkButtonConnector.js` are
   Eros-specific global UI state, still on `settings.safeForWorkMode` and still persisted
   through `redux-localstorage`.~~ **Done, #514**, as `App/safeForWorkStore.ts` — beside
   `App/appStore` as this said it should be, and the last piece of app-level UI state off
   Redux. It led Phase E rather than riding with the rest of Settings: the flag lives in
   that slice but is not part of `/config/ui`, so it had nothing to wait for.
5. **The SignalR container, and the cache helpers inside it.** Two separate things, and it
   is worth not conflating them:

   *The container converted in #470 and the handlers in #491; what follows is why it was
   safe to do early.* Ours **was** `SignalRConnector.js` — a `connect()`ed class with a
   `createMapStateToProps` and 15 dispatch props. Sonarr's is `SignalRListener.tsx`, a
   function component on `useQueryClient()`. Sonarr made that
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
   `id` — `updateQueryClientItem`, `removeQueryClientItem`, `updatePagedItem`. Eros has
   fourteen, because the cache shape differs: keys are slug/foreignId
   (`/movie/{titleSlug}`, `/performer/{foreignId}`), movies are nested inside
   `/performer/{id}/works`, and the paged invalidators scan the cache by key prefix. Those
   cannot collapse into Sonarr's without changing the key scheme. Only `updatePagedItem`
   ported across unchanged, in #491. Do not treat the rest as drift to be tidied away —
   though they should shrink as each domain converts and the bespoke key handling moves
   into that domain's hooks.

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

Phases A, B and C are done. Every leaf page is converted, and so is every piece of shared
plumbing: custom filters, commands, tags, root folders, paths, provider options, SignalR
and the app shell. **Phase D is done** — Scene, Performer, Studio, Collection,
interactive import, interactive search, movie files/credits, add/import movie and Movie's
own remainder have all landed. It is a step up again: a domain index page sits on top of all
five shared systems at once, and Phase D is where the connector count finally starts to
move, since 12 of the 56 lived in these areas (Collection 7, Movie 2, and one each for
Scene, Performer and Studio); Settings holds 37 of the rest. #499 took the Scene one, the
first of the twelve to go. #500 did not move the number — Studio's connector is
`DeleteStudioModalConnector.js`, which belongs to the editing half; #501 took it, and found
it had no importers at all. **#509 took all seven of Collection's**, the single biggest
drop of the migration: 53 to 46. #512 took Movie's credits connector and, with the last
redux import gone from that folder, the vestigially-named `MovieCastPostersConnector`
alongside it: 46 to 44. #513 moved neither that number nor the `react-redux` count — the
`addMovie` slice had no connectors, and all three of its consumers keep a `useSelector` for
a Phase E read — which is the §5 point about the headline number lagging the work.

**Phase E is under way.** ~~The pending-changes stores first — nothing in §7 can start
without them, because every section left is a settings form.~~ **Done, #516**, foundation
only and with no consumers, the same shape #452 took. ~~Section one — the `/config/ui`
half of UI settings, the rest of that row having gone out as #514.~~ **Done, #517**, and it
took `Settings/useSettings.ts` with it, so the ten sections left start from a written-down
shape rather than inventing one each.

~~Section 2 — remote path mappings and release profiles.~~ **Done, #518**, and it took
`Settings/useProviderSettings.ts` with it, which is to the seven list sections left what
`useSettings` is to the single-object ones. The prediction here was wrong in one respect
and it is worth recording: these were called the first use of `usePendingItemsStore`, and
they are not — see *A list section is still a form, one row at a time* below.

~~**Next: section 3** — quality profiles and quality definitions.~~ Split in two, because
the two halves share a name and nothing else. ~~The definitions half~~ **done, #519**: it
is the first real use of `usePendingItemsStore`, and it turned out to own all four of the
connectors the section-3 row predicted, so the count moved 39 to 35 on the smaller half.

~~**Next: section 3b** — quality profiles.~~ **Done, #520**, and it was the bigger half as
expected: the 544-line connector, its 373-line content component and both other connectors
collapse into one `EditQualityProfileModalContent.tsx`, twelve consumers outside the page
move to the list query, and the boot gate lost its quality-profile term. The
*"Quality profile in use"* thread does **not** close with it — Sonarr's
`useQualityProfileInUse` counts series client-side, which here means the whole-library
fetch the thread above rejects, so the hook arrived with the import-list half only and the
`GET /qualityprofile/{id}/inuse` endpoint is still the answer.

~~**Next: section 4** — Connections (Notifications).~~ **Done, #521.** A provider list
section like section 2, and the first one whose rows edit `fields`, so
`usePendingFieldsStore` finally has a consumer. Most of the work was in the shared hook
rather than the page: `useProviderSettings` had only ever needed to save, and a provider
with fields also needs to test, to fold pending fields into both bodies, and to put a
failed test where a failed save goes.

~~**Next: section 5** — Naming, Media Management and Metadata.~~ Split in two, because the
first two are one page and the third is a different shape entirely. ~~The Naming and Media
Management half~~ **done, #530**: three slices for two endpoints, both single-object
sections on `useSettings`, with `namingExamples` turning out not to be a settings section
at all but a debounced lookup keyed on the unsaved form. It is the first page where two
`useManageSettings` forms sit under one toolbar, and the reason that needs the
`setChildSave` shape rather than a shared hook is recorded in *Two settings forms cannot
share a pending bag* below.

~~**Next: section 5b** — Metadata.~~ **Done, #531**, and the prediction held exactly:
`useProviderSettings` as section 4 left it, minus `useTestProvider` and minus the seeding,
so the hook is thirty-one lines. The work was not in the hook — it was the two dead
things the section had been carrying, both recorded in *Metadata was rendering a component
its connector could not reach* below.

~~**Next: section 6** — Languages and General.~~ Split in two, because they share the row
and nothing else: Languages is a read-only list five pages read, General is the largest
single-object form in Settings. ~~The Languages half~~ **done, #532** — the first section
of Phase E that retires a slice without touching a form, and the second (after SignalR) to
move `react-redux` without moving the connector count. See *Sonarr's language filter
excludes nothing* below.

~~**Next: section 6b** — General.~~ It needs one thing first. General is the only page that
restarts the app from a Save, and `restart` was a `systemActions` thunk, so the page could
not come off `react-redux` while that stood. ~~**`System/useSystem.ts`**~~ **done, #534**,
split out the way #516 split the pending stores out of section one: both thunks become
mutations, `systemActions.js` goes, and `Store/Actions/index.js` is down to **one**
registered slice — `settings`, which is now the whole of what is left. 80 to **78**.

~~**Next: section 6b** — General, for real this time.~~ **Done, #535**, and section 6 with
it. The partial `useGeneralSettings` that already existed turned out to be worth less than
it looked — it was a `useSelector` over the slice with a boot dispatch, so the three
consumers reading it moved anyway; what it did buy was that they moved without touching
their own logic. The restart-required check is the one thing that could not be ported, and
it is its own note below.

~~**Next: section 7** — Indexers, Indexer Options and Indexer Flags. It is the first
section since 3 whose slices are read by the boot gate — `indexerFlags` is one of the two
terms left in `isReduxPopulated`.~~ Split three ways, as Sonarr shipped it.
~~**Indexer Flags first**, the smallest and the one on the boot gate.~~ **Done, #536** —
the Languages shape a second time, a read-only list the server compiles in, so the boot
gate swaps its `isPopulated` term for the query's `isFetched` and `isReduxPopulated` is
down to `importLists` alone. It also took the last `react-redux` import out of `Movie/`,
which finishes the four domain folders — see §9.

~~**Next: section 7b** — Indexer Options, the single-object form.~~ **Done, #537**, and
it is the plainest form conversion of Phase E: one endpoint, one `useManageSettings`, one
child under `IndexerSettings`' shared toolbar, and nothing new added to the shared hook.
The one thing it did turn up was a wrong wire type — see *`whitelistedHardcodedSubs` is a
string, not an array* below.

~~**Next: section 7c** — Indexers, the provider list, and the end of section 7.~~
**Done, #538**, and it was the larger half by some distance: 13 files lose their
`react-redux` import, six of them outside the settings page. It is the first section to
convert a **manage modal** — bulk edit, bulk delete and Set Tags — and sections 9, 10 and
11 each have the same one, so the shape it establishes is the shape they will copy. See
*A manage modal is a table, three mutations and a sort nobody shared* below.

~~**Next: section 8** — auto tagging and import list exclusions. Two list sections with no
connectors between them, so it is a quieter row than 7 was; `autoTaggings` and
`autoTaggingSpecifications` are the last two consumers of
`createProviderSettingsSelectorHook` outside import lists.~~ Split in two, as Sonarr
shipped it — the two halves share a row and nothing else.

~~**Auto tagging first.**~~ **Done, #539.** Two slices for one hook, because only one of
them was ever a section: `autoTaggingSpecifications` had a single endpoint, no writes and
a `pendingChanges` bag it emptied into the *other* slice on save. See *A condition is not
a resource* below. Custom formats (section 10) have the same pair, so this is the shape
that row will copy.

~~**Next: section 8b** — import list exclusions, and the end of section 8. It is the only
paged section in Settings: the slice is built on `createServerSideCollectionHandlers` and
carries the last entry in `persistState`, so `usePagedApiQuery` does the work `#475` and
`#474` established for Phase B's paged pages, not `useProviderSettings`.~~ **Done, #540**,
and it took more of the store with it than its own slice — see *The last paged section took
five creators, a hook and `persistState` with it* below.

~~**Next: section 9** — import lists and import list options, the largest subtree left at 16
files. It is section 7 again in miniature: a provider list with a manage modal (#538's
shape) plus a single-object form (#537's), one connector, and `importLists` is the last
term in the boot gate's `isReduxPopulated` — the gate goes with it.~~ Split in two, the
same way and in the same order as section 7. ~~**The options half first.**~~ **Done,
#541** — the plainest kind of conversion Phase E has left, `useManageSettings` over one
endpoint, and it needed nothing new from the shared hook. What it turned up was
underneath the section rather than in it: see *The last declared item-section was holding
up a selector for an undeclared one* below.

~~**Next: section 9b** — import lists, the provider list, and the end of section 9. It is
#538's shape with #538's manage modal, plus the one connector the row names, and
`importLists.isPopulated` is the last term in the boot gate's `isReduxPopulated` — the
gate and the last `dispatch` in `useAppPage` go with it.~~ **Done, #542**, and the gate
went exactly as predicted: `useAppPage` holds no `useSelector`, no `dispatch` and no
`react-redux` import at all, which is the first time since the migration started that
**nothing about booting the app runs through Redux**. The section itself was mechanical —
#538's shape twice over — and everything worth recording came from underneath it: two
inert things the slice had been carrying, and one live bug in the shared provider hook.
See *No provider schema sends an `id`, so every Add was a PUT to `/undefined`* below.

**Next: section 10** — custom formats: ten files, six connectors and the import/export
modals, plus the `customFormatSpecifications` pair that #539 established the shape for.
`settings` is down to four sections, and after 10 only Download Clients, Delay Profiles
and Download Client Options are left.

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
6. ~~**Phase C**, starting with **custom filters**, in two PRs.~~ **Done.**
   - ~~**Mutations.** Save and delete onto `useApiMutation`; both connectors retired.~~
     **Done, #483.**
   - ~~**Reads.** `useCustomFilters` + the 20 `createCustomFiltersSelector` call sites, and
     the slice with them.~~ **Done, #484.** The slice is gone; the comment that four
     pages carried since #474 is gone with it.

   The seam between the two is not where §5 assumed. See *Custom filters split at the
   mutation boundary, not the hook boundary* below.
7. ~~**Commands.**~~ **Done, #486.** ~~**Tags.**~~ **Done, #487.** ~~**Root folders.**~~
   **Done, #488.** ~~**Paths + file browser.**~~ **Done, #489.** ~~**Provider options +
   captcha.**~~ **Done, #490.** ~~**SignalR.**~~ **Done, #491**, in the only sense it can
   be — see *The SignalR row was already spent* below.

   The app shell is the last of Phase C's eight, and it splits three ways:
   - ~~**Store + messages.**~~ **Done, #492.** Dimensions, connection state, version and
     sidebar visibility onto `App/appStore`; messages onto `App/messagesStore`.
   - ~~**Translations.**~~ **Done, #493.** `App/useTranslations`, the boot gate in
     `useAppPage`, and with them `appActions` and the `app` slice.
   - ~~**Advanced settings.**~~ **Done, #494.** `Settings/advancedSettingsStore`, carved out
     of `settingsActions` ahead of Phase E. **Phase C is complete.**

### Advanced settings had eleven connectors, not three consumers

§5 filed this as a boolean with a toggle. The boolean is read by eleven `connect()`
components — five under Custom Formats and Download Clients, plus General, Metadata,
Notifications, Quality Definitions and UI — none of which can call a hook, and by five TSX
files through `useShowAdvancedSettings`.

Two things kept it small anyway. `useShowAdvancedSettings` already existed as the single
read for the TSX side, so re-pointing that one file at the store left all five importers
untouched. And rather than eleven bespoke wrappers as in #492, the flag is injected by one
`withAdvancedSettings` HOC, matching `withScrollPosition` — every wrapped component keeps
the prop contract it already had, so the components themselves are unchanged and the diff
stays in the connectors.

The flag was persisted through `redux-localstorage` under the instance-name key; it is now
persisted by `createPersist` under `<instance>_advanced_settings`. The keys differ, so the
toggle resets to off once per browser. That matches every options store converted so far,
none of which migrated their redux-persisted value either.

Worth knowing when reading the row: **UI settings has no advanced fields at all.**
`UISettings.js` contains zero `isAdvanced`, so its connector was passing a prop nothing
consumed. The prop is left in place — removing it is a Phase E cleanup, not this row's.

### The localization endpoint changes shape with the Accept header

`translate()` renders raw keys the moment its string table is wrong, and in English a raw
key mostly still reads like a label — `AddConnection` where `Add Connection` belongs. So
this conversion is quiet when it breaks, and it broke twice.

First, Whisparr's `LocalizationController` preserves PascalCase, where Sonarr's serialises
`strings`. Porting Sonarr's hook verbatim reads `data.strings`, gets `undefined`, and every
lookup silently falls back to its key.

Second, and less guessable: `GetLocalizationDictionary` returns a **pre-serialized JSON
string**, not a resource. What arrives therefore depends on which formatter content
negotiation picks. jQuery sent `Accept: application/json, text/javascript, */*; q=0.01`,
which selects the text/plain formatter and returns the JSON untouched. `fetchJson` pins
`Accept: application/json`, which selects the JSON formatter and serialises that string a
second time — so `JSON.parse` yields a *string* and `.Strings` is `undefined`. The old path
worked by accident of its Accept header. The hook now accepts either shape.

The controller is the actual wart and it is worth fixing on its own — returning the
resource rather than a hand-serialized string — but that changes the response casing, which
is an API break and does not belong in a frontend migration PR.

### Translations must land before the render that unblocks the app

`translate()` reads a module-level record synchronously during render. Sonarr's hook fills
that record from a `useEffect`, which is one paint too late: the render that first sees
`isFetched` is the render that unblocks every gated component, and the effect has not run
yet, so that paint emits raw keys and nothing re-renders to correct them. Filling the record
inside the query function closes the gap, because it runs before the query resolves. That is
also why this is a raw `useQuery` — `useApiQuery` owns the query function, the same reason
`useProviderOptions` reaches past it.

Verified by holding `/localization` open at the network layer: the app sits on the loading
page for as long as the request is held, then paints translated, with no raw-key frame in
between.

### A selector cannot read a zustand store, so connectors take an own prop

Six `connect()` components read dimensions through `createDimensionsSelector`: five under
Collection and `EditPerformerModalContentConnector`. (All six are gone now — the performer
one in #506, Collection's five in #509 — but the shape below is why the wrapper exists.) Once dimensions live in zustand, a
`mapStateToProps` selector has no way to reach them — and reading the store imperatively
inside the selector is worse than useless, because redux would never know the value changed
and the component would keep last session's breakpoint until some unrelated action ran.

They take `isSmallScreen` as an own prop instead, from a small function component that
subscribes with `useAppDimension` and renders the connected component. `connect` forwards
own props untouched, so nothing else changed. This is the same shape #484 used for custom
filters, and it is the general answer for any connector that needs a value from outside
redux while it waits for its own phase.

`useAppDimension` subscribes to one breakpoint rather than the whole dimensions object, so
dragging a window re-renders a consumer only when it actually crosses that breakpoint --
where the redux selector handed back a new object on every resize event.

### Twelve of Movie's twenty-nine files are gated on Phase E

The Phase D row reads as one conversion, but the domain does not come apart that way. Of
the 29 files under `Movie/` that import `react-redux`, **12 cannot move until Settings
does**: six take `createUISettingsSelector`, five read `state.settings` for
`safeForWorkMode`, and one takes `createIndexerFlagsSelector`. Two more belong to
Collection and two to interactive search, both later Phase D items.

What is actually available is the index view options (`movieIndexActions`, 8 files) and
then the domain slice (`movieActions`, 4 files). #496 took the first. Expect the same shape
for Scene, Performer and Studio: the view options come out cleanly, and a third of each
domain waits on Phase E regardless. #498 and #500 bore this out — both were mechanical
against #496's template, and neither needed a new helper.

Two things the `.js` slice was hiding, both surfaced the moment its column definitions were
moved into TypeScript:

- Three columns (`select`, `status`, `actions`) declared only `columnLabel` where `Column`
  requires `label`. Every converted options store already writes `label: ''` alongside
  `columnLabel`; Movie now does too.
- The `select` column carried `isHidden: true`, which is not part of `Column` and is read
  nowhere for columns. Dropped, matching every other converted store.

And one lie in a prop type: `MovieIndexSearchButton` and `MovieIndexRefreshMovieButton`
declared `selectedFilterKey: string`, but a custom filter's key is its numeric id. Both only
compare it against `'all'`, so the behaviour was always right and the type was always wrong.
Widened to `string | number`.

### Nothing has fetched the movie list into Redux for months

`movieActions` has no fetch handler — no `createFetchHandler`, no `FETCH_MOVIES`, nothing.
The only writer left is the `updateItem({ section: 'movies' })` call in `movieFileActions`,
which fires on an event for one movie at a time (`movieCollectionActions` had the other, and
went in #509), and the SignalR
`movie` handler stopped dispatching to Redux when the index went paged. So `state.movies.items`
is `[]` on every page load and stays that way.

Everything reading it has been reading an empty array. That was visible, and #497 measured it:
open *Filter → Custom Filters → Add Custom Filter*, choose **Studio**, focus the value box. On
the code as merged the suggestion list is empty; sourcing `sectionItems` from the paged query
instead lists the 16 studios on the current page. The same is true of **Release Groups**, the
other `optionsSelector` prop.

Sonarr's equivalent passes `useSeries()` — the whole library — because Sonarr's index is not
paged. Eros paginates, so the honest ceiling here is the page the user is looking at. Calling
`useMovieIndex()` from the modal costs nothing: it derives the identical query key, so React
Query serves it from cache and the request count does not move (verified: one `/movie/paged`
before opening the modal, one after).

Five more selectors still read that empty array —  `createAllMoviesSelector`,
`createAllScenesSelector`, `createMovieSelector`, `createMultiMoviesSelector` and
`createMovieClientSideCollectionItemsSelector` — behind the tag details modal, the Scene delete
modal, the queued-task name cell and the index overflow search item. Each is a separate small
bug and each belongs to the domain that owns it, not to this PR. #499 took the two Scene ones:
`createAllScenesSelector` is deleted, and `createMovieSelector` lost the Scene delete
connector, which was reading it with the wrong prop name anyway.

### The delete preference is briefly stored twice

`persistState: ['movies.deleteOptions']` backed one checkbox, *Add List Exclusion*, shared by
the movie delete modal and the scene one. #497 moves the movie half to
`Movie/movieDeleteOptionsStore.ts` and leaves the scene half on the slice, so for one PR the
two modals remember the setting separately. That is deliberate: Scene's delete path is a class
component behind `DeleteSceneModalContentConnector`, which reads `createMovieSelector()` — the
empty array above — and so needs rewriting rather than repointing. Doing it here would have
meant a Scene conversion inside a Movie PR.

**Closed in #499**, which did that rewrite. Both modals now read
`whisparr-dev_movie_delete_options`; verified by ticking the box in the scene modal and
reading it back checked in the movie one. `movies.deleteOptions` and its `persistState`
entry are gone.

### The SignalR row was already spent

§5 described the pivot as converting `Components/SignalRConnector.js`, retiring
`Store/thunks.ts` and `redux-batched-actions` along with it. None of that was still true
when the row came up:

- `SignalRConnector.js` does not exist. `SignalRListener.tsx` landed during Phase B and
  already handles calendar, command, moviefile, health, movie, performer, studio, queue
  ×3, system/task, rootfolder and tag through the query cache.
- `Store/thunks.ts` has 40+ consumers, every one of them under `Store/Actions/Settings/`.
  It is Phase E's to retire, not this row's.
- `redux-batched-actions` is imported by 22 files under `Store/`, all of them slice
  handlers belonging to Phases D and E.

At the time of #491, nine `dispatch` calls remained in the listener and not one could move there. Four
settings sections (`downloadclient`, `importlist`, `indexer`, `notification`) plus
`qualitydefinition` need query hooks that do not exist yet — Sonarr's listener writes to
`useDownloadClients`/`useIndexers`/`useConnections`, which are Phase E deliverables.
`collection` waits on Phase D. `setVersion` and the five `setAppValue` calls waited on the
app shell's zustand store and left in #492, so eleven `dispatch` statements remain, all of
them Phase D or Phase E.

**What was actually broken.** Two handlers were dispatching into thin air. `wanted/cutoff`
and `wanted/missing` still called `updateItem({ section: 'wanted.cutoffUnmet' | 'wanted.missing' })`,
but #475 retired that slice — there is no `wanted` section in `Store/Actions/index.js` and
no reducer for one. Both pages have been on `usePagedApiQuery` since, so the push updates
had been going nowhere. They now patch the paged cache in place through `updatePagedItem`,
a port of Sonarr's helper: the paged query key is `[path, ...paging]`, so a prefix match
reaches every cached page and sort without refetching any of them.

**`pagePopulator` was the same bug from the other end, and the mechanism is now
redundant.** Calendar registers a populator for `movieFileUpdated`/`movieFileDeleted`, and
both Wanted pages register for those plus `movieUpdated` — reasons that mirror Sonarr's
exactly. Nothing in the listener had emitted any of them since the conversion; the only
call was the bare `repopulatePage()` on reconnect, so a file import left those pages stale
until navigation.

Sonarr fixes this by firing `repopulatePage(reason)` from its `episodefile` and `series`
handlers, and that was the first shape of this PR. It is the wrong fix here. All three
reason-registering pages are plain React Query `refetch()`, so the listener can invalidate
`['/wanted/missing']`, `['/wanted/cutoff']` and `['/calendar']` directly and the whole
`reasons` mechanism disappears. Four more pages — Blocklist, History, Queue, Unmapped Files
— registered without reasons and so only ever fired on reconnect; they are React Query too,
and a blanket `invalidateQueries()` on reconnect covers them and is more honest besides,
since a dropped connection can have missed *any* message, not the four keys that list
happened to name.

Invalidation is strictly better than the callback, not merely equivalent:

- `currentPopulator` is a single module-level slot. A second registration silently evicts
  the first, and the loser gets no updates with no error. Query keys have no such limit.
- `refetch()` refreshes only the page the user is looking at. Invalidation stales every
  cached page of a paged list, so flipping to page 2 after an import is not stale.
- Invalidation costs nothing when nobody is looking. Measured: with Missing cached but the
  user on Calendar, a `moviefile` push fires no request at all, and returning to Missing
  well inside the 60s `staleTime` refetches once — the invalidation survived the
  navigation. The populator could do neither half of that.

`pagePopulator` itself survives, reduced to a single slot with no reasons, for exactly one
caller: Import List Exclusions still fetches through a redux thunk, which no query key can
reach. ~~It leaves with Phase E.~~ **Deleted in #540**, with the thunk — the reconnect's
blanket `invalidateQueries()` reaches that page like any other now, verified by restarting
the server with it on screen.

The lesson for the rest of the plan: a row written at assessment time describes the code as
it was, and Phase B moved several of these files underneath it. Read the file before
budgeting the row.

### Custom filters split at the mutation boundary, not the hook boundary

The plan was to land `useCustomFilters` plus the two connectors first and sweep the 20
call sites after. That does not cut: a query with no observers is dead weight, and while
reads still come from redux, having both sources live is actively worse than either alone.

Wiring the modals to the query hook made it reproducible. Creating a filter fired three
`GET /customFilter` and two `POST /movie/paged` — the first of those unfiltered, because
the modal selects the new filter as soon as the mutation resolves and the page resolves
that id against redux, which had not caught up. Against a 17k-movie library that is a
visible flash of the full list plus a wasted server-side query.

The redux thunk cannot be awaited to close the window: `createFetchHandler` returns
`abortRequest`, not a promise. So part one keeps every read on redux and has the mutations
apply their own response to the slice via `updateItem`/`removeItem`. Deterministic, and
strictly fewer requests than before — a create went from POST + GET + paged to POST +
paged, and edit and delete no longer refetch at all.

The lesson generalises to the rest of Phase C: for a slice whose consumers resolve ids
against it, reads and writes want to move together, and the safe intermediate state is
*writes converted, reads untouched* rather than a half-populated query.

Part two (#484) closed it from the other side. Two things keep the flash from coming back
once reads move:

- `useAppPage` gates the whole app on the query's `isFetched`, exactly as it gated on the
  slice's `isPopulated`. No page renders before the filters are in the cache, so a
  persisted `selectedFilterKey` resolves on the first pass. Verified: with a custom filter
  selected, a hard reload of each index page fires exactly one `/paged` POST and it
  already carries the filter.
- The mutations keep writing their own result into the cache with `setQueryData` instead
  of invalidating. `setQueryData` is synchronous, so the modal's "select what I just
  saved" effect always finds it.

The query also needs `staleTime: Infinity`. Without it the default of 0 refetched the
whole list every time a page mounted a new observer — measured at one extra
`GET /customFilter` per navigation, where the slice it replaces fetched once per session.
This is issue #1132 (no app-wide default `staleTime`) showing up locally; setting it on
this one query is not a workaround but the correct policy, since custom filters only ever
change through this app's own mutations and those write straight to the cache.

### `createClientSideCollectionSelector` takes custom filters as an own prop

Three consumers of that selector really do carry custom filters — Interactive Search
(`releases`), Collection (`movieCollections`) and the movie index search menu item. A
selector cannot call a hook, so the filters now arrive as an own prop and the selector
reads `props?.customFilters ?? []`; the six settings sections that have no custom filters
pass nothing and get the empty default. For Collection, still a `connect()` class, a small
function component wraps the connected component and injects the prop — `connect` passes
own props to `mapStateToProps` as its second argument, so nothing else had to change.
Collection converted in #509 and interactive search in #511; both call
`useCustomFiltersList` directly now, leaving only the movie index search menu item on the
own-prop route.

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
wants the shared filter-builder work behind it rather than a drive-by inside a slice
retirement. Phase C converted custom filters but not the filter *builder* — the four
`*FilterBuilderRowValueConnector.js` files under `Components/Filter/Builder` are still
`connect()`ed, and three of them belong to Settings sections. So this waits on Phase D for
`MovieFilterBuilderRowValue` and Phase E for the rest.

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

### `VirtualTable` blocks one connector removal, and paging would beat porting it

`UnmappedFilesTableConnector.tsx` survived #471 even though the slice under it did not.
Its own state moved to zustand, but it still dispatches `executeCommand` ×2,
`deleteMovieFile` and `deleteMovieFiles`, and collapsing it into `UnmappedFilesTable`
needs that table converted class → function. That conversion is entangled with
`VirtualTable` itself: Eros still has the old `scroller`-prop API, which depends on the
parent having already rendered so `scrollerRef.current` is populated — a pattern that does
not survive a function component without extra state. Sonarr replaced it with a
react-window API (`itemCount` / `itemData` / `Header`). This was filed against Phase C and
did not happen there — `VirtualTable.tsx` still takes a `scroller` prop.

**But porting it is probably the wrong fix.** `Components/Table/VirtualTable` has exactly
**one** importer, `UnmappedFilesTable.tsx`. The Movie and Scene index tables do not
virtualise at all — they are a plain `Scroller` plus rows — and the other
`react-virtualized` users (`StudioDetails`, `CollectionOverviews`) use `List`/`AutoSizer`
directly. So this blocks nothing outside Unmapped Files, and in particular it does **not**
block the Movie index.

The reason Unmapped Files is the only virtualised list is that it is the only list page
that fetches an unbounded set client-side: `GET /moviefile?unmapped=true` returns a plain
`List<MovieFileResource>` with no paging, where every other list page is server-side paged
through `usePagedApiQuery`. Virtualisation is compensating for that. Paging the endpoint
would let `VirtualTable` be **deleted** rather than ported, and would make the page look
like every other one — at the cost of a backend change, which is why it belongs with Movie
files in Phase D rather than as a standalone frontend port. Note `react-virtualized` cannot
be dropped either way while `StudioDetails` and `CollectionOverviews` still use it.

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
the delete-logs command, because commands were Phase C. The other half closed in #486 and
the page has no `useDispatch` left — which is the point: the half-converted state was a
staging post, not a debt. Sonarr's version of that page uses
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

### UI settings kept its languages on Redux

The page needs the language list for its **UI Language** picker, and `Settings/languages`
is section 6's job, not section one's. Converting it early would have meant either
pre-empting that section or running `GET /language` twice — once into the slice at boot,
once into a query — for the five sections in between. So `UISettings.tsx` keeps a single
`useSelector(createLanguagesSelector())` and converts only the `/config/ui` half, which is
the partial-component conversion #462 established.

That is why this PR does not take `UISettings.tsx` off `react-redux` even though it takes
everything else off it: the file still imports the hook for one list. The number moved 147
to 118 anyway, because the thirty-one selector consumers had nothing else holding them.

~~`useAppPage` still dispatches four boot fetches — quality profiles, languages, import
lists and indexer flags — and its `isReduxPopulated` selector waits on all four.~~ Down to
two — import lists and indexer flags — after #520 and #532. Those come off with sections 9
and 7 respectively; the selector goes with the last of them. **#532 closed this thread**:
`UISettings.tsx` is off `react-redux` entirely.

---

### Sonarr's language filter excludes nothing

`useFilteredLanguages` is the one place section 6a did not copy
[Sonarr/Sonarr@5bac016f](https://github.com/Sonarr/Sonarr/commit/5bac016f). Theirs takes a
`LanguageFilter` of `includeAny` / `includeOriginal` / `includeUnknown` and then filters
on `!excludeLanguages[lang.name]` — but `lang.name` is `Any`, not `includeAny`, so the
lookup is always `undefined` and every language survives. The selector it replaced took
`{ Any: true, Original: true, Unknown: true }`, keyed by name, and both of their call
sites were converted to the new key names, so `Any`, `Original` and `Unknown` are in
Sonarr's UI language list today.

Excluding by name is what all five Eros call sites already did by hand, so the hook takes
`readonly string[]` and each keeps the set it had: `Any` on the filter row,
`Any`/`Unknown`/`Original` on UI settings, `Any`/`Original` on the interactive-import and
file-edit pickers, `Unknown` on quality profiles. Every call site passes a module-level
constant, because the filtered array is memoised on that argument and an inline literal is
a new identity every render.

The nuisance this creates is that the exclusion sets are now spread across five files
rather than being one shared selector's business. That is the honest shape of it: they
were never the same set, and the old `createLanguagesSelector` only pretended otherwise by
excluding `Any` centrally and leaving each caller to filter the rest again.

---

### The restart-required check could not be ported

`GeneralSettings` opens a *Restart Whisparr* modal after a save that touched one of eight
restart-sensitive keys. The class decided that in `componentDidUpdate` by walking those
keys and comparing each setting's `previousValue` against its `value` — and
`previousValue` is a thing `selectSettings` only writes for a key that has a pending
change. That worked because the slice held the pending bag until the fetch after the save
overwrote it, so for one render after `isSaving` fell the settings still carried both
halves of every edit.

`useSaveSettings` clears the pending bag in `onSuccess`, which is the right thing for a
form and fatal for this check: by the time `isSaving` falls there are no pending changes
left, so no `previousValue`, so the walk finds nothing and the modal never opens. The
replacement watches `usePrevious(pendingChanges)` instead and asks which keys *were*
pending on the render before the save landed — the same question, asked of the render that
still has the answer.

Verified both ways round: **Instance Name** opens the modal, and a Whisparr-tag field
saved the same way does not.

---

### The pending stores do not own the is-it-a-change question

`createSetSettingValueReducer` did two jobs. It recorded the edit, and it decided whether
the edit was a change at all: it compared the new value against `item[name]` and deleted
the pending key when they matched, so a field toggled and toggled back left the form
clean. It also coerced first — `if (_.isNumber(currentValue) && value != null)` ran the
incoming value through `Number.parseInt`, because the reducer received strings out of DOM
inputs and had to compare them against numbers already in the slice.

The stores copied in #516 do only the first job. `setPendingChange` records, and
`unsetPendingChange` is a second call the caller makes; nothing in the store looks at the
saved value, because nothing in the store has it. That comparison belongs to the hook
that owns both halves — Sonarr's `useManageSettings` holds the query data and the pending
bag together and does a plain `===` between them.

The coercion does not come with it, and that is the part to watch when section one lands.
It existed because the slice was the only typed copy of the value; under React Query the
query data is typed as `T`, and Sonarr's replacement compares without parsing. If a form
turns out to send `'5'` where the resource holds `5`, the fix is at the input that
produced the string, not a `parseInt` back inside the store.

---

### A list section is still a form, one row at a time

§7 said a section that edits a list of rows reaches for `usePendingItemsStore`. Section two
is a list section and it does not. The distinction that matters is not list-versus-object,
it is **how many rows are dirty at once**.

Remote path mappings and release profiles both edit exactly one row, in a modal, and save
it on its own request. So the dirty state is one row's worth of pending changes —
`usePendingChangesStore`, the same store section one used — and the only new part is
picking that row out of the list query, which is what `useProvider` does. That is why
`useManageProviderSettings` reads almost identically to `useManageSettings`: substitute
"the provider with this id" for "the settings object" and the rest is unchanged.

`usePendingItemsStore` is for the sections that edit several rows *in place* and save them
together — quality definitions and delay profiles, where the table itself is the form and
there is no per-row modal. Its `Map<number, Partial<T>>` shape only earns its keep there.
Section 3a was the first of those, and it held: #519 is the only consumer of that store so
far, and delay profiles in section 11 will be the second.

The practical consequence for the sections left: 3, 4, 7, 8, 9, 10 and 11 are all
`useProviderSettings` sections, and the per-row half of each is already written.

---

### Two Redux reads survive section two on purpose

`useDownloadClientHostOptions` (the Host picker in the remote path mapping modal) and
`ReleaseProfiles`' `fetchIndexers` both still go through Redux. Neither belongs to this
section: download clients are section 11 and indexers are section 7, and querying either
one here would mean fetching it twice — once into the slice its own settings page still
populates, once into the query cache — for the several sections in between. It is the same
call the *UI settings kept its languages on Redux* note above describes, and it is why the
`react-redux` count moved only 118 to 113 for a PR that deleted two slices.

The host options did get extracted into `DownloadClient/useDownloadClientHostOptions.ts`
rather than left inline in the connector, which is the shape Sonarr had at the same point:
a typed hook wrapping the selector, so section 11 changes one file rather than hunting for
the reducer that built the list.

---

### Quality definitions save to a path the query is not keyed on

`useSettings`/`useProviderSettings` both assume the save goes back to the path the query
reads, which is what lets `useSaveSettings` write the response straight into the cache
under `[path]`. Quality definitions do not: Whisparr has a dedicated bulk endpoint,
`PUT /qualitydefinition/update`, which takes an array and answers with the whole list,
where Sonarr PUTs the array to the collection path itself and reuses `useSaveSettings`
unchanged. So `useSaveQualityDefinitions` is written out rather than composed — a mutation
on `/qualitydefinition/update` whose `onSuccess` seeds `['/qualitydefinition']`. Expect the
same wherever Eros kept a `/update` sibling.

The reset command needed no equivalent. Sonarr's `QualityDefinitions.tsx` watches
`isResettingQualityDefinitions` with `usePrevious` and invalidates the query when it goes
false; here `QualityDefinitionController` already broadcasts a SignalR sync on
`ResetQualityDefinitions`, and the listener's `qualitydefinition` branch — which used to
dispatch `fetchQualityDefinitions` — now invalidates the query key instead. One handler
covers the reset, so the component has no reset-awareness at all and takes no
`isResettingQualityDefinitions` prop.

### Two settings forms cannot share a pending bag

`usePendingChangesStore` builds its store inside `useState`, so every call site gets its
own. Media Management is the first page where that matters: it is one toolbar over
`/config/mediamanagement` and `/config/naming`, and the obvious shape — call
`useManageNamingSettings()` in the parent for the dirty flag and again in `Naming` for the
inputs — gives two independent bags. The parent's stays empty, so **Save** would PUT the
saved naming config back over itself and the child's edits would never leave the page.

So Naming owns the only naming form and hands its save callback and its
`{ isSaving, hasPendingChanges }` upward, through the `setChildSave` /
`onChildStateChange` pair that `typings/Settings/SettingsState.ts` already declared for
Quality Definitions in #519. Under redux this problem did not exist: both components
selected the same `settings.naming.pendingChanges` out of one store, which is exactly the
global-state affordance the migration is removing. Sections 6 and 11 pair endpoints under
one toolbar the same way and want the same shape.

### The naming examples endpoint needs the id it is given

`GET /config/naming/examples` model-binds a whole `NamingConfigResource` off the query
string, and opens with `if (config.Id == 0) { config = GetNamingConfig(); }` — a body with
no `id` is treated as no body at all and the *saved* config is sampled instead. The redux
thunk sent `{...naming.item, ...naming.pendingChanges}`, so `id` rode along by accident.
Keyed on `PendingSection<NamingConfig>` the same accident holds, but only because
`selectSettings` walks the query data and the query data has `id` — so `NamingConfig` now
declares it rather than leaving the guarantee to a field nobody named. Verified on the
running instance: with `id` the supplied formats are sampled, without it they are silently
ignored and the examples still look plausible, which is what makes it worth writing down.

### Metadata was rendering a component its connector could not reach

Two dead things, and the section had been carrying both since the January upstream sync.

`Metadatas` existed twice — `Metadatas.js`, a presentational component taking `items` as a
prop, and `Metadatas.tsx`, the same markup with a `useSelector` and a `fetchMetadata`
dispatch of its own. `webpack.config.js` resolves `.ts`, `.tsx`, `.js` in that order, so
`import Metadatas from './Metadatas'` in `MetadatasConnector` had been picking up the TSX
one for months: the connector's `mapStateToProps` was computed and thrown away, its
`componentDidMount` fetch raced a second fetch from the component it wrapped, and the
`.js` file was unreachable. Nothing looked wrong, because both fetches populate the same
slice with the same list. The lesson is not about metadata — it is that a partial upstream
sync can shadow a file rather than replace it, and a grep for the importer will not show
it.

The other is the Save button. `MetadataSettings` is the `onChildMounted` /
`onChildStateChange` shape that *Two settings forms cannot share a pending bag* describes,
except that nothing below it ever called back: `MetadatasConnector` did not take the
callbacks, and the cards save through their own modals. So `_saveCallback` stayed null,
`hasPendingChanges` stayed false, and the toolbar rendered a permanently disabled
*No Changes* button. `showSave={false}` is what the page always meant, and Connections
already had it.

### `whitelistedHardcodedSubs` is a string, not an array

`typings/Settings/IndexerOptions.ts` declared it `string[]`. The endpoint sends and takes
one comma-separated string — verified against the running instance, which returns
`"whitelistedHardcodedSubs": ""` on a fresh config and stores `"vostfr,hardsub"` after the
form saves two tags. Nothing on either side had ever produced an array: `TextTagInput`
takes `string | string[]` and splits a string for display, and the old change handler
joined the array back with `value?.join(',')` before dispatching. So the declared type was
wrong at both ends and cost nothing, because `checkJs` is false and the slice was
untyped — the reducer wrote whatever the action carried.

It only becomes an error under `useManageSettings`, whose `updateSetting` is
`<K extends keyof T>(key: K, value: T[K])`: the join produces a `string` and the type
demanded `string[]`. That is the point of the migration being the TypeScript conversion —
the compiler asks the question the moment the value stops passing through an untyped
reducer. The interface also gains the `id` the endpoint returns; `useManageSettings`
spreads the whole query object into the PUT, so it round-tripped regardless, but the form
could not be typed without it. Same class of thing as General's sixteen missing fields in
#535.

### A manage modal is a table, three mutations and a sort nobody shared

Indexers is the first of the four manage modals to convert — Import Lists, Custom Formats
and Download Clients have the same one — so this is the shape sections 9, 10 and 11 will
copy.

`bulkEditIndexers` and `bulkDeleteIndexers` become `useApiMutation` against
`/indexer/bulk`. The bulk edit gets its response back as the updated rows and writes them
into the list cache; the bulk delete gets an empty body, so it filters by the ids it sent,
exactly as `createBulkRemoveItemHandler` did. Neither refetches.

**The sort was global state that only one component read.** `SET_MANAGE_INDEXERS_SORT`
went through `createSetClientSideCollectionSortReducer` into the slice, and
`ManageIndexersModalContent` was the only reader — so it is `useState` in that component
now, with the ascending/descending toggle written out rather than inherited. It is
deliberately **not** a shared hook yet: three more sections want the identical thing, and
a shared abstraction with one consumer is a guess. Lift it when section 9 arrives and the
second call site says what the shape actually is.

**One carried-over bug is fixed.** `isSavingTags` was set to `true` when Set Tags was
pressed and never set back, so after one tags save every later bulk edit spun the Set Tags
button too. The mutation's `onSettled` clears it — settled rather than succeeded, because
a failed bulk edit has to clear it as well. That is why `useBulkEditIndexers` takes
`onSettled` and not `onSuccess`.

**Health and the settings page no longer share a spinner.** `testAllIndexers` wrote
`isTestingAll` into the slice, and both `IndexerSettings` and `Health` read it, so
pressing *Test All* on one page spun the button on the other. Each holds its own mutation
now.

### Cloning an indexer, and the secrets that cannot be copied

`CLONE_INDEXER` copied the source indexer into `selectedSchema`, deleted its `id` and
`name`, blanked every field whose `privacy` is `apiKey` or `password`, and wrote the copy
name into `pendingChanges`. The blanking is the part that matters and it is not cosmetic:
the API returns secrets masked, so a clone that carried them over would send the mask back
and store the mask.

It follows quality profiles (#520) now — the source indexer is the new indexer's
**default** rather than a write into a shared pending bag, so a clone nobody edits still
saves as a copy. Verified on the running instance: cloning an indexer with `apiKey` set to
`deadbeef` opens *Add Indexer* with the name `Test Torznab - Copy`, the API key empty, and
no schema request, because a clone reads the list rather than the schema.

### `typings/Indexer` was not a provider

It declared its own `name`, `fields`, `implementationName`, `implementation`,
`configContract` and `infoLink` — the whole of `Provider` minus `message` — plus a local
`Field` interface missing `section` and `hidden`. Nothing caught it, because the slice was
untyped and no call site needed the missing members.

`useSelectedSchema<T extends Provider>` did. So `Indexer extends Provider` now, which
deletes the duplicate `Field` and adds the `presets` that only `/indexer/schema` returns.
This is the same finding as `whitelistedHardcodedSubs` one section earlier, from the same
cause: a type that only has to satisfy a reducer is not checked against anything.

### A condition is not a resource

`settings.autoTaggingSpecifications` looked like a sibling of `settings.autoTaggings` --
it had a `defaultState`, an `items` array, a `pendingChanges` bag, save, delete, clone and
clear handlers, and 253 lines of them. It had no server. Its `FETCH` handler read the
*other* slice's item and unpacked `specifications` into `items`; its `SAVE` handler wrote
back into `items` and never left the browser; and `saveAutoTagging` reached across into it
to fill `pendingChanges.specifications` at the moment of the POST. The one real endpoint
in it, `/autoTagging/schema`, is the list of conditions the server offers, which is not
the list a given auto tag holds.

So the conversion is not two hooks. It is one `specifications` pending change on the
parent, three callbacks over an array, and `useProviderSchema` for the add dialog. What
the slice really provided was **identity**: the server sends conditions without ids --
`AutoTaggingSpecificationSchema` leaves `Id` at its default and the serialiser drops it --
so something has to number them before React can key a card or a handler can name one.
`useManageAutoTagging` does it in the memo that reads them, and the numbers ride back up
in the PUT unread, exactly as the slice's did.

Two things follow for section 10. Custom formats have the identical pair
(`customFormats` + `customFormatSpecifications`), so the row is this shape again. And the
condition editor is the only form in Settings that saves nowhere, so it wires
`usePendingChangesStore` and `usePendingFieldsStore` by hand instead of going through
`useManageProviderSettings`: there is no provider on the other end to PUT to, and
therefore no save error to route back onto its fields. Validation for a condition arrives
on the *parent's* save, against the parent's form — which is where it arrived before.

### Two inert things the import list slice was carrying

Neither changes behaviour; both are recorded because the next two sections copy this shape.

**`minRefreshInterval` was threaded through the add dialog and then dropped.**
`AddImportListItem` took it as a prop, passed it down to `AddImportListPresetMenuItem`, and
neither ever put it in the `selectImportListSchema` payload — so the reducer's
`selectedSchema.minRefreshInterval ?? payload.minRefreshInterval` always fell through to
the schema's own value. The prop chain is gone; the value still comes off the schema, which
is where it was always coming from. On this instance the only presets that exist — RSSImport's
two IMDb ones — carry their own `12:00:00`, so the fallback had nothing to do either.

**`ImportListFilterBuilderRowValueConnector` is unreachable.** It is returned only for
`filterBuilderValueTypes.IMPORTLIST`, and nothing in the tree declares a filter with that
value type. It is converted to `ImportListFilterBuilderRowValue` rather than deleted, to
keep parity with the other row values — the same call that #538 made for the indexer one,
which *is* reachable. `Components/ImportListList.tsx` is in the same position: no importers
at all, converted rather than deleted because it imported `react-redux` either way.

The one thing that is **not** inert, and that reading the schema instead of the pick would
have broken: `implementationName`. A preset object carries neither its own nor its parent's,
so `{...schema}` leaves the modal header as *"Add Import List -"*. `SELECT_IMPORT_LIST_SCHEMA`
set it from the dispatch payload, and the hook seeds it from the `SelectedSchema` for the
same reason.

### No provider schema sends an `id`, so every Add was a PUT to `/undefined`

Section 9b's Add flow did not work, and neither did anyone else's. `useProvider` returns
the seeded `defaultProvider` when `id === 0`, and `useManageProviderSettings` then passed
**`provider.id`** to `useSaveProviderSettings`:

```ts
const { save, isSaving } = useSaveProviderSettings<T>(provider.id, path, ...);
// inside: path: id === 0 ? path : `${path}/${id}`
//         method: id === 0 ? 'POST' : 'PUT'
```

No `/<provider>/schema` endpoint sends an `id` — verified against `/importlist/schema`,
`/indexer/schema` and `/notification/schema`, none of which have the key at all — so a
schema-seeded add has `provider.id === undefined`, which is not `0`, which selects the
edit branch. Every Add sent `PUT /api/v3/<provider>/undefined` and took a **404**.
Confirmed live on `eros-develop` before this section was touched: adding a Newznab indexer
sends `PUT /api/v3/indexer/undefined -> 404`. It reaches back to #521, where the hook was
written, and covers Connections, Metadata, Indexers, Auto Tagging and Import Lists.

The fix is one argument: pass the `id` the hook was called with, which is `0` for both add
and clone and the real id for an edit, rather than reading it off an object that was never
going to have one. It is disclosed in #542 rather than split out because 9b's own Add path
could not be verified without it.

The reason it survived four sections is worth keeping: **the Add path is the one flow that
cannot be verified from the list page**. An edit, a delete, a bulk edit and a test all work
off a provider that already exists, so they exercise the real-id branch every time; only
Add takes the `id === 0` branch, and only against a server that answers 404 rather than
throwing something visible. The console stays clean and the modal simply does not close.

### The last declared item-section was holding up a selector for an undeclared one

Retiring `settings.importListOptions` broke a file the section does not touch.
`createSettingsSectionSelector` is generic over the sections that hold a single item:

```ts
type SectionsWithItemNames = {
  [K in keyof SettingsAppState]:
    SettingsAppState[K] extends AppSectionItemState<unknown> ? K : never;
}[keyof SettingsAppState];
```

`importListOptions` was the last member of `SettingsAppState` declared that way, so
deleting it collapsed `SectionsWithItemNames` to `never`, and with it the selector's
`item` and `saveError` reads — two type errors in a file with nothing to do with import
lists.

The selector is not dead, though: `DownloadClientOptionsConnector.js` still calls it. That
section has always been an item-section in the *store* — `Store/Actions/Settings/downloadClientOptions.js`
has the same `item: {}` default state every other one does — and `SettingsAppState` simply
never declared it. The typing gap was invisible for as long as some other section kept the
constraint inhabited, and the connector is `.js`, so nothing was checking the call either.

So the fix is to declare the section that is really there rather than to prop the
constraint up with the one being removed. `typings/Settings/DownloadClientOptions.ts` is
written off `DownloadClientConfigResource`, and both it and the AppState entry go with
section 11, which is where that connector converts. The general point is worth keeping for
sections 10 and 11: a slice retirement can break a file by *removing the last instance of
a shape*, and the compiler reports that at the generic, not at the section.

### The last paged section took five creators, a hook and `persistState` with it

Import List Exclusions was the only section in Settings that pages on the server, and the
only consumer of `createServerSideCollectionHandlers` — a fetch handler that read
`pageSize`/`sortKey`/`sortDirection` off its own slice, plus page, sort and filter handlers
that wrote them back and re-dispatched the fetch. So it converts to the Phase B shape, not
the Settings one: `usePagedApiQuery` for the list, `usePage` for the page number (which
already had a key reserved for it), and an options store for the two the user chooses.
Nothing patches the cache after a write, either — a page is a server-side slice of an
ordering the client does not hold, so a mutation invalidates the path and whichever page is
on screen refetches itself. That is the one place the paged shape is *simpler* than the
provider one, which has a list to keep in step.

Deleting the slice made eight more files unreachable: the five collection creators,
`serverSideCollectionHandlers`, `pages`, `createSetTableOptionReducer` — and, outside
`Store/`, `Components/Table/usePaging.ts` and `Utilities/pagePopulator.js`, the last of
which existed *only* because this page could not be reached by query invalidation. It also
held the last entry in `persistState`, so `redux-localstorage` now persists an empty set;
the middleware stays until the teardown, because `Store/Migrators/migrate.js` still runs
against the old blob on boot.

**The lesson worth keeping is about the payload, not the paging.** The form shows three of
the record's five fields. Sonarr's equivalent hook takes those three as props and sends
what it was given, which is lossless there — their exclusion has nothing else on it. Ours
has `reason`, the server's own record of *why* an exclusion exists (`studioExclusion`,
`performerExclusion`, `duringDelete`), and an absent one deserialises as `Manual`. Sending
only the form's fields would have silently re-labelled every exclusion the studio,
performer and delete paths had added, on any edit. So the row hands the whole record down
and the save sends `{...record, ...pendingChanges}` — which is what `createSaveProviderHandler`
did, reading the item out of the slice by id. When a form covers part of a resource, the
question is not what the form changed; it is what the endpoint does with what the form left
out.

---

## 11. Log

| Date | PR | What |
| --- | --- | --- |
| 2026-08-28 | #542 | **Import lists.** Section 9b, and the end of section 9. `settings.importLists` and `ImportListAppState` are deleted for `Settings/ImportLists/ImportLists/useImportLists.ts` on the provider hooks; `react-redux` 46 to **32**, `Store/` 2,857 across 43 to **2,641** across 41, one connector 22 to **21**, and `Store/Actions/Settings/` down to five files. It is #538's shape reused wholesale — provider list, schema-seeded add, clone that blanks secrets, manage modal with bulk edit, Set Tags and bulk delete, and the modal-local sort that replaces `createClientSideCollectionSelector` — so the section itself added nothing to the shared hook. **The boot gate goes with it:** `importLists.isPopulated` was the last term in `isReduxPopulated` and `fetchImportLists` the last `dispatch` in `useAppPage`, which now holds no `useSelector`, no `dispatch` and no `react-redux` import — the first point in the migration at which **nothing about booting the app runs through Redux**. SignalR's `importlist` handler invalidates the path instead of patching the slice. **One live regression found and fixed, disclosed because it is outside this section:** no provider schema endpoint sends an `id`, so a schema-seeded add reached `useSaveProviderSettings` with `provider.id === undefined`, missed the `id === 0` branch and sent `PUT /<path>/undefined` — a 404 on **every** Add since #521, across Connections, Metadata, Indexers, Auto Tagging and Import Lists. Confirmed on the running instance before this section was touched: adding a Newznab indexer sent `PUT /api/v3/indexer/undefined -> 404`. It is its own note above, including why four sections' verification missed it. Two inert things the slice was carrying are their own note too. Verified on the running instance: one `GET /api/v3/importlist` on load; the add dialog fetches `/importlist/schema` once and serves a reopen from cache, listing twelve implementations in four groups; picking **Custom** and picking the **IMDb List** preset both render the header as *Add Import List - RSS List* with the name seeded to the implementation and the preset respectively, and the preset's own 12-hour refresh in the banner. Saving with an empty **RSS Link** comes back 400 and renders *'Link' must not be empty.* and *must be valid URL that starts with http(s)://* on that field with the modal open and the edit kept; against a real feed served locally the save sends one `POST` (201), closes the modal and the card appears. Editing sends one `PUT` (202) carrying the edited name, **Test** sends one `POST /importlist/test` (200), and **Clone** opens *Add* prefilled with `- Copy` and the non-secret field intact, saving as a second `POST` (201). The footer's **Delete** button is present for an edit and absent for an add or a clone, and deleting sends one `DELETE`. The manage modal opens off the list query with no request of its own, sorts by Name and Implementation **client-side with no refetch**, disables all three actions with nothing selected, and sends one `PUT /importlist/bulk` for a bulk edit (`{ids,enabled:false}`), one for Set Tags (`{ids,tags,applyTags}`) and one `DELETE /importlist/bulk` for a bulk delete, clearing the selection each time — including the Set Tags spinner, which the slice never reset and which #538 fixed the same way. Tag Details renders its **Import Lists** section off `useImportListsWithIds`, and the quality profile modal's Delete button is disabled with the in-use title for a profile an import list uses and enabled for one it does not, which is `useQualityProfileInUse` off the query. A cold load of `/movies` renders with the gate gone. No console errors on any of it; the instance is back to its original single list. Props of the components touched are marked `Readonly<T>` per SonarQube `typescript:S6759`. |
| 2026-08-27 | #541 | **Import list options.** Section 9a. `settings.importListOptions` and `ImportListOptionsSettingsAppState` are deleted for `Settings/ImportLists/Options/useImportListOptions.ts` on `useManageSettings`; `react-redux` 47 to **46** and `Store/` 2,936 across 44 to **2,857** across 43. No connectors, so 22 does not move, and `Store/Actions/Settings/` is down to six files. It is the plainest conversion Phase E has left — one endpoint, one form, one child under `ImportListSettings`' shared toolbar — and it added nothing to the shared hook, which is the point of having taken `useSettings` out in section one. The typing moves to `typings/Settings/ImportListOptions.ts` beside the other config resources and **gains the `id` the endpoint has always sent**: `ConfigController.GetConfig` stamps `Id = 1` on every config resource and the save spreads the query data, so the PUT body carried it all along — only the interface was missing it. **The one thing that broke was in a file the section does not touch:** `importListOptions` was the last section `SettingsAppState` declared as an `AppSectionItemState`, so removing it collapsed `createSettingsSectionSelector`'s generic to `never` — and its one remaining caller is Download Client Options, a section the store has always had and the typing never declared. Declaring it is the fix; both it and `typings/Settings/DownloadClientOptions.ts` go with section 11. See *The last declared item-section was holding up a selector for an undeclared one* above. Verified on the running instance: one `GET /api/v3/config/importlist` on load, rendering **Clean Library Level** at the server's `disabled`; picking *Log Only* touches the network **not at all** and moves the toolbar to *Save Changes*; picking *Disabled* back again returns it to *No Changes* with no request, which is `createSetSettingValueReducer`'s is-it-a-change comparison now living in `updateSetting`. Saving *Remove Movie and Keep Files* sends one `PUT` (202) whose body is `{"listSyncLevel":"removeAndKeep","id":1}`, and the toolbar returns to *No Changes* off the cache write with **no refetch**; navigating to Indexers and back renders from cache with no request, and a reload re-renders it off one `GET`. With **Show Advanced** off the fieldset is absent, as it always has been, but the query still fires and the toolbar still works — the hooks run above the early return, exactly where the slice's dispatches ran. No console errors on any of it; the instance is back to `listSyncLevel: disabled`. The section has no validator server-side, so there is no 400 path to exercise. Props of the component are marked `Readonly<T>` per SonarQube `typescript:S6759`. |
| 2026-08-27 | #540 | **Import list exclusions.** Section 8b, and the end of section 8. `settings.importListExclusions` and `ImportListExclusionsSettingsAppState` are deleted for `Settings/ImportLists/ImportListExclusions/useImportListExclusions.ts` on **`usePagedApiQuery`**, not `useProviderSettings`; `react-redux` 52 to **47** and `Store/` 3,339 across 51 to **2,936** across 44. No connectors — the section never had one — so 22 does not move. **It is the only paged section in Settings**, so it is the Phase B shape (#474, #475) rather than the Settings one, and the slice's own 121 lines took eight more files with them: the five `createServerSideCollectionHandlers` creators, `serverSideCollectionHandlers`, `pages`, `createSetTableOptionReducer`, plus `Components/Table/usePaging.ts` and `Utilities/pagePopulator.js` — the last of which existed only because this page could not be reached by query invalidation, and whose retirement was already written into the SignalR note above. Page size and sort become `importListExclusionOptionsStore`, **the last entry in `persistState`**: `redux-localstorage` now persists an empty set, and the middleware only survives because `Store/Migrators/migrate.js` still runs on boot. The store defaults to id/descending, which is what the server defaulted to when the slice sent no sort at all, so the first page is unchanged; the persisted page size resets to 20 once, as it has for every converted table. **An edit sends the whole record, not the three fields the form shows** — `reason` would otherwise deserialise back to `Manual` — which is its own note above. **One bug fixed and disclosed:** the footer's Delete button was gated on `foreignId`, a pending-field object and so always truthy, so the *Add* form drew a Delete button with no handler; it is gated on the record now. Verified on the running instance against 486 real exclusions: one `GET /api/v3/exclusions/paged` on load at 20 rows over 25 pages; sorting by **Title** re-fetches once with `sortKey=movieTitle`; first/previous/next/last all page on the server, page 25 holding the remaining six records, and paging back to a page already fetched renders from cache with no request; setting page size to 5 rewrites the pager to 98 pages, resets to page 1 and survives a reload out of `localStorage`. Adding: no request when the dialog opens, an empty **Foreign Id** comes back 400 and renders *'Foreign Id' must not be empty.* on that field with the edit kept, and a valid save sends one `POST` (201) and one refetch, the row appearing at the top with `reason: manual`. Editing a probe row created with `reason: studioExclusion` and changing only its title sends one `PUT` and one refetch, and the server record comes back with **`studioExclusion` intact** — the regression this shape exists to avoid. **Cancel** discards the edit with no request and reopening shows the saved value. **Delete** from the edit modal sends one `DELETE`; selecting three rows and confirming sends one `DELETE /exclusions/bulk`, clears the selection and re-disables the button; select-all/unselect-all covers the visible page. Restarting the server with the page open refetched it on reconnect, which is `pagePopulator`'s replacement under test. No console errors on any of it; the instance is back to its original 486 records. Props of the components touched are marked `Readonly<T>` per SonarQube `typescript:S6759`. |
| 2026-08-27 | #539 | **Auto tagging.** Section 8a. `settings.autoTaggings`, `settings.autoTaggingSpecifications`, `AutoTaggingAppState` and `AutoTaggingSpecificationAppState` are deleted for `Settings/Tags/AutoTagging/useAutoTaggings.ts` on `useProviderSettings`; `react-redux` 58 to **52** and `Store/` 3,723 across 53 to **3,339** across 51. No connectors — the section never had one — so 22 does not move. **Two slices went for one hook, because only one of them was ever a section**, which is its own note above: `autoTaggingSpecifications` had 253 lines, no server and a `pendingChanges` bag it emptied into the other slice at the moment of the POST. `Store/Actions/Settings/` is down to eight files. The hook is `useManageProviderSettings` with `testProvider` dropped — an auto tag has nothing to contact — plus `specifications`, `saveSpecification`, `deleteSpecification` and `cloneSpecification`, all four of them one `updateValue('specifications', ...)` over an array. Cloning an auto tag is the `defaultProvider` seed #538 established, minus the field masking: a condition's fields hold match patterns, never secrets. **The presets branch under `AddSpecificationItem` is dead here** and was before: `/autoTagging/schema` sends no `presets`, so `getProviderState`'s `delete result.presets` was a no-op too. Left in place, because custom formats do send them and section 10 reuses this component shape. Verified on the running instance: one `GET /api/v3/autoTagging` on load and one `GET /api/v3/autoTagging/schema` the first time the add-condition dialog opens, listing all nine conditions; adding a Year condition, naming it and saving it touches the network **not at all** and puts the card in the Conditions fieldset; **Save** sends one `POST` (201), closes the modal and adds the card off the cache write with no refetch; a reload renders it off one `GET`. Editing that auto tag: the condition modal opens on the saved values with a Delete button, changing **Minimum Year** to 1990 and cloning then deleting a condition are all local, and **Save** sends one `PUT` (202) whose body carries the edited field and the single remaining condition — both confirmed on the server. Cloning an auto tag opens *Add Auto Tag* prefilled with `- Copy`, the tag and the conditions, and saves as a second `POST`. Clearing **Name** and saving comes back 400 and renders *'Name' must not be empty.* on that field with the modal open and the edit kept; **Cancel** discards it and reopening shows the saved name with no stale error, the pending store having unmounted with the modal. **Delete** from the edit modal sends one `DELETE` and drops the card. The Tag Details modal lists the auto tag under *Auto Tagging* off `useAutoTaggingsWithIds`. No console errors on any of it. Props of the components touched are marked `Readonly<T>` per SonarQube `typescript:S6759`. |
| 2026-08-27 | #538 | **Indexers.** Section 7c, and the end of section 7. `settings.indexers` and `IndexerAppState` are deleted for `Settings/Indexers/Indexers/useIndexers.ts` on `useProviderSettings`; `react-redux` 71 to **58**, `Store/` 3,921 across 54 to **3,723** across 53, and one connector, 23 to **22**. **Thirteen files lose their `react-redux` import and six of them are outside the settings page** — the indexer select input, the release profile list and the row it feeds, the tag details modal, the Tags boot dispatch, Health's *Test All* button and `SignalRListener`, which invalidates `[INDEXERS_PATH]` instead of dispatching `updateItem`/`removeItem`. `IndexerFilterBuilderRowValueConnector.js` becomes `IndexerFilterBuilderRowValue.tsx`, the same collapse `QualityProfileFilterBuilderRowValue` made in #520; it was a class component whose whole job was a boot fetch the query now does on mount. **Nothing was added to `useProviderSettings`** — section 4 had already grown fields, testing and the merged error state, and an indexer needs exactly those. What is new is Indexers-only and lives in its own hook: `useTestAllIndexers`, `useBulkEditIndexers`, `useBulkDeleteIndexers`, and the clone. Three notes above carry the rest — the manage modal (and why its sort is deliberately not a shared hook yet), the clone and its masked secrets, and `typings/Indexer` not actually being a `Provider`. Verified on the running instance, which had no indexers, so one was built through the UI and torn down again: the Torznab **Jackett** preset seeds `name` from the preset and all three `enable*` from `supports*`; **Save** on an unreachable indexer comes back 400 and a second identical **Save** goes up as `POST /indexer?forceSave=true`, which is the redux `lastSaveData` comparison preserved; an indexer with nothing enabled saves 201 and the card appears off the cache write with no refetch; cloning blanks the API key and prefills *- Copy*; editing priority sends one `PUT /indexer/1` and the card re-renders off the cache; the manage modal sorts by Name (toggling) and by Priority (resetting to ascending), bulk-edits `{ids:[1,2],enableRss:true}`, applies `{tags:[8],applyTags:"add"}`, and bulk-deletes `{ids:[1]}` — each 202/200 with no refetch; the per-card delete sends `DELETE /indexer/2`; **Test All** sends `POST /indexer/testall`; and an external `PUT` from outside the browser refetched the list unprompted, which is the SignalR path. Release Profiles, Tags and the tag details modal all read the list off the query, and the release profile edit modal's indexer select renders `(Any)`. `/api/v3/indexer` is back to empty; five pages swept with no console errors. **Not exercised** — `IndexerFilterBuilderRowValue` (the toolbar renders no buttons headlessly, as in #520) and Health's *Test All Indexers* button, which only renders against a matching health issue. Props of the components touched are marked `Readonly<T>` per SonarQube `typescript:S6759`. |
| 2026-08-27 | #537 | **Indexer options.** Section 7b. `settings.indexerOptions` and `IndexerOptionsAppState` are deleted for `Settings/Indexers/Options/useIndexerOptions.ts` on `useManageSettings`; `react-redux` 72 to **71** and `Store/` 3,994 across 55 to **3,921** across 54. No connectors, so 23 does not move. **It is the plainest form conversion of Phase E** — one endpoint (`/config/indexer`), one `useManageSettings`, one child under `IndexerSettings`' shared toolbar on the `setChildSave` / `onChildStateChange` shape #530 established, and nothing added to the shared hook. Three things fall out of the slice going: the `fetchIndexerOptions` boot effect (the query fetches on mount), the `clearPendingChanges` unmount effect (the pending store is per-instance and unmounts with the component, the same retirement #521 made), and the `isPopulated` term in the render guard, which `hasSettings` already covered. The second `setIndexerOptionsValue` dispatch for the subtitle tags stays as a second handler, because the join is still needed — **and the type it joins to was wrong**, which is its own note above. `IndexerSettings.tsx` keeps one `useSelector` for `isTestingAll` and its `testAllIndexers` dispatch; those are 7c's, and this is the partial-component conversion #462 established. Verified on the running instance: the Options fieldset renders off one `GET /api/v3/config/indexer`; editing **Minimum Age** flips the toolbar to *Save Changes* and typing the saved value back returns it to *No Changes*, which is `updateSetting`'s comparison doing what `createSetSettingValueReducer` did; **Save** sends one `PUT` and returns to *No Changes* off the cache write with no refetch; under *Show Advanced* the subtitle tag input splits the stored string into two tags and saves `"vostfr,hardsub"` back, and a reload renders both; and an out-of-range **RSS Sync Interval** comes back 400 and renders *Must be between 10 and 120 or 0 to disable* on that field with the edit kept. `/api/v3/config/indexer` diffs clean against its pre-test baseline; no console errors. Props of the component are marked `Readonly<T>` per SonarQube `typescript:S6759`. |
| 2026-08-27 | #536 | **Indexer flags.** Section 7a. `settings.indexerFlags`, `IndexerFlagSettingsAppState` and `createIndexerFlagsSelector` are deleted for `Settings/Indexers/useIndexerFlags.ts`; `react-redux` 74 to **72** and `Store/` 4,052 across 57 to **3,994** across 55. No connectors — the section never had one — so 23 does not move. **It is the Languages shape a second time**: a read-only list the server compiles in, so `staleTime: Infinity` / `gcTime: Infinity` and one `GET /api/v3/indexerFlag` for the session, exactly as the slice's single boot fetch did. The boot gate swaps its `isPopulated` term for the query's `isFetched` and drops the `fetchIndexerFlags` dispatch, leaving `isReduxPopulated` waiting on `importLists` alone — the last term, and section 9's to take. **The bitmask unpacking is the only thing that needed a decision.** A release carries its flags as one integer, so both consumers had to test it against the flag list before rendering: `Movie/IndexerFlags` did it in a `filter` over `createIndexerFlagsSelector`, and `IndexerFlagsSelectInput` did the same walk again inside its own `createSelector` to build `value`. That is `useSelectedIndexerFlags` now, one memoised filter beside the query, and the select input's hand-rolled selector goes with it. **The domains are finished by this PR**: `Movie/IndexerFlags.tsx` was the last `react-redux` import under `Movie/`, `Scene/`, `Performer/` or `Studio/`, and everything still on Redux is Settings plus twelve scattered files. Verified on the running instance: the app boots with `#root` populated and no console errors; `GET /api/v3/indexerFlag` returns the ten flags; the **Set Indexer Flags** modal off Manage Files lists all ten off the query, and selecting `G_Freeleech` and `PTP_Golden` — 1 and 8 — round-trips the 9 back out as both, which is the unpacking under test. **Not exercised** — `Movie/IndexerFlags`' popover, which only renders on hover over a flagged row in the file editor. Props of the components touched are marked `Readonly<T>` per SonarQube `typescript:S6759`. |
| 2026-08-27 | #535 | **General.** Section 6, second half, and the end of section 6. `settings.general` and `GeneralAppState` are deleted for `Settings/General/useGeneralSettings.ts` on `useManageSettings`; the nine `.js` files under `Settings/General` become eight TSX ones plus a props type. One connector — 24 to **23** — and `react-redux` 78 to **74**, `Store/` 4,145 across 59 to **4,052** across 57. **The restart-required check is the story** and it is its own note above: it could not be ported, because it read a `previousValue` that only exists while the pending bag is still full. Two deliberate departures from Sonarr: the eight fieldsets take `settings` and `onInputChange` rather than the forty-odd individual field props Sonarr's take — every one comes from the same object and goes straight to a `FormInputGroup`, so per-field props are plumbing, not type safety — and `advancedSettings` is read by each fieldset through `useShowAdvancedSettings()` instead of being threaded down, as `MediaManagement.tsx` already does. `SecuritySettings` was the last class component in the folder and becomes a function; its two exported option lists still feed the first-run authentication modal, which comes off the slice here too. **`Store/Actions/actionTypes.js` had no importers at all** — its whole contents were this section's three action types plus a `FETCH_LANGUAGES` that #532 should have taken — so it goes with the slice. `typings/Settings/General.ts` gains the sixteen fields the interface never had (`logSizeLimit`, `trustCgnatIpAddresses` and the fourteen `whisparr*` ones); they round-tripped through the PUT regardless, since `useManageSettings` spreads the whole query object, but the form could not be typed without them. Verified on the running instance: eight fieldsets with Updates and Backups behind *Show Advanced*; **Instance Name** flips the toolbar to *Save Changes*, one `PUT /api/v3/config/host` saves it with no refetch and the restart modal opens; a non-restart key saves the same way and does not open it; clearing **Username** under forms auth comes back 400 and renders *'Username' must not be empty.* on that field with the edit kept. `/api/v3/config/host` diffs clean against its pre-test baseline, and Updates, Movies, Settings and System Status render with no console errors. **`/config/host` is fetched twice** on pages that mount a second observer, because the sidebar reads it too — unchanged from the slice, which had both the sidebar hook and the connector dispatching, and a `staleTime` on `useSettings` would reach every section, so it waits for the teardown. **Not exercised:** the first-run authentication modal, which only renders when authentication is off. Props of the components touched are marked `Readonly<T>` per SonarQube `typescript:S6759`. |
| 2026-08-27 | #534 | **Restart and shutdown.** Not a section — the prerequisite section 6b could not start without, split out the way #516 was. `System/useSystem.ts` replaces both `systemActions` thunks with mutations; `react-redux` 80 to **78** and `Store/` 4,208 across 60 to **4,145** across 59. **`Store/Actions/index.js` is down to one slice.** The system slice had held an empty `defaultState` since #491, so neither thunk wrote to a reducer and there was nothing to port — `restart`'s `onSuccess` does what its `.done()` did, setting the app store's `isRestarting` and starting the ping loop that clears it, both of which have been zustand since #492. Three consumers move: the header actions menu, the restore-backup modal, and `GeneralSettingsConnector`, which takes `restart` as an own prop from its function wrapper until 6b deletes it. Verified on the running instance: **Restart** from the header menu sends `POST /api/v3/system/restart`, the app goes down and comes back reconnected. The response was probed separately — 200 with a 24-byte body in 6ms — because the whole chain hangs on it resolving before the server tears the connection down, and a `.done()` that never fires would have looked the same from outside. **Shutdown was not exercised**, for the obvious reason. Props of the components touched are marked `Readonly<T>` per SonarQube `typescript:S6759`. |
| 2026-08-27 | #532 | **Languages.** Section 6, first half. `settings.languages`, `LanguageSettingsAppState` and `createLanguagesSelector` are deleted for `Language/useLanguages.ts`; `react-redux` 85 to **80** and `Store/` 4,282 across 62 to **4,208** across 60. No connectors, so 24 does not move — the section never had one. **It is the first Phase E section that retires a slice without touching a form**: nothing here writes, so there is no `useManageSettings`, no pending store and no `selectSettings`; the hook is a query plus a filter. The list is compiled into the server, so it is `staleTime: Infinity` / `gcTime: Infinity` and resolves once for the session, exactly as the slice's single boot fetch did — verified as one `GET /api/v3/language` per page load and none on client-side navigation, with five consumers mounted across the pages visited. The boot gate loses its languages term and its `fetchLanguages` dispatch, leaving `isReduxPopulated` waiting on two sections rather than four. **The one thing not copied from Sonarr is their filter**, which excludes nothing; it is its own note above. `ErrorPage.languagesError` widens from `Error` to `ApiError | null` and `FileEditModalContent.error` from `object` to `object | null`, both because a React Query error is nullable where a slice's was not. Verified on the running instance: the UI language select lists 57 languages with `Any`, `Unknown` and `Original` absent and opens on the saved value; the quality profile modal lists 59 with `Any` and `Original` present and `Unknown` absent; no console errors on either page. **Not exercised** — `FileEditModal` and `SelectLanguageModalContent`, because the instance has no movie files, and `LanguageFilterBuilderRowValue`, because `PageToolbar` renders empty in headless Chrome. Props of the components touched are marked `Readonly<T>` per SonarQube `typescript:S6759`. |
| 2026-08-27 | #531 | **Metadata.** Section 5, second half, and the end of section 5. `settings.metadata` and `MetadataAppState` are deleted for `Settings/Metadata/useMetadata.ts`; the eight `.js` files under `Settings/Metadata` become five TSX ones and a hook. Three connectors go — 27 to **24** — and `react-redux` 89 to **85**, `Store/` 4,364 across 63 to **4,282** across 62. **The hook is thirty-one lines**, because a metadata consumer cannot be added, deleted or tested: the list is whatever implementations the server ships. So `useManageMetadata` is `useManageProviderSettings` with `useTestProvider` dropped and nothing seeded — no `useProviderSchema`, no `id === 0` branch, and therefore no default provider, since `useProvider` only reaches for one when the id is zero. Section 4 had already grown the shared hook everything here needs, so nothing was added to it. **The two dead things are the story** — a shadowed `Metadatas.tsx` the connector could not reach, and a Save button nothing was wired to; both are their own note above. `EditMetadataModalConnector` existed only to dispatch `clearPendingChanges` on close, which `Modal` unmounting its children now does for free, the same retirement #521 made. **`field.section` is always undefined here.** `Metadata.js` split fields into a *Metadata* group and an *Images* group on `field.section === 'metadata'`, and the API sends no `section` on metadata fields at all, so every field has always landed under *Images* and the *Metadata* header has never rendered. Carried over unchanged rather than fixed — it is a server-side omission and not this PR's to decide. Verified on the running instance: five cards sorted by name with the toolbar down to *Show Advanced*; toggling **Enable** un-disables the field checkboxes; **Save** closes the modal and the card flips to *Enabled* with its labels, off the cache write and with no refetch; **Cancel** discards the pending edit and reopening shows the saved value; a 400 injected over CDP puts its message on the field it names, keeps the modal open and keeps the edit. `/api/v3/metadata` diffs clean against its pre-test baseline. Props of the components touched are marked `Readonly<T>` per SonarQube `typescript:S6759`. |
| 2026-08-27 | #530 | **Naming · Media Management.** Section 5, first half. `settings.naming`, `settings.namingExamples` and `settings.mediaManagement` are deleted for `Settings/MediaManagement/Naming/useNamingSettings.ts` and `Settings/MediaManagement/useMediaManagementSettings.ts`; `react-redux` 94 to **89** and `Store/` 4,606 across 66 to **4,364** across 63. No connectors here, so 27 does not move. **The page is two forms and one Save button**, and that is the whole shape of the PR — see *Two settings forms cannot share a pending bag* above; `SettingsStateChange` and `SetChildSave` were already in `typings/` from #519, so nothing new was invented for it. **`namingExamples` was never a settings section.** It was a slice with one action handler that read the *other* slice's `item` plus `pendingChanges` and posted them, which is a query keyed on unsaved form state — so it becomes `useNamingExamples(settings)`, and the hand-rolled one-second `setTimeout` that restarted on every keystroke becomes `useDebounce(settings, 300)`. Typing back to a format already asked about is now a cache hit rather than a request, which is why the shorter delay costs nothing. The `id` that has to go up with it is its own note above. **`ImportMovieSelectFolder`'s prefetch was not dead.** It dispatched `fetchNamingSettings` with no consumer in that file, but its sibling `ImportMovieRootFolderRow` read `createSettingsSectionSelector('naming')` — a call the grep for `Settings/naming` misses because it names the section, not the module. Both moved; the row fetches for itself and the prefetch goes. Verified on the running instance: examples update as the format is typed, one **Save** press persists both endpoints and returns the toolbar to *No Changes*, an invalid movie format comes back 400 and renders *Must contain movie title* on the field with the edit kept, and the Organize modal and import root-folder row both read the converted query. Nothing is added to the `persistState` warning list — neither slice declared one. |
| 2026-08-23 | #521 | **Connections.** Section 4. `settings.notifications` and `NotificationAppState` are deleted; `Settings/Notifications/useNotifications.ts` replaces them, and the thirteen `.js` files under `Settings/Notifications` become nine TSX ones. Four connectors go — 31 to **27** — and `react-redux` 98 to **94**. **Most of the change is in the shared hook, not the page.** `useProviderSettings` had only ever had to save a provider that is a plain object; a connection has `fields`, and a connection can be tested, so it grew `useTestProvider`, `usePendingFieldsStore` integration, and one merged error state — React Query keeps an error per mutation, but a failed test and a failed save are the same validation against the same body and both have to reach `selectSettings` for the messages to land on the fields that caused them. `useProviderSchema` is new, adapted from Sonarr's: `useSelectedSchema` resolves an implementation (and optionally a preset) out of the schema query, which is what `SELECT_NOTIFICATION_SCHEMA` did through the slice. **The identical-retry semantics come from the redux handlers, not from Sonarr.** Sonarr sends `skipTesting` and `skipValidation`; neither exists here — `ProviderControllerBase` binds `forceSave` on create/update and `forceTest` on test, and `createSaveProviderHandler`/`createTestProviderHandler` set them when the body is byte-identical to the previous attempt. So pressing **Save** or **Test** a second time on an unchanged form is what drops warning-level validation (and, for save, skips the connectivity test), and that comparison now lives in the two mutation hooks rather than in a module-level `lastSaveData`. `getProviderPayload` carries over the two things `getProviderState` did that are easy to miss: `presets` is stripped, because a schema-derived body still has it and the server rejects it, and fields go up as bare name/value pairs. **`OAuthInput` gains `onSaveError`.** It reported a failed authorization by dispatching `set({ section, saveError })`, which a converted form has no section for; the callback is optional, so the sections still on Redux keep the dispatch and only the converted ones pass it. Without it, deleting the slice would have made the Plex and Trakt buttons dispatch into a section that no longer exists. Two consumers outside the page move: `TagDetailsModalContent` reads `useNotificationsWithIds`, and `Tags` drops its `fetchNotifications` boot dispatch. `SignalRListener` invalidates `[NOTIFICATIONS_PATH]` instead of dispatching `updateItem`/`removeItem`. `getQueryString` returns `''` rather than a bare `?` when nothing is set, which it now can be, since `useApiMutation` takes query params as a function of the body. Verified: `tsc`, `eslint` and `yarn build` clean from the repo root. Not exercised in the browser — the live check was skipped this round on the user's instruction. Props of the components touched are marked `Readonly<T>` per SonarQube `typescript:S6759`. |
| 2026-08-23 | #520 | **Quality profiles.** Section 3b, and the end of section 3. `settings.qualityProfiles` is deleted, along with `QualityProfilesAppState`, `createQualityProfileSelector`, `createProfileInUseSelector` and `Utilities/Quality/getQualities`; `Settings/Profiles/Quality/useQualityProfiles.ts` replaces them on `useProviderSettings`. Four connectors go — 35 to **31** — and `react-redux` 111 to **98**, on twelve consumers outside the settings page plus the boot gate, which now waits on the list query rather than dispatching `fetchQualityProfiles`. The 544-line `EditQualityProfileModalContentConnector`, the 373-line content component and `EditQualityProfileModalConnector` collapse into one 760-line TSX file; the connector's `clearPendingChanges` on close goes with it, since the store is per-instance and `Modal` unmounts its children when closed. **Three things changed on purpose.** (1) *Cloning.* `CLONE_QUALITY_PROFILE` was a reducer that copied a profile into the section's `pendingChanges` and relied on the add modal reading the same bag; the source profile is the new profile's default now, passed down as `cloneId`, so a clone nobody edits still saves as a copy — the old shape saved an empty profile if the reducer's write lost a race with the modal opening. (2) *`ensureCutoff` is an effect.* It was called at the end of five handlers and forgotten by none of them only by inspection; as an effect on `items`/`cutoff` it cannot be forgotten. Where nothing at all is allowed it now leaves the stale cutoff instead of setting it to null — the server refuses the save either way (`ValidCutoffValidator`), and null does not survive the `int` binding. (3) *No `cloneDeep`.* The handlers rebuilt the profile by deep-cloning it and mutating; the copy came out of the redux slice then and would come out of the React Query cache now, which is the §8 F1 hazard, so each handler builds a new list instead. `getQualities` is retired rather than ported: all three callers read the schema out of the slice first, so the fetch and the flattening travel together in `useQualities`, and the schema is fetched only where it is used — the edit modal skips it entirely for an edit or a clone, where the connector fetched it on every mount that had no id. The connector's `createFormatsSelector` was dead — computed, destructured, never passed on — and is not carried over. `createProfileInUseSelector` becomes `useQualityProfileInUse`, still import-lists-only and still reading the Redux slice until section 9; see the open thread. Verified live against the running instance: the page listing 13 profiles off one `GET /qualityprofile`; editing VR (toggle a quality → one `PUT`, modal closes, card updates off the cache write, no refetch) and reverting it; cloning VR (`VR - Copy` prefilled, **no** schema fetch, `POST`, list updates); adding from scratch (the one place `GET /qualityprofile/schema` fires); deleting the clone through the confirm modal; creating and dissolving a group in *Edit Groups* mode; and the cutoff following the allowed set as *Upgrade Until* moved VR → SDTV when VR was unticked. Nine pages swept for console errors, all clean, each fetching `/qualityprofile` exactly once. Not exercised in the browser, for want of a route to them on this instance: the two filter-builder row values (the toolbar renders no buttons headlessly), `FileEditModal` and `SelectQualityModalContent` (no movie files), and `ManageImportListsModalRow` and the in-use delete guard (no import lists). Props of the components touched are marked `Readonly<T>` per SonarQube `typescript:S6759`. |
| 2026-08-23 | #519 | **Quality definitions.** Section 3a. `qualityDefinitions` slice retired and the first use of `usePendingItemsStore`. Four connectors go — 39 to 35 — two of which had already lost their `react-redux` import and were connectors in name only. Seven files to TSX, and `react-slider` gets a hand-written declaration rather than a new dependency. |
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
| 2026-08-20 | #487 | **Tags.** `useTags`/`useTagDetails` replace `tagActions`, both tag selectors and `TagsAppState`; the `Tags/useTags.ts` shim that had been a selector wearing a hook's name is now the real query. `TagFilterBuilderRowValueConnector` was a `connect()` whose whole job was reshaping the list, so it became a plain component and the connector count dropped with it. `useAppPage` gates on the query for the same reason it gates on custom filters. Delete writes the removal into the cache but leaves the refetch to SignalR — invalidating `/tag/detail` here as well fetched it twice, measured. `useSortedTagList` copies before sorting: `MovieTagInput` had been sorting the shared list in place, which was harmless against a slice that handed out a fresh array per fetch and is not against a query cache. |
| 2026-08-23 | #518 | **Remote path mappings · Release profiles — Phase E section two.** Two slices deleted, `ReleaseProfilesAppState` with them, and `Settings/useProviderSettings.ts` arrives: `useProviderSettings` for the list query, `useProvider` to pick one row out of it, `useSaveProviderSettings` (POST when the id is 0, PUT otherwise, response written straight into the cached list), `useDeleteProvider`, and `useManageProviderSettings` pairing the row with a `usePendingChangesStore`. Sections 3, 4, 7, 8, 9, 10 and 11 all call it. The three remote path mapping connectors go — 42 to 39 — and their four components move to TSX. Sonarr's copy of `useProvider` throws when the id is missing; kept, because every caller renders inside a `Modal` and `Modal` has its own error boundary, where the alternative is a silent POST of a duplicate. Two Redux reads stay behind on purpose (see the note above), which is why `react-redux` only moves 118 to 113. One behaviour change fell out of typing the local path input: `includeFiles` is required on `PathInput` and was being passed `undefined`, so the file browser listed files while the autocomplete beside it did not — it is `false` now, matching both the autocomplete and Sonarr. Verified against the running instance: add/edit/delete on both sections, server-side validation surfacing on the right field, and the tag details modal reading release profiles from the query. |
| 2026-08-23 | #517 | **UI settings — Phase E section one.** `Settings/ui.js` is deleted and `Settings/useSettings.ts` arrives with it: `useSettings`, `useSaveSettings` and `useManageSettings`, the last of which holds a `usePendingChangesStore` beside the query and runs the pair through `selectSettings`. That is the shape the other ten sections will use. `UISettings.js` + `UISettingsConnector.js` become one `UISettings.tsx`; the connector's `clearPendingChanges` on unmount goes with it, because the store lives inside the component now and unmounting is the clear. `withAdvancedSettings` goes too — the page has no advanced fields. **This is the largest single drop in `react-redux` importers of the migration: 147 to 118**, on thirty-one `createUISettingsSelector` consumers plus four direct slice readers (`useTheme`, `ApplyTheme`, `useCalendar` — which comes off `react-redux` entirely — and the boot gate). The gate matters more here than in most sections: thirty-odd components call `formatDate` during render, so rendering before the format strings land formats every date with `undefined`. **Two things are deliberately not copied from the reducer.** The form renders on `isFetched` rather than `!isFetching`, because a query sets `isFetching` on every background refetch and gating on it would blank a half-edited form on window focus, which the once-on-mount thunk never did. And `createSetSettingValueReducer`'s `Number.parseInt` coercion before the is-it-a-change comparison does not come across — `useManageSettings` compares `===` against typed query data, verified live by changing a select and changing it back to reach *No Changes*. Riding along, all disclosed: `CalendarOptionsModalContent` was the second writer of `/config/ui` and moves to `useSaveUiSettings`, which merges over the whole resource as `createSaveHandler` did; `LanguageSelectInput` widens from `number[]` to `number | number[]`, a mismatch UI settings had been feeding it invisibly for as long as that page was JavaScript; `ErrorPage`'s `uiSettingsError` widens to match `translationsError`; and `Store/Selectors/selectSettings.js` is deleted as unreachable — webpack resolves `.ts` first, so all 17 extensionless importers have been getting the TypeScript copy. `useSettings` also returns one shared object rather than a fresh `{}` before the fetch resolves, so the settings never change identity in a dependency array; Sonarr's copy builds a new one per render. No `Unexpected key` warning: `ui.js` declared no `persistState`. Verified live: all six fieldsets populated, edit/revert/save round-trip with a single merged PUT, `/system/updates` rendering `2026-08-15` under the new short format, the *Unsaved Changes* modal still blocking navigation, the calendar options modal writing through the new hook, and a cold boot fetching `/config/ui` exactly once. |
| 2026-08-23 | #516 | **The pending-changes stores.** `usePendingChangesStore`, `usePendingFieldsStore` and `usePendingItemsStore`, copied from Sonarr's `v5-develop` unchanged. Foundation only, no consumers — the same shape #452 took, and the prerequisite §7 names for every section of Phase E, since each one is a settings form and each needs somewhere to hold dirty state that is not `createSetSettingValueReducer` or `createSetProviderFieldValueReducer`. Each store is created per-instance inside `useState`, matching `useSelectStore`, so two mounted forms hold separate dirty state instead of sharing the one Redux section's pending bag. The stores record edits and nothing more — the is-it-a-change comparison the reducers did stays with the caller, see the note above. `typings/pending.ts` and `PendingChangesModal.tsx` were already here and already matched Sonarr's, so nothing else was needed; the reducers themselves stay until their last consumer goes. Metrics move only where a foundation PR can move them: zustand 35 to 38 and the denominator 1,197 to 1,200; `react-redux`, slices and connectors are untouched at 147, 2 and 43. |
| 2026-08-23 | #515 | **The `movies` slice — the last of Phase D.** `movieActions` (252 loc) is deleted, taking the slice count to **2**: `settings` and `system` are all that remain in `Store/Actions/index.js`. It had no importers left at all — the preset filters moved to `movieIndexFilters` in #496 and `toggleMovieMonitored` was the last thunk standing, superseded by `useToggleMovieMonitored` — so the whole file was reachable only through its own registration. **The four components still reading the slice were each silently dead**, because nothing has populated `state.movies.items` since the indexes went paged, and every one of them was reading an array that is always empty. (1) *The filter builder's Movie picker offered no values*, so the `movieIds` filter on History, Blocklist and Queue could not be built at all — the one place in the app that genuinely wants the whole movie table, since the filter is over the whole library. (2) *Tag Details never rendered its Movies fieldset*, however many movies carried the tag. (3) *Queued task rows dropped the titles after the command name*, so a movie search read `Movies Search` and nothing else. (4) *The Movie index's overflow **Search All** was permanently disabled*, since `isDisabled={!items.length}` was reading the same empty list; it takes `items` from the toolbar button it mirrors now, which `PageToolbarSection` was already handing it — the props it renders the overflow component with are the button's own, so the fix was to read the prop that had been there all along instead of running a client-side collection selector beside it. `useMoviesByIds` (`POST /movie/bulk`) covers the two by-id cases and `useAllMovies` (`GET /movie`) the picker. **`createProfileInUseSelector` asked the same empty slice** whether any movie used a quality profile, so only the import-list half of that answer has been real for some time; the dead term is dropped rather than left reading a slice that no longer exists, and answering it properly wants a server-side question — see the open thread below. `MovieIndex` also held a `useDispatch` it never dispatched with, kept alive by an `useEffect(() => {}, [dispatch])`. Removed as dead with the slice: `MoviesAppState` (`AppState` is down to `settings` alone), `ClientSideCollectionAppState`, `createMoviesFetchingSelector`, `movieEntities`, and the four movie selectors. **`GET /movie` is a heavy way to fill a title picker** — full resources, one per row, measured at 46MB of JSON for this instance's 16,917 records and 19.7MB on the wire — so it carries a five-minute stale time and `SignalRListener` deliberately does *not* invalidate it: a library scan emits a movie event per record, and each one would re-download the list for as long as a filter row happened to be open. `/movie/bulk` is invalidated, being small and keyed on the ids asked for. Verified live: the Movie picker returning 45 suggestions for `ashley` off one 825ms fetch, Tag Details listing both movies on the `anewone` tag from a single 2.7KB `POST /movie/bulk`, a queued Movies Search rendering **Movies Search - 035 Angela White X Mick Blue, Consumed by Desire 3** sorted by `sortTitle`, and the overflow **Search All** — forced into the menu at a 360px viewport — dispatching `MoviesSearch` with the page's 25 ids. Props of the components touched are marked `Readonly<T>` per SonarQube `typescript:S6759`. |
| 2026-08-23 | #514 | **Safe-for-work mode — Phase E opens.** Split out of section 1 and landed first because it is not what section 1 is about: `safeForWorkMode` is not part of `/config/ui` and never was. It is a hand-rolled key on the `settings` root with its own `TOGGLE_SFW_MODE`, kept in the redux `persistState` blob — client state with persistence, so it becomes `App/safeForWorkStore.ts`, a `createPersist` store beside `App/appStore`, rather than going to React Query with the real UI settings. Ten files swap `useSelector((state: AppState) => state.settings.safeForWorkMode)` for `useSafeForWorkMode()`, and `SafeForWorkButtonConnector.js` is deleted outright since it only wired the toggle — 44 connectors to **43**. **`SafeForWorkModeContext` goes too.** With the mode in a global store the context was a broadcast channel with one publisher and no subscribers that needed it: `Page` held the only provider, wrapping the whole app, and nothing overrode it anywhere in the tree. Its eleven consumers read the store directly now. That is also marginally cheaper — the provider sat in `Page`'s render, so `Page` re-rendered its entire subtree on every toggle, where now only the eleven components that read the mode do. `ColorImpairedContext`, its sibling in the same two lines of `Page`, deliberately stays: it broadcasts `enableColorImpairedMode` from `/config/ui`, which is server state and upstream Sonarr's own shape, so it belongs to the `/config/ui` half of section 1. **The persisted value is migrated rather than dropped**, unlike every previous conversion — the default here is *unblurred*, so letting it fall back would silently un-hide a library on upgrade. The store seeds itself from the redux blob at module scope, which is safe because `bootstrap.tsx` imports `App`, which reaches the store through `Page`, and ES imports evaluate before `createAppStore()` runs — so the read happens before redux rewrites the blob without the path. **It then writes the value straight back, and that second half is load-bearing:** `persist` only writes on a state change, so a migrated value nobody touches never claims the zustand key while redux has already dropped it, and the mode reverts on the *next* reload. Caught by reloading twice — the first load honoured the migrated value and the second did not — and the same trap applies to any future store migrating a persisted redux value. Drops a dead prop chain found on the way: `PerformerIndexPosters` declared `safeForWorkMode` and never read it, `PerformerIndex` passed it, and `usePerformerIndex` returned it only to feed that. Verified live in both states: posters blurring and unblurring across the movie, scene, studio, performer and collection indexes, the movie, performer and studio details pages and both add-new search flows; the header toggle switching it with the blur following (24 blurred posters to 0 and back) and surviving a reload; the migration holding across three reloads; and table-view row blur, checked by enabling the hidden Root Folder Path column — 25 blurred cells with the mode on, 0 with it off. No console errors on any page. Props of the components touched are marked `Readonly<T>` per SonarQube `typescript:S6759`. |
| 2026-08-22 | #513 | **Add / Import Movie.** `addMovieActions` (264 loc) is deleted, taking the slice count to **3** — `movies`, `settings` and `system` are all that is left in `Store/Actions/index.js`. Only the persisted defaults were still live on it: `movieDefaults`, shared by the Add New Movie/Scene modal and the Import Movies footer, and `studioDefaults`, read by the Add New Studio modal. They become `addMovieDefaultsStore` and `addStudioDefaultsStore`, `createPersist` stores of the same shape as #508's `addPerformerDefaultsStore`; `performerDefaults` was already dead, since #508 moved it. Everything else the slice exported had no consumers at all — `lookupPerformer` and `addPerformer` were superseded by `useAddNewPerformer`, and `clearAddMovie`, `setAddMovieValue` and `setAddPerformerValue` had none before that. **`migrateMonitorToEnum` goes with it, and it never worked.** Its three `_.remove(persistedState, 'addMovie.*Defaults.monitor')` calls pass an object to a lodash function that returns early on anything without a `length`, so the migration it is named for has been a no-op since it was written; nothing depended on it, and with the slice gone the persisted state has no `addMovie` key to strip. **Fixes a live bug.** `useAddMovieMutation` handed `state.addMovie.addError` to `selectSettings`, and nothing has written that since the add thunk was replaced, so a 400 from `POST /movie` only ever reached the modal's top-level Alert and never the field it named. It passes `mutation.error` now, which is what the performer and studio modals already do — verified both ways against the running instance by seeding a bogus root folder: `eros-develop` renders nothing under **Root Folder**, this renders *Root folder '/does/not/exist' does not exist* there. Verified live: the add modal writing a quality profile and the import footer reading it back, the footer writing one and the modal reading it back, both surviving a reload through `whisparr-dev_add_movie_defaults`, the studio store staying independent of them in `whisparr-dev_add_studio_defaults`, the import page listing and looking up three planted files with the persisted profile applied to every row, and five add/import pages rendering with no console errors beyond the one-time retired-slice warning. The five files left under `AddMovie/` and `useAddNewStudio` keep `react-redux` for UI settings, `safeForWorkMode`, the naming config and the quality-profile list — all Phase E, and deliberately left alone. |
| 2026-08-22 | #512 | **Movie files + credits.** `movieFileActions` (332 loc) and `movieCreditsActions` (86 loc) are deleted, taking the slice count to **4**; `movieCreditsActions` was already dead, since the credits posters have read `/credit` through `useMovieCastCredits` for a while and nothing dispatched or selected the slice. The file editor's columns and sort become `movieFileEditorOptionsStore`; the three write paths become `useUpdateMovieFiles`, `useDeleteMovieFile` and `useDeleteMovieFiles`. `MovieCreditPosterConnector` folds into `MovieCastPoster`, which reads `SafeForWorkModeContext` and calls `useTogglePerformerMonitored` itself, and with the last redux import gone from that folder `MovieCastPostersConnector` is renamed to `MovieCastPosters` — 46 connectors to **44**. **Three live bugs, each a regression from an earlier TypeScript conversion.** (1) *Both Unmapped Files deletes have been dead since #34*, which dropped the object wrappers: the connector called `deleteMovieFile(id)` and `deleteMovieFiles(ids)` where the thunks destructure `{ id }` and `{ movieFileIds }`, so the single delete requested `DELETE /movieFile/undefined` and the bulk one sent `{}` — verified against the running API as a 404 and a 400 (`movieFileIds must be provided`) before the fix. `isDeleting` was hardcoded `false` in the same file, so the toolbar spinner never spun and the deselect-after-delete branch was unreachable; both halves are real now and the mutation's error is passed through, so a failed delete keeps the selection. (2) *The file editor's column sort has been inert since #199*, which replaced `createClientSideCollectionSelector('movieFiles')` with `useMovieFile()` and did not carry the sort over — the header kept drawing its indicator and writing the choice to the slice while the rows never moved. It runs through the shared `clientSideFilterAndSort` now. (3) *Editing a file wiped its edition*: `FileEditModalContentConnector` passed `movieFile.edition` until #44 replaced it with `const edition = ''`, and `SetPropertiesBulk` treats an empty string as a value, so every quality edit cleared the stored edition. **The three mutations leave the refetch to SignalR**, as Tags does: `MovieFileController` broadcasts on `MovieFileUpdatedEvent` and `MovieFileDeletedEvent`, and `SignalRListener` already invalidates `/moviefile` plus the queries that gaining or losing a file changes, so invalidating in the mutation as well fetched the list twice — measured on all three, one GET each now. A bulk delete of *n* files still refetches *n* times, because the server raises one event per file; that is upstream's shape and was three refetches before. Removed as dead: `MovieFilesAppState`, `MovieCreditAppState` and `ExtraFilesAppState` — the last had no slice behind it at all, so `state.extraFiles` was a type over nothing; `MovieDetails`'s `movieFilesError`/`movieCreditsError`/`extraFilesError` props, declared and never read; and `MovieFileEditorTableContent`'s `movieId`, `isLoading`, `error` and `isDeleting` props, none of which any caller passed. `MovieFile` gains `edition`, which is on `MovieFileResource` and which the save payload needs. Verified live against four planted files on one movie and three unmapped ones: one `GET /moviefile?movieId=` on open, both sortable columns sorting in both directions with no refetch and the choice persisting to `whisparr-dev_movie_file_editor_options` across a reload, a column toggle persisting through the same store, the edit modal prefilling `Directors Cut`/`Extended Edition` and the `PUT /moviefile/bulk` carrying the edition back rather than an empty string, a single delete sending `DELETE /moviefile/40`, an unmapped single delete sending `DELETE /moviefile/41` and removing the file from disk, a bulk delete sending `{"movieFileIds":[43,44]}` and deselecting the remaining row, the credits poster's monitor toggle still sending its `GET` + `PUT /performer/29` pair, and eleven pages loading with no console errors beyond the documented retired-slice warning. |
| 2026-08-22 | #511 | **Interactive search.** `releaseActions` (364 loc) and `ReleasesAppState` are deleted, taking the slice count to **6**. `useReleases` fetches `/release` and runs the filter and sort through the shared `clientSideFilterAndSort`; the presets, predicates and builder props move to `releaseFilters` verbatim. `gcTime: 0` is doing the work of two thunks at once -- dropping the query when the modal closes both clears the results and aborts a search still in flight, which is what `clearReleases` and `cancelFetchReleases` did between them and why the module-level `abortCurrentRequest` is gone -- and `retry: false` keeps a failed search to the single request the thunk made. `releaseOptionsStore` persists the selected filter key and keeps the sort in a session store, which is what the slice actually did rather than what it looked like it did: `persistState` listed only `releases.selectedFilterKey`, and `CLEAR_RELEASES` spread the rest of `defaultState` back over the section on every close, so the sort never survived one search. **The per-release grab state comes off the release.** `isGrabbing`, `isGrabbed` and `grabError` were fields `updateRelease` wrote onto the item in the store; each row owns a `useGrabRelease()` now and hands the same instance to its override modal, so whichever button starts the grab both report it, and a failure on one row leaves the others alone -- verified by grabbing one release successfully and failing another while the first kept its **Added to download queue** state. The failure message becomes `InteractiveSearchGrabError` rather than the hardcoded `'Failed to add to download queue'` the thunk fell back to. `Release` gains `id`, `qualityWeight` and `releaseWeight`; all three are on `ReleaseResource` and two are what the sort predicates read, so the type had been lying about the shape it sorts on. **One regression found and fixed during verification:** React Query's `isFetched` is true after a *failed* fetch, where the thunk left `isPopulated` false, so the first cut rendered **No results found** underneath the error alert; the hook returns `isPopulated: isFetched && !isError` instead. Verified against a stubbed `/release` (the dev instance has no indexers, and the real endpoint's empty response was checked separately): every sortable column in both directions with no refetch, including all six predicate-backed clauses; a custom filter built through the builder with the **Languages** `optionsSelector` suggesting the stubbed releases' own languages, applied to hide one of three rows with the **Some results are hidden** alert, and hiding all three with the **All results are hidden** alert after the data changed under it; the filter key persisting to `whisparr-dev_release_options` across a reload; a plain grab posting `{guid, indexerId}`; a `downloadAllowed: false` release routing through the confirm modal and posting the search payload with it; a 400 rendering its message on that row's button only; the override modal seeded from the release, posting `shouldOverride: true` and closing when the grab settled; a 500 rendering the search-failed alert with the server's message and no retry; and close-then-reopen refetching. |
| 2026-08-22 | #510 | **Interactive import.** `interactiveImportActions` (366 loc) and `InteractiveImportAppState` are deleted, taking the slice count to **7**; nothing under `InteractiveImport/` imports `react-redux`. The list becomes `useInteractiveImport`, a `useApiQuery` on `/manualimport` with `gcTime: 0` so a stale list is never handed back the next time the modal opens — which is what `clearInteractiveImport` was for. **The user's edits are kept beside the fetched rows rather than written over them.** Sonarr's port writes each edit into the query cache and then sets `originalItems = [...items]` from that same mutated cache, so its `isSameEpisodeFile` compares a row to itself; keeping the edits in a separate map means `originalItems` really is the untouched response, which is what decides whether an existing file can be updated in place instead of re-imported. Recording an edit and asking the server to reprocess it is one operation now, so the eleven `updateInteractiveImportItem(s)` + `reprocessInteractiveImportItems` dispatch pairs across the modal and the row collapse to one `updateItems(ids, changes)` call each, and the row stops dispatching at all — it takes an `onItemChange` prop. `abortCurrentRequest` and `currentIds`, the two module-level variables the thunk used to cancel a superseded reprocess, are gone: the responses merge by id, so a late one cannot clobber a newer edit for a different row. The recent and favorite folders — the only part of the slice that outlived the modal, since `CLEAR_INTERACTIVE_IMPORT` preserved them — become `interactiveImportFoldersStore`; the sort and import mode become `interactiveImportOptionsStore`. Persisting the sort now actually does something: `persistState` listed `interactiveImport.sortKey`, but `CLEAR_INTERACTIVE_IMPORT` reset it to `relativePath` on every close, so it never survived. **Fixes a live bug.** `filterExistingFiles` was passed by *Unmapped Files* but was not declared on `InteractiveImportModalContent`'s props at all, and the component hardcoded its state to `false` — so that screen's manual import opened listing every file rather than only the unmapped ones. The modal's props are now derived from the content's rather than an index signature, which is what surfaced it, along with three props no component has ever read: `movie` on the *Manage Files* call, and `showReplaceExistingFiles`/`replaceExistingFiles` on *Unmapped Files*, naming a feature this fork does not have. Also removed: `seasonNumber`, sent on every fetch and passed by nobody, and the row's `isReprocessing` prop, declared but never destructured. `useUpdateMovieFiles` replaces the `updateMovieFiles` thunk on the import path; the thunk's `updateItem` calls wrote to `state.movieFiles.items`, which nothing reads — `MovieFileEditorTable` has taken its rows from `useMovieFile` for a while and only reads columns and sort from the slice — so an in-place metadata rewrite left the file table stale. It invalidates `/moviefile` instead. Verified live end to end against three planted files in an import folder: one `GET /manualimport` on open with no console errors, auto-selection of the two rows the server matched, sort by **Relative Path** and **Movie** in both directions with no refetch, a per-row movie pick sending one reprocess POST and flipping the cell, a bulk quality change sending one POST carrying each row's own `movieId`/`languages`/`path`, the import-mode guard refusing to import with **Choose Import Mode** selected, a real import moving the file into the library as movie file 37, *Manage Files* on a movie with an existing file hiding the **Movie** column and the import-mode select and sending `PUT /moviefile/bulk` with `{"id":37,"releaseGroup":"TESTGRP",…}` rather than a `ManualImport` command, the folder store's add/favourite/unfavourite/remove all round-tripping to `localStorage`, and `filterExistingFiles=true` reaching the first fetch from the prop and `false` on switching to **All Files**. **Adjacent finding, not fixed:** `ManualImportResource.QualityWeight` is never assigned — the mapper has it commented out — so it is always 0 and the **Quality** column's sort has never done anything. That is a server change and belongs in its own PR. |
| 2026-08-22 | #509 | **Collection — the last un-started Phase D domain, and the biggest.** `movieCollectionActions` (571 loc) is deleted, all **seven** connectors go, and the connector count drops 53 to **46** in one PR. `/collection` moves to React Query, the page's own state to a persisted `collectionOptionsStore`, and the filter/sort work to the shared `clientSideFilterAndSort` — the migrated equivalent of the `createClientSideCollectionSelector` this page was the last real user of. **Fixes two live bugs with one cause.** The page asked whether a collection's movie was in the library by looking it up in `state.movies.items`, and *nothing has populated that list since the movie index went paged* — Radarr still dispatches `fetchMovies()` from `useAppPage`, this fork does not, so `createAllMoviesSelector` has been reading `[]`. (1) Every movie in every collection rendered as **not in your library**: posters were `<button>` not `<a>`, clicking one you already owned opened the *Add Movie* modal, and no poster or label had a monitor toggle, progress bar or Downloaded/Missing status. Confirmed on a build of `eros-develop` against a collection whose movies the API reports `isExisting: true` for — 0 anchors and 0 progress bars there, 5 and 10 here. The API has said which movies exist all along (`CollectionMovieResource.isExisting`, set in `CollectionController.MapToResource`); the page reads that now, with one `POST /movie/list` fetching the library rows behind the existing ones for their id, monitored flag and file state. (2) The **Collection** label on movie details always read `Unknown` for the same reason; it asks `GET /collection?tmdbId=` now — one collection rather than the whole set — and shows the real title. `SignalRListener` stays the cache authority and the mutations were tuned against what the server actually broadcasts, not against a guess: `UpdateCollection` and `RemoveCollection` raise their events, so the single PUT and the DELETE add no invalidation of their own and now refetch **once** instead of twice; the bulk `PUT /collection` is the exception — `UpdateCollections` writes straight to the repository without raising `CollectionEditedEvent` — so it invalidates for itself, and the listener gained a small patch for the `/movie/list` cache so toggling a poster's monitor state updates in place rather than re-fetching the page's movies. `useDeleteMovieMutation` loses its last Redux read: it hand-patched the collection's missing count into the store, guessing the new value, and only did anything once the collections page had been visited — it invalidates `/collection` and lets the server recompute. Removed as unreachable, each verified: `clearMovieCollections` and `saveCollectionEditor` (no callers); `setMovieCollectionsOption` and the `options` state it wrote, which was never in `defaultState` and which the options modal spread back as `undefined` — all five inputs used `onChangeOverviewOption`; the persisted `movieCollections.defaults`, read by nothing; `Movie/Index/MovieCollectionLabel.tsx`, a byte-identical copy of the one in `Movie/` that nothing imported; `CollectionMovie`'s `EditMovieModal`, whose `onEditMoviePress` was never wired to an element and whose `onDeleteMoviePress` was `undefined`; `Collection.js`'s `view` state, since `getViewComponent` ignored it and always returned the overview; `styles.container` and `styles.checkInput`, neither of which exists in `CollectionOverview.css`; and `Measure`'s `whitelist` prop and Swiper's `loopFillGroupWithBlank`, neither accepted by the current versions. `isScrollingOptout` on the virtualized grid was **dropped rather than corrected** — the real prop is `isScrollingOptOut`, so the typo left it at its default and fixing the spelling would have changed behaviour. `Filters/Filter`'s `PropertyFilter.value` gains `number` and `boolean`, which `App/State/AppState`'s copy of the same type already allowed. Verified live throughout: sort by title and missing with the jump bar appearing and disappearing with the sort key, all three presets, the custom-filter builder's six rows with the **Genres** `optionsSelector` suggesting real genres, the options modal round-tripping to `localStorage`, select-all plus a bulk update sending `{"collectionIds":[...],"monitored":false,"monitorMovies":false}` and omitting the untouched keys, the edit modal saving `PUT /collection/236`, both monitor toggles, a movie deleted and re-added through the *Add Movie* modal with the poster flipping to a link and the missing count dropping to 0, and a collection deleted through the footer with `?deleteFiles=false&addImportExclusion=false`. |
| 2026-08-22 | #508 | **Performer add flow — the domain is done.** `addPerformerActions` is deleted and leaves `Store/Actions/index.js`, taking the slice count to **9**; nothing under `Performer/` dispatches or selects any more. The lookup becomes a `useApiQuery` on `/lookup/performer` keyed by a debounced term — React Query hands `fetchJson` an abort signal, so a superseded lookup is cancelled the way the thunk's module-level `abortCurrentRequest` did, without the module-level state; the 300 ms debounce is unchanged and clearing the box still empties results immediately rather than after the delay. **Existence marking keeps its separate `POST /performer/list`, deliberately.** That looks redundant beside the `isExisting` field `/lookup/performer` returns — but the field is *always false*: `SearchController.SearchPerformer` is the only one of the three lookups with no `MapToExisting*` pass, so nothing ever sets it. Confirmed against the running API before relying on the extra request; "simplifying" onto `isExisting` would have silently broken the **already in your library** indicator. `performerDefaults` becomes `addPerformerDefaultsStore`, replacing `persistState: ['addPerformer.performerDefaults']`. The modal now closes on the mutation's own success rather than by side effect: `isAdded` was set in the slice and read by nobody, and the modal closed only because the existence effect re-ran when `isAdding` went back to false, found the new performer and flipped the result to "already in your library", unmounting the modal — which also fired `POST /performer/list` **twice** per add. It now fires once, from the mutation's invalidation. `AddNewPerformerModal` takes the `Performer` rather than three of its fields, removing the by-`foreignId` lookup into slice items that `ADD_PERFORMER` did to rebuild an object the caller already had. Both hooks read `safeForWorkMode` from `SafeForWorkModeContext`. Two dead dispatches go with the thunk: `updateItem({section: 'performers'})`, whose slice was retired in #506, and `updateItem({section: 'addMovie'})`, which keyed a performer into the movie lookup list where no such id exists. `<Form>` now receives `validationErrors`/`validationWarnings` — field-level errors already worked here, unlike the edit modal in #506, because this hook passed the real `addError` to `selectSettings`, so this is parity with the studio and movie modals rather than a fix. Verified live end to end: one debounced lookup per term, existence marking, the clear button, defaults surviving a modal close and reaching the POST (`qualityProfileId` 4, `searchOnAdd` false on the created performer), a real `400` from ticking **Monitor Movies** on a performer with no TMDB link rendering inline under that field with the modal held open, and the add itself sending one `POST /performer` plus one `POST /performer/list`. Both test performers deleted afterwards. |
| 2026-08-22 | #507 | **Performer details.** `performerScenesActions` becomes `Performer/Details/performerScenesOptionsStore.ts`, the shape #503 gave studio details, and the slice leaves `Store/Actions/index.js`. **Fixes three defects in the works table, all from one cause: sort was tracked twice.** `PerformerDetails` held `sortKey`/`sortDirection` in local `useState` and passed them down, while `sortPress` *also* dispatched into the slice — so the slice was written, never read, and `persistState` saved a value nothing loaded. (1) The persisted sort was ignored: the page always opened on `releaseDate`/`descending`. (2) Re-sorting an already-sorted column wrote the **unchanged** direction to the slice — the table flipped because local state flipped independently, the stored value did not. (3) Sorting by a *new* column kept the current direction instead of starting ascending, because `PerformerDetailsYear` passed `direction ?? sortDirection` into `sortPress`, so its `if (!useDirection)` branch could never run. Verified against a build of `eros-develop`: clicking **Title** while descending sorted Z–A there and A–Z here; a second click left the store on `descending` there and flips it here; a reload with `title` stored opened on `releaseDate` there and on `title` here. The secondary title clause the slice declared but never applied is now real, via `lodash.orderBy`, matching studio. `bulkMonitorMovie` moves to `useBulkMonitorMovies` (added for studios in #503) and this was its only caller, so `BULK_MONITOR_MOVIE` leaves `movieActions` too; the wire format is unchanged — one `PATCH /movie/bulk/monitor?monitored=<bool>` with the bare id array. `SceneRow` is shared with studio details and now reads `safeForWorkMode` from `SafeForWorkModeContext` rather than a prop, which removes the last reason `StudioDetailsYear` took one, so it and the pass-down from `StudioDetails` go too. Dropped as dead: `secondarySortKey`/`secondarySortDirection` (never written), `sortPredicates` (the page sorts inline; its `status` clause also carried a stray `console.log`), `usePerformerScenesColumns`, and `PerformerDetailsYear`'s `bulkMonitorMovie` prop, which no caller passed. Verified live: sort from column headers in both directions and across a reload, column show/hide through the table-options modal, the year monitor toggle on the wire, the search button's no-monitored-movies guard, and the safe-for-work blur toggling `SceneRow-path` ↔ `SceneRow-blurred` through the context. |
| 2026-08-22 | #506 | **Performer edit modal, and the `performers` slice retired.** The last performer surface on the store: `EditPerformerModalContent` becomes a TSX function component owning its field state, `EditPerformerModal` a thin shell, and the save runs through a new `useSavePerformer`. With `setPerformerValue` and `savePerformer` gone the slice has no callers, so it leaves `Store/Actions/index.js` outright — the fourth slice retired whole, after `studios` in #502. **Fixes validation feedback, which never worked on this modal.** The hook destructured `saveError` from `state.performers` and passed *that* to `selectSettings`, but nothing has dispatched a performer save thunk since the mutation replaced it, so the slice's `saveError` is permanently `null`; the real error was returned to the caller under the same name one line apart and never reached `selectSettings`. Field-level failures were dropped, and form-level ones had nowhere to go anyway — the content rendered `<Form {...otherProps}>` and never received `validationErrors`/`validationWarnings`, so a failed save left the modal open with no message at all. Verified by stubbing a 400 against both builds: `eros-develop` shows nothing for either kind, this shows a matching failure under its field and an unmatched one as a form alert. Worth noting for later conversions: `selectSettings` **splices** each failure out of the form-level list into the field whose key matches, so the two are exclusive — the modal's only server rule (`MoviesMonitored` needs a TMDB link) maps to a field `useShowMovieMonitorToggleButton` hides in exactly the case that would fail, which is why the gap went unnoticed. `SpinnerButton` became `SpinnerErrorButton`, matching the studio and movie modals. Three computed-but-never-rendered props are gone — `overview`, `originalPath`, `isPathChanging`, plus `minimumAvailability` in the settings object: none of `overview`, `path` or `minimumAvailability` exist on `PerformerResource`, which is why the hook reached them through `as unknown as` casts that read `undefined` every time. `searchOnAdd` is real, so it joins the `Performer` type and its cast goes. `EditPerformerModalContentConnector.js` had **no importers** — the live path has been the hook since it was written — so it was deleted rather than converted, taking `createPerformerSelector` with it. Also dropped for reading the permanently empty slice: `state.performers.error` in `useAppPage` (always null, so it never gated a page) and the performers source in `createProfileInUseSelector`. `useSavePerformer` deliberately invalidates nothing, confirmed on the wire — saving from an index row sends one PUT and the refetch that follows is `SignalRListener`'s. |
| 2026-08-22 | #505 | **Performer bulk editing and both delete paths.** `performerActions` 210 loc to 76 — only `fetchPerformers`, `savePerformer` and `setPerformerValue` survive, all three held for the edit-modal conversion. The select footer and its tags modal move to the `useEditPerformersMutation` already sitting beside them, with a mutation each so the two buttons spin independently, as #501 did for studios. **Fixes the tags modal's Result preview:** it read the selection through `createAllPerformersSelector` → `state.performers.items`, which nothing populates, so the existing tags never rendered and **Remove**/**Replace** gave no sign of what they were about to take away. Confirmed against a build of `eros-develop`: same two performers, Result empty before, `test2` and `test` after. The modal now takes the index's own `items`, as the studio one does. Both delete paths lose their Redux hook — the bulk modal already kept its options in local state and its only tie was a `clearPendingChanges` dispatch against a section with no pending changes, while `useDeletePerformerModalContent` beside it had no importers at all; the per-performer modal moves to `useDeletePerformerMutation` and a small `performerDeleteOptionsStore`, mirroring `studioDeleteOptionsStore`. Verified the option semantics survive unchanged by driving both builds: `addImportExclusion` was session-scoped in the slice and still persists across a modal close, `deleteFiles` was always local and still resets. The footer's `SavePayload` omitted `moviesMonitored`, which `EditPerformersModalContent` does build — the modal types its callback as `object`, so the key was reaching the request all along and the interface was simply under-describing it; widened. Dropped as dead: `togglePerformerMonitored` (the React Query hook of the same name replaced it), `createAllPerformersSelector` and `createPerformerClientSideCollectionItemsSelector`. Verified live: tag add and remove round-tripped through the UI with the paged query invalidating into the reopened preview, a bulk quality-profile edit sending `{"performerIds":[5985],"qualityProfileId":3}` and restored the same way, and both delete modals opened, ticked and closed without firing a DELETE. |
| 2026-08-22 | #504 | **Performer index view options.** `performerActions` 675 loc to 210: view, sort, selected filter, columns, and the poster and table options move to `Performer/Index/performerIndexOptionsStore.ts`, the page number to the shared `usePage` store, and the preset filters and the eighteen filter-builder rows to their own modules. Same shape as #496, #498 and #500, so the index needed no new machinery. Sorting from a column header now resets to page one — it already did from the toolbar's sort menu, and the movie, scene and studio headers all reset, so performer's was the odd one out and sorting on page three left you on page three of a different ordering. `PerformerIndexRefreshPerformerButton` had the same `selectedFilterKey: string` lie #496 and #500 found, widened to `string | number`. Fourth domain to reach the empty-`sectionItems` pattern and the first where it never showed: `fetchPerformers` exists but is dispatched nowhere, so `state.performers.items` has always been `[]` — but unlike the studio **Network** row in #500, no performer row derives its options from the loaded items (status, gender, hair colour and ethnicity all build from fixed lists), so nothing looked wrong. Dropped as dead while trimming the slice: `setPerformerRefreshing` and its `refreshingPerformers` map (exported, dispatched nowhere, reducer never ran), `secondarySortKey`/`secondarySortDirection`, `sceneSortKey`/`sceneSortDirection`, and `sortPredicates`. Two controls survive the move still inert, flagged rather than changed: the table options' **Show Search** toggle (no performer row renders a search action, unlike the movie and scene rows) and the poster options' **Show Name** (`PerformerIndexPoster` never reads it). Verified live against 6,872 performers: paging first/prev/next/last across 275 pages, sort from menu and header, all four presets and a custom filter, view switch, column visibility, poster and table options, and the filter builder's value suggestions. |
| 2026-08-21 | #503 | **Studio details.** `studioScenesActions` becomes `Studio/Details/studioScenesOptionsStore.ts`, holding exactly what the slice persisted — sort key and direction, the nine columns, and the per-year `expandedState` map. The sort rule carries over unchanged (new column ascending, same column flips), because the hook computed the direction itself and the reducer's fallback never ran. Three things in the slice were never state: `secondarySortKey`/`secondarySortDirection` are constants nothing wrote; `sortPredicates` held one `gender` predicate copied from the performer table, and `gender` is neither a column here nor a field on `Movie`, so it could never be selected; and `tableOptions` was in `persistState` but absent from `defaultState`, this table having no pager. `expandedState` stays one map across all studios, as it was — the page rewrites it to the studio's own years on mount, so a year shared with the studio you came from opens already expanded. Flagged rather than changed. `bulkMonitorMovie` becomes `useBulkMonitorMovies`, taken once per direction because `monitored` is a query param and the body is the bare id array, the same shape as `useSaveMovie(moveFiles)`. **It invalidates nothing on purpose.** The first read of this was that the thunk left the page stale, since it wrote into the permanently empty `movies.items`; building `eros-develop` and driving it side by side disproved that — `SignalRListener` already patches every cached view of a changed movie, this page's works list included, and explicitly avoids a refetch. Adding an invalidation would have fought that design, so the conversion keeps the same division of labour. Also removed: a second copy of `useGeneralSettings` living in `useStudioDetails`, identical down to the action it dispatches, which `PageSidebar` was importing from the studio details module; `showMovieMonitorToggle`, dead since `StudioDetails` switched to `useShowMovieMonitorToggleButton`; `useStudioMoviesColumns`, no consumers; and `Studio/Details/SceneRow.tsx` with its stylesheet, none either — `StudioDetailsYear` renders the performer copy. Verified live: expand/collapse per year and from the toolbar, column visibility, sorting in both directions, and the year monitor toggle, each reading back from `whisparr-dev_studio_scenes_options` and surviving a reload. |
| 2026-08-21 | #502 | **Studio edit modal, and the `studios` slice.** The modal was the slice's last live consumer: it wrote every keystroke into `studios.pendingChanges` via `setStudioValue`, read them back through `selectSettings`, and cleared them with `clearPendingChanges` on close. The eight fields become `useState` on the content and the form resets by unmounting, which closing a `Modal` already does. `useSaveStudio` replaces the ad-hoc mutation the hook carried and invalidates `/studio/paged` and the cached `/studio/{foreignId}`, which the old one did not — saving from the index left the row on pre-save values. Save errors reach the UI for the first time: `selectSettings` was fed `studios.saveError`, unset since `saveStudio` stopped being dispatched, and the form-level failures never reached `<Form>` at all, because the old code spread `otherProps` there and that held only `studioId`, `isPathChanging` and `originalPath` — none of which `Form` reads. `overview`, `path` and `minimumAvailability` are not on `StudioResource` and never were, so the props plumbing them were inert; `afterDate`, `searchTitle` and `searchOnAdd` are real and move onto `Studio`, retiring the casts. With no importers left, `studioActions.js` goes, and with it three readers of a slice nothing populated: `state.studios.error` in `useAppPage` (always null — no fetch handler), the `state.studios.items` source in `createProfileInUseSelector` (always empty, so the studio half of the profile-in-use guard has never reported anything — it needs to come from the API, filed separately), and `hasExistingStudios` in `useAddNewStudio`, which had no consumers. `createStudioSelector.js` and `studioMoviesActions.js` had none either; the latter was not even registered in `Store/Actions/index.js`. The React Query row drops 67 → 66 because `useEditStudioModal.ts` was one of the files and its mutation moves into `useStudio.ts`, which already counted. Verified live: all three entry points (index poster, table row, studio details) render the eight fields, Cancel discards a dirtied form, and toggling *Search on Add* fires `PUT /studio/333` followed by the `/studio/paged` refetch, with the reopened modal showing the saved value. |
| 2026-08-21 | #501 | **Studio bulk editing.** `saveStudioEditor` becomes `useEditStudiosModalMutation`, taken twice so Edit and Set Tags spin independently as Movie's and Scene's do; `deleteStudio` becomes `useDeleteStudioMutation`; `studios.deleteOptions` becomes `studioDeleteOptionsStore`, shared by the per-studio and bulk modals as the one blob was. Not `createPersist` — unlike `movies.deleteOptions`, the studio slice never listed it in `persistState`, so it stays session-only. There is no bulk delete endpoint (`/studio/editor` is PUT only), so the multi-select modal still fires one DELETE per id, as the thunk loop did. Third domain to hit the same empty-`sectionItems` class of bug: the tags modal's Result section read `createAllStudiosSelector()` over the permanently empty `state.studios.items`, so the selection's existing tags never appeared; it takes the page's items now and the selector is deleted with its last consumer. `DeleteStudioModalConnector.js` had no importers at all — connectors 55 to 54. `StudioDetails` passed `onDeleteMoviePress` into `DeleteStudioModal`, which a `[key: string]: unknown` catch-all swallowed and the content never read. Verified live: Result lists the studio's existing tag, `PUT /studio/editor` fires from both buttons with only the pressed one spinning and `/studio/paged` invalidated, both delete modals render real titles and warnings, and ticking the exclusion in one reads back checked in the other. |
| 2026-08-21 | #500 | **Studio index view options.** `studioActions` 509 loc to 196: view, sort, selected filter, columns, poster and table options move to `Studio/Index/studioIndexOptionsStore.ts`, the page number to the shared `usePage` store, and the preset filters and filter-builder rows to their own modules. Same shape as #496 and #498, so the Studio index needed no new machinery. Fixes the same empty-`sectionItems` bug those two found: the filter builder's **Network** row builds its suggestions from `state.studios.items`, and — exactly as with `movies` — `studioActions` has no fetch handler, so that array has been `[]` since the index went paged. Verified live: Network now lists the 15 distinct networks on the current page. Also drops the third copy of `useGeneralSettings`; the `showMovieMonitorToggle` it fed in `useStudioIndex` was returned but never read, and `StudioIndexRow` computes its own. `StudioIndexRefreshStudioButton` had the same `selectedFilterKey: string` lie #496 found on the Movie buttons, widened to `string | number`. |
| 2026-08-21 | #499 | **Scene editing.** The last dispatching code under `Scene/`: the select footer's `saveMovieEditor` becomes a second `useEditScenesModalMutation`, so Edit and Set Tags spin independently as Movie's do; the tags and organize modals take the page's items instead of `createAllScenesSelector`, which is deleted; and `DeleteSceneModalContentConnector.js` is rewritten as `Scene/Delete/DeleteSceneModalContent.tsx`. That connector was broken in two ways at once — it looked the scene up with `createMovieSelector()`, which keys on a `movieId` prop the modal never passed, and that selector reads the `state.movies.items` array nothing has filled since the index went paged. It rendered `Delete - {0}`, an empty path and two raw translation keys. Organize had the same cause and said "0 selected movie(s)" while the footer said one was selected. Scene now shares `movie_delete_options` with the movie modal, closing the split brain above. Orphaned by the connector's removal and deleted with it: `deleteMovie`, `saveMovieEditor`, `setDeleteOption` and the persisted `movies.deleteOptions` blob. Connectors 56 to 55 — the first Phase D PR to move that number. Ten translation keys the touched files ask for by name were never in `en.json`, including the two `DeleteMoviesModalHeader`/`DeleteMoviesModalWarning` flagged in #497, so they are added here rather than left rendering as keys. Verified live: the per-scene modal now shows the real title, path and `1 scene files totaling 1.4 GiB`; organize lists the selected title and counts 1; the tags modal shows the scene's existing tag and `PUT /movie/editor` fires with only Set Tags spinning; ticking *Add List Exclusion* in the scene modal reads back checked in the movie one. |
| 2026-08-21 | #498 | **Scene index view options.** `sceneIndexActions` (352 loc) retired for `Scene/Index/sceneIndexOptionsStore.ts`, the same shape #496 gave Movie: three pass-through `select*Options.ts` selectors deleted, `filterBuilderProps` lifted into `sceneIndexFilterBuilderProps.ts` (Scene's list is not Movie's — no release-group or studio rows, and `genres` is a plain string match), page number onto `usePage('sceneIndex')`. Slices 15 to 14. `SceneIndexFilterModal` also drops `state.movies.items` for the paged query, though unlike Movie that changes nothing observable: no Scene filter row declares an `optionsSelector`, and `FilterBuilderRowValueConnector` returns an empty list without one — the file says so rather than claiming a fix. Closes Whisparr/Whisparr#1134, both halves; the show-\* half turned out to be a landscape-poster layout fault rather than a state one, so it is its own commit — see the resolved thread above. Verified live: sort toggles direction on a repeat press and refetches once, `Wanted` sends its three predicates, poster `Show Title` persists and adds 25 titles, Overview page size 10 issues `pageSize: 10` where it previously issued nothing, opening the filter modal adds no request, and the Movie index is untouched. Scene view options reset to defaults once on upgrade, as Movie's did — the redux-persist blob is abandoned, not migrated. |
| 2026-08-21 | #497 | **Movie editing.** `movieActions` loses `saveMovie`, `bulkDeleteMovie`, `setMovieValue` and the `filters` preset list; the first three had no dispatchers left and the list is a static definition, now `Movie/Index/movieIndexFilters.ts` (Scene imports it too — both indexes filter the same `/movie` resource). `deleteMovie` and `setDeleteOption` are replaced for Movie by `Movie/Delete/useDeleteMovieMutation.ts` and `Movie/movieDeleteOptionsStore.ts`, and the select footer's tags button drops `saveMovieEditor` for a second `useEditMoviesModalMutation` instance, so Edit and Set Tags spin independently instead of sharing one slice-level `isSaving`. `MovieIndexFilterModal` takes `sectionItems` from the paged query — see above, it was an empty array. Two dead hooks (`useEditMovieModal`, `useDeleteMovieModal`) and the orphan `movieTitlesActions.js` deleted. The delete mutation still dispatches one `updateItem` because the collection missing-count it nudges is Redux with no query to invalidate. Verified live: `DELETE /movie/33178?deleteFiles=false&addImportExclusion=true` matches the thunk's query params byte for byte, the checkbox survives a reload under `whisparr-dev_movie_delete_options`, `PUT /movie/editor {"movieIds":[33178],"tags":[],"applyTags":"add"}` matches `saveMovieEditor`, only the Set Tags button spins while it is in flight, and the Scene index and its preset filters still render off the lifted module. |
| 2026-08-21 | #496 | **Movie index view options.** `movieIndexActions` (391 loc) retired for `Movie/Index/movieIndexOptionsStore.ts`; the three pass-through `select*Options.ts` selectors deleted; `filterBuilderProps` lifted out of slice state into `movieIndexFilterBuilderProps.ts`, since they are static definitions rather than user state. Page number moves to `usePage('movieIndex')`, which is where the sort/filter/view resets now land — the reducers they replace each reset it. `MovieIndexFilterModal` converts halfway: its `sectionItems` still reads the movies slice and goes with `movieActions`. Verified live: view and sort persist across a reload, filter and sort each refetch once, the table renders 20 rows against `tableOptions.pageSize`, and the initial load fires exactly one `/movie/paged`. |
| 2026-08-20 | #490 | **Provider options + captcha.** `providerOptionActions`, `captchaActions`, `oAuthActions` and their three `AppState` files deleted for `Settings/useProviderOptions.ts`, `Components/Form/useCaptcha.ts` and `OAuth/useOAuth.ts`. `useProviderOptions` does not use `useApiQuery`: that helper keys a POST on the whole body, and the body here is the entire provider form, so every keystroke would be a new cache entry and a new request. It keys on `baseUrl`/`apiPath`/`apiKey`/`authToken` instead, which is what the old slice's `lastActions` de-duplication was approximating — measured, typing in *Name* now fires nothing where the four important fields fire one request each. Two deliberate departures from Sonarr's commits. Sonarr's `DeviceInput` rewrite reads the options as `{value, name}`, but the backend projects `{id, name}` in both apps, so this keeps `.id` — with `.value` the selected device renders as *Unknown (…)*, verified against a stubbed response. And `OAuthInput` keeps dispatching `set({section, saveError})`: Sonarr routes that through a `FormInputGroupContext` Eros does not have, and without it the pop-up-blocked message stops reaching the field. Converting `CaptchaInput` also fixes it — `refreshing`, `siteKey` and `secretToken` were declared as props and never passed by anything, so the ReCAPTCHA widget could not render; no provider in this build declares a `captcha` field, so that path is types-and-lint only. |
| 2026-08-20 | #494 | **App shell, part 3, and the end of Phase C.** `Settings/advancedSettingsStore` replaces `state.settings.advancedSettings`, its toggle action and its reducer, carved out of `settingsActions` ahead of Phase E. Eleven `connect()` components read the flag, so it is injected by a single `withAdvancedSettings` HOC in the shape of `withScrollPosition`, leaving the wrapped components untouched. `useShowAdvancedSettings` keeps its path and now re-exports from the store, so its five TSX importers did not change. Verified live: the toggle expands General from 18 form groups to 38 and Media Management from 7 to 30, adds the Megabytes Per Minute column to Quality Definitions, survives a reload through `createPersist`, and through the HOC adds exactly the two fields the API marks advanced on Kodi. |
| 2026-08-20 | #493 | **App shell, part 2.** `App/useTranslations` replaces the `fetchTranslations` thunk; `appActions` and the `app` slice are deleted and `AppState` loses its last app member. Slices 17 to 16. Two things made this less mechanical than it looks, both of them silent failures — the response is PascalCase where Sonarr's is camelCase, and it double-encodes under `fetchJson`'s Accept header. See above. The strings are written from inside the query function rather than an effect so they are in place before the render that unblocks the app. Verified live: translated labels render, holding the request open keeps the app on the loading page with no raw-key frame, and a 500 puts the message on `ErrorPage`. |
| 2026-08-20 | #492 | **App shell, part 1.** `App/appStore.ts` and `App/messagesStore.ts` take dimensions, connection state, version, sidebar visibility and messages; `createDimensionsSelector.ts` and `MessagesAppState.ts` are deleted and `appActions` is down to translations. 33 files. Six `connect()` components could not call a hook, so they take `isSmallScreen` as an own prop from a small wrapper — see above. The SignalR listener loses its last six `dispatch` calls that were not blocked by another phase. Verified live: resizing across 768px adds and removes the sidebar's inline transform, the toggle moves it between 0 and -210px, a `command` push renders a message that clears itself after its `hideAfter`, and a `version` push opens the Whisparr Updated modal. |
| 2026-08-20 | #491 | **SignalR.** The row assumed a `SignalRConnector.js` that Phase B had already replaced. What was actually left was two handlers dispatching into a slice that no longer exists — `wanted/cutoff` and `wanted/missing` still wrote to `wanted.cutoffUnmet`/`wanted.missing`, retired in #475 — plus `pagePopulator`, whose emit side had gone missing entirely. The wanted handlers now patch the paged cache through `updatePagedItem`, ported from Sonarr. `pagePopulator` was not restored but retired: all seven React Query registrants came out in favour of invalidating their query keys from the listener, and reconnect now invalidates the whole cache rather than four hand-picked keys. It survives, reasons removed, for Import List Exclusions alone, which still fetches through a redux thunk. The nine remaining dispatches cannot move here: five settings sections and `qualitydefinition` need Phase E's query hooks, `collection` needs Phase D, and `setVersion` plus the five `setAppValue` calls need the app shell. |
| 2026-08-20 | #489 | **Paths + file browser.** `pathActions`, `PathsAppState` and `createPathsSelector` deleted; `PathInput` and `FileBrowserModalContent` finished onto the `usePaths` query that had been sitting unused since Phase A. The slice was a single shared listing that every path input on the page wrote to and read from; each component now owns a `currentPath` and the query follows it, which is why `PathInputInternal`'s Tab-complete and suggestion handlers had to stop calling their own dispatch and go through the `onFetchPaths` prop — inside the browser modal that prop is what moves the modal's path. Dropped `usePaths`' `enabled: path.trim().length > 0` guard, following Sonarr's own follow-up: the browser opens on an empty path and the endpoint answers that with the root listing, so the guard left the modal blank whenever the field it was opened from was empty. Costs one `GET /filesystem` on mount per page carrying a path field — Media Management and General, one each, both behind *Show Advanced*. |
| 2026-08-20 | #488 | **Root folders.** `RootFolder/useRootFolders.ts` replaces `rootFolderActions`, `createRootFoldersSelector` and `RootFolderAppState`. Eight components dispatched `fetchRootFolders()` purely to prime the slice for a select they might never mount; the query fetches when `RootFolderSelectInput` actually mounts, so those effects are gone rather than rewritten. Whisparr has a `refresh` mutation Sonarr does not — it rescans one folder and returns it, so `useRefreshRootFolder` takes the id in the payload and writes the result into both the list and the by-id cache. `ImportMovie` read a single folder out of the list via a by-id fetch that `updateItem` merged back in; it now reads `/rootFolder/{id}` directly, and drops the `timeout`/`getMovieFolder` query params, which `GetResourceById` never bound. Add and delete write the cache; the server broadcasts `rootfolder` on create but **not** on delete, verified over the websocket, so the delete's cache write is what removes the row — same as the slice's remove handler. |
| 2026-08-20 | #486 | **Commands.** `useCommands` and friends replace `commandActions` and its three selectors across 58 files; SignalR now writes the command cache instead of dispatching. Two behaviours changed on purpose, both following Sonarr: the per-command five-minute removal timer is gone in favour of a five-minute `refetchInterval`, and the `commands.handlers` table went with it — it was initialised, read once in `FINISH_COMMAND`, and never written to by anything. Toasts still dispatch `showMessage` to the redux app slice; commands are its only producer, and it converts with the rest of the app shell. |
| 2026-08-20 | #485 | **React Query client defaults.** `staleTime: 60s` and `retry: 1` on `queryClient`, closing Whisparr/Whisparr#1132. Not a conversion — it changes behaviour for every already-converted page, which is why it rode alone. Measured before and after over four flows: 46–48 requests became 28–30. Verified push still drives updates: an external API mutation refetched `/movie/paged` unprompted on an idle page. Turned up a separate redux bug on the way — `useShowMovieMonitorToggleButton` dispatches `fetchGeneralSettings()` from a per-row mount effect, so `/config/host` fires once per table row. |
| 2026-08-20 | #484 | **Custom filters, part 2 of 2 — reads.** `useCustomFilters`/`useCustomFiltersList` queries; all 19 `createCustomFiltersSelector` call sites swept across 8 filter domains; `customFilterActions` and `CustomFiltersAppState` deleted. `useAppPage` now gates on the query, which is what keeps a persisted filter from flashing the unfiltered list on reload. `createClientSideCollectionSelector` takes custom filters as an own prop. Also: `staleTime: Infinity` (the default 0 cost one extra GET per navigation), six vestigial `<section>.customFilters` persist paths removed, and `AppState`'s duplicate `CustomFilter` type now re-exports the canonical one. |
| 2026-08-20 | #483 | **Custom filters, part 1 of 2 — mutations.** Save and delete onto `useApiMutation`; `FilterBuilderModalContentConnector` and `CustomFiltersModalContentConnector` retired, both modal contents to TSX. Reads stay on redux, so the mutations apply their own response to the slice rather than refetching. Two latent bugs fixed on the way: the manage modal's sort was a no-op, and its `Alert` took a prop the component does not have. |
| 2026-08-20 | #481 | **Calendar.** `calendarActions` and `CalendarAppState` deleted; Phase B complete. Options and view to a persisted zustand store, the visible range to a second non-persisted one, `/calendar` to `useApiQuery`. Two fixes ride along, both in code the conversion rewrites: `executeCommandHelper` never returned the created command, which had left *Search for Missing* throwing and its spinner dead; and the view switch no longer resets to today (Whisparr/Whisparr#1131), matching what Sonarr's own conversion did. |
| 2026-08-19 | #478 | **History.** `historyActions`, `movieHistoryActions`, `movieBlocklistActions`, `HistoryAppState` and `MovieBlocklistAppState` deleted, plus two dead `HistoryDetailsConnector` files. The page was already a hybrid — React Query fetched, Redux still held the options — so this is mostly the options store plus the two per-movie reads the interactive search needs. |
| 2026-08-19 | #477 | **Blocklist.** `blocklistActions` and `BlocklistAppState` deleted. Also fixes `fetchJson` on empty 200 bodies, without which the per-row delete does not invalidate — see §10. `movieBlocklistActions` deferred to History; it shares a selector with `movieHistory`. |
| 2026-08-19 | #476 | **Queue custom filters.** Regression fix, not a conversion: #474 resolved the filter key against the built-ins only, so selecting a custom filter stored the key and changed nothing on the wire. |
| 2026-08-18 | #475 | **Wanted: Missing + Cutoff Unmet.** `wantedActions` and `WantedAppState` deleted; both pages onto `usePagedApiQuery` with one options store each. Batch monitor-toggle becomes a `/movie/editor` mutation, which retires `createBatchToggleMovieMonitoredHandler` and the `isSaving` row flag. |
| 2026-08-18 | #474 | **Queue, part 3 of 3 — paged.** `queueActions` and `QueueAppState` deleted. Options to zustand, page to `usePagedApiQuery`, grab/remove to `useApiMutation`. The `isQueuePopulated` ref from #470 goes: React Query only refetches observed queries. |
| 2026-08-18 | #473 | **Queue, part 2 of 3 — details.** Three selectors and nine fetch/clear dispatch sites replaced by one shared query. Collapsed rather than ported to Sonarr's context provider, because our endpoint takes no filter. |
| 2026-08-18 | #472 | **Queue, part 1 of 3 — status.** Sidebar badge onto React Query; `queue/status` SignalR handler onto `setQueryData`; the reconnect refetch moves from the component into `handleReconnected`. |

### Open threads

- **The Movie filter picker downloads the library** — `useAllMovies` asks `GET /movie` for
  full `MovieResource`s and reads two fields off each. On this instance that is 16,917
  records, 46MB of JSON and 19.7MB on the wire for a list of titles. It is only fetched
  when a filter row picks the **Movie** field, and it is a strict improvement on the empty
  list it replaces, but the right fix is a projection endpoint returning id and title — the
  same shape `GET /movie/list` already has for ids alone. Backend plus a one-line hook
  change, and its own PR. Until then the hook carries a five-minute stale time and is
  excluded from SignalR invalidation, both for the same reason.
- **"Quality profile in use" only checks import lists** — `createProfileInUseSelector` asked
  the `movies` slice whether any movie used the profile, and that slice has been empty since
  the indexes went paged, so the movie half of the answer has been inert for some time; #515
  dropped the dead term rather than leave it reading a retired slice. Deleting a profile that
  movies use is still guarded server-side, so this only affects whether the modal warns
  first. Answering it client-side would mean the same whole-library fetch as the thread
  above; a `GET /qualityprofile/{id}/inuse` is the better shape. **Still open after #520**,
  which was where §7 put it: the selector became `useQualityProfileInUse` and kept the
  import-list half verbatim, because Sonarr's version of that hook answers the other half by
  fetching every series. The server refuses the delete on movies, performers, studios,
  import lists or the fallback flag, so the endpoint would want to return all five counts;
  it is a backend PR, not a frontend one. **Filed as
  [Whisparr/Whisparr#1138](https://github.com/Whisparr/Whisparr/issues/1138)** — deferred
  rather than dropped, and the divergence from Sonarr is deliberate: their hook fetches
  every series, which here is the 46MB library read.

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
  has e.g. `blocklist` in its persisted blob. #494 added `settings.advancedSettings` to the
  list of keys this applies to. `createStore` then logs
  `Unexpected key "blocklist" found in preloadedState`. Cosmetic — redux drops the key —
  but it fires once per retired slice per user, and every conversion so far has added one.
  #512 adds `movieFiles`, whose `persistState` carried three keys, and it was the warning
  observed on every page load during that PR's verification. #515 does *not* add one:
  `movieActions` declared no `persistState`, so retiring the `movies` slice leaves nothing
  behind in the blob.
  `Store/Migrators/migrate.js` is where a sweep would go, and it wants doing once at the
  end rather than per-PR.
- ~~**Whisparr/Whisparr#1132**~~ — **Fixed, #485.** `App/queryClient.ts` built the client
  with no defaults, so `staleTime` was 0 and every observer that mounted after the first
  refetched. Measured on
  `eros-develop` before Calendar was touched: `/queue/details` ×2 and `/movie/stats` ×2 on
  the calendar, `/queue/details` ×3 on `/scenes`, `/system/status` ×2 everywhere. #481 adds
  `/calendar` to that list — 9 requests against the thunk's 6 over the same six-step
  session — because the page gates its body on a measurement and so mounts consumers in two
  commits. Every precondition is present in Sonarr's `v5-develop` unchanged — same bare
  `new QueryClient()`, same `isMeasured` gate, same first-commit `useCalendar()` in the
  toolbar, same per-day-cell `useCalendar()` — so this is upstream's shape, not an Eros
  divergence. The fix is a client default; it changes behaviour for every converted page
  and should not ride along in a page conversion — so it went out alone as #485,
  `staleTime: 60s` plus `retry: 1`. A minute of staleness is safe because freshness here
  is push-driven: `invalidateQueries` is not gated by `staleTime`, `refetchOnWindowFocus`
  stays on, and nothing in the tree sets `refetchInterval`. Measured over four flows,
  46–48 requests became 28–30 — navigating six index pages went 14 to 4, and paging back
  to an already-fetched page went 8–10 to 2.
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
  differ in how strictly `type` and `value` are typed. 15 files import from the former.
  This was filed to be collapsed "with the custom filters work in Phase C"; that work
  landed in #483/#484 and did not touch it, and `History.tsx` has since lost the cast and
  TODO that made it visible. It now wants doing on its own, or with the first domain that
  trips over it — the index filter modals in Phase D are the likely candidate.
- ~~**Two live "toggle movie monitored" implementations** — the React Query hook serves
  movie/scene details and the studio and performer scene rows; the Collection overview
  connectors still dispatch the redux thunk. They do not share cache invalidation.
  Resolves when Collection converts in Phase D.~~ **Resolved, #509** — the Collection
  posters and labels use `useToggleMovieMonitored`, and `SignalRListener` patches the
  `/movie/list` cache they read so the toggle lands in place.
- **`getErrorMessage(error as Error)` in `AddNewPerformer.tsx`** — the cast is harmless
  today because the value is redux-sourced, but it will silently lie once that page moves
  to React Query and the value becomes an `ApiError`. Remove the cast then.
- **The queue Movie filter mixes scenes and movies** — `MovieFilterBuilderRowValue` lists
  every record in the movie table by title, with no `itemType` distinction, so the queue's
  `movieIds` filter cannot tell a scene from a movie. Shared filter-builder plumbing backed
  by `state.movies`, so it was filed against Phase C — but custom filters converted without
  touching `MovieFilterBuilderRowValue`, which still reads the movies slice. It moves with
  Movie in Phase D. Carried over unchanged by #474.
- **Whisparr/Whisparr#1134 — the Scenes Overview view ignores its own options.**
  ~~Open.~~ **Both halves fixed in #498.** The two faults were unrelated to each other and
  only one was in the state layer:
  - *Page Size* — `useSceneIndex.ts` derived the page size with
    `if (view === 'posters') … else tableOptions.pageSize`, with no `overview` branch, so
    the Overview view paged at the **table** size. Both index hooks were written in the same
    commit ([eb4bcd11d1](https://github.com/Whisparr/Whisparr-Eros/commit/eb4bcd11d1),
    "Movie and Scene index pagination"), Movie's as a three-way `switch` and Scene's as an
    inline two-way `if` — the overview case was never there, so Movie's is the reference
    implementation rather than merely the newer one. Porting its shape fixed it.
  - *The show-\* toggles were applied all along; the rows had nowhere to go.* The suspicion
    recorded here — the `maxRows` cap in `SceneIndexOverviewInfo` — was right, and the cause
    is upstream of it. `SceneIndexOverviews` derives the row height from the poster alone,
    and scene posters are **landscape**: 111px at the default medium size, leaving 74px after
    the 42px title row, which is two 25px rows' worth. Movie's posters are portrait and about
    twice as tall, so the identical code is not visibly broken there — the fault only ever
    looked Scene-specific because of an aspect ratio. The row now reserves whichever is
    taller, the poster or the title plus the rows the options ask for. A second, smaller bug
    sat underneath: `shownRows` started at 1 while the cap compares `>= maxRows`, so one row
    that fitted was always dropped.
  - Measured on the running instance: at the default medium size three rows render where one
    did, and enabling all six grows the row 116px → 197px and renders all six. With only
    *Monitored* on the row stays at 116px, so the reservation never pads past the poster.
- **More translation keys are missing than #499 added.** The five the filter builder asks
  for — `Movie`, `Scene`, `Studio`, `Performer`, `Tag` — still log as missing on every
  scenes page load and render as the raw key. Not in #499's surface, so left alone. Separately,
  the count-bearing label reads "Delete 1 Scene Files"; that is parity with Movie's
  `DeleteMovieFiles` rather than a new fault, and both want a plural-aware pass.
- **Unmapped Files fetches an unbounded list** — `GET /moviefile?unmapped=true` returns a
  plain `List<MovieFileResource>`, so the page is the only one in the app that pages
  client-side, and the only consumer of `VirtualTable`. Paging the endpoint would delete
  `VirtualTable` outright and align the page with every other list. **#512 left this
  alone deliberately**: it is a backend change plus a class→function conversion of
  `UnmappedFilesTable`, and folding either into a slice retirement would have made the
  three delete fixes unreviewable. It is now the only thing keeping
  `UnmappedFilesTableConnector` a separate file — the connector holds no redux after #512
  and exists solely because the table below it is still a class. See the `VirtualTable`
  note above.
- **`FileEditModal` never sends `isRepack`** — the modal offers Proper and Real only, so
  the revision it builds omits `isRepack` and `SetPropertiesBulk` overwrites `Quality`
  wholesale. Editing anything about a repacked file silently demotes it to a plain proper.
  Radarr's modal has the same shape, so #512 preserved it verbatim — sending the same
  `false` the server was already binding — rather than change behaviour inside a
  conversion. The fix is either a third checkbox or carrying the file's existing
  `isRepack` through.
- **Toggling a performer's monitored state from the credits row does not redraw it** —
  `useTogglePerformerMonitored` does not invalidate `/credit`, so the poster's icon keeps
  its old state until the page is reloaded. The write itself lands: verified in #512 that
  the `PUT /performer/29` goes out and `GET /credit` reports the new value afterwards.
  Pre-existing and unchanged by #512, which only moved where the hook is called from.
  One `invalidateQueries` in the Performer hook fixes it.
- ~~**Unmapped Files' delete state is inert**~~ — **Fixed, #512, and it was worse than
  recorded.** The hardcoded `isDeleting = false` was real, but underneath it *neither*
  delete worked at all: both call sites passed bare values to thunks that destructure
  `{ id }` and `{ movieFileIds }`, so the single delete requested
  `DELETE /movieFile/undefined` (404) and the bulk one sent `{}` (400). Dead since the
  page's TypeScript conversion in #34. Both are mutations now, with a real `isPending` and
  the error passed through so a failed delete keeps the selection.
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
