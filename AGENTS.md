# Whisparr — repo map for agents & contributors

This file is an **architecture map**: where things live and where new code goes.
It deliberately does **not** restate conventions that are documented elsewhere —
see [Conventions live elsewhere](#conventions-live-elsewhere) for those.

`CLAUDE.md` is a symlink to this file.

## What this is

Whisparr is a Servarr-family PVR — an adult movie/scene collection manager — and
a **fork of Radarr**, which is why backend folders are named `NzbDrone.*`
(inherited Sonarr/Radarr lineage). It's a **C# .NET 10** backend plus a
**React 19 / Redux** frontend, bundled into a single application served over
ASP.NET Core with SignalR for live updates and SQLite/PostgreSQL (via Dapper)
for storage.

- Repo: `Whisparr/Whisparr-Eros`. Default / PR-target branch: **`eros-develop`**
  (never `eros`).
- Issues for both `Whisparr/Whisparr` and `Whisparr/Whisparr-Eros` are tracked
  on `Whisparr/Whisparr` — link fixes as `Fixes whisparr/whisparr#NNNN`.

## The naming quirk (read this first)

Folders under `src/` keep the legacy `NzbDrone.*` prefix, but the csproj,
assemblies, and (in newer projects) namespaces map to `Whisparr.*`. When you
search, the folder and the assembly name often differ:

| Folder (`src/…`)     | Assembly / project   | Responsibility                          |
| -------------------- | -------------------- | --------------------------------------- |
| `NzbDrone.Core`      | `Whisparr.Core`      | All business logic (~40 domain areas)   |
| `Whisparr.Api.V3`    | `Whisparr.Api.V3`    | REST API — controllers + resource DTOs  |
| `Whisparr.Http`      | `Whisparr.Http`      | HTTP framework, base controllers, REST/ |
| `NzbDrone.SignalR`   | `Whisparr.SignalR`   | Real-time push to the UI                |
| `NzbDrone.Host`      | `Whisparr.Host`      | Bootstrap, startup, DI wiring           |
| `NzbDrone.Common`    | `Whisparr.Common`    | Cross-cutting infra (DI, disk, http, …) |
| `NzbDrone` / `.Console` | `Whisparr` / `.Console` | Executable entry points            |
| `NzbDrone.Mono` / `.Windows` | `Whisparr.Mono` / `.Windows` | Platform-specific impls     |
| `NzbDrone.Update`    | `Whisparr.Update`    | Self-updater                            |

Test projects follow the same rule: `NzbDrone.Core.Test` →
`Whisparr.Core.Test`, etc.

## Top-level layout

- `src/` — **all** C# source and test projects. Solution: `src/Whisparr.sln`;
  shared MSBuild config: `src/Directory.Build.props` / `.targets` (output paths,
  warnings-as-errors, multi-RID).
- `frontend/` — React/Redux SPA; Webpack 5 + Babel + `ts-loader`
  (`frontend/build/webpack.config.js`). Mixed JSX + TypeScript (migration in
  progress), CSS Modules via PostCSS.
- `.github/workflows/` — CI (`build_v3.yml` main build, `sonarqube.yml`,
  `deploy.yml`, `api_docs.yml`).
- `distribution/` — packaging assets (Debian, Docker). `schemas/`, `scripts/`,
  `Logo/` — supporting assets.
- `_output/` / `_tests/` / `_temp/` — **build artifacts, not source.** `en.json`
  and other files appear here as copies; the source-of-truth is under `src/`.

## Where things go (the cheat-sheet)

Each item names a representative path — follow the existing neighbors.

- **DB migration** → a `[Migration(N)]` class deriving `NzbDroneMigrationBase`,
  overriding `MainDbUpgrade()`, in `src/NzbDrone.Core/Datastore/Migration/`
  (FluentMigrator). File naming: `NNN_snake_case_description.cs`. Numbers are
  **non-contiguous** — high 200s are inherited Radarr history, Whisparr-specific
  ones sit in the 000–025 range; use the next free number. Migrations are
  auto-discovered and run in order.
- **Command / event** → `src/NzbDrone.Core/Messaging/`. Commands derive
  `Command`, executed by an `IExecute<TCommand>` handler; events implement
  `IEvent`, handled by `IHandle<TEvent>` / `IHandleAsync<TEvent>` via
  `EventAggregator`. No manual subscription.
- **DI registration** → usually **none needed.** DryIoc scans assemblies
  (`WithNzbDroneRules()` + `AutoAddServices`) and auto-wires interfaces
  (singleton) to implementations. Just define the interface + class. Entry
  point: `src/NzbDrone.Host/Bootstrap.cs`.
- **New provider** (indexer / download client / notification / import list /
  metadata source) → the **ThingiProvider** pattern in
  `src/NzbDrone.Core/ThingiProvider/`. Add a subfolder, subclass the type's
  `*Base<TSettings>`, and add a `*Settings` config-contract class. The factory
  and provider controller expose it automatically. Canonical full example:
  `src/NzbDrone.Core/Indexers/Newznab/`. Type roots: `Indexers/`,
  `Download/` (+ `Download/Clients/`), `Notifications/`, `ImportLists/`,
  `MetadataSource/`.
- **New API surface** → a `*Controller : RestControllerWithSignalR<TResource,
  TModel>` under `src/Whisparr.Api.V3/`, decorated `[V3ApiController]`, with a
  paired `*Resource` DTO carrying static `MapToResource` / `ToModel` mappers.
  Base classes and routing live in `src/Whisparr.Http/REST/`. Controllers often
  also implement `IHandle<…Event>` to push SignalR updates. The OpenAPI spec is
  generated from these controllers at runtime and served at `/docs`; there is no
  checked-in copy to update.
- **Parser change** → `src/NzbDrone.Core/Parser/` (`Parser.cs`,
  `QualityParser.cs`, `LanguageParser.cs`, `ReleaseGroupParser.cs`,
  `ParsingService.cs`). **This is the most test-guarded area in the repo.** Any
  change must add/adjust `[TestCase(...)]` rows in
  `src/NzbDrone.Core.Test/ParserTests/` (`ParserFixture.cs`,
  `ParseMovieTitleFixture.cs`, `QualityParserFixture.cs`, `StudioFixture.cs`,
  …) covering the specific tokens touched. A parser change with no new parser
  case is a defect, not a nit.
- **User-facing string** → add a key to
  `src/NzbDrone.Core/Localization/Core/en.json` (flat, `PascalCase`,
  alphabetical; `{placeholder}` interpolation). Backend:
  `_localizationService.GetLocalizedString("Key")`. Frontend:
  `translate('Key')`. Do **not** hand-edit other languages — Weblate owns them;
  log-message translations aren't accepted.

## Tests

- NUnit, `[TestFixture]` classes named `*Fixture.cs`, in the sibling
  `NzbDrone.*.Test` project mirroring the source tree.
- Base classes: `TestBase` / `TestBase<TSubject>`
  (`src/NzbDrone.Test.Common/TestBase.cs`) → `CoreTest` / `CoreTest<TSubject>`
  and `DbTest` (`src/NzbDrone.Core.Test/Framework/`). Auto-mocking `Mocker` /
  `Subject`; Moq (AutoMoq) + FluentAssertions + NBuilder.
- **80% coverage on new backend code** (enforced on PRs).
- `NzbDrone.Integration.Test` and `NzbDrone.Automation.Test` (Selenium) are
  separate projects / test categories.
- Targeted run (excluding heavy categories):
  ```
  dotnet test src/NzbDrone.Core.Test/Whisparr.Core.Test.csproj \
    --filter "FullyQualifiedName~ParserTests&TestCategory!=IntegrationTest&TestCategory!=AutomationTest&TestCategory!=ManualTest"
  ```

## Build & run

- Frontend: `yarn install`, then `yarn start` (watch) or `yarn build`. Node 22
  + Yarn via `corepack enable`.
- Backend: `dotnet msbuild -restore src/Whisparr.sln -p:Configuration=Debug -p:Platform=Posix -t:PublishAllRids`
  (or `Platform=Windows`), or the orchestrator `build.sh`. Output in `_output/`;
  app runs at `http://localhost:6969`.
- .NET SDK is pinned in `global.json` (10.0.x). API docs are served at `/docs`.

## Conventions live elsewhere

This map covers *structure*. The rules are already documented — don't duplicate,
consult:

- **`CONTRIBUTING.md`** — dev setup, branch/PR rules (PR only to `eros-develop`,
  rebase not merge, meaningful feature-branch names, one fix per PR), commit
  prefixes (`New:` / `Fix:` / `Chore:`, conventional `feat:`/`fix:`/… also
  tolerated), testing, and the translation workflow.
- **`.github/PULL_REQUEST_TEMPLATE.md`** — required DB-migration note
  (`YES - NNNN` | `NO`), Tests & Translation-Keys checkboxes, SFW screenshots,
  `Fixes whisparr/whisparr#NNNN`.
- **`.editorconfig`** + **`src/stylecop.json`** — C# style (4-space indent,
  `var` preferred, `_camelCase` private fields, `System.*` usings first, final
  newline). **`eslint.config.js`** + **`frontend/.prettierrc.json`** — frontend.
- CI enforces the above (`build_v3.yml`, `sonarqube.yml`); `yarn lint --fix` /
  `yarn stylelint-windows --fix` before committing frontend changes.
