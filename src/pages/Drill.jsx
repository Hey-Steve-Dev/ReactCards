// src/pages/Drill.jsx
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import DrillView from "../components/drill/DrillView";

export default function Drill({ decks, selectedDeckId, setSelectedDeckId, setDecks }) {
  const renderText = (text) => (
    <ReactMarkdown
      remarkPlugins={[remarkBreaks]}
      components={{
        p: ({ children }) => <p style={{ margin: 0 }}>{children}</p>,
        strong: ({ children }) => <strong style={{ fontWeight: 900 }}>{children}</strong>,
        em: ({ children }) => <em style={{ fontStyle: "italic" }}>{children}</em>,
        code: ({ children }) => (
          <code
            style={{
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
              fontSize: "0.95em",
              padding: "2px 6px",
              borderRadius: 8,
              background: "rgba(0,0,0,0.18)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            {children}
          </code>
        ),
      }}
    >
      {String(text ?? "")}
    </ReactMarkdown>
  );

  return (
    <DrillView
      decks={decks}
      selectedDeckId={selectedDeckId}
      setSelectedDeckId={setSelectedDeckId}
      setDecks={setDecks}
      renderText={renderText}
    />
  );
}
