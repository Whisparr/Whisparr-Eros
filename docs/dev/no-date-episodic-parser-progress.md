# No-Date Episodic Parser — Progress Log

## 2025-06-25

- Created branch `feature/no-date-episodic-scene-parser` from `eros-develop`
- Added `ParsedMovieInfo` transient no-date episodic fields
- Implemented `TryParseNoDateEpisodicRelease` with explicit-marker override for weak E### regex matches
- Added target-aware resolver in `ParsingService.GetSceneMovie` and `MovieService.IsNoDateEpisodicSceneMatch`
- Added config kill switches (defaults: InteractiveOnly)
- Added import conflict guard for grabbed no-date episodic targets
- Core unit suite: 3950 passed, 0 failed
- Diagnostics: structured debug logs in parser and resolver; Parse API inherits new ParsedMovieInfo fields via existing endpoint

## v1 limitations

- Multi-file range packs: per-file import only; single combined pack files may require manual import
- Cross-episode pack re-grab dedup relies on existing grab history; dedicated pack history deferred to v2
