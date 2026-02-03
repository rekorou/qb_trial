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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
