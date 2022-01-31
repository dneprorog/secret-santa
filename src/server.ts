import express, { type Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import type DB from './db';

export default class Server {
  app: Express;
  db: DB;

  constructor(db: DB) {
    this.app = express();
    this.db = db;
  }

  public async init(port: number = 3000): Promise<void> {
    this.app.use(bodyParser.json());

    this.app.get('/participants', this.getParticipants.bind(this));
    this.app.get('/participants/:id', this.getParticipantById.bind(this));
    this.app.post('/participants', this.addParticipant.bind(this));
    this.app.delete('/participants/:id', this.removeParticipant.bind(this));

    this.app.post('/shuffle', this.shuffle.bind(this));

    this.app.get('/santas/:id', this.getSantasParticipant.bind(this));

    this.app.listen(port, () => {
      console.log(`server started at http://localhost:${port}`);
    });
  }

  private async getParticipants(_: Request, res: Response): Promise<void> {
    const participants = await this.db.getAllParticipants();

    res.send({ participants, error: null });
  }
  private async getParticipantById(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const participant = await this.db.getParticipantById(id);

    res.send({ participant, error: null });
  }
  private async addParticipant(req: Request, res: Response): Promise<void> {
    const { firstName, lastName, wishlist } = req.body;

    const deserializedWishlist = JSON.parse(wishlist);

    const id = await this.db.addParticipant(
      firstName,
      lastName,
      deserializedWishlist
    );

    res.send({ id, error: null });
  }
  private async removeParticipant(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    await this.db.removeParticipant(id);

    res.send({ error: null });
  }

  private async shuffle(_: Request, res: Response): Promise<void> {
    const participantsCount = await this.db.getParticipantsCount();
    if (participantsCount < 3 || participantsCount > 500) {
      res.status(500).send({
        error: `Invalid participants count ${participantsCount}. Participants count should be between 3 and 500.`,
      });
      return;
    }

    const participants = await this.db.getAllParticipants();
    const participantsIDs = participants.map((p) => p.id);
    for (let i = participantsIDs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [participantsIDs[i], participantsIDs[j]] = [
        participantsIDs[j],
        participantsIDs[i],
      ];
    }
    const santas = participantsIDs.map(
      (id: number, i: number): [number, number] => [
        id,
        participantsIDs[i + 1] || participantsIDs[0],
      ]
    );

    await this.db.persistSantas(santas);

    res.send({ error: null });
  }

  private async getSantasParticipant(
    req: Request,
    res: Response
  ): Promise<void> {
    const id = Number(req.params.id);
    const receiver = await this.db.getSantasParticipant(id);

    res.send({ receiver, error: null });
  }
}
