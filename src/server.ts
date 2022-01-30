import express, { type Express } from 'express';
import type DB from './db';

const PORT = 3000;

export default class Server {
  app: Express;
  db: DB;

  constructor(db: DB) {
    this.app = express();
    this.db = db;

    this.init();
  }

  private init(): void {
    this.app.get('/', async (req, res) => {
      const participants = await this.db.getAllParticipants();
      console.log('participants --->', participants);

      res.send('Hello world!!!');
    });

    this.app.listen(PORT, () => {
      console.log(`server started at http://localhost:${PORT}`);
    });
  }
}
