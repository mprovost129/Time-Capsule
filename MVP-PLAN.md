# Time Capsule — proposed MVP

Living project plan • Updated September 8, 2026 • For Mike and Tanya

## Confirmed decisions

- Visual direction: warm, modern scrapbook.
- Start with a few short profile questions; additional questions are optional and grouped into categories.
- Users can return to those categories at their leisure while the capsule is a draft.
- Keep the product map, MVP scope, decisions, and progress in this local file. Update the checklist as work is completed; distinguish proposed scope from confirmed decisions.

## Visual direction

Use warm paper tones, photo frames, restrained handwritten accents, and scrapbook-style captions. Keep body text easy to read, controls clear, contrast accessible, and phone layouts uncluttered. Decorative paper and tape details should support the memories. Start with one cohesive scrapbook theme; the two proposed alter ego styles belong inside that theme.

## Product promise

Capture who you are right now. Turn that snapshot into a creative keepsake. Revisit it as your life changes.

Tanya's original concept combines a MySpace-style personal profile with photos, favorite music, important people, and AI creations. Preserve both halves: an enjoyable creative payoff today and a meaningful record for later.

## First audience and hypothesis

Start with adults making their own personal capsule. Mike and Tanya are the first testers, followed by a small invited group. Family accounts and child profiles are later extensions.

Hypothesis: a short guided profile plus a personalized alter ego card will feel worthwhile enough that users finish, keep the result, and want to make another capsule. This is unvalidated; neither originality nor demand has been established.

## Main journey

My capsules → Create snapshot → Add photos and answers → Preview capsule → Create alter ego card → Review → Seal → Revisit or download.

Aim for a first useful capsule in 5–10 minutes. Save progress automatically. Allow optional questions to be skipped and more details to be added before sealing.

## Screen map

```text
My capsules
├── Start a capsule
│   └── Quick start → Scrapbook draft
├── Continue a draft
│   └── Scrapbook draft
│       ├── Add or edit photos and captions
│       ├── Explore question categories → Save and return anytime
│       ├── Preview scrapbook
│       ├── Create alter ego → Review and save card
│       └── Review and seal → Sealed scrapbook
└── Open a sealed scrapbook
    ├── Read memories and view card
    ├── Download or export
    └── Start a new dated capsule

Account → Sign-in/recovery, data export, deletion
```

The scrapbook draft is the central workspace. Show a clear saved state and a gentle invitation to add more. Empty categories do not render as blank pages in the scrapbook. Users can preview, create a card, and seal without completing every category.

## MVP scope

| Feature | First version |
| --- | --- |
| Personal account | Private library with persistent storage and account recovery |
| Guided snapshot | Name, capsule title/date, optional cover photo, three short starter questions |
| Optional question library | Categorized prompts, saved answers, and resume at any time before sealing |
| Photos | Cover plus up to 10 photos, with optional captions |
| Profile page | A consistent, attractive scrapbook-style layout |
| AI creation | One illustrated alter ego card with fictional title, short description, and current quest; two visual styles |
| Review | Preview and revise the card text before saving; limited regeneration |
| Sealing | Freeze the snapshot while keeping it readable immediately |
| Library | Dated capsules that can be reopened and browsed |
| Portability and control | Download the card; export original photos and answers in common formats; delete capsule/account |

Do not require a photo to complete the written snapshot. The alter ego can use an illustrated symbolic character without a selfie.

## Profile questions

### Quick start

Collect name and capsule date/title, with an optional cover photo. Then show only three short prompts, each answerable in a phrase or sentence:

1. What's life like right now?
2. What are you into lately?
3. What are you looking forward to?

Allow skipping and saving at any point. Do not require completion of the optional library to create a capsule. If there is too little information for a personal alter ego, invite the user to add one interest or life detail rather than inventing biography.

### Optional categories

Initial question inventory for Tanya to refine:

| Category | Example short prompts |
| --- | --- |
| Family | Who's in your family circle? Any traditions you love? What family moment do you want to remember? |
| Friends & relationships | Who are your people (up to five, unranked)? What do you enjoy doing together? Any inside jokes? |
| Recreation & adventures | How do you spend a free weekend? Where do you like to go? Any trips or outings to remember? |
| Hobbies & interests | What do you make, collect, or practice? What are you learning? What's your latest obsession? |
| Music & entertainment | Favorite songs or artists? What are you watching, reading, or playing? What's on repeat? |
| Everyday life | What's a typical day like? What's your favorite food lately? What little routine makes you happy? |
| Work & learning | What are you working on or studying? What are you proud of? What's challenging you? |
| Home & surroundings | What feels like home? What's your favorite spot? What everyday object would you photograph for future you? |
| Goals & future | What do you hope changes? What are you excited about? What would you tell future you? |
| Reflections | How have you been feeling? What matters most right now? What do you wish you could remember about this season? |

### Completion behavior

- Show category cards with an answered count and a continue action; never label optional categories overdue or incomplete in a warning state.
- Open one category at a time with short prompts and optional longer answers.
- Autosave answers and restore them when users return. Show save failures clearly and offer retry.
- Allow answers to be edited or removed until sealing. Do not duplicate starter answers in the optional library; render starter answers in a Right Now section.
- Keep categories independent: users may answer a single question and leave.
- Include answered sections only in the scrapbook preview. Adding more answers never automatically spends another generation credit; regenerating a card is an explicit action.
- Explain before sealing that unanswered questions can stay empty and that this freezes the snapshot. To keep adding later, leave it as a draft.

Keep the user's original words. AI-generated creative text is a separate, labeled artifact and never replaces the source answers. Optional private reflections are excluded from the card unless the user chooses to include them.

## Sealing rules

