import { useEffect, useState } from "react";

const LS_KEY = "reactcards_decks_v2";

function serializeDecks(decks) {
  return decks.map((d) => ({
    ...d,
    hiddenIds: Array.from(d.hiddenIds ?? []),
  }));
}

function deserializeDecks(raw) {
  const arr = Array.isArray(raw) ? raw : [];
  return arr.map((d) => ({
    ...d,
    hiddenIds: new Set(d.hiddenIds ?? []),
  }));
}

export function useDeckStorage(initialDecks = []) {
  const [decks, setDecks] = useState(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        return deserializeDecks(JSON.parse(saved));
      }
    } catch {}
    return initialDecks;
  });

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(serializeDecks(decks)));
    } catch {}
  }, [decks]);

  return [decks, setDecks];
}
