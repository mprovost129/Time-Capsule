'use client';
import { useEffect, useState } from 'react';
import { Upload, ImagePlus, Star, Trash2, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { api } from '@/hooks/use-capsules';
import type { Photo } from '@/lib/capsule-types';
import { MAX_PHOTOS, MAX_PHOTO_BYTES } from '@/lib/capsule-types';
export function PhotoManager({
  capsuleId,
  coverId,
  flush,
  onPhotos,
  onCover,
  onRemoved,
  enabled,
}: {
  capsuleId: string;
  coverId: string | null;
  flush: () => Promise<void>;
  onPhotos: (p: Photo[]) => void;
  onCover: (id: string) => Promise<void>;
  onRemoved: () => Promise<void>;
  enabled: boolean;
}) {
  const [photos, setPhotos] = useState<Photo[]>([]),
    [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [deleting, setDeleting] = useState<Photo | null>(null),
    [captions, setCaptions] = useState<Record<string, string>>({}),
    [captionStatus, setCaptionStatus] = useState('');
  useEffect(() => {
    let cancelled = false;
    setPhotos([]);
    onPhotos([]);
    if (capsuleId === 'sample' || !enabled) return;
    api<{ photos: Photo[] }>('/api/photos?capsuleId=' + capsuleId)
      .then((data) => {
        if (!cancelled) {
          setPhotos(data.photos);
          onPhotos(data.photos);
          setCaptions(
            Object.fromEntries(data.photos.map((p) => [p.id, p.caption])),
          );
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [capsuleId, onPhotos, enabled]);
  function update(next: Photo[]) {
    setPhotos(next);
    onPhotos(next);
  }
  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setError('');
    setBusy(true);
    try {
      await flush();
      if (files.length + photos.length > MAX_PHOTOS)
        throw new Error('You can add up to 10 photos per capsule.');
      let next = photos;
      for (const file of Array.from(files)) {
        if (
          file.size > MAX_PHOTO_BYTES ||
          !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
        )
          throw new Error(
            `${file.name}: choose JPEG, PNG, or WebP up to 10 MB. iPhone HEIC photos need to be exported as JPEG first.`,
          );
        const objectUrl = URL.createObjectURL(file);
        try {
          await new Promise<void>((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve();
            image.onerror = () =>
              reject(new Error(`${file.name} could not be opened as a photo.`));
            image.src = objectUrl;
          });
        } finally {
          URL.revokeObjectURL(objectUrl);
        }
        const form = new FormData();
        form.set('photo', file);
        const result = await api<{ photo: Photo }>(
          '/api/photos?capsuleId=' + capsuleId,
          { method: 'POST', body: form },
        );
        next = [...next, result.photo];
        update(next);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed.');
    } finally {
      setBusy(false);
    }
  }
  async function caption(p: Photo) {
    setBusy(true);
    setError('');
    try {
      const value = captions[p.id] ?? p.caption;
      await api('/api/photos', {
        method: 'PATCH',
        body: JSON.stringify({ id: p.id, caption: value }),
      });
      update(
        photos.map((photo) =>
          photo.id === p.id ? { ...photo, caption: value } : photo,
        ),
      );
      setCaptionStatus('Caption saved.');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    if (!deleting) return;
    setBusy(true);
    setError('');
    try {
      await flush();
      await api('/api/photos?id=' + deleting.id, { method: 'DELETE' });
      update(photos.filter((p) => p.id !== deleting.id));
      await onRemoved();
      setDeleting(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <button
        className="photo-entry"
        disabled={!enabled || capsuleId === 'sample'}
        onClick={() => setOpen(true)}
      >
        <ImagePlus size={22} />
        <span>
          <strong>Your photo collection</strong>
          <small>
            {capsuleId === 'sample'
              ? 'Start a capsule to add photos'
              : `${photos.length} of 10 photos · Add & organize`}
          </small>
        </span>
        <Upload size={18} />
      </button>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!busy) setOpen(v);
        }}
      >
        <DialogContent className="editor-dialog photo-dialog">
          <DialogTitle className="dialog-heading">
            The camera roll, curated.
          </DialogTitle>
          <DialogDescription>
            Up to 10 photos. JPEG, PNG, or WebP, up to 10 MB each. Originals are
            kept in your capsule library. Use Save caption to keep caption
            edits.
          </DialogDescription>
          <label className="upload-zone">
            <Upload size={25} />
            <strong>{busy ? 'Working…' : 'Choose your photos'}</strong>
            <input
              aria-label="Choose photos"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              disabled={busy || photos.length >= 10}
              onChange={(e) => {
                void upload(e.target.files);
                e.target.value = '';
              }}
            />
          </label>
          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}
          <div className="photo-editor-grid">
            {photos.map((p, i) => (
              <section key={p.id} className="photo-editor">
                <img
                  src={'/api/photos?id=' + p.id}
                  alt={p.caption || p.filename}
                />
                <div className="photo-actions">
                  <button
                    className="text-button"
                    disabled={busy}
                    onClick={async () => {
                      setBusy(true);
                      setError('');
                      try {
                        await onCover(p.id);
                      } catch (e) {
                        setError((e as Error).message);
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >
                    <Star
                      size={15}
                      fill={
                        coverId === p.id || (!coverId && i === 0)
                          ? 'currentColor'
                          : 'none'
                      }
                    />
                    {coverId === p.id || (!coverId && i === 0)
                      ? 'Cover photo'
                      : 'Make cover'}
                  </button>
                  <button
                    className="icon-button"
                    disabled={busy}
                    aria-label={'Remove ' + p.filename}
                    onClick={() => setDeleting(p)}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
                <a
                  className="text-button"
                  href={'/api/photos?id=' + p.id}
                  download={p.filename}
                >
                  Download original
                </a>
                <label className="field">
                  Caption
                  <input
                    value={captions[p.id] ?? p.caption}
                    maxLength={300}
                    onChange={(e) => {
                      setCaptions((c) => ({ ...c, [p.id]: e.target.value }));
                      setCaptionStatus('');
                    }}
                  />
                </label>
                <button
                  disabled={busy || (captions[p.id] ?? p.caption) === p.caption}
                  className="text-button"
                  onClick={() => void caption(p)}
                >
                  <Check size={15} /> Save caption
                </button>
              </section>
            ))}
          </div>
          <p role="status" className="small-note">
            {captionStatus}
          </p>
          <button
            disabled={busy}
            className="primary"
            onClick={() => setOpen(false)}
          >
            Back to my scrapbook
          </button>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={!!deleting}
        onOpenChange={(v) => {
          if (!v && !busy) setDeleting(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogTitle>Remove this photo?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes the photo and its caption from this capsule. Your
            original file is unchanged.
          </AlertDialogDescription>
          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Keep photo</AlertDialogCancel>
            <AlertDialogAction disabled={busy} onClick={() => void remove()}>
              Remove photo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