Drafts remain editable. Sealing preserves the answers, photos, date, and approved card as a fixed snapshot. A sealed capsule is readable immediately; sealing does not imply a future access lock. Users can create a new capsule from a previous one, with a deliberate review of dated answers, or delete an existing capsule. Future-date unlocking is deferred.

## Deliberately deferred

- Song generation, movie posters, mood boards, and a broad AI studio.
- Social feeds, public profiles, comments, and direct social posting.
- Spotify/Instagram imports or music playback integrations.
- Shared family accounts, child accounts, and collaborative capsules.
- Video/audio uploads, subscriptions, print fulfillment, and automated comparison.
- Scheduled unlocks and promises of permanent or lifetime hosting.

These are potential extensions, not rejected ideas. Pick the next one based on pilot behavior. A downloadable card already lets users share manually.

## Build sequence

1. **Experience prototype:** Sample capsule, question flow, scrapbook preview, and an example alter ego card. Tanya reviews prompts and visual direction before backend work.
2. **Private functional MVP:** Phone-friendly web app, account access, saved drafts, uploads, generation, sealing, library, export, and deletion. Choose providers and estimate operating costs before implementation.
3. **Pilot:** Mike and Tanya plus 5–10 invited adults use real answers. Observe where they stop, what they skip, and whether the creation feels personal. Invite a second capsule after roughly a month to test repeat interest without waiting a year.

## Quality gates

- Quick start exposes only three short prompts; optional categories never block preview or sealing.
- Category answers survive leaving and resuming; removed answers and empty sections disappear from the preview.
- Drafts and uploads survive refresh and sign-in on another device.
- One account cannot access another account's capsules or photo URLs.
- Generation failures keep the user's answers safe and allow a controlled retry.
- Sealed content stays unchanged, including after model/provider changes.
- Generated fiction stays distinct from biographical facts.
- The card includes only fields the user has allowed into that creation; the user reviews the result before downloading or sharing.
- Export works independently of continued app access; deletion behavior is documented and tested.
- Upload and generation limits bound operating costs; credentials stay server-side.

## Pilot decision criteria

Proposed targets, not industry benchmarks: at least 4 of the first 5 outside testers complete a capsule without coaching, typical completion is under 10 minutes, and at least 3 say the card feels personal and keep or download it. Also record actual generation cost, failures, and repeat creation. A small pilot is directional evidence, not proof of a market.

If people enjoy the card but do not value the saved snapshot, revisit positioning before expanding the archive. If they value the snapshot but skip generation, simplify the AI feature. If completion is low, reduce the questions before adding features.

## Suggested collaboration

Tanya: shape the prompts, emotional tone, card styles, and tester feedback. Mike: lead implementation, reliability, and scope. Together: approve the first complete example and choose the next feature from observed use. Roles are proposals, not commitments.

## Build checklist

- [x] Retrieve Tanya's original idea and document the initial MVP.
- [x] Confirm scrapbook visual direction.
- [x] Map the screens and separate quick start from optional categories.
- [x] Save the scope and tracking plan locally.
- [x] Build the first scrapbook experience prototype with sample content.
- [x] Implement the three-question starter and optional category navigation.
- [ ] Review the experience and wording with Mike and Tanya.
- [ ] Choose storage, authentication, and AI providers; estimate operating costs.
- [ ] Implement persistent drafts, photos, and account access.
- [ ] Implement alter ego creation and review.
- [ ] Implement sealing, library, export, and deletion.
- [ ] Verify quality gates and run the invited pilot.

Next work item: review the scrapbook prototype with Mike and Tanya, then implement persistent drafts and photo uploads. The prototype source is in `prototype/`.

## Prototype delivery status — September 8, 2026

- Implemented warm scrapbook layout, a fictional sample capsule, three starter prompts, ten optional categories with three questions each, live scrapbook rendering, answer editing, and JSON download.
- Category answer counts update as users type; blank optional categories stay out of the scrapbook. Starting fresh from a personal draft offers a download and confirmation first.
- Uses accessible installed dialog and tab primitives, responsive layouts, reduced-motion support, and a sample photo with source attribution.
- This is an experience prototype: edits are in memory for the open page only. The interface explicitly explains this. Persistent saving, photo uploads, accounts, sealing, capsule library, and AI generation are not implemented yet.
- Production builds passed, the TypeScript check passed, and the local preview route returned HTTP 200. Browser interaction/visual QA has not been performed.
- Added optional `open_capsule_category` WebMCP navigation tool. No supported validation context was available, so its browser contract has not been verified.
- Hosted publication is blocked by Sites connector transport errors on both registration and the follow-up lookup. Registration outcome is unknown; before any retry, look up the existing slug `tanyas-time-capsule` to avoid creating a duplicate. No hosted URL or project ID has been confirmed.
- Dependency review found advisories in the generated starter. Updated React, React DOM, and RSC to 19.2.8 and Vite to 8.0.16. Installation still reports nine dependency vulnerabilities (one low, two moderate, six high); review and resolve remaining findings before a production pilot. No automatic force-upgrade was used.

## Remaining assumptions

Proposed scope remains personal adult capsules, a phone-friendly web app, and one alter ego card as the initial AI output. Reassess native apps and family collaboration after the pilot. Specific technology, visual details, and final prompt wording are still open; the scrapbook direction and categorized optional questions are confirmed.

## Market context

Existing products already address adjacent needs: [TimeCapsule](https://www.timecapsule.company/) describes future-locked messages and media; [Remento](https://help.remento.co/en/articles/8365873-what-is-remento-and-how-does-it-work) turns spoken memories into books with linked recordings. Reviewed September 8, 2026. Tanya's proposed combination of a dated identity profile and creative interpretation is the angle to test, not a verified claim of uniqueness.
