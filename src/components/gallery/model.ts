export type Artwork = {
  id: string;
  title: string;
  url: string;
  room?: string;
};

export type Gallery = {
  name: string;
  theme?: 'light' | 'dark';
  artworks: Artwork[];
};

export const GALLERY_DRAFT_KEY = 'gallery_draft_v1';

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

// Unicode-safe Base64 helpers without deprecated escape/unescape
function encodeUtf8ToBase64(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function decodeBase64ToUtf8(input: string): string {
  const binary = atob(input);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export function galleryToHash(gallery: Gallery): string {
  const json = JSON.stringify(gallery);
  return encodeUtf8ToBase64(json);
}

export function galleryFromHash(hash: string): Gallery | null {
  const value = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!value) return null;
  try {
    const json = decodeBase64ToUtf8(value);
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed as Gallery;
  } catch {
    return null;
  }
}

export function loadDraft(): Gallery | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(GALLERY_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed as Gallery;
  } catch {
    return null;
  }
}

export function saveDraft(gallery: Gallery): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(GALLERY_DRAFT_KEY, JSON.stringify(gallery));
  } catch {
    // ignore
  }
}

export function clearDraft(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(GALLERY_DRAFT_KEY);
  } catch {
    // ignore
  }
}


