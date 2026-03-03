// src/pages/About.jsx
import { useEffect, useState } from "react";

function StepIcon({ n }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: 38,
        height: 38,
        borderRadius: 14,
        display: "grid",
        placeItems: "center",
        fontWeight: 900,
        background: "linear-gradient(135deg, var(--primary), var(--secondary))",
        color: "#fff",
        boxShadow: "var(--shadow)",
        flex: "0 0 auto",
      }}
    >
      {n}
    </div>
  );
}

function MiniCard({ title, text, delay = 0, icon }) {
  return (
    <div
      className="about-card"
      style={{
        animationDelay: `${delay}ms`,
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        {icon}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 900, fontSize: 14 }}>{title}</div>
          <div className="muted" style={{ marginTop: 6, lineHeight: 1.55 }}>
            {text}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function About() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section className="card">
      {/* Local page-only styles */}
      <style>{`
        @keyframes aboutIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes glowPulse {
          0% { opacity: .55; transform: scale(1); }
          100% { opacity: .9; transform: scale(1.02); }
        }

        .about-hero {
          position: relative;
          overflow: hidden;
          border-radius: 22px;
          padding: 18px;
          border: 1px solid var(--border);
          background: var(--panel-strong);
          box-shadow: var(--shadow);
        }

        .about-hero::before {
          content: "";
          position: absolute;
          inset: -80px;
          background:
            radial-gradient(520px 260px at 18% 18%, rgba(111,123,255,.35), transparent 60%),
            radial-gradient(520px 260px at 82% 22%, rgba(0,214,199,.25), transparent 60%),
            radial-gradient(620px 340px at 55% 105%, rgba(255,154,122,.22), transparent 70%);
          filter: blur(10px);
          animation: glowPulse 1800ms ease-in-out infinite alternate;
          pointer-events: none;
        }

        .about-hero > * { position: relative; }

        .about-grid {
          display: grid;
          gap: 12px;
          margin-top: 14px;
        }

        @media (min-width: 860px) {
          .about-grid {
            grid-template-columns: 1.2fr .8fr;
            align-items: start;
          }
        }

        .about-cards {
          display: grid;
          gap: 10px;
          margin-top: 12px;
        }

        @media (min-width: 740px) {
          .about-cards {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        .about-card {
          border: 1px solid var(--border);
          border-radius: 18px;
          padding: 14px;
          background: rgba(255,255,255,.10);
          box-shadow: 0 10px 22px rgba(0,0,0,.18);
          opacity: 0;
          transform: translateY(10px);
          animation: aboutIn 520ms ease forwards;
        }

        .about-flow {
          border: 1px solid var(--border);
          border-radius: 18px;
          padding: 14px;
          background: rgba(255,255,255,.08);
          overflow: hidden;
        }

        .flow-row {
          display: grid;
          gap: 10px;
        }

        .flow-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(255,255,255,.10);
          font-weight: 800;
        }

        .arrow {
          opacity: .65;
          margin-left: 50px;
          font-size: 12px;
        }

        .kbd {
          display: inline-flex;
          align-items: center;
          border: 1px solid rgba(255,255,255,.18);
          background: rgba(0,0,0,.18);
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 800;
          color: var(--text);
          white-space: nowrap;
        }
      `}</style>

      <div className="about-hero">
        <div
          style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}
        >
          <h2 style={{ margin: 0 }}>About ReactCards</h2>
          <span className="pill">Local storage</span>
          <span className="pill">No login</span>
          <span className="pill">Totaly Free</span>
        </div>

        <p className="muted" style={{ marginTop: 10, marginBottom: 0, lineHeight: 1.6 }}>
          ReactCards turns a published Google Sheet into a study deck. Import a sheet,
          drill cards, and hide what you already know — all in the browser.
        </p>

        <div className="about-grid">
          {/* Left: steps */}
          <div>
            <div style={{ marginTop: 14, fontWeight: 900, letterSpacing: 0.2 }}>
              How it works (in 4 steps)
            </div>

            <div className="about-cards">
              <MiniCard
                delay={mounted ? 40 : 0}
                icon={<StepIcon n={1} />}
                title="Make a sheet"
                text={
                  <>
                    Create two columns: <strong>Question</strong> and{" "}
                    <strong>Answer</strong>. Row 1 is your header row.
                  </>
                }
              />
              <MiniCard
                delay={mounted ? 120 : 0}
                icon={<StepIcon n={2} />}
                title="Publish / share"
                text="Make it viewable by anyone with the link (no login required)."
              />
              <MiniCard
                delay={mounted ? 200 : 0}
                icon={<StepIcon n={3} />}
                title="Import to ReactCards"
                text="Paste the sheet or tab link. We parse rows into flashcards."
              />
              <MiniCard
                delay={mounted ? 280 : 0}
                icon={<StepIcon n={4} />}
                title="Drill + hide"
                text={
                  <>
                    Practice fast. Hide cards you know. Your progress is stored in{" "}
                    <strong>localStorage</strong>.
                  </>
                }
              />
            </div>
          </div>

          {/* Right: flow diagram */}
          <div className="about-flow" style={{ marginTop: 14 }}>
            <div style={{ fontWeight: 900 }}>Visual flow</div>
            <div className="muted" style={{ marginTop: 6, lineHeight: 1.55 }}>
              Think of ReactCards as a tiny pipeline:
            </div>

            <div className="flow-row" style={{ marginTop: 12 }}>
              <div className="flow-pill">
                <span className="pill">Google Sheet</span>
                <span className="muted" style={{ fontWeight: 700 }}>
                  (Question / Answer)
                </span>
              </div>
              <div className="arrow">▼ publish / share</div>
              <div className="flow-pill">
                <span className="pill">Import</span>
                <span className="muted" style={{ fontWeight: 700 }}>
                  parse rows → cards
                </span>
              </div>
              <div className="arrow">▼ drill</div>
              <div className="flow-pill">
                <span className="pill">Study</span>
                <span className="muted" style={{ fontWeight: 700 }}>
                  hide known cards
                </span>
              </div>
              <div className="arrow">▼ saved locally</div>
              <div className="flow-pill">
                <span className="pill">localStorage</span>
                <span className="muted" style={{ fontWeight: 700 }}>
                  progress stays in your browser
                </span>
              </div>
            </div>

            <div className="muted" style={{ marginTop: 14, lineHeight: 1.6 }}>
              Pro tip: Keep answers concise. Short cards drill faster.
            </div>
          </div>
        </div>
      </div>

      {/* Keep your original content, but give it visual structure */}
      <div style={{ marginTop: 18 }}>
        <h3 style={{ marginBottom: 8 }}>Google Sheets format</h3>
        <div className="about-cards" style={{ marginTop: 10 }}>
          <MiniCard
            delay={mounted ? 340 : 0}
            icon={<span className="pill">Required</span>}
            title="Headers"
            text={
              <>
                Row 1 must include <strong>Question</strong> and <strong>Answer</strong>{" "}
                (case-insensitive).
              </>
            }
          />
          <MiniCard
            delay={mounted ? 420 : 0}
            icon={<span className="pill">Cards</span>}
            title="Rows become cards"
            text="Each row after the header becomes one flashcard."
          />
          <MiniCard
            delay={mounted ? 500 : 0}
            icon={<span className="pill">Extra</span>}
            title="Extra columns ignored"
            text="You can keep notes or tags in extra columns—ReactCards only uses Q/A."
          />
          <MiniCard
            delay={mounted ? 580 : 0}
            icon={<span className="pill">Tip</span>}
            title="Keep it simple"
            text={
              <>Use short prompts. Think “quiz mode” — fast questions, clean answers.</>
            }
          />
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <h3 style={{ marginBottom: 8 }}>Deck index (optional)</h3>
        <div className="muted" style={{ lineHeight: 1.7 }}>
          Create an “index” sheet to import multiple decks at once.
          <div style={{ marginTop: 10 }}>
            Index headers: <span className="kbd">Name</span> and{" "}
            <span className="kbd">URL</span>
          </div>
          <div style={{ marginTop: 8 }}>
            Each row imports a deck using the URL to a published tab/sheet.
          </div>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <h3 style={{ marginBottom: 8 }}>Privacy & data</h3>
        <div className="muted" style={{ lineHeight: 1.7 }}>
          <div>ReactCards does not require login.</div>
          <div style={{ marginTop: 6 }}>
            If you use a public/published sheet, the deck content is public by design.
          </div>
          <div style={{ marginTop: 6 }}>
            Your hidden-card progress is stored locally in your browser (not uploaded).
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <h3 style={{ marginBottom: 10 }}>Important Notes</h3>

        <div
          style={{
            borderRadius: 18,
            padding: 16,
            border: "1px solid rgba(255,255,255,.18)",
            background:
              "linear-gradient(135deg, rgba(255,154,122,.18), rgba(111,123,255,.18))",
            boxShadow: "0 12px 26px rgba(0,0,0,.25)",
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: 8 }}>⚠ Things to keep in mind</div>

          <ul className="muted" style={{ lineHeight: 1.7, paddingLeft: 18 }}>
            <li>
              Your decks and hidden-card progress are stored in your browser using
              <strong> localStorage</strong>. This data will persist even if you refresh
              the page or close your browser.
            </li>

            <li style={{ marginTop: 8 }}>
              Your data will only be removed if you manually clear your browser’s site
              data (local storage), use private/incognito mode, or delete your browser
              data.
            </li>

            <li style={{ marginTop: 8 }}>
              ReactCards is <strong>read-only</strong>. You cannot edit or write back to
              Google Sheets from this app. All changes must be made directly in Google
              Sheets and then refreshed or re-imported here.
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
