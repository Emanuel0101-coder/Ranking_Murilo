const form = document.getElementById("form");
const status = document.getElementById("status");
const select = document.getElementById("select-pessoas");
const btnExcluir = document.getElementById("btn-excluir");

// Enviar nova compra
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nome = document.getElementById("nome").value;
  const valor = parseFloat(document.getElementById("valor").value);

  const res = await fetch("/purchase", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, valor }),
  });

  if (res.ok) {
    status.textContent = `✅ Compra salva para ${nome}!`;
    form.reset();
    carregarPessoas();
  } else {
    status.textContent = `❌ Erro ao registrar.`;
  }
});

// Carregar lista de pessoas
async function carregarPessoas() {
  const res = await fetch("/ranking");
  const data = await res.json();
  select.innerHTML = "";
  data.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.nome;
    opt.textContent = p.nome;
    select.appendChild(opt);
  });
}

// Excluir pessoa
btnExcluir.addEventListener("click", async () => {
  const nome = select.value;
  if (!nome) return;

  const confirmar = confirm(`Deseja realmente excluir ${nome}?`);
  if (!confirmar) return;

  const res = await fetch(`/remove?nome=${encodeURIComponent(nome)}`, {
    method: "DELETE"
  });

  if (res.ok) {
    status.innerHTML = `🗑️ Pessoa <b>${nome}</b> removida!`;
    carregarPessoas();
  } else {
    status.textContent = `❌ Erro ao excluir.`;
  }
});

// Primeira carga
carregarPessoas();