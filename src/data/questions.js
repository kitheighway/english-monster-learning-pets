export const QUESTION_BANK = [
  {
    mode: "Punctuation",
    prompt: "Which sentence uses a comma correctly?",
    choices: [
      "After lunch we went, to the park.",
      "After lunch, we went to the park.",
      "After, lunch we went to the park.",
      "After lunch we, went to the park.",
    ],
    correctIndex: 1,
    hint: "The comma often shows a pause after an opening phrase.",
    explanation:
      "A comma is used after an opening clause or phrase: “After lunch, …”. The other options place the comma incorrectly.",
  },
  {
    mode: "Spelling",
    prompt: "Choose the correct spelling:",
    choices: ["definately", "definitely", "definitly", "definitley"],
    correctIndex: 1,
    hint: "It has the word “finite” inside it.",
    explanation:
      "The correct spelling is “definitely”. A common trick is to spot “finite” in the middle.",
  },
  {
    mode: "Grammar",
    prompt: "Which is correct?",
    choices: [
      "I done my homework.",
      "I did my homework.",
      "I did done my homework.",
      "I done did my homework.",
    ],
    correctIndex: 1,
    hint: "Past tense of “do” is “did”.",
    explanation:
      "Standard English uses “I did my homework.” “Done” is used with an auxiliary verb (e.g., “I have done…”).",
  },
  {
    mode: "Reading",
    prompt: "A character who is 'reluctant' is…",
    choices: [
      "excited to do something",
      "unwilling or hesitant",
      "very angry",
      "very confident",
    ],
    correctIndex: 1,
    hint: "They don’t really want to do it.",
    explanation: "Reluctant means unwilling or hesitant.",
  },
];
