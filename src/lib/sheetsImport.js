// src/lib/sheetsImport.js

function normalizeHeader(h) {
  return String(h || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/**
 * Accepts URLs like:
 *  - https://docs.google.com/spreadsheets/d/<SHEET_ID>/edit
 *  - https://docs.google.com/spreadsheets/d/<SHEET_ID>/edit#gid=123
 *  - sharing links etc.
 *
 * If gid is missing, defaults to "0" (single-tab or first tab).
 */
export function extractSheetIdAndGid(inputUrl) {
  const url = String(inputUrl || "").trim();
  if (!url) throw new Error("Paste a Google Sheets URL.");

  const idMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!idMatch) throw new Error("Could not find spreadsheet ID in the URL.");
  const spreadsheetId = idMatch[1];

  const gidMatch = url.match(/[#&?]gid=(\d+)/);
  const gid = gidMatch ? gidMatch[1] : "0";

  return { spreadsheetId, gid };
}

/**
 * Convert a sheet tab to CSV endpoint using gviz.
 * Works when sheet is publicly readable (Anyone with link -> Viewer).
 */
export function buildCsvUrl(spreadsheetId, gid) {
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&gid=${gid}`;
}

/**
 * Small CSV parser (handles quotes, commas, newlines).
 */
export function parseCsv(csvText) {
  const text = String(csvText ?? "");
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      continue;
    }

    if (ch === ",") {
      row.push(field);
      field = "";
      continue;
    }

    if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }

    if (ch === "\r") continue;

    field += ch;
  }

  row.push(field);
  rows.push(row);

  while (rows.length && rows[rows.length - 1].every((c) => String(c).trim() === "")) {
    rows.pop();
  }

  return rows;
}

function hashShort(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).slice(0, 8);
}

/**
 * Fetch & build a deck from a published/readable tab URL.
 * Requires headers with Question/Answer (case-insensitive).
 */
export async function importDeckFromPublishedTabUrl(tabUrl, deckNameOverride) {
  const { spreadsheetId, gid } = extractSheetIdAndGid(tabUrl);
  const csvUrl = buildCsvUrl(spreadsheetId, gid);

  const res = await fetch(csvUrl);
  if (!res.ok) {
    throw new Error(
      `Fetch failed (${res.status}). Make sure “Anyone with the link can view” is enabled.`
    );
  }

  const csv = await res.text();
  const rows = parseCsv(csv);
  if (!rows.length) throw new Error("No rows found.");

  const header = rows[0].map(normalizeHeader);
  const qIdx = header.findIndex((h) => h === "question");
  const aIdx = header.findIndex((h) => h === "answer");

  if (qIdx === -1 || aIdx === -1) {
    throw new Error(
      "Missing headers. Row 1 must include Question and Answer (case-insensitive)."
    );
  }

  const cards = rows
    .slice(1)
    .map((r, i) => {
      const question = String(r[qIdx] ?? "").trim();
      const answer = String(r[aIdx] ?? "").trim();
      if (!question || !answer) return null;
      return {
        id: `g_${gid}_${i}_${hashShort(question + "|" + answer)}`,
        question,
        answer,
      };
    })
    .filter(Boolean);

  if (!cards.length) throw new Error("No valid cards found (need non-empty Question + Answer).");

  const deckName = String(deckNameOverride || "").trim() || `Imported Deck (${gid})`;

  return {
    id: `sheet_${spreadsheetId}_${gid}`, // stable: importing same tab refreshes it
    name: deckName,
    source: { type: "google_sheet_tab", tabUrl, spreadsheetId, gid, csvUrl },
    cards,
    hiddenIds: new Set(),
    builtin: false,
    lastSyncAt: Date.now(),
  };
}

/**
 * Deck Index importer
 * Index tab must have columns: Name, URL (case-insensitive).
 * Each row: a deck name + a Google Sheets link (tab link preferred, but gid optional).
 */
export async function importDeckIndexFromPublishedTabUrl(indexTabUrl) {
  const { spreadsheetId, gid } = extractSheetIdAndGid(indexTabUrl);
  const csvUrl = buildCsvUrl(spreadsheetId, gid);

  const res = await fetch(csvUrl);
  if (!res.ok) {
    throw new Error(
      `Index fetch failed (${res.status}). Make sure the index sheet is publicly viewable.`
    );
  }

  const csv = await res.text();
  const rows = parseCsv(csv);
  if (!rows.length) throw new Error("Index has no rows.");

  const header = rows[0].map(normalizeHeader);
  const nameIdx = header.findIndex((h) => h === "name");
  const urlIdx = header.findIndex((h) => h === "url");

  if (nameIdx === -1 || urlIdx === -1) {
    throw new Error("Index is missing headers. Need columns: Name, URL.");
  }

  const items = rows
    .slice(1)
    .map((r) => ({
      name: String(r[nameIdx] ?? "").trim(),
      url: String(r[urlIdx] ?? "").trim(),
    }))
    .filter((x) => x.name && x.url);

  if (!items.length) throw new Error("Index contains no valid rows (need Name + URL).");

  return items;
}