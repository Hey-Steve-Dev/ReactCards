// src/App.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import {
  importDeckFromPublishedTabUrl,
  importDeckIndexFromPublishedTabUrl,
} from "./lib/sheetsImport";

/**
 * Built-in hard-coded decks
 * - These will ALWAYS be ensured on startup (they reappear after refresh, even if deleted).
 * - Put your real permanent sheet links here.
 */
const BUILTIN_DECK_SOURCES = [
  // EXAMPLE: replace with your permanent sheets
  // {
  //   id: "builtin_python",
  //   name: "Python (Built-in)",
  //   tabUrl: "https://docs.google.com/spreadsheets/d/<ID>/edit#gid=0",
  // },
];

const LS_KEY = "reactcards_decks_v2";
const LS_SETTINGS_KEY = "reactcards_settings_v1";

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

function isSheetDeck(deck) {
  return deck?.source?.type === "google_sheet_tab" && !!deck?.source?.tabUrl;
}

function formatTime(ts) {
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return "";
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState("admin");

  // Settings
  const [autoRefreshOnLoad, setAutoRefreshOnLoad] = useState(true);
  const [autoRefreshIntervalMin, setAutoRefreshIntervalMin] = useState(0); // 0 = off

  // Decks
  const [decks, setDecks] = useState(() => {
    // Load decks from localStorage
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) return deserializeDecks(JSON.parse(saved));
    } catch {}
    return [];
  });

  const [selectedDeckId, setSelectedDeckId] = useState(() => decks[0]?.id ?? null);
  const [search, setSearch] = useState("");

  // Single deck import
  const [importUrl, setImportUrl] = useState("");
  const [importName, setImportName] = useState("");
  const [importStatus, setImportStatus] = useState("");
  const [importBusy, setImportBusy] = useState(false);

  // Deck index import
  const [indexUrl, setIndexUrl] = useState("");
  const [indexStatus, setIndexStatus] = useState("");
  const [indexBusy, setIndexBusy] = useState(false);

  // Keep selectedDeckId valid if decks change
  useEffect(() => {
    if (!decks.length) {
      setSelectedDeckId(null);
      return;
    }
    if (selectedDeckId && decks.some((d) => d.id === selectedDeckId)) return;
    setSelectedDeckId(decks[0].id);
  }, [decks, selectedDeckId]);

  // Persist decks
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(serializeDecks(decks)));
    } catch {}
  }, [decks]);

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem(
        LS_SETTINGS_KEY,
        JSON.stringify({ autoRefreshOnLoad, autoRefreshIntervalMin })
      );
    } catch {}
  }, [autoRefreshOnLoad, autoRefreshIntervalMin]);

  // Load settings on first mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_SETTINGS_KEY);
      if (!saved) return;
      const s = JSON.parse(saved);
      if (typeof s.autoRefreshOnLoad === "boolean") setAutoRefreshOnLoad(s.autoRefreshOnLoad);
      if (typeof s.autoRefreshIntervalMin === "number") setAutoRefreshIntervalMin(s.autoRefreshIntervalMin);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ensure built-in decks exist (reappear after refresh)
  useEffect(() => {
    if (!BUILTIN_DECK_SOURCES.length) return;

    setDecks((prev) => {
      const next = [...prev];

      for (const b of BUILTIN_DECK_SOURCES) {
        const exists = next.some((d) => d.id === b.id);
        if (!exists) {
          next.unshift({
            id: b.id,
            name: b.name,
            source: { type: "google_sheet_tab", tabUrl: b.tabUrl },
            cards: [],
            hiddenIds: new Set(),
            builtin: true,
            lastSyncAt: 0,
          });
        } else {
          // ensure builtin flag stays true if it exists
          for (let i = 0; i < next.length; i++) {
            if (next[i].id === b.id) {
              next[i] = { ...next[i], builtin: true, source: { type: "google_sheet_tab", tabUrl: b.tabUrl } };
              break;
            }
          }
        }
      }

      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedDeck = useMemo(
    () => decks.find((d) => d.id === selectedDeckId) ?? null,
    [decks, selectedDeckId]
  );

  const filteredCards = useMemo(() => {
    if (!selectedDeck) return [];
    const q = search.toLowerCase().trim();
    if (!q) return selectedDeck.cards;
    return selectedDeck.cards.filter(
      (c) =>
        c.question.toLowerCase().includes(q) ||
        c.answer.toLowerCase().includes(q)
    );
  }, [selectedDeck, search]);

  function toggleHidden(cardId) {
    setDecks((prev) =>
      prev.map((d) => {
        if (d.id !== selectedDeckId) return d;
        const nextHidden = new Set(d.hiddenIds);
        if (nextHidden.has(cardId)) nextHidden.delete(cardId);
        else nextHidden.add(cardId);
        return { ...d, hiddenIds: nextHidden };
      })
    );
  }

  function unhideAll() {
    setDecks((prev) =>
      prev.map((d) => {
        if (d.id !== selectedDeckId) return d;
        return { ...d, hiddenIds: new Set() };
      })
    );
  }

  function deleteDeck(deckId) {
    setDecks((prev) => prev.filter((d) => d.id !== deckId));
  }

  function renameDeck(deckId, newName) {
    const name = String(newName || "").trim();
    if (!name) return;
    setDecks((prev) => prev.map((d) => (d.id === deckId ? { ...d, name } : d)));
  }

  async function refreshDeck(deck) {
    if (!isSheetDeck(deck)) return;

    // keep existing name unless user typed override; keep hidden state
    const existingHidden = deck.hiddenIds ?? new Set();
    const existingName = deck.name;

    const refreshed = await importDeckFromPublishedTabUrl(deck.source.tabUrl, existingName);

    setDecks((prev) =>
      prev.map((d) => {
        if (d.id !== deck.id) return d;
        return {
          ...d,
          ...refreshed,
          id: d.id, // preserve id if builtin uses custom id
          name: existingName,
          builtin: !!d.builtin,
          hiddenIds: existingHidden, // keep hidden preferences across refresh
          lastSyncAt: Date.now(),
          source: { ...d.source, ...refreshed.source },
        };
      })
    );
  }

  async function refreshAllSheets() {
    const sheetDecks = decks.filter(isSheetDeck);
    for (const d of sheetDecks) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await refreshDeck(d);
      } catch {
        // ignore per-deck errors (we can surface later)
      }
    }
  }

  // Auto-refresh on load (once)
  const didAutoRefreshRef = useRef(false);
  useEffect(() => {
    if (!autoRefreshOnLoad) return;
    if (didAutoRefreshRef.current) return;
    if (!decks.length) return;

    didAutoRefreshRef.current = true;
    refreshAllSheets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefreshOnLoad, decks.length]);

  // Optional interval refresh
  useEffect(() => {
    if (!autoRefreshIntervalMin || autoRefreshIntervalMin < 1) return;

    const ms = autoRefreshIntervalMin * 60 * 1000;
    const t = setInterval(() => {
      refreshAllSheets();
    }, ms);

    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefreshIntervalMin, decks.length]);

  async function handleImportDeck() {
    try {
      setImportBusy(true);
      setImportStatus("Importing…");

      const newDeck = await importDeckFromPublishedTabUrl(importUrl, importName);

      setDecks((prev) => {
        const exists = prev.some((d) => d.id === newDeck.id);
        return exists
          ? prev.map((d) => (d.id === newDeck.id ? { ...newDeck, hiddenIds: d.hiddenIds, lastSyncAt: Date.now() } : d))
          : [{ ...newDeck, lastSyncAt: Date.now() }, ...prev];
      });

      setSelectedDeckId(newDeck.id);
      setSearch("");
      setImportStatus(`Imported ${newDeck.cards.length} cards ✅`);
      setImportUrl("");
      setImportName("");
    } catch (e) {
      setImportStatus(e?.message || "Import failed.");
    } finally {
      setImportBusy(false);
    }
  }

  async function handleImportIndex() {
    try {
      setIndexBusy(true);
      setIndexStatus("Reading index…");

      const items = await importDeckIndexFromPublishedTabUrl(indexUrl);

      setIndexStatus(`Index found ${items.length} decks. Importing…`);

      for (let i = 0; i < items.length; i++) {
        const { name, url } = items[i];
        // eslint-disable-next-line no-await-in-loop
        const d = await importDeckFromPublishedTabUrl(url, name);
        setDecks((prev) => {
          const exists = prev.some((x) => x.id === d.id);
          return exists
            ? prev.map((x) => (x.id === d.id ? { ...d, hiddenIds: x.hiddenIds, lastSyncAt: Date.now() } : x))
            : [{ ...d, lastSyncAt: Date.now() }, ...prev];
        });
      }

      setIndexStatus("Index import complete ✅");
      setIndexUrl("");
    } catch (e) {
      setIndexStatus(e?.message || "Index import failed.");
    } finally {
      setIndexBusy(false);
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <div className="topbar">
            <div className="brand">
              <div className="logo" aria-hidden="true" />
              ReactCards
            </div>

            <nav className="nav">
              <button
                className={`tab-btn ${activeTab === "admin" ? "is-active" : ""}`}
                type="button"
                onClick={() => setActiveTab("admin")}
              >
                Admin
              </button>

              <button
                className={`tab-btn ${activeTab === "drill" ? "is-active" : ""}`}
                type="button"
                onClick={() => setActiveTab("drill")}
              >
                Drill
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="container">
          {activeTab === "admin" ? (
            <section className="admin-layout">
              <aside className="stack">
                <div className="card">
                  <h2>Import deck (Google Sheets)</h2>
                  <div className="muted">
                    Paste a publicly viewable Sheets link. Columns: <strong>Question</strong>, <strong>Answer</strong>.
                    (If gid is missing, we default to the first tab.)
                  </div>

                  <div className="row" style={{ marginTop: 12 }}>
                    <input
                      className="input"
                      type="url"
                      placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                      value={importUrl}
                      onChange={(e) => setImportUrl(e.target.value)}
                    />
                  </div>

                  <div className="row" style={{ marginTop: 10 }}>
                    <input
                      className="input"
                      type="text"
                      placeholder="Deck name (optional)"
                      value={importName}
                      onChange={(e) => setImportName(e.target.value)}
                    />
                    <button
                      className="btn primary"
                      type="button"
                      onClick={handleImportDeck}
                      disabled={importBusy}
                    >
                      {importBusy ? "Importing…" : "Import"}
                    </button>
                  </div>

                  {importStatus ? (
                    <div className="muted" style={{ marginTop: 10 }}>
                      {importStatus}
                    </div>
                  ) : null}
                </div>

                <div className="card">
                  <h2>Import deck index</h2>
                  <div className="muted">
                    Index tab columns: <strong>Name</strong>, <strong>URL</strong>. Each row imports a deck.
                  </div>

                  <div className="row" style={{ marginTop: 12 }}>
                    <input
                      className="input"
                      type="url"
                      placeholder="Paste index tab link"
                      value={indexUrl}
                      onChange={(e) => setIndexUrl(e.target.value)}
                    />
                    <button
                      className="btn accent"
                      type="button"
                      onClick={handleImportIndex}
                      disabled={indexBusy}
                    >
                      {indexBusy ? "Importing…" : "Import Index"}
                    </button>
                  </div>

                  {indexStatus ? (
                    <div className="muted" style={{ marginTop: 10 }}>
                      {indexStatus}
                    </div>
                  ) : null}
                </div>

                <div className="card">
                  <h2>Auto-refresh</h2>

                  <label className="muted" style={{ display: "block", marginTop: 8 }}>
                    <input
                      type="checkbox"
                      checked={autoRefreshOnLoad}
                      onChange={(e) => setAutoRefreshOnLoad(e.target.checked)}
                      style={{ marginRight: 8 }}
                    />
                    Refresh all sheet decks on load
                  </label>

                  <div className="row" style={{ marginTop: 12 }}>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      step="1"
                      value={autoRefreshIntervalMin}
                      onChange={(e) => setAutoRefreshIntervalMin(Number(e.target.value))}
                      placeholder="0"
                      title="0 = off"
                    />
                    <button className="btn" type="button" onClick={refreshAllSheets}>
                      Refresh Now
                    </button>
                  </div>

                  <div className="muted" style={{ marginTop: 8 }}>
                    Interval minutes (0 = off). Refresh keeps your hidden cards.
                  </div>
                </div>

                <div className="card">
                  <h2>Decks</h2>

                  <div className="deck-list">
                    {decks.map((d) => (
                      <DeckRow
                        key={d.id}
                        deck={d}
                        isSelected={d.id === selectedDeckId}
                        onSelect={() => setSelectedDeckId(d.id)}
                        onDelete={() => deleteDeck(d.id)}
                        onRename={(name) => renameDeck(d.id, name)}
                        onRefresh={() => refreshDeck(d)}
                      />
                    ))}
                  </div>
                </div>
              </aside>

              <section className="card">
                <h2>
                  Selected Deck:{" "}
                  <span className="muted">{selectedDeck?.name ?? "—"}</span>
                </h2>

                <div className="row" style={{ marginTop: 10 }}>
                  <input
                    className="input"
                    type="search"
                    placeholder="Search cards..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <button className="btn success" type="button" onClick={unhideAll}>
                    Unhide All
                  </button>
                </div>

                <div className="muted" style={{ marginTop: 10 }}>
                  Cards: <strong>{selectedDeck?.cards?.length ?? 0}</strong>{" "}
                  | Hidden: <strong>{selectedDeck?.hiddenIds?.size ?? 0}</strong>{" "}
                  {selectedDeck?.lastSyncAt ? (
                    <>
                      | Last sync: <strong>{formatTime(selectedDeck.lastSyncAt)}</strong>
                    </>
                  ) : null}
                </div>

                <div className="scroll">
                  {!selectedDeck ? (
                    <div className="muted" style={{ padding: "12px 0" }}>
                      Select a deck to view cards.
                    </div>
                  ) : (
                    filteredCards.map((c) => {
                      const isHidden = selectedDeck.hiddenIds.has(c.id);
                      return (
                        <div className="card-row" key={c.id}>
                          <div className="q">{c.question}</div>
                          <div className="a muted">{c.answer}</div>

                          <div className="row row-tight">
                            <div className="muted">
                              Status:{" "}
                              <strong>{isHidden ? "hidden" : "remaining"}</strong>
                            </div>
                            <button
                              className={`btn ${isHidden ? "" : "success"}`}
                              type="button"
                              onClick={() => toggleHidden(c.id)}
                            >
                              {isHidden ? "Unhide" : "Know It (Hide)"}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>
            </section>
          ) : (
            <DrillView
              decks={decks}
              selectedDeckId={selectedDeckId}
              setSelectedDeckId={setSelectedDeckId}
              setDecks={setDecks}
            />
          )}
        </div>
      </main>
    </div>
  );
}

/* ---------------- Admin: Deck Row ---------------- */

function DeckRow({ deck, isSelected, onSelect, onDelete, onRename, onRefresh }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(deck.name);

  useEffect(() => setName(deck.name), [deck.name]);

  const canRefresh = deck?.source?.type === "google_sheet_tab" && !!deck?.source?.tabUrl;

  return (
    <div className="deck-item">
      <div className="deck-title">
        {editing ? (
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onRename(name);
                setEditing(false);
              }
              if (e.key === "Escape") {
                setName(deck.name);
                setEditing(false);
              }
            }}
            autoFocus
          />
        ) : (
          <strong>{deck.name}</strong>
        )}

        {isSelected ? <span className="pill">Selected</span> : null}
        {deck.builtin ? <span className="pill">Built-in</span> : null}
      </div>

      <div className="deck-meta">
        <span className="pill">{deck.cards.length} cards</span>
        <span className="pill">Hidden: {deck.hiddenIds.size}</span>
      </div>

      <div className="row row-tight" style={{ marginTop: 10 }}>
        <button className="btn" type="button" onClick={onSelect}>
          Select
        </button>

        <button
          className="btn"
          type="button"
          onClick={() => {
            if (!editing) {
              setEditing(true);
            } else {
              onRename(name);
              setEditing(false);
            }
          }}
        >
          {editing ? "Save" : "Rename"}
        </button>

        {canRefresh ? (
          <button className="btn accent" type="button" onClick={onRefresh}>
            Refresh
          </button>
        ) : null}

        <button className="btn danger" type="button" onClick={onDelete}>
          Delete
        </button>
      </div>

      {deck.lastSyncAt ? (
        <div className="muted" style={{ marginTop: 10 }}>
          Last sync: {formatTime(deck.lastSyncAt)}
        </div>
      ) : null}

      {editing ? (
        <div className="muted" style={{ marginTop: 8 }}>
          Enter = save, Esc = cancel
        </div>
      ) : null}
    </div>
  );
}

/* ---------------- Drill ---------------- */

function DrillView({ decks, selectedDeckId, setSelectedDeckId, setDecks }) {
  const deck = useMemo(
    () => decks.find((d) => d.id === selectedDeckId) ?? null,
    [decks, selectedDeckId]
  );

  const remainingIds = useMemo(() => {
    if (!deck) return [];
    return deck.cards.filter((c) => !deck.hiddenIds.has(c.id)).map((c) => c.id);
  }, [deck]);

  const [queue, setQueue] = useState([]);
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    setQueue(remainingIds);
    setIndex(0);
    setShowAnswer(false);
  }, [selectedDeckId, remainingIds.join("|")]);

  const card = useMemo(() => {
    if (!deck) return null;
    if (queue.length === 0) return null;
    const id = queue[Math.min(index, queue.length - 1)];
    return deck.cards.find((c) => c.id === id) ?? null;
  }, [deck, queue, index]);

  useEffect(() => {
    if (index >= queue.length && queue.length > 0) {
      setIndex(0);
      setShowAnswer(false);
    }
    if (queue.length === 0) {
      setIndex(0);
      setShowAnswer(false);
    }
  }, [queue.length, index]);

  const total = deck?.cards.length ?? 0;
  const hidden = deck?.hiddenIds.size ?? 0;
  const remaining = Math.max(0, total - hidden);

  function flip() {
    if (!card) return;
    setShowAnswer((s) => !s);
  }

  function next() {
    if (queue.length === 0) return;
    setIndex((i) => (i + 1) % queue.length);
    setShowAnswer(false);
  }

  function knowIt() {
    if (!deck || !card) return;

    setDecks((prev) =>
      prev.map((d) => {
        if (d.id !== deck.id) return d;
        const nextHidden = new Set(d.hiddenIds);
        nextHidden.add(card.id);
        return { ...d, hiddenIds: nextHidden };
      })
    );

    setShowAnswer(false);
  }

  function resetHidden() {
    if (!deck) return;
    setDecks((prev) =>
      prev.map((d) => {
        if (d.id !== deck.id) return d;
        return { ...d, hiddenIds: new Set() };
      })
    );
  }

  function shuffle() {
    setQueue((prev) => shuffleArray(prev));
    setIndex(0);
    setShowAnswer(false);
  }

  return (
    <section className="screen-pad">
      <div className="card">
        <h2>Drill</h2>

        <div className="row">
          <select
            value={selectedDeckId ?? ""}
            onChange={(e) => {
              setSelectedDeckId(e.target.value);
              setIndex(0);
              setShowAnswer(false);
            }}
          >
            {decks.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <button className="btn" type="button" onClick={shuffle}>
            Shuffle
          </button>

          <button className="btn danger" type="button" onClick={resetHidden}>
            Reset Hidden
          </button>
        </div>

        <div className="progress">
          <div>
            Remaining: <strong>{remaining}</strong> / <span>{total}</span>
          </div>
          <div>
            Hidden: <strong>{hidden}</strong>
          </div>
        </div>
      </div>

      <div className="flip-wrap" style={{ marginTop: 14 }}>
        {!deck ? (
          <div className="flashcard">
            <div className="label">No deck selected</div>
            <div className="side">Pick a deck to start drilling.</div>
          </div>
        ) : !card ? (
          <div className="flashcard">
            <div className="label">All done</div>
            <div className="side">You’ve hidden all cards in this deck 🎉</div>
            <div className="muted">Hit “Reset Hidden” to drill again.</div>
          </div>
        ) : (
          <div className={`flip-card ${showAnswer ? "is-flipped" : ""}`}>
            <div className="flip-inner">
              <div className="flip-face flip-front">
                <div className="label">Question</div>
                <div className="side">{card.question}</div>
                <div className="muted" style={{ marginTop: 10 }}>
                  Tap Flip to reveal
                </div>
              </div>

              <div className="flip-face flip-back">
                <div className="label">Answer</div>
                <div className="side">{card.answer}</div>
                <div className="muted" style={{ marginTop: 10 }}>
                  Tap Flip to go back
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="row" style={{ marginTop: 16 }}>
        <button className="btn primary" type="button" onClick={flip}>
          Flip
        </button>
        <button className="btn" type="button" onClick={next}>
          Next
        </button>
        <button className="btn success" type="button" onClick={knowIt}>
          Know It (Hide)
        </button>
      </div>
    </section>
  );
}

function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}