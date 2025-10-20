import { useEffect, useMemo, useState } from 'preact/hooks';
import type { JSX } from 'preact';
import type { Artwork, Gallery } from './model';
import { clearDraft, generateId, loadDraft, saveDraft, galleryToHash } from './model';

type NewArtwork = Pick<Artwork, 'title' | 'url' | 'room'>;

export default function Editor() {
  const [name, setName] = useState<string>('My Gallery');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [newArtwork, setNewArtwork] = useState<NewArtwork>({ title: '', url: '', room: '' });
  const [shareLink, setShareLink] = useState<string>('');

  const onNameInput = (e: JSX.TargetedEvent<HTMLInputElement, Event>) => {
    setName(e.currentTarget.value);
  };

  const onThemeChange = (e: JSX.TargetedEvent<HTMLSelectElement, Event>) => {
    setTheme((e.currentTarget.value as 'light' | 'dark'));
  };

  const onUrlInput = (e: JSX.TargetedEvent<HTMLInputElement, Event>) => {
    const value = e.currentTarget.value;
    setNewArtwork(s => ({ ...s, url: value }));
  };

  const onTitleInput = (e: JSX.TargetedEvent<HTMLInputElement, Event>) => {
    const value = e.currentTarget.value;
    setNewArtwork(s => ({ ...s, title: value }));
  };

  const onRoomInput = (e: JSX.TargetedEvent<HTMLInputElement, Event>) => {
    const value = e.currentTarget.value;
    setNewArtwork(s => ({ ...s, room: value }));
  };

  const onShareFocus = (e: JSX.TargetedEvent<HTMLInputElement, FocusEvent>) => {
    e.currentTarget.select();
  };

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
    <div class="stack-1">
      <section class="panel stack-2">
        <label>
          <div>Name</div>
          <input class="input-text" value={name} onInput={onNameInput} />
        </label>
        <label>
          <div>Theme</div>
          <select class="select" value={theme} onChange={onThemeChange}>
            <option value="light">light</option>
            <option value="dark">dark</option>
          </select>
        </label>
      </section>

      <section class="panel stack-2">
        <div class="section-title">Add artwork</div>
        <input class="input-text" placeholder="Image URL" value={newArtwork.url} onInput={onUrlInput} />
        <input class="input-text" placeholder="Title (optional)" value={newArtwork.title} onInput={onTitleInput} />
        <input class="input-text" placeholder='Room (optional, e.g. "Room A")' value={newArtwork.room} onInput={onRoomInput} />
        <button class="btn" onClick={addArtwork}>Add</button>
      </section>

      <section class="panel stack-2">
        <div class="section-title">Preview</div>
        {grouped.length === 0 ? (
          <div>No artworks yet.</div>
        ) : (
          grouped.map(([room, items]) => (
            <div class="panel stack-2">
              <div class="section-title">{room}</div>
              <div class="grid-thumbs">
                {items.map(a => (
                  <figure class="art-card">
                    <img loading="lazy" src={a.url} alt={a.title} class="art-image" />
                    <figcaption class="art-caption">
                      <span title={a.title}>{a.title}</span>
                      <button class="btn btn--sm" onClick={() => removeArtwork(a.id)}>Remove</button>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          ))
        )}
      </section>

      <section class="panel stack-2">
        <div class="btn-row">
          <button class="btn" onClick={generateLink}>Generate share link</button>
          <button class="btn" onClick={openViewer}>Open viewer</button>
          <button class="btn" onClick={resetDraft}>Clear draft</button>
        </div>
        <input class="input-text" readOnly placeholder="Share link will appear here" value={shareLink} onFocus={onShareFocus} />
      </section>
    </div>
  );
}


