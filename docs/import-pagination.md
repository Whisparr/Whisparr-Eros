# Import pagination

Manual and library imports display 50 candidates per page. Header selection and
shift selection affect the visible page; reviewed matches, selections and edits
survive page changes. Validation, bulk edits and import/delete submissions include
selected records from every visited page. Unvisited pages are not automatically
selected or searched. Existing catalog lookup and match-selection rules remain.

## API

- `GET /api/v3/manualimport/paged?folder=...&page=1&pageSize=50&sortKey=relativePath&sortDirection=ascending`
- `GET /api/v3/rootFolder/{id}/importfiles?page=1&pageSize=50&sortKey=relativePath&sortDirection=ascending`

Responses include `page`, `pageSize`, `sortKey`, `sortDirection`, `totalRecords`
and `records`. Pages start at 1, default to 50 records and are capped at 200.
Invalid bounds/sorts return HTTP 400; pages beyond the end have empty records.
Existing unpaged endpoints and their defaults remain available. No database
migration is needed.

Root-folder import files use database filtering, ordering, count, limit and offset.
Manual Import enumerates paths for its total and global order, then analyzes only
the requested page. Existing-file filtering precedes paging, and matched folders
retain their sample context. Repeated `downloadIds` and the legacy `downloadId`
combine into one ordered page; each record retains its source download ID.
Manual-import sorts are path and file size; size ordering reads candidate sizes.
Metadata-column sorts are unavailable because unseen files have not been analyzed.
Filesystem changes between requests can change page membership.

Folder list/detail and refresh endpoints accept `includeImportFiles=false` to
return `importFileCount` without embedding all candidates. Their default remains
`true` for legacy clients. The import UI uses summaries and requests files on demand.
Library catalog lookups run only for the current page and abort on navigation;
completed results stay cached for visited pages.

## Validation

Run the targeted backend tests with .NET 10:

```sh
dotnet test src/NzbDrone.Core.Test/Whisparr.Core.Test.csproj --filter 'FullyQualifiedName~ManualImportPagingFixture|FullyQualifiedName~ImportFilePagingFixture|FullyQualifiedName~RootFolderServiceFixture|FullyQualifiedName~ImportDecisionMakerFixture|FullyQualifiedName~ManualImportServiceFixture'
dotnet test src/NzbDrone.Api.Test/Whisparr.Api.Test.csproj --filter 'FullyQualifiedName~ImportPagingFixture|FullyQualifiedName~ManualImportPagingFixture|FullyQualifiedName~RootFolderPagingFixture|FullyQualifiedName~ManualImportControllerFixture'
```

The browser fixture intercepts every API request and mutation. It uses 10,001
manual-import files and 1,001 library-import files to exercise bounded responses,
page navigation, cross-page selections/edits, hidden invalid selections, sorting,
filter resets, duplicate basenames, page-scoped lookups, Cancel/Start Processing,
multiple download IDs and complete submission payloads. It never touches live media.

```sh
yarn typecheck
yarn build
yarn vite build --config frontend/tests/manual-import/vite.config.mts
NODE_PATH=/path/to/playwright/node_modules node frontend/tests/manual-import/browser.cjs
```
