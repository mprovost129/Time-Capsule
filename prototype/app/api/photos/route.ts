import {
  ApiError,
  boundedBody,
  bindings,
  owner,
  guardWrite,
  json,
  failure,
  requireCapsule,
} from '@/lib/capsule-server';
import {
  validId,
  imageMime,
  MAX_PHOTOS,
  MAX_PHOTO_BYTES,
} from '@/lib/capsule-types';
export async function GET(request: Request) {
  try {
    const user = owner(request);
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const { DB, PHOTOS } = bindings();
    if (id) {
      if (!validId(id)) throw new ApiError(400, 'Invalid photo.');
      const row = await DB.prepare(
        'SELECT p.* FROM photos p JOIN capsules c ON c.id=p.capsule_id WHERE p.id=? AND c.owner=? AND c.deleting=0',
      )
        .bind(id, user)
        .first<{ object_key: string; mime: string }>();
      if (!row) throw new ApiError(404, 'Photo not found.');
      const object = await PHOTOS.get(row.object_key);
      if (!object) throw new ApiError(404, 'Photo not found.');
      return new Response(object.body, {
        headers: {
          'Content-Type': row.mime,
          'Cache-Control': 'private, no-store',
          'X-Content-Type-Options': 'nosniff',
          'Content-Security-Policy': "default-src 'none'",
        },
      });
    }
    const capsuleId = url.searchParams.get('capsuleId');
    if (!validId(capsuleId)) throw new ApiError(400, 'Invalid capsule.');
    await requireCapsule(capsuleId, user);
    const result = await DB.prepare(
      'SELECT id,capsule_id AS capsuleId,filename,mime,size,caption,created_at AS createdAt FROM photos WHERE capsule_id=? ORDER BY created_at,id',
    )
      .bind(capsuleId)
      .all();
    return json({ photos: result.results });
  } catch (e) {
    return failure(e);
  }
}
export async function POST(request: Request) {
  try {
    const user = owner(request);
    guardWrite(request);
    const capsuleId = new URL(request.url).searchParams.get('capsuleId');
    if (!validId(capsuleId)) throw new ApiError(400, 'Invalid capsule.');
    await requireCapsule(capsuleId, user);
    const size = Number(request.headers.get('content-length') || 0);
    if (size > MAX_PHOTO_BYTES + 8192)
      throw new ApiError(413, 'Choose a photo smaller than 10 MB.');
    const bounded = await boundedBody(request, MAX_PHOTO_BYTES + 8192);
    let form: FormData;
    try {
      form = await new Response(bounded, {
        headers: { 'Content-Type': request.headers.get('Content-Type') || '' },
      }).formData();
    } catch {
      throw new ApiError(400, 'Choose a valid photo file.');
    }
    const file = form.get('photo');
    if (
      !(file instanceof File) ||
      file.size === 0 ||
      file.size > MAX_PHOTO_BYTES
    )
      throw new ApiError(400, 'Choose a JPEG, PNG, or WebP photo up to 10 MB.');
    const bytes = new Uint8Array(await file.arrayBuffer());
    const mime = imageMime(bytes);
    if (!mime || file.type !== mime)
      throw new ApiError(415, 'Choose a JPEG, PNG, or WebP photo.');
    const { DB, PHOTOS } = bindings();
    const id = crypto.randomUUID();
    const key = `capsules/${capsuleId}/${id}`;
    const filename = file.name.slice(0, 180);
    const now = new Date().toISOString();
    await PHOTOS.put(key, bytes, { httpMetadata: { contentType: mime } });
    try {
      const result = await DB.prepare(
        'INSERT INTO photos (id,capsule_id,object_key,filename,mime,size,caption,created_at) SELECT ?,?,?,?,?,?,?,? WHERE (SELECT COUNT(*) FROM photos WHERE capsule_id=?) < ? AND EXISTS (SELECT 1 FROM capsules WHERE id=? AND owner=? AND deleting=0)',
      )
        .bind(
          id,
          capsuleId,
          key,
          filename,
          mime,
          file.size,
          '',
          now,
          capsuleId,
          MAX_PHOTOS,
          capsuleId,
          user,
        )
        .run();
      if (result.meta.changes !== 1)
        throw new ApiError(
          409,
          'This capsule already has 10 photos, or is no longer available.',
        );
    } catch (e) {
      await PHOTOS.delete(key);
      throw e;
    }
    return json(
      {
        photo: {
          id,
          capsuleId,
          filename,
          mime,
          size: file.size,
          caption: '',
          createdAt: now,
        },
      },
      201,
    );
  } catch (e) {
    return failure(e);
  }
}
export async function PATCH(request: Request) {
  try {
    const user = owner(request);
    guardWrite(request);
    const body = JSON.parse(
      new TextDecoder().decode(await boundedBody(request, 4096)),
    ) as { id?: unknown; caption?: unknown };
    if (
      !validId(body.id) ||
      typeof body.caption !== 'string' ||
      body.caption.length > 300
    )
      throw new ApiError(400, 'Use a caption up to 300 characters.');
    const result = await bindings()
      .DB.prepare(
        'UPDATE photos SET caption=? WHERE id=? AND capsule_id IN (SELECT id FROM capsules WHERE owner=? AND deleting=0)',
      )
      .bind(body.caption, body.id, user)
      .run();
    if (result.meta.changes !== 1) throw new ApiError(404, 'Photo not found.');
    return json({ saved: true });
  } catch (e) {
    return failure(e);
  }
}
export async function DELETE(request: Request) {
  try {
    const user = owner(request);
    guardWrite(request);
    const id = new URL(request.url).searchParams.get('id');
    if (!validId(id)) throw new ApiError(400, 'Invalid photo.');
    const { DB, PHOTOS } = bindings();
    const row = await DB.prepare(
      'SELECT p.object_key FROM photos p JOIN capsules c ON c.id=p.capsule_id WHERE p.id=? AND c.owner=? AND c.deleting=0',
    )
      .bind(id, user)
      .first<{ object_key: string }>();
    if (!row) throw new ApiError(404, 'Photo not found.');
    await PHOTOS.delete(row.object_key);
    await DB.batch([
      DB.prepare(
        'UPDATE capsules SET cover_id=NULL, revision=revision+1 WHERE cover_id=? AND owner=?',
      ).bind(id, user),
      DB.prepare('DELETE FROM photos WHERE id=?').bind(id),
    ]);
    return json({ deleted: true });
  } catch (e) {
    return failure(e);
  }
}
