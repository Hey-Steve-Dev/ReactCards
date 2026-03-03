// src/hooks/useDeckStorage.js
import { useEffect, useRef, useState, useCallback } from "react";

const STORAGE_KEY = "reactcards_decks_v1";

function serializeDecks(decks) {
  return JSON.stringify(
    (decks || []).map((d) => ({
      ...d,
      hiddenIds: Array.from(d.hiddenIds ?? []),
    }))
  );
}

function deserializeDecks(raw) {
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) return [];

  return parsed.map((d) => ({
    ...d,
    hiddenIds: new Set(d.hiddenIds ?? []),
  }));
}

/**
 * Keep the FIRST occurrence of each id (top-of-list wins),
 * drop the rest. This prevents duplicate React keys and “new instances”.
 */
function dedupeDecksById(decks) {
  const seen = new Set();
  const out = [];
  for (const d of decks) {
    const id = String(d?.id ?? "");
    if (!id) continue;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(d);
  }
  return out;
}

/**
 * useDeckStorage(initial) -> [decks, setDecks, hydrated]
 */
export function useDeckStorage(initialDecks = []) {
  const [decks, _setDecks] = useState(() => dedupeDecksById(initialDecks));
  const [hydrated, setHydrated] = useState(false);

  const didHydrateRef = useRef(false);

  // Wrap setDecks so ALL writes get deduped
  const setDecks = useCallback((next) => {
    _setDecks((prev) => {
      const computed = typeof next === "function" ? next(prev) : next;
      return dedupeDecksById(Array.isArray(computed) ? computed : []);
    });
  }, []);

  // Load once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const loaded = dedupeDecksById(deserializeDecks(raw));
        _setDecks(loaded);
      }
    } catch {
      // ignore
    } finally {
      setHydrated(true);
      didHydrateRef.current = true;
    }
  }, []);

  // Save on change (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    if (!didHydrateRef.current) return;

    try {
      localStorage.setItem(STORAGE_KEY, serializeDecks(decks));
    } catch {
      // ignore
    }
  }, [decks, hydrated]);

  return [decks, setDecks, hydrated];
}
