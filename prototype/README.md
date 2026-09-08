# Time Capsule

A private scrapbook app with a short starter profile, ten optional question categories, autosaved drafts, a capsule library, and original photo storage.

## Development

Run `npm install`, apply migrations with `npx wrangler d1 migrations apply DB --local --config wrangler.local.json`, then run `npm run dev`. On the local preview, select **Enable saved capsules** once to activate the Sites test identity. All local browsers use the same test profile. This is development behavior, not separate real accounts.

Local D1/R2 files live under ignored `.wrangler/state`. Local and hosted data are separate; do not delete that folder if you need local memories. Hosted requests use the Sites authenticated user ID and enforce ownership server-side. The hosted Site is owner-only; Tanya does not have access until explicitly shared.

`npm run build` builds the Worker. `npx tsc --noEmit` checks types. `node tests/storage-api.mjs` exercises the running local API with disposable records and cleans them up. The ownership API test uses the provided SQL fixture and cleanup files through local Wrangler. Never run the fixture against a remote database.

## Current scope

- Short profile, editable date, optional categorized questions.
- Serialized autosave with revision conflict protection and restore/download recovery.
- Draft library: create, reopen, and delete with confirmation.
- JPEG/PNG/WebP uploads up to 10 MB each, maximum 10 per capsule, original-byte preservation, captions, cover selection, original downloads, and removal.
- Private D1 records and R2 photo objects, authenticated APIs, same-origin writes, bounded upload bodies, and ownership checks.
- Capsule deletion uses a retryable deletion marker to prevent racing uploads from leaving orphaned files.

Sealing, AI generation, family collaboration, and a full backup import/export archive remain future work. JSON export includes answers and photo metadata; download original photos separately. HEIC conversion is not implemented.

## Validation and limitations

API integration tests cover persistence across independent reads, concurrent-update rejection, ownership/authentication, cross-origin write rejection, photo format/count checks, original bytes, caption/cover updates, and deletion. No browser interaction QA or supported WebMCP validation context was available in this turn. Existing starter dependency advisories still need resolution before a wider production pilot.

Product scope and progress: `../MVP-PLAN.md`.

Sample content is fictional. Sample photo: Sichen Xiang, https://unsplash.com/photos/a-group-of-people-sitting-at-a-picnic-table-next-to-a-lake-QdFF1x5jqAU . It is loaded from Unsplash and omitted if unavailable.
