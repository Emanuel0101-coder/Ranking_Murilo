const lista = document.getElementById("lista");

function render(ranking) {
  lista.innerHTML = "";

  if (ranking.length === 0) {
    lista.innerHTML = `<p style="font-size: 1.5rem;">Nenhum dado ainda. 👀</p>`;
    return;
  }

  // TOP 1
  const primeiro = ranking[0];
  const div1 = document.createElement("div");
  div1.className = "item pos-1";
  div1.innerHTML = `
    <span class="nome">${primeiro.nome}</span><br />
    <span class="total-highlight">R$ ${primeiro.total.toFixed(2)}</span>
  `;
  lista.appendChild(div1);

  // Wrapper para TOP 2 e 3
  const top2Wrapper = document.createElement("div");
  top2Wrapper.className = "top2-wrapper";

  for (let i = 1; i <= 2 && i < ranking.length; i++) {
    const jogador = ranking[i];
    const div = document.createElement("div");
    div.className = `item pos-${i + 1}`;
    div.innerHTML = `
      <span class="nome">${jogador.nome}</span><br />
      <span class="total-highlight">R$ ${jogador.total.toFixed(2)}</span>
    `;
    top2Wrapper.appendChild(div);
  }
  lista.appendChild(top2Wrapper);

  // Demais colocados (4 em diante)
  for (let i = 3; i < ranking.length && i < 7; i++) {
    const jogador = ranking[i];
    const div = document.createElement("div");
    div.className = `item pos-${i + 1}`;
    div.innerHTML = `
      <span class="nome">${jogador.nome}</span>
      <span class="total">R$ ${jogador.total.toFixed(2)}</span>
    `;
    lista.appendChild(div);
  }
}

// 1ª carga + atualização por SSE
fetch("/ranking").then(r => r.json()).then(render);
const evtSource = new EventSource("/events");
evtSource.onmessage = (e) => render(JSON.parse(e.data));
