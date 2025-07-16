import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(process.cwd(), 'db', 'ranking.db'));
db.pragma("journal_mode = WAL");

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { nome, valor } = req.body;
  if (!nome || !valor || valor <= 0) return res.status(400).end();

  const existe = db.prepare("SELECT 1 FROM compras WHERE nome = ?").get(nome);
  if (existe) {
    db.prepare("UPDATE compras SET total = total + ? WHERE nome = ?").run(valor, nome);
  } else {
    db.prepare("INSERT INTO compras (nome, total) VALUES (?, ?)").run(nome, valor);
  }

  res.status(204).end();
}
