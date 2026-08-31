---
name: sync-upstream
description: Work one month-sized chunk of the Radarr or Sonarr upstream backlog for Whisparr Eros. Reads each upstream diff, applies the parser/localization/frontend skip rules, records a disposition with a reason, applies the picks, regenerates UPSTREAM_SYNC.md, and opens the PR. Use when catching up on upstream commits or when the upstream-watch tracking issue lists new work.
argument-hint: "<radarr|sonarr> <YYYY-MM>"
user-invocable: true
allowed-tools: Bash, Read, Grep, Glob, Edit, Write, AskUserQuestion, TodoWrite
---

# Sync one upstream chunk

Whisparr Eros tracks **two** upstreams on two clocks:

| Tree | Upstream | Why |
| --- | --- | --- |
| `frontend/` | `Sonarr/Sonarr:v5-develop` | Our React Query + zustand frontend was ported from Sonarr's completed migration (see `REDUX_MIGRATION.md`). |
| `src/` and everything else | `Radarr/Radarr:develop` | Our code lineage. The chain is Sonarr → Radarr → us. |

State lives in `.github/upstream/state.json` — high-water SHAs plus a
`sha → {subject, month, disposition, reason}` map. **That file is the only thing
you edit by hand, and `UPSTREAM_SYNC.md` is generated from it.** Never edit the
report directly; `--check` will catch you.

Argument is an upstream and a month: `sync-upstream radarr 2026-04`. If omitted,
read `UPSTREAM_SYNC.md` and propose the smallest outstanding month.

Run the phases in order. Track them with TodoWrite when the chunk has more than
a handful of commits.

## 1. Resolve the chunk

```sh
GITHUB_TOKEN=$(gh auth token) node scripts/upstream-sync.mjs --report
```

Read the month's section of `UPSTREAM_SYNC.md`. That list is the chunk. Anything
already in `state.json` has been settled and will not appear.

`upstream-watch` runs weekly and may have got there first: it opens a **draft**
PR holding the commits that cherry-picked cleanly and cleared the automatable
gates, and lists the conflicted and gated remainder on the tracking issue. That
PR is a starting point, not a verdict. Nothing in it is dispositioned, none of
it has been read against the rules below, and taking it as-is is exactly the
mistake the gates exist to prevent. Read every diff in it as if you had picked
it yourself, drop what should not be there, and write the dispositions.

Branch off `eros-develop` — never work on it directly:

```sh
git switch -c sync-<upstream>-<YYYY-MM> eros-develop
```

## 2. Read every diff

For each commit:

```sh
gh api repos/<Radarr/Radarr|Sonarr/Sonarr>/commits/<sha> -q '.files[] | .filename, .patch'
```

**Never classify from the subject line.** Subjects routinely understate scope
("Fix syntax" that rewrites a service) or overstate relevance (a "parser fix"
that only touches a token we do not have).

## 3. Apply the skip rules — these are gates, not guidance

Run these *before* deciding anything. Each exists because following upstream
here has actively cost us.

### Parser → skip by default

Anything under `src/NzbDrone.Core/Parser/`. Our `Parser.cs` is ~1,100 lines
against Radarr's ~640; we parse scenes with full dates, performers and studios,
they parse movies by year or series by season/episode. Upstream regexes are
tuned to a grammar we do not share.

The **only** way past this gate: write a test against *our* parser that fails
before the fix. A ported regex plus a ported test proves nothing. If it does not
reproduce here, record `skip` with that reason.

Be especially wary of anything about absolute episode numbers (no such concept
here) or date-vs-year precedence (exactly where our grammar deliberately
differs — a bare `[YYYY]` means a movie, scenes carry full dates).

### Localization → never take an upstream `en.json` hunk

We keep `en.json` sorted case-insensitively; upstream does not (they carry ~70
out-of-order pairs each, we carry one known one). Shared keys also collide —
dozens have different text on our side.

