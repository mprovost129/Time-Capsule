import {
  ApiError,
  boundedBody,
  bindings,
  owner,
  guardWrite,
  json,
  failure,
  requireCapsule,
  capsuleFromRow,
} from '@/lib/capsule-server';
import { parseCapsule, validId } from '@/lib/capsule-types';
export async function GET(request: Request) {
  try {
    const user = owner(request);
    const rows = await bindings()
      .DB.prepare(
        'SELECT * FROM capsules WHERE owner = ? ORDER BY updated_at DESC',
      )
      .bind(user)
      .all<Record<string, unknown>>();
    return json({ capsules: rows.results.map(capsuleFromRow) });
  } catch (e) {
    return failure(e);
  }
}
export async function PUT(request: Request) {
  try {
    const user = owner(request);
    guardWrite(request);
    if (!request.headers.get('content-type')?.startsWith('application/json'))
      throw new ApiError(415, 'Expected a capsule.');
    const text = new TextDecoder().decode(await boundedBody(request, 200000));
    if (text.length > 200000)
      throw new ApiError(413, 'This capsule is too large.');
    let c;
    try {
      c = parseCapsule(JSON.parse(text));
    } catch (e) {
      throw new ApiError(
        400,
        e instanceof Error ? e.message : 'Invalid capsule.',
      );
    }
    const { DB } = bindings();
    const now = new Date().toISOString();
    if (c.coverId) {
      const photo = await DB.prepare(
        'SELECT id FROM photos WHERE id = ? AND capsule_id = ?',
      )
        .bind(c.coverId, c.id)
        .first();
      if (!photo) throw new ApiError(400, 'Choose a photo from this capsule.');
    }
    if (c.revision === 0) {
      const result = await DB.prepare(
        'INSERT OR IGNORE INTO capsules (id,owner,name,title,date,answers,cover_id,revision,updated_at) VALUES (?,?,?,?,?,?,?,1,?)',
      )
        .bind(
          c.id,
          user,
          c.name,
          c.title,
          c.date,
          JSON.stringify(c.answers),
          c.coverId,
          now,
        )
        .run();
      if (result.meta.changes !== 1)
        throw new ApiError(
          409,
          'This capsule already exists. Download your changes, then reopen the saved draft.',
        );
    } else {
      const result = await DB.prepare(
        'UPDATE capsules SET name=?, title=?, date=?, answers=?, cover_id=?, revision=revision+1, updated_at=? WHERE id=? AND owner=? AND revision=? AND deleting=0',
      )
        .bind(
          c.name,
          c.title,
          c.date,
          JSON.stringify(c.answers),
          c.coverId,
          now,
          c.id,
          user,
          c.revision,
        )
        .run();
      if (result.meta.changes !== 1)
        throw new ApiError(
          409,
          'This draft changed in another window. Download your changes, then reopen the saved draft.',
        );
    }
    return json({
      capsule: { ...c, revision: c.revision + 1, updatedAt: now },
    });
  } catch (e) {
    return failure(e);
  }
}
export async function DELETE(request: Request) {
  try {
    const user = owner(request);
    guardWrite(request);
    const id = new URL(request.url).searchParams.get('id');
    if (!validId(id)) throw new ApiError(400, 'Invalid capsule.');
    const marked = await bindings()
      .DB.prepare('UPDATE capsules SET deleting=1 WHERE id=? AND owner=?')
      .bind(id, user)
      .run();
    if (marked.meta.changes !== 1)
      throw new ApiError(404, 'Capsule not found.');
    const { DB, PHOTOS } = bindings();
    const files = await DB.prepare(
      'SELECT object_key FROM photos WHERE capsule_id=?',
    )
      .bind(id)
      .all<{ object_key: string }>();
    if (files.results.length)
      await PHOTOS.delete(files.results.map((p) => p.object_key));
    await DB.prepare('DELETE FROM capsules WHERE id=? AND owner=?')
      .bind(id, user)
      .run();
    return json({ deleted: true });
  } catch (e) {
    return failure(e);
  }
}
