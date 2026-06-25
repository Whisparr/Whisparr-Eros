# No-Date Episodic Code Map

## Parser entry

| File | Method | Line (approx) | Change |
|------|--------|---------------|--------|
| `src/NzbDrone.Core/Parser/Parser.cs` | `ParseMovieTitle` | 264 | Capture regex result; no-date fallback before StashId |
| `src/NzbDrone.Core/Parser/Parser.cs` | `TryParseNoDateEpisodicRelease` | new | Bracketed SxxExx / Season Episode parsing |
| `src/NzbDrone.Core/Parser/Parser.cs` | `HasExplicitNoDateEpisodicMarker` | new | Override gate for weak E### matches |

## Model

| File | Method | Change |
|------|--------|--------|
| `src/NzbDrone.Core/Parser/Model/ParsedMovieInfo.cs` | fields | Season, EpisodeStart, EpisodeEnd, ParserSource, IsNoDateEpisodic, IsEpisodeRange, HasReleaseDate |

## Resolver

| File | Method | Change |
|------|--------|--------|
| `src/NzbDrone.Core/Parser/ParsingService.cs` | `GetSceneMovie` | Target-aware no-date match before FindScene |
| `src/NzbDrone.Core/Movies/MovieService.cs` | `IsNoDateEpisodicSceneMatch` | Studio/title/episode validation |

## Sample title current behavior (pre-fix)

| Release | Parse | Failure |
|---------|-------|---------|
| `[AgentRedGirl] All My Roommates Love Season 2: Episode 2` | null | No Season/Episode regex |
| `[Wildeer Studio] Lara In Trouble S01 E01 [1080p]` | broken | L128 E01 regex; wrong StudioTitle |
| `[Wildeer Studio] Lara In Trouble S01 E01 - E06 [1080p]` | broken | Range ignored |

## Config

| File | Settings |
|------|----------|
| `IConfigService.cs` / `ConfigService.cs` | WhisparrNoDateEpisodicParsingMode, RangePackMode, MinimumConfidence, PreferGrabbedTargetOnImport |

## Tests

| File | Purpose |
|------|---------|
| `NoDateEpisodicParserFixture.cs` | Parser positive/negative/regression |
| `NoDateEpisodicMatchFixture.cs` | Target-aware resolver |
