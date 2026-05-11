import { use } from "react";

export type Note = { id: string; title: string; body: string };

const NOTES: Note[] = [
  {
    id: "a",
    title: "No loader, just a hook",
    body: "This page has no loader.ts. The hook below throws a promise; LoadingBoundary's <Suspense> catches it and renders loading.tsx.",
  },
  {
    id: "b",
    title: "Cache the promise",
    body: "use() needs a stable promise reference, so the hook memoizes per key. Without that, every render restarts the wait and the fallback never clears.",
  },
  {
    id: "c",
    title: "Per-id remount",
    body: "Navigating between notes mounts a new component with a fresh id, which suspends on its own cached promise — same loading.tsx fires again.",
  },
];

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

let listPromise: Promise<Note[]> | null = null;
const detailCache = new Map<string, Promise<Note>>();

export function useNotes(): Note[] {
  listPromise ??= sleep(600).then(() => NOTES);
  return use(listPromise);
}

export function useNote(id: string): Note {
  let p = detailCache.get(id);
  if (!p) {
    p = sleep(600).then(() => {
      const note = NOTES.find((n) => n.id === id);
      if (!note) throw new Error(`Note "${id}" not found`);
      return note;
    });
    detailCache.set(id, p);
  }
  return use(p);
}
