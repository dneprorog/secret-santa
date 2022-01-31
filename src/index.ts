import Server from './server';
import DB from './db';

async function main(): Promise<void> {
  const db = new DB();
  await db.init();

  const server = new Server(db);
  await server.init();
}

main();
