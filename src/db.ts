import sqlite3 from 'sqlite3';
import type { Participant, DBParticipant } from './types';

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
  }

  public async getParticipantsCount(): Promise<number> {
    const getParticipantsCountQuery =
      'SELECT COUNT(*) as count from participants;';

    return new Promise((resolve, reject) => {
      this.db.get(
        getParticipantsCountQuery,
        function (err: Error | null, row: { count: number }) {
          if (err !== null) {
            reject(new DBError('Cannot get participants count', err));
          }

          const { count } = row;

          resolve(count);
        }
      );
    });
  }

  public async getAllParticipants(): Promise<Participant[]> {
    const getAllParticipantsQuery = 'SELECT * FROM participants;';

    return new Promise((resolve, reject) => {
      this.db.all(
        getAllParticipantsQuery,
        (err: Error | null, rows: DBParticipant[]) => {
          if (err !== null) {
            reject(new DBError('Cannot read `participants` table', err));
          }

          const participants = rows.map((p: DBParticipant): Participant => {
            return {
              id: p.id,
              firstName: p.first_name,
              lastName: p.last_name,
              wishlist: JSON.parse(p.wishlist),
            };
          });

          resolve(participants);
        }
      );
    });
  }

  public async getParticipantById(id: number): Promise<Participant | null> {
    const getParticipantByIdQuery = 'SELECT * FROM participants WHERE id = ?;';

    return new Promise((resolve, reject) => {
      this.db.get(
        getParticipantByIdQuery,
        [id],
        (err: Error | null, row?: DBParticipant) => {
          if (err !== null) {
            reject(new DBError(`Cannot read participant with id ${id}`, err));
          }

          let participant = null;
          if (row !== undefined) {
            participant = {
              id: row.id,
              firstName: row.first_name,
              lastName: row.last_name,
              wishlist: JSON.parse(row.wishlist),
            };
          }

          resolve(participant);
        }
      );
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

  public async removeParticipant(id: number): Promise<void> {
    const removeParticipantQuery = 'DELETE FROM participants WHERE id = ?;';

    return new Promise((resolve, reject) => {
      this.db.run(removeParticipantQuery, [id], function (err: Error | null) {
        if (err !== null) {
          reject(new DBError(`Cannot delete participant with id ${id}`, err));
        }

        resolve();
      });
    });
  }

  public async persistSantas(santas: [number, number][]): Promise<void> {
    const cleanupSantasQuery = 'DELETE FROM santas;';
    const persistSantasQuery =
      'INSERT INTO santas (santa_id, receiver_id) VALUES (?, ?);';

    return new Promise((resolve, reject) => {
      const callback = (err: Error | null) => {
        if (err !== null) {
          reject(new DBError('Cannot persist santas', err));
        }
      };

      this.db.serialize(() => {
        this.db.run(cleanupSantasQuery, callback);

        const statement = this.db.prepare(persistSantasQuery);
        santas.forEach((params) => statement.run(params, callback));
        statement.finalize(callback);

        resolve();
      });
    });
  }

  public async getSantasParticipant(id: number): Promise<Participant | null> {
    const getSantasParticipantQuery = `
        SELECT participants.*
        FROM participants
        INNER JOIN santas ON participants.id = santas.receiver_id
        WHERE santas.santa_id = ?;`;

    return new Promise((resolve, reject) => {
      this.db.get(
        getSantasParticipantQuery,
        [id],
        (err: Error | null, row: DBParticipant) => {
          if (err !== null) {
            reject(new DBError(`Cannot get santa with id ${id}`, err));
          }

          const receiver = {
            id: row.id,
            firstName: row.first_name,
            lastName: row.last_name,
            wishlist: JSON.parse(row.wishlist),
          };

          resolve(receiver);
        }
      );
    });
  }

  public async init(): Promise<void> {
    await this.createParticipantsTable();
    await this.createSantaTable();
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
  private async createSantaTable(): Promise<void> {
    const createSantaTableQuery = `
      CREATE TABLE santas (
        santa_id INTEGER NOT NULL,
        receiver_id INTEGER NOT NULL
      );
    `;

    return new Promise((resolve, reject) => {
      this.db.run(createSantaTableQuery, (err: Error | null) => {
        if (err !== null) {
          reject(new DBError('Cannot create `santa` table', err));
        }

        resolve();
      });
    });
  }
}