So a pick that needs a user-facing string gets **our own key, authored by us, in
correct case-insensitive sorted position**. Take the code, leave the JSON.

Every `Multiple Translations updated by Weblate` commit is an automatic `skip` —
those files come from Weblate, not from cherry-picks.

### Generated API docs → skip

Both upstreams regenerate a checked-in `openapi.json` from a bot, several times
a month. We retired ours along with the workflow that produced it, so those
commits rewrite a file we do not have — automatic `skip`.

Gated on the files, not the subject: commits with "API docs" in the title are
often hand-written C# (a resource attribute, a controller change) and still have
to be read.

### Radarr `frontend/` → skip by default

Our frontend follows Sonarr. Radarr is still mid-conversion to the react-query
patterns Sonarr finished, so picking their frontend commits re-imports something
we already moved past. Past the gate only for a genuine bug fix in code we still
share.

## 4. Classify what survives

One of four, and **every one needs a reason** — `--check` rejects a bare or
stub reason:

- **`pick`** — applies as-is.
- **`adapt`** — right idea, wrong entity model. Radarr `Movie`/`Collection` or
  Sonarr `Series`/`Episode` vs our `Movie`/`Scene`/`Performer`/`Studio`.
- **`skip`** — upstream-specific, gated out, or not wanted. Say which.
- **`have`** — already in our tree.

Write each into `.github/upstream/state.json` as you go. "Not applicable to
Whisparr" is precisely the knowledge that gets lost and re-litigated a year
later, so the reason has to say *why*.

Anything that is a feature decision rather than a sync decision — a new download
client, a new list integration — is not yours to wave through. Stop and ask.

## 5. Apply the picks

Keep the trailer convention already used throughout our history:

```
(cherry picked from commit radarr/radarr@<sha>)
(cherry picked from commit sonarr/sonarr@<sha>)
```

The Sonarr form barely exists in our history yet, which is exactly why the
Sonarr side of the backlog was invisible until someone read `REDUX_MIGRATION.md`
by hand. Use it.

Commit prefixes: Servarr (`New:`/`Fix:`/`Chore:`) or conventional
(`feat:`/`fix:`/`chore:`) — the repo tolerates both.

## 6. Verify what you actually touched

- Backend: `./build.sh --backend` and `dotnet test`.
- Frontend: `yarn build`, plus `tsc` and `eslint` from the repo root. Three
  `node_modules` errors from tsc is the clean baseline, not a failure.
- Parser (if anything got past the gate): `dotnet test --filter ParserFixture`
  and the `NzbDrone.Core.Test/ParserTests/` fixtures. **New** assertions —
  never modify or delete an existing one to go green.
- New-code coverage stays at 80%.
- DB migration → note its number in the PR description.
- Anything user-visible → run the app on port 6969 and check the live API.
  Do not infer which surfaces a change reaches from shared code paths.

## 7. Regenerate and open the PR

```sh
GITHUB_TOKEN=$(gh auth token) node scripts/upstream-sync.mjs --report
GITHUB_TOKEN=$(gh auth token) node scripts/upstream-sync.mjs --check
```

Commit the regenerated `UPSTREAM_SYNC.md` and the updated `state.json` together
with the code.

**Advance the high-water SHA only when every commit at or before it is
dispositioned.** A pointer that jumps ahead of unreviewed commits hides them —
that is how a stray October pick concealed seven earlier commits until the
report was rebuilt.

Open the PR against `eros-develop` (never `eros`) filling in
`.github/PULL_REQUEST_TEMPLATE.md` — `gh pr create --body` silently bypasses it,
so pass `--body-file` with the template filled in. Keep the body short: what was
picked, what was skipped and why, and the verification result. Link issues fully
qualified as `Fixes Whisparr/Whisparr#123` — a bare `#123` resolves against the
wrong repo from this remote.

Never add AI attribution to the commit or PR body.
