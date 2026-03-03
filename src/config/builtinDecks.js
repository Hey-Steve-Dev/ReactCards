// src/config/builtinDecks.js

/**
 * Built-in hard-coded decks.
 * These will ALWAYS be ensured on startup (they reappear after refresh, even if deleted).
 *
 * Add your permanent Google Sheet tab links here.
 */
export const BUILTIN_DECK_SOURCES = [
  // Example:
  // {
  //   id: "builtin_python",
  //   name: "Python (Built-in)",
  //   tabUrl: "https://docs.google.com/spreadsheets/d/<ID>/edit#gid=0",
  // },

  {
    id: "Builtin-Spanish",
    name: "Spanish Words",
    tabUrl:
      "https://docs.google.com/spreadsheets/d/1Blxoor9P0LL8udc5hD_ogQUW_MP6mkgIKlyS3fDNgNg/edit?gid=0#gid=0",
  },
  {
    id: "Builtin-Web Dev",
    name: "Web Dev",
    tabUrl:
      "https://docs.google.com/spreadsheets/d/17KhNQU_hszZMgrKv6NEmCeJDDoISlXZGsLVN5ADQlkI/edit?gid=0#gid=0",
  },
];
