const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

let db; // database connection

const app = express(); // web server
app.use(cors()); // allow cross-origin requests
app.use(express.json()); // if request has JSON body, parse it and put it in req.body

const dreamsByDate = {}; // 'database' key value pairs date: user input

// GET a dream for a date
app.get("/api/dreams/:date", (req, res) => { // GET request to /api/dreams/date
  const date = req.params.date; // gets date from URL
  const text = dreamsByDate[date] || ""; // looks up dream for that date, or empty string
  res.json({ date, text }); // return JSON reponse 
});

// PUT to save/replace a dream for a date
app.put("/api/dreams/:date", (req, res) => { // PUT request to /api/dreams/date
  const date = req.params.date; // gets date from URL
  const { text } = req.body; // gets text from request body

  if (typeof text !== "string") { // validate input 
    return res.status(400).json({ error: "text must be a string" }); // bad request 
  }

  dreamsByDate[date] = text; // saves dream
  res.json({ date, text }); // return JSON response
});

const PORT = 3001; // listen for requests
app.listen(PORT, () => { 
  console.log(`API running on http://localhost:${PORT}`);
});
