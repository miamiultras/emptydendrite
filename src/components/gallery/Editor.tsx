import { useEffect, useMemo, useState } from 'preact/hooks';
import type { Artwork, Gallery } from './model';
import { clearDraft, generateId, loadDraft, saveDraft, galleryToHash } from './model';

type NewArtwork = Pick<Artwork, 'title' | 'url' | 'room'>;

export default function Editor() {
  const [name, setName] = useState<string>('My Gallery');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [newArtwork, setNewArtwork] = useState<NewArtwork>({ title: '', url: '', room: '' });
  const [shareLink, setShareLink] = useState<string>('');

  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setName(draft.name || 'My Gallery');
      setTheme((draft.theme as any) || 'light');
      setArtworks(Array.isArray(draft.artworks) ? draft.artworks : []);
    }
  }, []);

  useEffect(() => {
    const gallery: Gallery = { name, theme, artworks };
    saveDraft(gallery);
  }, [name, theme, artworks]);

  const grouped = useMemo(() => {
    const map = new Map<string, Artwork[]>();
    for (const a of artworks) {
      const key = a.room && a.room.trim() !== '' ? a.room : 'Main';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(a);
    }
    return Array.from(map.entries());
  }, [artworks]);

  function addArtwork() {
    const url = newArtwork.url.trim();
    if (!url) return;
    const title = newArtwork.title.trim() || 'Untitled';
    const room = newArtwork.room?.trim();
    setArtworks(prev => [...prev, { id: generateId(), title, url, room: room || undefined }]);
    setNewArtwork({ title: '', url: '', room: '' });
  }

  function removeArtwork(id: string) {
    setArtworks(prev => prev.filter(a => a.id !== id));
  }

  function buildShareLink() {
    const payload: Gallery = { name: name.trim() || 'My Gallery', theme, artworks };
    const hash = galleryToHash(payload);
    const base = `${location.origin}/gallery/viewer`;
    return `${base}#${hash}`;
  }

  function generateLink() {
    setShareLink(buildShareLink());
  }

  function openViewer() {
    const url = shareLink || buildShareLink();
    setShareLink(url);
    window.open(url, '_blank');
  }

  function resetDraft() {
    clearDraft();
    location.reload();
  }

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <section style={{ display: 'grid', gap: '0.5rem' }}>
        <label>
          <div>Name</div>
          <input value={name} onInput={(e: any) => setName(e.currentTarget.value)} />
        </label>
        <label>
          <div>Theme</div>
          <select value={theme} onChange={(e: any) => setTheme(e.currentTarget.value)}>
            <option value="light">light</option>
            <option value="dark">dark</option>
          </select>
        </label>
      </section>

      <section style={{ display: 'grid', gap: '0.5rem' }}>
        <div style={{ fontWeight: 600 }}>Add artwork</div>
        <input placeholder="Image URL" value={newArtwork.url} onInput={(e: any) => setNewArtwork(s => ({ ...s, url: e.currentTarget.value }))} />
        <input placeholder="Title (optional)" value={newArtwork.title} onInput={(e: any) => setNewArtwork(s => ({ ...s, title: e.currentTarget.value }))} />
        <input placeholder='Room (optional, e.g. "Room A")' value={newArtwork.room} onInput={(e: any) => setNewArtwork(s => ({ ...s, room: e.currentTarget.value }))} />
        <button onClick={addArtwork}>Add</button>
      </section>

      <section style={{ display: 'grid', gap: '0.5rem' }}>
        <div style={{ fontWeight: 600 }}>Preview</div>
        {grouped.length === 0 ? (
          <div>No artworks yet.</div>
        ) : (
          grouped.map(([room, items]) => (
            <div style={{ border: '1px solid var(--color-border, #ddd)', padding: '0.75rem', borderRadius: '8px' }}>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{room}</div>
              <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
                {items.map(a => (
                  <figure style={{ margin: 0 }}>
                    <img src={a.url} alt={a.title} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 6, border: '1px solid #e6e6e6' }} />
                    <figcaption style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, fontSize: 12 }}>
                      <span title={a.title}>{a.title}</span>
                      <button onClick={() => removeArtwork(a.id)} style={{ fontSize: 12 }}>Remove</button>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          ))
        )}
      </section>

      <section style={{ display: 'grid', gap: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={generateLink}>Generate share link</button>
          <button onClick={openViewer}>Open viewer</button>
          <button onClick={resetDraft}>Clear draft</button>
        </div>
        <input readOnly placeholder="Share link will appear here" value={shareLink} onFocus={(e: any) => e.currentTarget.select()} />
      </section>
    </div>
  );
}


