const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

let db; // database connection

const app = express(); // web server
app.use(cors()); // allow cross-origin requests
app.use(express.json()); // if request has JSON body, parse it and put it in req.body


async function initDb(){ 
  db = await open({ // open connection to database - wait for it to be ready
    filename: './dreams.sqlite', // database file
    driver: sqlite3.Database, // database driver
  });

  // runs raw SQL , create table if doesnt exist, columns: date as pk, text user input or empty string, store timestamp
await db.exec(` 
  CREATE TABLE IF NOT EXISTS dreams (
    date TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`);
}

// GET a dream for a date
app.get("/api/dreams/:date", async (req, res) => { // GET request to /api/dreams/date
  const date = req.params.date; // gets date from URL

  const row = await db.get( // query database - find row where date matches value from URL
    "SELECT text FROM dreams WHERE date = ?", // parameterised query to prevent SQL injection - ? placeholder, sql + user date sent seperately
    date
  );

  const text = row ? row.text : ""; // if row exists, get text, else empty string
  res.json({ date, text }); // return JSON response
});

// PUT to save/replace a dream for a date
app.put("/api/dreams/:date", async(req, res) => { // PUT request to /api/dreams/date
  const date = req.params.date; // gets date from URL
  const { text } = req.body; // gets text from request body

  if (typeof text !== "string") { // validate input 
    return res.status(400).json({ error: "text must be a string" }); // bad request 
  }

  const now = new Date().toISOString(); // current timestamp

  await db.run( // insert or replace row in database, placeholders -> sql parsed before values inserted
    `INSERT INTO dreams (date, text, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(date) DO UPDATE SET
        text = excluded.text,
        updated_at = excluded.updated_at
    `,
    date,
    text,
    now
  ); // on conflict -> if this date already exists, dont error - just update row , avoids race conditions

  res.json({ date, text }); // return JSON response

});

const PORT = 3001; // listen for requests

initDb()
  .then(() => {
    app.listen(PORT, () => { // listens for requests only after db open
      console.log(`API running on http://localhost:${PORT}`); 
    });
  })
  .catch((err) => { // error handling - if db fails to open
    console.error("failed to start server:", err);
    process.exit(1);
  });