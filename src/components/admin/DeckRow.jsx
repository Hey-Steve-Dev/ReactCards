import { useEffect, useState } from "react";

function formatTime(ts) {
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return "";
  }
}

export default function DeckRow({
  deck,
  isSelected,
  onSelect,
  onDelete,
  onRename,
  onRefresh,
}) {
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
