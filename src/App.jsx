// src/App.jsx
import DeckRow from "./components/admin/DeckRow";
import DrillView from "./components/drill/DrillView";
import ImportDeck from "./components/admin/ImportDeck";
import { useDeckStorage } from "./hooks/useDeckStorage";

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
  const [decks, setDecks] = useDeckStorage([]);

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
      if (typeof s.autoRefreshOnLoad === "boolean")
        setAutoRefreshOnLoad(s.autoRefreshOnLoad);
      if (typeof s.autoRefreshIntervalMin === "number")
        setAutoRefreshIntervalMin(s.autoRefreshIntervalMin);
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
              next[i] = {
                ...next[i],
                builtin: true,
                source: { type: "google_sheet_tab", tabUrl: b.tabUrl },
              };
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
      (c) => c.question.toLowerCase().includes(q) || c.answer.toLowerCase().includes(q)
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

    const refreshed = await importDeckFromPublishedTabUrl(
      deck.source.tabUrl,
      existingName
    );

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
          ? prev.map((d) =>
              d.id === newDeck.id
                ? { ...newDeck, hiddenIds: d.hiddenIds, lastSyncAt: Date.now() }
                : d
            )
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
            ? prev.map((x) =>
                x.id === d.id
                  ? { ...d, hiddenIds: x.hiddenIds, lastSyncAt: Date.now() }
                  : x
              )
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
                <ImportDeck
                  importUrl={importUrl}
                  setImportUrl={setImportUrl}
                  importName={importName}
                  setImportName={setImportName}
                  importStatus={importStatus}
                  importBusy={importBusy}
                  onImport={handleImportDeck}
                />

                <div className="card">
                  <h2>Import deck index</h2>
                  <div className="muted">
                    Index tab columns: <strong>Name</strong>, <strong>URL</strong>. Each
                    row imports a deck.
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
                  Cards: <strong>{selectedDeck?.cards?.length ?? 0}</strong> | Hidden:{" "}
                  <strong>{selectedDeck?.hiddenIds?.size ?? 0}</strong>{" "}
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
                              Status: <strong>{isHidden ? "hidden" : "remaining"}</strong>
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

/* ---------------- Drill ---------------- */

function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
