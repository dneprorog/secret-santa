import sqlite3 from 'sqlite3';
import type { Participant } from './types';

class DBError extends Error {
  err: Error;
  constructor(msg: string, err?: Error) {
    super(`DB Error: ${msg}`);
    this.err = err;
  }
}

export default class DB {
  db: sqlite3.Database;

  constructor() {
    const { Database } = sqlite3.verbose();
    this.db = new Database(':memory:');

    this.init();
  }

  public async getAllParticipants(): Promise<Participant[]> {
    const getAllParticipantsQuery = 'SELECT * FROM participants;';

    return new Promise((resolve, reject) => {
      this.db.all(getAllParticipantsQuery, (err, rows) => {
        if (err !== null) {
          reject(new DBError('Cannot read `participants` table', err));
        }

        resolve(rows);
      });
    });
  }

  public async addParticipant(
    firstName: string,
    lastName: string,
    wishlist: string[]
  ): Promise<number> {
    const addParticipantQuery =
      'INSERT INTO participants (first_name, last_name, wishlist) VALUES (?, ?, ?);';

    const serializedWishlist = JSON.stringify(wishlist);

    return new Promise((resolve, reject) => {
      this.db.run(
        addParticipantQuery,
        [firstName, lastName, serializedWishlist],
        function (err: Error | null) {
          if (err !== null) {
            reject(
              new DBError(
                'Cannot add new participant to `participants` table',
                err
              )
            );
          }

          resolve(this.lastID);
        }
      );
    });
  }

  private async init(): Promise<void> {
    await this.createParticipantsTable();
  }
  private async createParticipantsTable(): Promise<void> {
    const createParticipantsTableQuery = `
      CREATE TABLE participants (
        id INTEGER PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        wishlist TEXT NOT NULL
      );
    `;

    return new Promise((resolve, reject) => {
      this.db.run(createParticipantsTableQuery, (err: Error | null) => {
        if (err !== null) {
          reject(new DBError('Cannot create `participants` table', err));
        }

        resolve();
      });
    });
  }
}

// db.run(
//   `
//     CREATE TABLE participants (
//       id INTEGER PRIMARY KEY,
//       first_name TEXT NOT NULL,
//       last_name TEXT NOT NULL,
//       wishlist TEXT NOT NULL
//     );
// `,
//   (err: Error | null) => {
//     if (err !== null) {
//       console.log('DB: Cannot create `participants` table');
//     }
//
//     /*const statement = DB.prepare(
//       `INSERT INTO participants (first_name, last_name) VALUES (?, ?);`
//     );
//     for (let i = 1; i <= 10; i++) {
//       statement.run([`Fname-${i}`, `Lname-${i}`]);
//     }
//     statement.finalize();*/
//   }
// );
