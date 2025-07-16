import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(process.cwd(), 'db', 'ranking.db'));

export default function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const lista = db.prepare("SELECT nome, total FROM compras ORDER BY total DESC").all();
  res.status(200).json(lista);
}
