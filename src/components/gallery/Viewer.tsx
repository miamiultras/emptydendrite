import { useEffect, useMemo, useState } from 'preact/hooks';
import type { Artwork, Gallery } from './model';
import { galleryFromHash } from './model';

export default function Viewer() {
  const [gallery, setGallery] = useState<Gallery | null>(null);

  useEffect(() => {
    setGallery(galleryFromHash(location.hash));
    const onHash = () => setGallery(galleryFromHash(location.hash));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const grouped = useMemo<Array<[string, Artwork[]]>>(() => {
    if (!gallery) return [];
    const map = new Map<string, Artwork[]>();
    for (const a of gallery.artworks || []) {
      const key = a.room && a.room.trim() !== '' ? a.room : 'Main';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(a);
    }
    return Array.from(map.entries());
  }, [gallery]);

  if (!gallery) {
    return (
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        <div>No gallery data in URL.</div>
        <div>
          Open via a link like <code>/gallery/viewer#&lt;base64-json&gt;</code> generated in the editor.
        </div>
        <a href="/gallery/editor">Go to editor</a>
      </div>
    );
  }

  const dark = gallery.theme === 'dark';

  return (
    <div style={{ display: 'grid', gap: '1rem', color: dark ? '#eaeaea' : 'inherit' }}>
      <h2 style={{ margin: 0 }}>{gallery.name}</h2>
      {grouped.map(([room, items]) => (
        <section
          style={{ border: '1px solid var(--color-border, #ddd)', padding: '0.75rem', borderRadius: 8, background: dark ? '#111' : '#fff' }}
        >
          <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{room}</div>
          <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
            {items.map((a) => (
              <figure style={{ margin: 0 }}>
                <img
                  src={a.url}
                  alt={a.title}
                  style={{ width: '100%', height: 260, objectFit: 'cover', borderRadius: 8, border: '1px solid #e6e6e6' }}
                />
                <figcaption style={{ marginTop: 6, fontSize: 13, opacity: 0.9 }}>{a.title}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}


