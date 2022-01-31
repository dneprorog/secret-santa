import Server from './server';
import DB from './db';

const db = new DB();

new Server(db);
