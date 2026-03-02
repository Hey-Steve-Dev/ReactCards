// src/pages/Drill.jsx
import DrillView from "../components/drill/DrillView";

export default function Drill({ decks, selectedDeckId, setSelectedDeckId, setDecks }) {
  return (
    <DrillView
      decks={decks}
      selectedDeckId={selectedDeckId}
      setSelectedDeckId={setSelectedDeckId}
      setDecks={setDecks}
    />
  );
}
