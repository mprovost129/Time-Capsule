export type Capsule = {
  id: string;
  name: string;
  title: string;
  date: string;
  answers: Record<string, string>;
  coverId: string | null;
  revision: number;
  updatedAt: string;
  deleting?: boolean;
};
export type Photo = {
  id: string;
  capsuleId: string;
  filename: string;
  mime: string;
  size: number;
  caption: string;
  createdAt: string;
};
export const MAX_PHOTOS = 10;
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
export function validId(id: unknown): id is string {
  return (
    typeof id === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      id,
    )
  );
}
export function parseCapsule(input: unknown): Capsule {
  if (!input || typeof input !== 'object') throw new Error('Invalid capsule.');
  const v = input as Capsule;
  if (
    !validId(v.id) ||
    typeof v.name !== 'string' ||
    v.name.length > 80 ||
    typeof v.title !== 'string' ||
    v.title.length > 120 ||
    !/^\d{4}-\d{2}-\d{2}$/.test(v.date) ||
    !Number.isFinite(Date.parse(v.date)) ||
    new Date(v.date).toISOString().slice(0, 10) !== v.date ||
    !Number.isInteger(v.revision) ||
    v.revision < 0 ||
    (!validId(v.coverId) && v.coverId !== null)
  )
    throw new Error('Check the capsule name, title, and date.');
  if (
    !v.answers ||
    typeof v.answers !== 'object' ||
    Array.isArray(v.answers) ||
    Object.keys(v.answers).length > 40 ||
    Object.entries(v.answers).some(
      ([k, a]) => k.length > 160 || typeof a !== 'string' || a.length > 4000,
    )
  )
    throw new Error('An answer is too long or invalid.');
  return {
    id: v.id,
    name: v.name,
    title: v.title,
    date: v.date,
    answers: v.answers,
    coverId: v.coverId,
    revision: v.revision,
    updatedAt: '',
  };
}
export function imageMime(bytes: Uint8Array): string | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
    return 'image/jpeg';
  if ([137, 80, 78, 71, 13, 10, 26, 10].every((n, i) => bytes[i] === n))
    return 'image/png';
  if (
    String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
    String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'
  )
    return 'image/webp';
  return null;
}
