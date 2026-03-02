export default function AdminDeckView({
  selectedDeck,
  search,
  setSearch,
  onUnhideAll,
  filteredCards,
  onToggleHidden,
}) {
  return (
    <section className="card">
      <h2>
        Selected Deck: <span className="muted">{selectedDeck?.name ?? "—"}</span>
      </h2>

      <div className="row" style={{ marginTop: 10 }}>
        <input
          className="input"
          type="search"
          placeholder="Search cards..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn success" type="button" onClick={onUnhideAll}>
          Unhide All
        </button>
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
                    onClick={() => onToggleHidden(c.id)}
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
  );
}
