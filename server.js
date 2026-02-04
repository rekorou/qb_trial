const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;
const path = require("path");

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const rooms = {};
const ROOM_CODE_LENGTH = 6;
const ROOM_CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const quizRounds = [
  {
    id: "easy",
    title: "🟢 EASY",
    points: 1,
    timeLimitSeconds: 15,
    questions: [
      {
        id: "easy-1",
        prompt: "What does CPU stand for?",
        options: [
          "Central Processing Unit",
          "Computer Personal Unit",
          "Central Program Utility",
          "Core Processing User",
        ],
        answer: "A",
      },
      {
        id: "easy-2",
        prompt: "Which of the following is an input device?",
        options: ["Monitor", "Printer", "Keyboard", "Speaker"],
        answer: "C",
      },
      {
        id: "easy-3",
        prompt:
          "What symbol is commonly used to end a statement in many programming languages like C or Java?",
        options: [",", ":", ".", ";"],
        answer: "D",
      },
      {
        id: "easy-4",
        prompt: "Which data type stores true or false values?",
        options: ["Integer", "String", "Boolean", "Float"],
        answer: "C",
      },
      {
        id: "easy-5",
        prompt: "What is a variable used for in programming?",
        options: ["To display images", "To store data", "To compile code", "To delete files"],
        answer: "B",
      },
      {
        id: "easy-6",
        prompt: "Which of the following best describes an algorithm?",
        options: [
          "A programming language",
          "A step-by-step solution to a problem",
          "A computer hardware component",
          "A software application",
        ],
        answer: "B",
      },
      {
        id: "easy-7",
        prompt: "In games, what is a “score”?",
        options: [
          "A game character",
          "A visual effect",
          "A value representing player progress",
          "A type of level",
        ],
        answer: "C",
      },
      {
        id: "easy-8",
        prompt: "What does RAM stand for?",
        options: ["Random Access Memory", "Read Access Machine", "Rapid Action Module", "Run All Memory"],
        answer: "A",
      },
      {
        id: "easy-9",
        prompt: "Which programming concept repeats a block of code?",
        options: ["Variable", "Loop", "Function", "Comment"],
        answer: "B",
      },
      {
        id: "easy-10",
        prompt: "Ethics primarily deals with questions about:",
        options: ["Speed", "Beauty", "Right and wrong", "Technology"],
        answer: "C",
      },
    ],
  },
  {
    id: "average",
    title: "🟡 AVERAGE",
    points: 3,
    timeLimitSeconds: 30,
    questions: [
      {
        id: "average-1",
        prompt: "Which of the following is an example of system software?",
        options: ["Microsoft Word", "Google Chrome", "Operating System", "Mobile Game"],
        answer: "C",
      },
      {
        id: "average-2",
        prompt: "What is the output of 5 + 3 * 2?",
        options: ["16", "11", "13", "10"],
        answer: "B",
      },
      {
        id: "average-3",
        prompt: "Which data structure follows the FIFO principle?",
        options: ["Stack", "Tree", "Queue", "Graph"],
        answer: "C",
      },
      {
        id: "average-4",
        prompt: "What is the main purpose of a function?",
        options: ["To store multiple values", "To repeat code manually", "To organize and reuse code", "To stop program execution"],
        answer: "C",
      },
      {
        id: "average-5",
        prompt: "Which algorithm technique breaks a problem into smaller subproblems?",
        options: ["Brute Force", "Divide and Conquer", "Greedy", "Backtracking"],
        answer: "B",
      },
      {
        id: "average-6",
        prompt: "In game development, what does “collision detection” handle?",
        options: ["Sound effects", "Character movement", "Interaction between game objects", "Saving game progress"],
        answer: "C",
      },
      {
        id: "average-7",
        prompt: "What data structure is best for implementing undo/redo operations?",
        options: ["Queue", "Stack", "Array", "Linked List"],
        answer: "B",
      },
      {
        id: "average-8",
        prompt: "Which programming paradigm focuses on objects and classes?",
        options: ["Procedural", "Functional", "Object-Oriented", "Logical"],
        answer: "C",
      },
      {
        id: "average-9",
        prompt: "Meta-ethics is mainly concerned with:",
        options: ["Applying rules to actions", "Moral emotions", "The meaning of moral terms", "Legal systems"],
        answer: "C",
      },
      {
        id: "average-10",
        prompt: "Which is an example of a conditional statement?",
        options: ["for", "while", "if", "print"],
        answer: "C",
      },
    ],
  },
  {
    id: "difficult",
    title: "🔴 DIFFICULT",
    points: 5,
    timeLimitSeconds: 60,
    questions: [
      {
        id: "difficult-1",
        prompt: "What is the time complexity of binary search in a sorted array?",
        options: ["O(n)", "O(n²)", "O(log n)", "O(1)"],
        answer: "C",
      },
      {
        id: "difficult-2",
        prompt: "Which data structure is most suitable for representing hierarchical relationships?",
        options: ["Array", "Queue", "Tree", "Stack"],
        answer: "C",
      },
      {
        id: "difficult-3",
        prompt: "In game development, which component is primarily responsible for rendering graphics?",
        options: ["Physics Engine", "Game Loop", "Rendering Engine", "Input Handler"],
        answer: "C",
      },
      {
        id: "difficult-4",
        prompt: "What does Big-O notation describe?",
        options: ["Memory address", "Algorithm efficiency", "Code syntax", "Variable scope"],
        answer: "B",
      },
      {
        id: "difficult-5",
        prompt: "Which statement best describes moral realism in meta-ethics?",
        options: [
          "Moral values depend on culture",
          "Moral statements are meaningless",
          "Moral facts exist independently of beliefs",
          "Ethics is purely emotional",
        ],
        answer: "C",
      },
    ],
  },
];

const generateRoomCode = () => {
  let code = "";
  for (let i = 0; i < ROOM_CODE_LENGTH; i += 1) {
    const idx = Math.floor(Math.random() * ROOM_CODE_CHARS.length);
    code += ROOM_CODE_CHARS[idx];
  }
  return code;
};

const createUniqueRoomCode = () => {
  let code = generateRoomCode();
  while (rooms[code]) {
    code = generateRoomCode();
  }
  return code;
};

app.post("/api/rooms", (req, res) => {
  const teamName = typeof req.body?.teamName === "string" ? req.body.teamName.trim() : "";

  if (teamName.length < 2 || teamName.length > 20) {
    return res.status(400).json({ error: "teamName must be 2-20 characters" });
  }

  const code = createUniqueRoomCode();
  const room = {
    code,
    hostTeamName: teamName,
    createdAt: new Date().toISOString(),
  };

  rooms[code] = room;

  return res.status(201).json(room);
});

app.get("/api/rooms/:code", (req, res) => {
  const code = String(req.params.code || "").toUpperCase();
  const room = rooms[code];

  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }

  return res.json(room);
});

app.get("/api/questions", (req, res) => {
  const difficulty = String(req.query.difficulty || "").toLowerCase();
  if (!difficulty) {
    return res.json({ rounds: quizRounds });
  }

  const round = quizRounds.find((item) => item.id === difficulty);
  if (!round) {
    return res.status(404).json({ error: "Difficulty not found" });
  }

  return res.json(round);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
