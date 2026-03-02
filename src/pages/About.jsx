// src/pages/About.jsx
export default function About() {
  return (
    <section className="card">
      <h2>About ReactCards</h2>

      <p className="muted" style={{ marginTop: 8 }}>
        ReactCards is a simple flashcard app that turns a Google Sheet into a study deck.
        You can import a sheet, drill cards, and hide cards you already know — all on the
        front end.
      </p>

      <div style={{ marginTop: 16 }}>
        <h3>How it works</h3>
        <ul className="muted" style={{ lineHeight: 1.6, marginTop: 8 }}>
          <li>
            You create a Google Sheet with two columns: <strong>Question</strong> and{" "}
            <strong>Answer</strong>.
          </li>
          <li>
            Publish/share the sheet so it can be viewed by anyone with the link (no login
            required).
          </li>
          <li>Paste the sheet (or tab) link into ReactCards to import it as a deck.</li>
          <li>
            ReactCards stores your decks and your “hidden” progress in your browser using{" "}
            <strong>localStorage</strong>.
          </li>
        </ul>
      </div>

      <div style={{ marginTop: 16 }}>
        <h3>Google Sheets format</h3>
        <div className="muted" style={{ marginTop: 8, lineHeight: 1.6 }}>
          <div>
            ✅ Row 1 must include headers: <strong>Question</strong> and{" "}
            <strong>Answer</strong> (case-insensitive)
          </div>
          <div>✅ Each row after that becomes one flashcard</div>
          <div>✅ Extra columns are ignored</div>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <h3>Deck index (optional)</h3>
        <div className="muted" style={{ marginTop: 8, lineHeight: 1.6 }}>
          <div>
            You can also create an “index” sheet to import multiple decks at once.
          </div>
          <div>
            Index headers: <strong>Name</strong> and <strong>URL</strong>
          </div>
          <div>Each row imports a deck using the URL to a published tab/sheet.</div>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <h3>Privacy & data</h3>
        <div className="muted" style={{ marginTop: 8, lineHeight: 1.6 }}>
          <div>ReactCards does not require login.</div>
          <div>
            If you use a public/published sheet, the deck content is public by design.
          </div>
          <div>
            Your “hidden cards” progress is stored locally in your browser (not uploaded).
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <h3>Tips</h3>
        <ul className="muted" style={{ lineHeight: 1.6, marginTop: 8 }}>
          <li>Use short questions and concise answers for best drilling.</li>
          <li>Make separate tabs/sheets for different topics.</li>
          <li>
            Use Auto-refresh if you keep editing your sheet and want updates pulled in.
          </li>
        </ul>
      </div>
    </section>
  );
}
