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

  // Apply gallery theme to the document (so global dark styles take effect)
  useEffect(() => {
    if (!gallery) return;
    const root = document.documentElement;
    if (gallery.theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [gallery]);

  if (!gallery) {
    return (
      <div class="stack-2">
        <div>No gallery data in URL.</div>
        <div>
          Open via a link like <code>/gallery/viewer#&lt;base64-json&gt;</code> generated in the editor.
        </div>
        <a href="/gallery/editor">Go to editor</a>
      </div>
    );
  }

  return (
    <div class="stack-1">
      <h2 class="gallery-title">{gallery.name}</h2>
      {grouped.map(([room, items]) => (
        <section class="panel">
          <div class="section-title">{room}</div>
          <div class="grid-thumbs">
            {items.map((a) => (
              <figure class="art-card">
                <img loading="lazy" src={a.url} alt={a.title} class="art-image" />
                <figcaption class="art-caption">{a.title}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}


