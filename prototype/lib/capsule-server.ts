import { env } from 'cloudflare:workers';
export function bindings() {
  return env as unknown as { DB: D1Database; PHOTOS: R2Bucket };
}
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function owner(request: Request) {
  const id = request.headers.get('oai-authenticated-user-id');
  if (!id) throw new ApiError(401, 'Enable saved capsules to continue.');
  return id;
}
export function guardWrite(request: Request) {
  const origin = request.headers.get('origin');
  if (
    origin !== new URL(request.url).origin ||
    request.headers.get('sec-fetch-site') === 'cross-site'
  )
    throw new ApiError(403, 'This request could not be verified.');
}
export function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
export async function boundedBody(request: Request, limit: number) {
  if (Number(request.headers.get('content-length') || 0) > limit)
    throw new ApiError(413, 'The upload is too large.');
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > limit) {
        await reader.cancel();
        throw new ApiError(413, 'The upload is too large.');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return bytes;
}
export function failure(error: unknown) {
  return json(
    {
      error:
        error instanceof ApiError
          ? error.message
          : 'Something went wrong. Your changes have not been saved.',
    },
    error instanceof ApiError ? error.status : 500,
  );
}
export async function requireCapsule(id: string, user: string) {
  const row = await bindings()
    .DB.prepare(
      'SELECT * FROM capsules WHERE id = ? AND owner = ? AND deleting = 0',
    )
    .bind(id, user)
    .first<Record<string, unknown>>();
  if (!row) throw new ApiError(404, 'Capsule not found.');
  return row;
}
export function capsuleFromRow(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name,
    title: row.title,
    date: row.date,
    answers: JSON.parse(String(row.answers)),
    coverId: row.cover_id,
    revision: row.revision,
    updatedAt: row.updated_at,
    deleting: Boolean(row.deleting),
  };
}
