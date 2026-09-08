'use client';

import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { useCapsules } from '@/hooks/use-capsules';
import type { Capsule, Photo } from '@/lib/capsule-types';
import { PhotoManager } from '@/components/capsule/photo-manager';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import {
  Layers,
  ArrowRight,
  ArrowLeft,
  Heart,
  Users,
  Compass,
  Palette,
  Music,
  Coffee,
  Briefcase,
  Home,
  Sprout,
  PenLine,
  Plus,
  Sparkles,
  Check,
  Download,
  Library,
  Trash2,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const categories = [
  {
    name: 'Family',
    icon: Heart,
    color: 'rose',
    prompts: [
      "Who's in your family circle?",
      'Any traditions you love?',
      'What family moment do you want to remember?',
    ],
  },
  {
    name: 'Friends & relationships',
    icon: Users,
    color: 'peach',
    prompts: [
      'Who are your people?',
      'What do you enjoy doing together?',
      'Any inside jokes?',
    ],
  },
  {
    name: 'Recreation & adventures',
    icon: Compass,
    color: 'blue',
    prompts: [
      'How do you spend a free weekend?',
      'Where do you like to go?',
      'Any trips or outings to remember?',
    ],
  },
  {
    name: 'Hobbies & interests',
    icon: Palette,
    color: 'yellow',
    prompts: [
      'What do you make, collect, or practice?',
      'What are you learning?',
      "What's your latest obsession?",
    ],
  },
  {
    name: 'Music & entertainment',
    icon: Music,
    color: 'lilac',
    prompts: [
      'Favorite songs or artists?',
      'What are you watching, reading, or playing?',
      "What's on repeat?",
    ],
  },
  {
    name: 'Everyday life',
    icon: Coffee,
    color: 'peach',
    prompts: [
      "What's a typical day like?",
      "What's your favorite food lately?",
      'What little routine makes you happy?',
    ],
  },
  {
    name: 'Work & learning',
    icon: Briefcase,
    color: 'blue',
    prompts: [
      'What are you working on or studying?',
      'What are you proud of?',
      "What's challenging you?",
    ],
  },
  {
    name: 'Home & surroundings',
    icon: Home,
    color: 'yellow',
    prompts: [
      'What feels like home?',
      "What's your favorite spot?",
      'What everyday object would you save a photo of?',
    ],
  },
  {
    name: 'Goals & future',
    icon: Sprout,
    color: 'green',
    prompts: [
      'What do you hope changes?',
      'What are you excited about?',
      'What would you tell future you?',
    ],
  },
  {
    name: 'Reflections',
    icon: PenLine,
    color: 'lilac',
    prompts: [
      'How have you been feeling?',
      'What matters most right now?',
      'What do you want to remember about this season?',
    ],
  },
];
const starters = [
  "What's life like right now?",
  'What are you into lately?',
  'What are you looking forward to?',
];
const sample = {
  name: 'Jamie',
  title: 'The little things, lately',
  answers: {
    [starters[0]]:
      'Finding a slower rhythm and making more room for the people I love.',
    [starters[1]]:
      'Weekend walks, old playlists, and trying to keep my houseplants alive.',
    [starters[2]]:
      'A fall road trip with no real itinerary. Just us and the open road.',
  } as Record<string, string>,
};
const photo =
  'https://images.unsplash.com/photo-1726198576670-31e06b15c39f?auto=format&fit=crop&w=1200&q=85';
export default function Page() {
  const storage = useCapsules({
    ...sample,
    id: 'sample',
    date: '2026-09-08',
    coverId: null,
    revision: 0,
    updatedAt: '',
  });
  const { draft, change, flush } = storage;
  const { name, title, answers } = draft;
  const setName = (value: string) => change({ name: value });
  const setTitle = (value: string) => change({ title: value });
  const demo = draft.id === 'sample';
  const canEdit = storage.ready && storage.signedIn;
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [reloadOpen, setReloadOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false),
    [deleting, setDeleting] = useState<Capsule | null>(null),
    [working, setWorking] = useState(false);
  const [tab, setTab] = useState('scrapbook'),
    [active, setActive] = useState<number | null>(null),
    [start, setStart] = useState(false),
    [photoVisible, setPhotoVisible] = useState(true);
  const [message, setMessage] = useState(''),
    [notice, setNotice] = useState(false);
  useEffect(() => {
    const context = (
      document as Document & {
        modelContext?: {
          registerTool: (
            tool: unknown,
            options: { signal: AbortSignal },
          ) => void | Promise<void>;
        };
      }
    ).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try {
      void Promise.resolve(
        context.registerTool(
          {
            name: 'open_capsule_category',
            title: 'Open a capsule category',
            description:
              'Open an optional question category in the current capsule. Does not change answers.',
            inputSchema: {
              type: 'object',
              properties: {
                category: {
                  type: 'string',
                  enum: categories.map((c) => c.name),
                },
              },
              required: ['category'],
              additionalProperties: false,
            },
            annotations: { readOnlyHint: false, untrustedContentHint: false },
            execute(input: unknown) {
              if (
                !input ||
                typeof input !== 'object' ||
                Object.keys(input).some((k) => k !== 'category')
              )
                throw new Error('Provide a category name only.');
              const index = categories.findIndex(
                (c) => c.name === (input as { category?: unknown }).category,
              );
              if (index < 0) throw new Error('Unknown category.');
              flushSync(() => setActive(index));
              return { opened: categories[index].name };
            },
          },
          { signal: lifecycle.signal },
        ),
      ).catch(() => {});
    } catch {
      /* Optional browser capability. */
    }
    return () => lifecycle.abort();
  }, []);
  const update = (q: string, v: string) =>
    change({ answers: { ...answers, [q]: v } });
  const count = Object.values(answers).filter((v) => v.trim()).length;
  async function begin() {
    setWorking(true);
    setMessage('');
    try {
      await storage.begin();

      setStart(true);
      setTab('scrapbook');
      setLibraryOpen(false);
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setWorking(false);
    }
  }
  function download() {
    const blob = new Blob(
      [JSON.stringify({ ...draft, photos, prototype: true }, null, 2)],
      { type: 'application/json' },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-time-capsule.json';
    a.click();
    URL.revokeObjectURL(url);
    setMessage(
      'Your answers and photo captions have been downloaded. Image files are separate.',
    );
  }
  return (
    <div className="app-shell">
      <header className="topbar">
        <span className="brand">
          <span className="brand-icon">
            <Layers size={22} />
          </span>{' '}
          time capsule<span className="brand-dot">.</span>
        </span>
        <span className="prototype-label">
          YOUR LIFE. YOUR ERA. <span>•</span> PROTOTYPE
        </span>
        <div className="header-actions">
          <button
            className="text-button"
            disabled={!canEdit || working}
            onClick={() => setLibraryOpen(true)}
          >
            <Library size={18} /> My capsules
          </button>
          <button
            className="primary small"
            disabled={!canEdit || working}
            onClick={() => void begin()}
          >
            <Plus size={17} /> New capsule
          </button>
        </div>
      </header>
      <main className="workspace">
        {!storage.ready && (
          <p role="status" className="storage-banner">
            Loading your saved capsules…
          </p>
        )}
        {storage.ready && !storage.signedIn && (
          <div className="storage-banner">
            <div>
              <strong>Make a capsule you can come back to.</strong>
              <p>
                Keep your drafts and photos together in your private library.
              </p>
            </div>
            <a
              className="primary"
              href="/signin-with-chatgpt?return_to=%2F"
              target="_top"
            >
              Enable saved capsules <ArrowRight size={17} />
            </a>
          </div>
        )}
        {(storage.error || message) && (
          <div
            className={
              storage.error ? 'storage-banner error-message' : 'storage-banner'
            }
            role={storage.error ? 'alert' : 'status'}
          >
            <p>{storage.error || message}</p>
            {storage.error && (
              <button
                className="text-button"
                onClick={() => setReloadOpen(true)}
              >
                Restore saved version
              </button>
            )}
            {storage.error && (
              <button
                className="text-button"
                onClick={() => {
                  if (storage.signedIn) void flush().catch(() => {});
                  else window.location.reload();
                }}
              >
                Retry
              </button>
            )}
          </div>
        )}
        <div className="page-heading">
          <div>
            <p className="eyebrow">TIME CAPSULE / RIGHT NOW</p>
            <h1>Your current era.</h1>
            <p className="subtext">
              Your people. Your obsessions. Your life lately. Keep it all here.
            </p>
          </div>
          <span className="handwritten heading-note">
            <Sparkles size={18} /> 100% you
          </span>
        </div>
        <div className="workspace-grid">
          <section className="book-area" aria-label="Your capsule">
            <div className="book-toolbar">
              <span className="draft-label">
                <span /> {demo ? 'Sample capsule' : storage.status}
              </span>
              <button
                className="text-button"
                disabled={!canEdit || working}
                onClick={() => setStart(true)}
              >
                <PenLine size={16} /> Edit the basics
              </button>
            </div>
            <Tabs value={tab} onValueChange={(v) => setTab(String(v))}>
              <TabsList className="view-tabs">
                <TabsTrigger value="scrapbook">My scrapbook</TabsTrigger>
                <TabsTrigger value="details">
                  My answers <span className="count">{count}</span>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="scrapbook">
                <article className="scrapbook">
                  <div className="paper-content">
                    <div className="profile-cover">
                      <div className="profile-header">
                        <span className="profile-avatar" aria-hidden="true">
                          {name.trim().slice(0, 1).toUpperCase() || 'Y'}
                        </span>
                        <div>
                          <p className="belonging">
                            {name ? `${name}’s capsule` : 'Your capsule'}
                          </p>
                          <p className="profile-date">
                            {new Date(
                              draft.date + 'T12:00:00',
                            ).toLocaleDateString('en-US', {
                              month: 'long',
                              year: 'numeric',
                            })}{' '}
                            · {demo ? 'Sample' : 'Draft'}
                          </p>
                        </div>
                        <span className="era-sticker">IN MY ERA ✦</span>
                      </div>
                      <h2>{title || 'This is me, lately.'}</h2>
                    </div>
                    {demo && photoVisible && (
                      <figure className="polaroid">
                        <img
                          src={photo}
                          alt="People spending an afternoon beside a lake surrounded by evergreen trees"
                          onError={() => setPhotoVisible(false)}
                        />
                        <figcaption className="handwritten">
                          Offline. Outside. Exactly where I want to be.
                        </figcaption>
                      </figure>
                    )}
                    {!demo &&
                      photos.length > 0 &&
                      (() => {
                        const cover =
                          photos.find((p) => p.id === draft.coverId) ||
                          photos[0];
                        return (
                          <figure className="polaroid">
                            <img
                              src={'/api/photos?id=' + cover.id}
                              alt={cover.caption || cover.filename}
                            />
                            {cover.caption && (
                              <figcaption>{cover.caption}</figcaption>
                            )}
                          </figure>
                        );
                      })()}
                    <div className="memory-note">
                      <p className="eyebrow">LIFE, RIGHT NOW</p>
                      <p>
                        {answers[starters[0]] ||
                          'A few words today. A memory for another day.'}
                      </p>
                    </div>
                    <div className="little-notes">
                      {starters.slice(1).map((q, i) => (
                        <section
                          className={i ? 'note note-blue' : 'note note-yellow'}
                          key={q}
                        >
                          <span className="eyebrow">
                            {i ? 'UP NEXT ↗' : 'ON REPEAT ♡'}
                          </span>
                          <p>
                            {answers[q] ||
                              (i
                                ? 'Something to look forward to…'
                                : 'The things you can’t get enough of…')}
                          </p>
                        </section>
                      ))}
                    </div>
                    {categories.map((c) => {
                      const filled = c.prompts.filter((q) =>
                        answers[q]?.trim(),
                      );
                      return (
                        filled.length > 0 && (
                          <section className="filled-category" key={c.name}>
                            <h3>
                              <c.icon size={18} />
                              {c.name}
                            </h3>
                            {filled.map((q) => (
                              <div key={q}>
                                <p className="question-caption">{q}</p>
                                <p>{answers[q]}</p>
                              </div>
                            ))}
                          </section>
                        )
                      );
                    })}
                    {!demo && photos.length > 1 && (
                      <section
                        className="memory-gallery"
                        aria-label="More capsule photos"
                      >
                        {photos
                          .filter(
                            (p) => p.id !== (draft.coverId || photos[0]?.id),
                          )
                          .map((p) => (
                            <figure key={p.id}>
                              <img
                                src={'/api/photos?id=' + p.id}
                                alt={p.caption || p.filename}
                              />
                              {p.caption && (
                                <figcaption>{p.caption}</figcaption>
                              )}
                            </figure>
                          ))}
                      </section>
                    )}
                    <footer className="paper-footer">
                      <span>THIS IS ME, RIGHT NOW.</span>
                      <Heart size={16} />
                      <span>01</span>
                    </footer>
                  </div>
                </article>
                {demo && (
                  <p className="sample-credit">
                    Fictional sample · Photo by{' '}
                    <a
                      href="https://unsplash.com/photos/a-group-of-people-sitting-at-a-picnic-table-next-to-a-lake-QdFF1x5jqAU"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Sichen Xiang / Unsplash
                    </a>
                  </p>
                )}
              </TabsContent>
              <TabsContent value="details">
                <div className="answers-sheet">
                  <h2>Your words, all together.</h2>
                  <p className="subtext">
                    Edit anything here. Your scrapbook changes with you.
                  </p>
                  <label className="field">
                    Capsule date
                    <input
                      disabled={!canEdit}
                      type="date"
                      value={draft.date}
                      onChange={(e) => {
                        if (e.target.value) change({ date: e.target.value });
                      }}
                    />
                  </label>
                  {starters.map((q) => (
                    <label className="field" key={q}>
                      {q}
                      <textarea
                        disabled={!canEdit}
                        value={answers[q] || ''}
                        onChange={(e) => update(q, e.target.value)}
                        rows={2}
                      />
                    </label>
                  ))}
                  {categories.map(
                    (c) =>
                      c.prompts.some((q) => answers[q]?.trim()) && (
                        <section key={c.name}>
                          <h3>{c.name}</h3>
                          {c.prompts
                            .filter((q) => answers[q]?.trim())
                            .map((q) => (
                              <label className="field" key={q}>
                                {q}
                                <textarea
                                  disabled={!canEdit}
                                  value={answers[q]}
                                  onChange={(e) => update(q, e.target.value)}
                                  rows={2}
                                />
                              </label>
                            ))}
                        </section>
                      ),
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </section>
          <aside className="details-panel">
            <PhotoManager
              key={draft.id + (draft.revision > 0 ? '-saved' : '-new')}
              capsuleId={draft.id}
              coverId={draft.coverId}
              flush={flush}
              onPhotos={setPhotos}
              onCover={async (id) => {
                change({ coverId: id });
                await flush();
              }}
              onRemoved={storage.refresh}
              enabled={canEdit && draft.revision > 0}
            />
            <section className="start-card">
              <span className="section-number">THE QUICK INTRO</span>
              <h2>Catch your current vibe.</h2>
              <p>Three quick questions. The you of right now.</p>
              <button
                className="primary"
                disabled={!canEdit || working}
                onClick={() => setStart(true)}
              >
                {demo ? 'Try it out' : 'Keep going'}
                <ArrowRight size={17} />
              </button>
            </section>
            <section className="category-section">
              <div className="section-heading">
                <div>
                  <span className="section-number">THE REST IS ALL YOU</span>
                  <h2>What’s your thing?</h2>
                </div>
              </div>
              <p className="subtext">
                Tap a category. Drop a memory. Skip anything.
              </p>
              <div className="category-grid">
                {categories.map((c, i) => {
                  const filled = c.prompts.filter((q) =>
                    answers[q]?.trim(),
                  ).length;
                  return (
                    <button
                      key={c.name}
                      disabled={!canEdit || working}
                      className={'category-card ' + c.color}
                      onClick={() => setActive(i)}
                    >
                      <c.icon size={21} strokeWidth={1.6} />
                      <span>{c.name}</span>
                      <small>
                        {filled ? `${filled} of 3 added` : 'Explore'}{' '}
                        <ArrowRight size={13} />
                      </small>
                    </button>
                  );
                })}
              </div>
            </section>
            <section className="future-card">
              <Sparkles size={22} />
              <div>
                <h3>Meet your alter ego</h3>
                <p>Turn this chapter into a character card.</p>
                <button className="text-button" onClick={() => setNotice(true)}>
                  Planned for the next build <ArrowRight size={15} />
                </button>
              </div>
            </section>
            <div className="prototype-note">
              <p>
                Your drafts and original photos are saved to your library.
                Download copies of important memories. Local and hosted
                previews use separate libraries.
              </p>
              <button className="text-button" onClick={download}>
                <Download size={16} /> Download my answers
              </button>
              <p role="status">{message}</p>
            </div>
          </aside>
        </div>
      </main>
      <Dialog open={start} onOpenChange={setStart}>
        <DialogContent className="editor-dialog">
          <DialogTitle className="dialog-heading">
            Start with right now.
          </DialogTitle>
          <DialogDescription>
            A phrase or two is plenty. You can skip any question.
          </DialogDescription>
          <p className="small-note" role="status">
            {demo ? 'Example capsule' : storage.status}
          </p>
          {storage.error && (
            <button className="text-button" onClick={() => setReloadOpen(true)}>
              Restore saved version
            </button>
          )}
          {storage.error && (
            <p className="error-message" role="alert">
              {storage.error}
            </p>
          )}
          <div className="dialog-fields">
            <div className="two-fields">
              <label className="field">
                Your name
                <input
                  disabled={!canEdit}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="First name"
                  maxLength={80}
                />
              </label>
              <label className="field">
                Chapter title
                <input
                  disabled={!canEdit}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="My life lately"
                  maxLength={120}
                />
              </label>
            </div>
            <label className="field">
              Capsule date
              <input
                disabled={!canEdit}
                type="date"
                value={draft.date}
                onChange={(e) => {
                  if (e.target.value) change({ date: e.target.value });
                }}
              />
            </label>
            {starters.map((q) => (
              <label className="field" key={q}>
                {q}
                <textarea
                  disabled={!canEdit}
                  rows={2}
                  value={answers[q] || ''}
                  onChange={(e) => update(q, e.target.value)}
                  placeholder="A little about you…"
                  maxLength={4000}
                />
              </label>
            ))}
          </div>
          <button
            className="primary"
            onClick={() => {
              setStart(false);
              setTab('scrapbook');
            }}
          >
            See my scrapbook
            <ArrowRight size={17} />
          </button>
          <p className="small-note">
            Drafts save automatically to your library.
          </p>
        </DialogContent>
      </Dialog>
      <Dialog
        open={active !== null}
        onOpenChange={(open) => {
          if (!open) setActive(null);
        }}
      >
        <DialogContent className="editor-dialog">
          <DialogTitle className="dialog-heading">
            {active !== null ? categories[active].name : ''}
          </DialogTitle>
          <DialogDescription>
            Just the parts you feel like sharing. Leave the rest for another
            day.
          </DialogDescription>
          <p className="small-note" role="status">
            {demo ? 'Example capsule' : storage.status}
          </p>
          {storage.error && (
            <button className="text-button" onClick={() => setReloadOpen(true)}>
              Restore saved version
            </button>
          )}
          {storage.error && (
            <p className="error-message" role="alert">
              {storage.error}
            </p>
          )}
          <div className="dialog-fields">
            {active !== null &&
              categories[active].prompts.map((q) => (
                <label className="field" key={q}>
                  {q}
                  <textarea
                    disabled={!canEdit}
                    rows={3}
                    value={answers[q] || ''}
                    onChange={(e) => update(q, e.target.value)}
                    placeholder="Write a little memory…"
                    maxLength={4000}
                  />
                </label>
              ))}
          </div>
          <button className="primary" onClick={() => setActive(null)}>
            <Check size={17} /> Back to my scrapbook
          </button>
        </DialogContent>
      </Dialog>
      <Dialog open={notice} onOpenChange={setNotice}>
        <DialogContent>
          <DialogTitle className="dialog-heading">
            A creative chapter, coming next.
          </DialogTitle>
          <DialogDescription>
            The alter ego card is planned for the functional MVP. This prototype
            lets us shape the questions and scrapbook first. No AI service is
            connected yet.
          </DialogDescription>
          <button className="primary" onClick={() => setNotice(false)}>
            Back to my story <ArrowLeft size={17} />
          </button>
        </DialogContent>
      </Dialog>
      <AlertDialog open={reloadOpen} onOpenChange={setReloadOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Restore the saved version?</AlertDialogTitle>
          <AlertDialogDescription>
            This discards your unsaved edits in this window. Download them first
            if you want to keep a copy.
          </AlertDialogDescription>
          <button className="text-button" onClick={download}>
            <Download size={16} /> Download my edits
          </button>
          {message && <p role="alert">{message}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={working}>
              Keep editing
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={working}
              onClick={async () => {
                setWorking(true);
                try {
                  await storage.reloadSaved();
                  setReloadOpen(false);
                } catch (e) {
                  setMessage((e as Error).message);
                } finally {
                  setWorking(false);
                }
              }}
            >
              Restore saved version
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={libraryOpen} onOpenChange={setLibraryOpen}>
        <DialogContent className="editor-dialog">
          <DialogTitle className="dialog-heading">
            Your eras, saved.
          </DialogTitle>
          <DialogDescription>
            Your saved draft capsules. Open one and pick up where you left off.
          </DialogDescription>
          <div className="capsule-library">
            {storage.library.length === 0 ? (
              <p>No capsules yet. Start your first one below.</p>
            ) : (
              storage.library.map((c) => (
                <div key={c.id} className="library-row">
                  <button
                    disabled={working}
                    onClick={async () => {
                      setWorking(true);
                      try {
                        await storage.open(c.id);
                        setLibraryOpen(false);

                        setTab('scrapbook');
                      } catch (e) {
                        setMessage((e as Error).message);
                      } finally {
                        setWorking(false);
                      }
                    }}
                  >
                    <strong>
                      {c.deleting
                        ? 'Deletion needs retry'
                        : c.title || 'Untitled capsule'}
                    </strong>
                    <span>
                      {c.name || 'Your capsule'} · {c.date}
                    </span>
                    <small>
                      {Object.values(c.answers).filter((a) => a.trim()).length}{' '}
                      answers{draft.id === c.id ? ' · Current' : ''}
                    </small>
                  </button>
                  <button
                    className="icon-button"
                    disabled={working}
                    aria-label={'Delete ' + (c.title || 'untitled capsule')}
                    onClick={() => setDeleting(c)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
          <button
            disabled={working}
            className="primary"
            onClick={() => void begin()}
          >
            <Plus size={17} /> Start a new capsule
          </button>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={!!deleting}
        onOpenChange={(v) => {
          if (!v && !working) setDeleting(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogTitle>Delete this capsule?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes this saved draft, its answers, and uploaded
            photos. Other capsules are unaffected.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={working}>
              Keep capsule
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={working}
              onClick={async () => {
                if (!deleting) return;
                setWorking(true);
                try {
                  await storage.remove(deleting.id);

                  setDeleting(null);
                } catch (e) {
                  setMessage((e as Error).message);
                } finally {
                  setWorking(false);
                }
              }}
            >
              Delete capsule
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
