import DeckRow from "./DeckRow";

export default function DeckList({
  decks,
  selectedDeckId,
  onSelectDeck,
  onDeleteDeck,
  onRenameDeck,
  onRefreshDeck,
}) {
  return (
    <div className="card">
      <h2>Decks</h2>

      <div className="deck-list">
        {decks.map((d) => (
          <DeckRow
            key={d.id}
            deck={d}
            isSelected={d.id === selectedDeckId}
            onSelect={() => onSelectDeck(d.id)}
            onDelete={() => onDeleteDeck(d.id)}
            onRename={(name) => onRenameDeck(d.id, name)}
            onRefresh={() => onRefreshDeck(d)}
          />
        ))}
      </div>
    </div>
  );
}
