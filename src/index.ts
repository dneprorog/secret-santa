import sqlite3 from 'sqlite3';
import express from 'express';

const { Database } = sqlite3.verbose();

const DB = new Database(':memory:');
DB.run(
  `
    CREATE TABLE participants (
        id INTEGER PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL
    );
`,
  (err) => {
    if (err !== null) {
      console.log('DB: Cannot create participants TABLE');
    }

    const statement = DB.prepare(
      `INSERT INTO participants (first_name, last_name) VALUES (?, ?)`
    );
    for (let i = 1; i <= 10; i++) {
      statement.run([`Fname${i}`, `Lname${i}`]);
    }

    statement.finalize();
  }
);

const app = express();
const port = 3000; // default port to listen

// define a route handler for the default home page
app.get('/', (req, res) => {
  DB.all(`SELECT * FROM participants;`, [], (err, rows) => {
    if (err) {
      console.log('DB: Cannot read participants TABLE');
    }

    console.log(rows);
  });

  res.send('Hello World!!!');
});

// start the Express server
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
