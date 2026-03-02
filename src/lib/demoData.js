// src/lib/demoData.js

export const demoDecks = [
  {
    id: "deck-python",
    name: "Python Basics",
    cards: [
      { id: "py1", question: "What is a list in Python?", answer: "A mutable, ordered collection." },
      { id: "py2", question: "What is a dict?", answer: "A key/value mapping (hash map)." },
      { id: "py3", question: "What does None mean?", answer: "A null-like value meaning 'no value'." },
      { id: "py4", question: "What is a virtual environment?", answer: "An isolated environment for dependencies." },
      { id: "py5", question: "What is a tuple?", answer: "An ordered, immutable collection." },
    ],
    hiddenIds: ["py2"],
  },
  {
    id: "deck-spanish",
    name: "Spanish",
    cards: [
      { id: "sp1", question: "Hello", answer: "Hola" },
      { id: "sp2", question: "Thank you", answer: "Gracias" },
      { id: "sp3", question: "Goodbye", answer: "Adiós" },
      { id: "sp4", question: "Please", answer: "Por favor" },
    ],
    hiddenIds: [],
  },
];