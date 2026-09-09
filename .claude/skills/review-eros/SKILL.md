---
name: review-eros
description: Review a GitHub PR against Whisparr/Whisparr-Eros:eros-develop with this repo's conventions (branch target, commit prefixes, 80% new-code coverage, en.json translation keys, DB-migration note, NUnit *Fixture tests, ParserTests scrutiny). Produces a structured terminal review, then offers to post it. Use when reviewing an Eros PR.
argument-hint: "[PR number or URL]"
user-invocable: true
allowed-tools: Bash, Read, Grep, Glob, Agent, AskUserQuestion, TodoWrite
---

# Review an Eros PR

Review a pull request against `Whisparr/Whisparr-Eros:eros-develop` the same way
every time. The repo is `Whisparr/Whisparr-Eros` (remote here). Issues for both
`Whisparr/Whisparr` and `Whisparr/Whisparr-Eros` are tracked on
`Whisparr/Whisparr`, so linked issues use `Fixes whisparr/whisparr#NNNN`.

Output rule: **produce the full review in the terminal first, then ask** whether
to post it. Never auto-post. Never add an AI-attribution footer to anything
posted (per global rules).

Run the phases in order. Track them with TodoWrite if the review is non-trivial.

## 1. Resolve the PR

- The argument is a PR number or URL. If omitted, infer from the current branch
  (`gh pr view --json number` on the checked-out branch) or ask which PR.
- Gather everything up front:
  ```
  gh pr view <n> --repo Whisparr/Whisparr-Eros \
    --json number,title,body,baseRefName,headRefName,author,files,commits,url,isDraft
  gh pr diff <n> --repo Whisparr/Whisparr-Eros
  ```
- Note: title, body, **base branch**, head branch, changed files, full diff,
  commit list, linked issues, draft status.

## 2. Gate checks — conventions & PR template (always run)

Flag every miss. Sources: `CONTRIBUTING.md`, `.github/PULL_REQUEST_TEMPLATE.md`,
`.editorconfig`, `src/stylecop.json`.

- **Base branch MUST be `eros-develop`** (never `eros`). Wrong base = blocking
  hard fail — PRs to `eros` get closed.
- Head branch is meaningfully named (`fix-...`/`new-...`), not `patch`/`develop`/
  `eros-develop`.
- Commit prefixes: accept **both** Servarr (`New:`/`Fix:`/`Chore:`) and
  conventional (`feat:`/`fix:`/`chore:`/`refactor:`) — the repo tolerates both.
- One feature/bug-fix per PR — flag scope creep.
- PR-template items present in the body:
  - **DB migration note** (`YES - XXXX` or `NO`). If the diff adds a migration
    under `src/NzbDrone.Core/Datastore/Migration/`, the note must give its
    number.
  - **Tests** checkbox and **Translation Keys** checkbox.
  - Linked issue as `Fixes whisparr/whisparr#NNNN` (issues live on
    `Whisparr/Whisparr`).
- **Localization**: any new user-facing string needs an `en.json` key at
  `src/NzbDrone.Core/Localization/Core/en.json`. Backend uses
  `_localizationService.GetLocalizedString("Key")`; frontend uses
  `translate('Key')`. Log-message translations are not accepted — don't ask for
  them.
- **Style** (call out obvious violations only; CI's SonarQube + eslint/stylelint
  do the real enforcement): 4-space indent, `var` preferred, `_camelCase`
  private fields with `_` prefix, `System.*` usings first, final newline.

## 3. Test-coverage review (always run)

- New/changed **backend** code needs NUnit tests: `*Fixture.cs` classes named
  `XxxFixture : CoreTest`, in the sibling `src/NzbDrone.*.Test` project (e.g.
  `NzbDrone.Core.Test`). Expect ~**80% coverage on new code**.
- **Parser changes get extra scrutiny.** If the diff touches
  `src/NzbDrone.Core/Parser/`, require added/updated `[TestCase(...)]` rows in
  `src/NzbDrone.Core.Test/ParserTests/` — `ParserFixture.cs`,
  `ParseMovieTitleFixture.cs`, `StudioFixture.cs`, `QualityParserFixture.cs`,
  etc. — covering the **specific tokens/edge cases** touched. A parser change
  with no new parser test case is a finding, not a nit. (Parser regressions are
  a recurring theme in this repo: codec tokens, multi-brand studio parsing.)

