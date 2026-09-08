# Time Capsule prototype

Run `npm install`, then `npm run dev` from this folder. The development server prints the local preview URL.

`npm run build` creates the production bundle. `npx tsc --noEmit` checks types.

This is the first experience prototype, not the functional MVP. It includes a scrapbook preview, short starter, optional categorized prompts, answer editing, and JSON download. Edits exist only in the open page. No account, durable storage, photo upload, sealing, or AI service is connected.

Product scope and progress: `../MVP-PLAN.md`.

Sample content is fictional. Sample image: Sichen Xiang, https://unsplash.com/photos/a-group-of-people-sitting-at-a-picnic-table-next-to-a-lake-QdFF1x5jqAU . It is loaded from Unsplash; when unavailable, the photo is omitted.

Sites registration returned a transport error and a follow-up lookup also failed. Registration outcome remains unknown. Do not create another Site without checking whether `tanyas-time-capsule` exists. No confirmed project ID has been stored.
