import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(process.cwd(), 'db', 'ranking.db'));

export default function handler(req, res) {
  if (req.method !== "DELETE") return res.status(405).end();

  const nome = req.query.nome;
  if (!nome) return res.status(400).send("Nome não fornecido");

  const result = db.prepare("DELETE FROM compras WHERE nome = ?").run(nome);

  if (result.changes === 0) {
    return res.status(404).send("Pessoa não encontrada");
  }

  res.status(204).end();
}