## 4. Correctness review (always run)

Read the **changed files in full**, not just the diff hunks, and reason about
logic errors, missed edge cases, and regressions. Weight parser/token handling
heavily given repo history. You may delegate the deep correctness pass to the
built-in `/code-review` skill on the checked-out branch and fold its findings in
— this skill's job is to wrap that with the Eros-specific gates above.

## 5. Adaptive local verification

Decide from the diff whether to run anything locally:

- **Risky diff** — touches `src/NzbDrone.Core/Parser/`, a DB migration, core
  release/parsing/decision logic, or security-sensitive code:
  1. `gh pr checkout <n> --repo Whisparr/Whisparr-Eros`
  2. Build + run the **targeted** fixtures for the touched area, excluding heavy
     categories, e.g.:
     ```
     dotnet test src/NzbDrone.Core.Test/Whisparr.Core.Test.csproj \
       --filter "FullyQualifiedName~ParserTests&TestCategory!=IntegrationTest&TestCategory!=AutomationTest&TestCategory!=ManualTest"
     ```
     (Adjust the `FullyQualifiedName~` filter to the touched fixtures.)
  3. Report pass/fail with real output. Restore the original branch afterward.
- **Low-risk diff** — frontend-only, docs, or a small isolated change: stay
  static and rely on CI. **State explicitly** that local verification was
  skipped and why.

Never claim tests passed unless you actually ran them.

## 5b. Read the actual CI result (always run)

The PR's CI has usually already run — read it, don't just predict it:

```
gh pr checks <n> --repo Whisparr/Whisparr-Eros
gh pr view <n> --repo Whisparr/Whisparr-Eros --json statusCheckRollup,mergeStateStatus,mergeable
```

Report the real state of the key gates from `build_v3.yml` and `sonarqube.yml`:
backend matrix, `frontend`, `unit_test`, `unit_test_postgres`, `integration_test`,
and SonarQube "Build and Analyze". A failing/red check is a **blocking** finding;
name the failed job. `deploy / release` and `CodeQL` showing `skipping`/`neutral`
is normal on a PR.

Distinguish a real failure from a **held** run: this repo only blocks automatic
Action runs for **new / first-time contributors** (runs sit `pending` awaiting
maintainer approval — GitHub's fork-PR gate). That is a workflow-approval step,
not a fault in the PR, and it is **not** a blocking finding — call it out as
"CI awaiting maintainer approval (new contributor)" and review on the code alone.
For known contributors and Dependabot, CI runs automatically, so absent/pending
checks there are worth a second look.

`mergeStateStatus: BLOCKED` with `mergeable: MERGEABLE` and all checks green
usually just means the PR is awaiting a review approval — not a CI problem.

## 6. Emit the terminal review

Always use this fixed structure:

- **Verdict**: Approve / Approve-with-nits / Request-changes / Blocked.
- **Blocking** — correctness bugs, wrong base branch, missing required tests.
  Most severe first, each as `file:line` with a concrete failure scenario.
- **Should-fix** — coverage gaps, convention/PR-template misses.
- **Nits** — style, naming.
- **Checklist** — one pass/fail line each: base branch, commit prefixes,
  migration note, tests present, `en.json` keys, ~80% coverage, and **actual CI
  status** (from step 5b — real result of build_v3 + SonarQube, or "awaiting
  maintainer approval" for a new contributor).

## 7. Offer to post (never auto-post)

After printing the review, use AskUserQuestion to ask whether to post it. Only on
explicit approval:

- Summary review: `gh pr review <n> --repo Whisparr/Whisparr-Eros --comment --body "..."`
  (or `--request-changes` / `--approve` to match the verdict).
- Inline notes: `gh pr comment <n> --repo Whisparr/Whisparr-Eros --body "..."`.

Confirm before this outward-facing step every time. No AI-attribution footer.
