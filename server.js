import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app  = express();
const port = 3000;

// ========= Banco de Dados =========
const db = new Database(path.join(__dirname, "ranking.db"));
db.pragma("journal_mode = WAL");
db.prepare(`
  CREATE TABLE IF NOT EXISTS compras (
    id     INTEGER PRIMARY KEY AUTOINCREMENT,
    nome   TEXT UNIQUE,
    total  REAL NOT NULL DEFAULT 0
  )
`).run();

// ========= Middleware =========
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

// ========= Rotas =========

// 1. Registrar compra
app.post("/purchase", (req, res) => {
  const { nome, valor } = req.body;
  if (!nome || !valor || valor <= 0) return res.status(400).end();

  const existe = db.prepare("SELECT 1 FROM compras WHERE nome = ?").get(nome);
  if (existe) {
    db.prepare("UPDATE compras SET total = total + ? WHERE nome = ?").run(valor, nome);
  } else {
    db.prepare("INSERT INTO compras (nome, total) VALUES (?, ?)").run(nome, valor);
  }

  broadcastRanking();
  res.status(204).end();
});

// 2. Retornar ranking ordenado
app.get("/ranking", (req, res) => {
  const lista = db.prepare("SELECT nome, total FROM compras ORDER BY total DESC").all();
  res.json(lista);
});

// 3. Remover pessoa com tratamento de erro e logs
app.delete("/remove", (req, res) => {
  try {
    const nome = req.query.nome;
    console.log("DELETE /remove - nome:", nome);

    if (!nome) {
      return res.status(400).send("Nome não fornecido");
    }

    const result = db.prepare("DELETE FROM compras WHERE nome = ?").run(nome);

    if (result.changes === 0) {
      return res.status(404).send("Pessoa não encontrada");
    }

    broadcastRanking();
    res.status(204).end();
  } catch (error) {
    console.error("Erro ao deletar pessoa:", error);
    res.status(500).send("Erro interno no servidor");
  }
});

// ========= SSE (atualização em tempo real) =========
const clients = [];
app.get("/events", (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.flushHeaders();
  res.write("retry: 5000\n\n");      // se perder, tenta reconectar
  clients.push(res);

  req.on("close", () => {
    const i = clients.indexOf(res);
    if (i !== -1) clients.splice(i, 1);
  });
});

// ========= Função para notificar clientes =========
function broadcastRanking() {
  const data = JSON.stringify(
    db.prepare("SELECT nome, total FROM compras ORDER BY total DESC").all()
  );
  for (const client of clients) {
    client.write(`data: ${data}\n\n`);
  }
}

// ========= Inicia servidor =========
app.listen(port, () => {
  console.log(`Servidor em http://localhost:${port}`);
});
  