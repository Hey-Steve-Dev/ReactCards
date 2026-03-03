import { useEffect, useMemo, useState } from "react";

export default function DrillView({
  decks,
  selectedDeckId,
  setSelectedDeckId,
  setDecks,
  renderText,
}) {
  const render = useMemo(() => {
    if (typeof renderText === "function") return renderText;
    return (t) => String(t ?? "");
  }, [renderText]);

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

          <button className="btn shuffle" type="button" onClick={shuffle}>
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
                <div className="side">{render(card.question)}</div>
                <div className="muted" style={{ marginTop: 10 }}>
                  Tap Flip to reveal
                </div>
              </div>

              <div className="flip-face flip-back">
                <div className="label">Answer</div>
                <div className="side">{render(card.answer)}</div>
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
        <button className="btn next" type="button" onClick={next}>
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
