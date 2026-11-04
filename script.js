// ==========================================
// LABORATÓRIO VIRTUAL DE CIRCUITOS ELÉTRICOS
// JavaScript compatível com o index.html enviado
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  iniciarAbas();
  iniciarMontagemLivre();
  iniciarQuestoes();
  iniciarMontagemAvancada();
});

// ------------------------------------------
// NAVEGAÇÃO ENTRE AS ABAS
// ------------------------------------------
function iniciarAbas() {
  const abas = document.querySelectorAll(".aba[data-aba]");
  const paineis = {
    livre: document.getElementById("painelLivre"),
    questoes: document.getElementById("painelQuestoes"),
    avancada: document.getElementById("painelAvancada")
  };

  abas.forEach((aba) => {
    aba.addEventListener("click", () => {
      abas.forEach((item) => item.classList.remove("ativa"));
      Object.values(paineis).forEach((painel) => {
        if (painel) painel.classList.add("escondido");
      });

      aba.classList.add("ativa");
      const destino = paineis[aba.dataset.aba];
      if (destino) destino.classList.remove("escondido");
    });
  });
}

// ------------------------------------------
// MONTAGEM LIVRE
// ------------------------------------------
function iniciarMontagemLivre() {
  const area = document.getElementById("circuito");
  if (!area) return;

  let componentes = [];
  let proximoId = 1;
  let interruptorFechado = true;

  const nomes = {
    fonte: "🔋 Fonte",
    interruptor: "🔘 Interruptor",
    resistor: "▱ Resistor",
    lampada: "💡 Lâmpada",
    fio: "➖ Fio"
  };

  document.querySelectorAll("[data-componente]").forEach((botao) => {
    botao.addEventListener("click", () => {
      const tipo = botao.dataset.componente;
      if (!nomes[tipo]) return;
      componentes.push({ id: proximoId++, tipo });
      desenhar();
      atualizarMensagem("Componente adicionado", `${nomes[tipo]} foi adicionado à montagem.`);
    });
  });

  const tensao = document.getElementById("tensao");
  const resistencia = document.getElementById("resistencia");
  [tensao, resistencia].forEach((campo) => {
    if (campo) campo.addEventListener("input", atualizarValores);
  });

  const testar = document.getElementById("testarCircuito");
  if (testar) testar.addEventListener("click", testarMontagem);

  const limpar = document.getElementById("limparCircuito");
  if (limpar) limpar.addEventListener("click", () => {
    componentes = [];
    interruptorFechado = true;
    desenhar();
    atualizarMensagem("Montagem limpa", "Adicione componentes para começar novamente.");
  });

  document.querySelectorAll("[data-desafio]").forEach((botao) => {
    botao.addEventListener("click", () => {
      const desafio = botao.dataset.desafio;
      if (desafio === "1") {
        componentes = ["fonte", "interruptor", "resistor", "lampada"].map((tipo) => ({
          id: proximoId++, tipo
        }));
        atualizarMensagem("Desafio 1", "Monte e teste um circuito com os quatro componentes.");
      } else if (desafio === "2") {
        if (tensao) tensao.value = 12;
        if (resistencia) resistencia.value = 6;
        atualizarValores();
        atualizarMensagem("Desafio 2", "Com 12 V e 6 Ω, use a Lei de Ohm para encontrar a corrente.");
      } else {
        componentes = [
          { id: proximoId++, tipo: "fonte" },
          { id: proximoId++, tipo: "interruptor" },
          { id: proximoId++, tipo: "lampada" }
        ];
        interruptorFechado = false;
        atualizarMensagem("Desafio 3", "Teste o circuito com o interruptor aberto e observe o resultado.");
      }
      desenhar();
    });
  });

  function desenhar() {
    area.innerHTML = "";
    if (!componentes.length) {
      area.innerHTML = '<div class="circuito-vazio"><span>⚡</span><h3>Seu circuito está vazio</h3><p>Adicione componentes no painel para começar.</p></div>';
      return;
    }

    componentes.forEach((item) => {
      const card = document.createElement("div");
      card.className = "componente";
      const nome = nomes[item.tipo] || item.tipo;
      const estado = item.tipo === "interruptor"
        ? (interruptorFechado ? "Fechado" : "Aberto")
        : "";
      card.innerHTML = `<span>${nome}${estado ? " — " + estado : ""}</span>
        <button type="button" aria-label="Remover ${nome}">×</button>`;
      card.querySelector("button").addEventListener("click", () => {
        componentes = componentes.filter((c) => c.id !== item.id);
        desenhar();
      });
      if (item.tipo === "interruptor") {
        card.addEventListener("click", (evento) => {
          if (evento.target.tagName !== "BUTTON") {
            interruptorFechado = !interruptorFechado;
            desenhar();
          }
        });
      }
      area.appendChild(card);
    });
  }

  function atualizarValores() {
    const v = Math.max(0, Number(tensao?.value) || 0);
    const r = Math.max(0.1, Number(resistencia?.value) || 0.1);
    const i = v / r;
    const p = v * i;
    setText("valorTensao", formatar(v));
    setText("valorResistencia", formatar(r));
    setText("valorCorrente", i.toFixed(2).replace(".", ","));
    setText("valorPotencia", p.toFixed(2).replace(".", ","));
  }

  function testarMontagem() {
    const temFonte = componentes.some((c) => c.tipo === "fonte");
    const temCarga = componentes.some((c) => c.tipo === "resistor" || c.tipo === "lampada");
    const temInterruptor = componentes.some((c) => c.tipo === "interruptor");

    if (!temFonte || !temCarga) {
      atualizarMensagem("Circuito incompleto", "Adicione pelo menos uma fonte e um resistor ou lâmpada.");
    } else if (temInterruptor && !interruptorFechado) {
      atualizarMensagem("Circuito aberto", "O interruptor está aberto. A corrente elétrica não circula.");
    } else {
      atualizarMensagem("Representação de circuito fechado", "Há fonte e componente de carga. Nesta montagem livre, os fios são apenas ilustrativos; os cálculos usam os valores informados.");
      atualizarValores();
    }
  }

  function atualizarMensagem(titulo, texto) {
    setText("tituloMensagem", titulo);
    setText("textoMensagem", texto);
    const caixa = document.getElementById("mensagemSistema");
    if (caixa) caixa.className = "mensagem info";
  }

  atualizarValores();
  desenhar();
}

// ------------------------------------------
// EXEMPLOS DE CIRCUITOS / QUESTÕES
// ------------------------------------------
function iniciarQuestoes() {
  const modelos = {
    basico: {
      nivel: "NÍVEL BÁSICO",
      titulo: "Circuito em série",
      descricao: "Uma bateria de 12 V alimenta dois resistores ligados em série, de 4 Ω e 2 Ω.",
      resultados: [
        ["Resistência equivalente", "6 Ω"],
        ["Corrente total", "2 A"],
        ["Potência total", "24 W"]
      ],
      explicacao: "Em série, somamos as resistências: Req = 4 + 2 = 6 Ω. Pela Lei de Ohm: I = U/Req = 12/6 = 2 A. A corrente é a mesma nos dois resistores.",
      esquema: "serie",
      tutorial: {
        introducao: "Neste exemplo, você vai ligar uma bateria de 12 V a dois resistores: R1 = 4 Ω e R2 = 2 Ω. Eles ficarão um depois do outro, formando um circuito em série.",
        nota: "Em série, a corrente percorre um único caminho. Se um componente ou fio interromper esse caminho, a corrente deixa de circular.",
        etapas: [
          { titulo: "Separe os componentes", texto: "Adicione 1 bateria e 2 resistores na bancada avançada. Depois, selecione cada resistor e informe os valores indicados.", acao: "Clique em ‘Adicionar fonte’ uma vez e em ‘Adicionar resistor’ duas vezes. Selecione o primeiro resistor, coloque 4 no campo de valor e clique em ‘Aplicar valor’. Repita com o segundo resistor usando 2.", conferir: "Há uma única bateria e dois resistores com os valores corretos. Não confunda Ω (ohm) com V (volt)." },
          { titulo: "Identifique os terminais", texto: "Cada peça tem dois terminais azuis, um de cada lado. Um fio é criado com dois cliques: primeiro em um terminal e depois no terminal da outra peça.", acao: "Arraste a bateria para a esquerda, o resistor de 4 Ω para o centro e o resistor de 2 Ω para a direita. Deixe um espaço entre as peças para enxergar os fios.", conferir: "Os três componentes estão separados e os terminais estão visíveis. A posição na tela ajuda a visualizar, mas o que importa é a ligação dos terminais." },
          { titulo: "Ligue a bateria ao primeiro resistor", texto: "Agora vamos ligar a bateria ao primeiro resistor. Clique em um dos círculos azuis da bateria e depois em um círculo azul do resistor de 4 Ω.", acao: "Faça dois cliques: primeiro no terminal azul da bateria e depois no terminal azul do resistor de 4 Ω. Um fio deve aparecer entre eles.", conferir: "Existe um fio ligando o positivo da bateria a apenas uma extremidade de R1. O outro terminal de R1 continua livre." },
          { titulo: "Ligue os resistores em sequência", texto: "Ligue os dois resistores. Use o terminal que ainda está livre no resistor de 4 Ω e conecte-o a um terminal do resistor de 2 Ω.", acao: "Clique no círculo azul livre do resistor de 4 Ω e depois em um dos círculos azuis do resistor de 2 Ω. Assim, eles ficam em sequência.", conferir: "R1 e R2 estão ligados um depois do outro. Entre eles existe apenas um caminho, sem ramificações." },
          { titulo: "Feche o caminho até a bateria", texto: "Falta fechar o circuito. Conecte o terminal que sobrou no resistor de 2 Ω ao segundo terminal da bateria.", acao: "Clique no terminal azul que ainda está livre no resistor de 2 Ω e depois no terminal azul que sobrou na bateria. O caminho ficará completo: bateria → resistor de 4 Ω → resistor de 2 Ω → bateria.", conferir: "O circuito forma um caminho completo, sem pontas soltas. A resistência equivalente deve ser 4 + 2 = 6 Ω." },
          { titulo: "Analise o resultado", texto: "Agora o circuito está montado. Como os resistores estão em série, somamos: 4 + 2 = 6 Ω. A corrente será I = 12 ÷ 6 = 2 A.", acao: "Clique em ‘Analisar circuito’ na bancada avançada. O resultado esperado é: resistência equivalente de 6 Ω, corrente de 2 A e potência de 24 W.", conferir: "O laboratório identifica circuito fechado, tipo série, resistência equivalente de 6 Ω e corrente de 2 A. Se aparecer circuito aberto, revise cada fio." }
        ]
      }
    },
    complexo: {
      nivel: "NÍVEL INTERMEDIÁRIO",
      titulo: "Circuito misto",
      descricao: "Uma bateria de 12 V alimenta um resistor de 2 Ω em série com dois resistores de 6 Ω em paralelo.",
      resultados: [
        ["Resistência equivalente", "5 Ω"],
        ["Corrente total", "2,4 A"],
        ["Potência total", "28,8 W"]
      ],
      explicacao: "Primeiro, o paralelo: 1/Req = 1/6 + 1/6, então Req = 3 Ω. Depois, somamos com o resistor em série: 2 + 3 = 5 Ω. A corrente total é I = 12/5 = 2,4 A.",
      esquema: "misto",
      tutorial: {
        introducao: "Neste exemplo, a bateria de 12 V alimenta primeiro um resistor de 2 Ω. Depois, o circuito se divide em dois caminhos paralelos, cada um com um resistor de 6 Ω.",
        nota: "No paralelo, os dois resistores precisam compartilhar os mesmos dois nós: o ponto onde os ramos se dividem e o ponto onde eles se juntam novamente.",
        etapas: [
          { titulo: "Separe os quatro componentes", texto: "Adicione uma bateria e três resistores. O primeiro terá 2 Ω; os outros dois terão 6 Ω.", acao: "Adicione 1 fonte e 3 resistores. Ajuste os valores para 2 Ω, 6 Ω e 6 Ω usando o campo de valor e o botão ‘Aplicar valor’ para cada peça.", conferir: "Há uma bateria e três resistores. Um resistor tem 2 Ω; os outros dois têm 6 Ω." },
          { titulo: "Monte o primeiro trecho em série", texto: "O resistor de 2 Ω deve ficar entre a bateria e a divisão dos caminhos. Ele é o primeiro componente do circuito.", acao: "Arraste a bateria para a esquerda e o resistor de 2 Ω para perto dela. Clique em um terminal azul da bateria e depois em um terminal azul do resistor de 2 Ω.", conferir: "Um dos terminais da bateria está ligado a R1. Ainda não há ramificações antes desse resistor." },
          { titulo: "Crie o ponto de divisão", texto: "Agora vamos criar a divisão. O terminal livre do resistor de 2 Ω será o ponto de onde sairão os dois caminhos paralelos.", acao: "Clique no terminal livre do resistor de 2 Ω e depois em um terminal do resistor de 6 Ω. Repita: clique novamente no mesmo terminal livre do resistor de 2 Ω e depois em um terminal do outro resistor de 6 Ω. Os dois fios devem sair do mesmo ponto.", conferir: "Os dois resistores de 6 Ω começam no mesmo ponto elétrico, depois de R1. Esse é o início do paralelo." },
          { titulo: "Forme os dois ramos paralelos", texto: "Os resistores de 6 Ω precisam ficar em dois caminhos separados: um ramo em cima e outro embaixo. Eles não devem ser ligados um depois do outro.", acao: "Arraste um resistor de 6 Ω para cima e o outro para baixo. Deixe espaço para unir as pontas livres dos dois resistores.", conferir: "Há dois caminhos: um passa somente por R2 e o outro passa somente por R3. Os ramos não estão em série entre si." },
          { titulo: "Una os ramos novamente", texto: "Agora una as pontas dos dois ramos. Os resistores de 6 Ω devem começar no mesmo ponto e terminar no mesmo ponto.", acao: "Clique no terminal livre de um resistor de 6 Ω e depois no terminal livre do outro resistor de 6 Ω. Você criou o ponto onde os dois caminhos se juntam.", conferir: "Os dois resistores de 6 Ω compartilham os mesmos dois nós: o de divisão e o de encontro." },
          { titulo: "Retorne ao polo negativo", texto: "Falta fechar o caminho: ligue o ponto onde os dois resistores se juntaram ao segundo terminal da bateria.", acao: "Clique em um dos terminais que já estão unidos no final dos ramos e depois no terminal livre da bateria. O circuito fica fechado.", conferir: "O circuito tem um trecho em série antes da divisão e dois ramos em paralelo, que se juntam antes de voltar à bateria." },
          { titulo: "Calcule e confira", texto: "Calcule primeiro o paralelo: dois resistores de 6 Ω em paralelo equivalem a 3 Ω. Depois some o resistor em série: 2 + 3 = 5 Ω.", acao: "Clique em ‘Analisar circuito’. O resultado esperado é: resistência equivalente de 5 Ω, corrente total de 2,4 A e potência de 28,8 W.", conferir: "O resultado esperado é circuito fechado, misto, 5 Ω de resistência equivalente e 2,4 A de corrente total." }
        ]
      }
    }
  };

  document.querySelectorAll("[data-modelo]").forEach((botao) => {
    botao.addEventListener("click", () => {
      document.querySelectorAll("[data-modelo]").forEach((b) => {
        b.classList.remove("ativo");
      });
      botao.classList.add("ativo");
      mostrarModelo(modelos[botao.dataset.modelo]);
    });
  });

  let modeloAtual = modelos.basico;
  let etapaAtual = 0;

  const anterior = document.getElementById("anteriorTutorial");
  const proxima = document.getElementById("proximaTutorial");
  if (anterior) anterior.addEventListener("click", () => {
    etapaAtual = Math.max(0, etapaAtual - 1);
    mostrarEtapaTutorial();
  });
  if (proxima) proxima.addEventListener("click", () => {
    const total = modeloAtual.tutorial.etapas.length;
    if (etapaAtual < total - 1) {
      etapaAtual++;
    } else {
      etapaAtual = 0;
    }
    mostrarEtapaTutorial();
  });

  mostrarModelo(modelos.basico);

  function mostrarEtapaTutorial() {
    const tutorial = modeloAtual.tutorial;
    const etapa = tutorial.etapas[etapaAtual];
    const total = tutorial.etapas.length;
    setText("tituloTutorial", `Como montar: ${modeloAtual.titulo}`);
    setText("introducaoTutorial", tutorial.introducao);
    setText("contadorTutorial", `Etapa ${etapaAtual + 1} de ${total}`);
    setText("numeroTutorial", String(etapaAtual + 1).padStart(2, "0"));
    setText("etapaTutorialTitulo", etapa.titulo);
    setText("etapaTutorialTexto", etapa.texto);
    setText("etapaTutorialAcao", etapa.acao);
    setText("etapaTutorialConferir", etapa.conferir);
    setText("notaTutorial", tutorial.nota);
    const barra = document.getElementById("barraTutorial");
    if (barra) barra.style.width = `${((etapaAtual + 1) / total) * 100}%`;
    if (anterior) anterior.disabled = etapaAtual === 0;
    if (proxima) proxima.textContent = etapaAtual === total - 1 ? "↻ Rever tutorial" : "Próxima etapa →";
  }

  function mostrarModelo(modelo) {
    if (!modelo) return;
    setText("nivelCircuito", modelo.nivel);
    setText("tituloCircuito", modelo.titulo);
    setText("descricaoCircuito", modelo.descricao);

    const esquema = document.getElementById("esquemaWrap");
    if (esquema) {
      esquema.innerHTML = modelo.esquema === "serie"
        ? `<svg viewBox="0 0 620 170" role="img" aria-label="Bateria e dois resistores em série">
             <path d="M70 85 H150 M210 85 H300 M360 85 H500 V130 H70 V85" fill="none" stroke="currentColor" stroke-width="4"/>
             <path d="M70 55 V115 M82 65 V105" stroke="currentColor" stroke-width="4"/>
             <rect x="150" y="65" width="60" height="40" rx="5" fill="#dceafe" stroke="#2563eb" stroke-width="3"/>
             <rect x="300" y="65" width="60" height="40" rx="5" fill="#dceafe" stroke="#2563eb" stroke-width="3"/>
             <g fill="currentColor" font-size="15" text-anchor="middle"><text x="70" y="35">12 V</text><text x="180" y="55">4 Ω</text><text x="330" y="55">2 Ω</text></g>
           </svg>`
        : `<svg viewBox="0 0 620 210" role="img" aria-label="Circuito misto com resistor em série e dois em paralelo">
             <path d="M55 100 H130 M190 100 H255 M255 100 V45 H390 V100 M255 100 V155 H390 V100 M390 100 H520 V175 H55 V100" fill="none" stroke="currentColor" stroke-width="4"/>
             <path d="M55 70 V130 M67 80 V120" stroke="currentColor" stroke-width="4"/>
             <rect x="130" y="80" width="60" height="40" rx="5" fill="#dceafe" stroke="#2563eb" stroke-width="3"/>
             <rect x="315" y="25" width="60" height="40" rx="5" fill="#dceafe" stroke="#2563eb" stroke-width="3"/>
             <rect x="315" y="135" width="60" height="40" rx="5" fill="#dceafe" stroke="#2563eb" stroke-width="3"/>
             <g fill="currentColor" font-size="15" text-anchor="middle"><text x="55" y="50">12 V</text><text x="160" y="70">2 Ω</text><text x="345" y="18">6 Ω</text><text x="345" y="195">6 Ω</text></g>
           </svg>`;
    }

    const resultados = document.getElementById("resultadosCircuito");
    if (resultados) {
      resultados.innerHTML = modelo.resultados.map(([nome, valor]) =>
        `<div class="resultado-item"><small>${nome}</small><strong>${valor}</strong></div>`
      ).join("");
    }
    const explicacao = document.getElementById("explicacaoCircuito");
    if (explicacao) explicacao.textContent = modelo.explicacao;
    modeloAtual = modelo;
    etapaAtual = 0;
    mostrarEtapaTutorial();
  }
}

// ------------------------------------------
// MONTAGEM AVANÇADA
// ------------------------------------------
function iniciarMontagemAvancada() {
  const svg = document.getElementById("bancadaAvancada");
  if (!svg) return;

  const ns = "http://www.w3.org/2000/svg";
  const camadaFios = document.getElementById("camadaFios");
  const camadaPreview = document.getElementById("camadaPreview");
  const camadaPecas = document.getElementById("camadaPecas");

  let pecas = [];
  let fios = [];
  let selecionada = null;
  let terminalInicial = null;
  let proximoId = 1;
  let arrasto = null;

  const nomes = {
    fonte: "Bateria",
    resistor: "Resistor",
    lampada: "Lâmpada",
    interruptor: "Interruptor"
  };

  document.querySelectorAll("[data-av-add]").forEach((botao) => {
    botao.addEventListener("click", () => adicionarPeca(botao.dataset.avAdd));
  });

  ligar("aplicarValorPeca", alterarValor);
  ligar("alternarChaveAvancada", alternarChave);
  ligar("removerPecaAvancada", removerPeca);
  ligar("limparAvancado", limpar);
  ligar("analisarAvancado", analisar);
  ligar("desfazerFio", desfazerFio);

  const campoTensao = document.getElementById("tensaoAvancada");
  if (campoTensao) campoTensao.addEventListener("input", () => {
    const v = Number(campoTensao.value);
    if (Number.isFinite(v) && v > 0) {
      mostrar("Tensão da fonte definida como " + v + " V.");
    }
  });

  function ligar(id, fn) {
    const el = document.getElementById(id);
    if (el) el.addEventListener("click", fn);
  }

  function adicionarPeca(tipo) {
    if (!nomes[tipo]) return;
    const peca = {
      id: proximoId++,
      tipo,
      x: 150 + Math.random() * 650,
      y: 120 + Math.random() * 360,
      resistencia: tipo === "lampada" ? 10 : 100,
      fechado: true
    };
    pecas.push(peca);
    selecionada = peca.id;
    desenhar();
    mostrar(nomes[tipo] + " adicionado. Arraste a peça para posicioná-la.");
  }

  function terminalId(id, lado) {
    return `${id}-${lado}`;
  }

  function posTerminal(id, lado) {
    const p = pecas.find((item) => item.id === id);
    if (!p) return null;
    return { x: p.x + (lado === "a" ? -58 : 58), y: p.y };
  }

  function desenhar() {
    camadaFios.innerHTML = "";
    camadaPreview.innerHTML = "";
    camadaPecas.innerHTML = "";

    fios.forEach((fio) => {
      const a = posTerminal(fio.a.id, fio.a.lado);
      const b = posTerminal(fio.b.id, fio.b.lado);
      if (!a || !b) return;
      const caminho = document.createElementNS(ns, "path");
      const meioX = Math.round((a.x + b.x) / 2);
      const d = Math.abs(a.y - b.y) < 12
        ? `M ${a.x} ${a.y} H ${b.x}`
        : `M ${a.x} ${a.y} H ${meioX} V ${b.y} H ${b.x}`;
      caminho.setAttribute("d", d);
      caminho.setAttribute("class", "fio");
      caminho.setAttribute("fill", "none");
      caminho.setAttribute("stroke", "#1683d8");
      caminho.setAttribute("stroke-width", "3.5");
      caminho.setAttribute("stroke-linecap", "round");
      caminho.setAttribute("stroke-linejoin", "round");
      caminho.setAttribute("filter", "url(#glowFio)");
      camadaFios.appendChild(caminho);
      [a, b].forEach((ponto) => {
        const no = document.createElementNS(ns, "circle");
        no.setAttribute("cx", ponto.x); no.setAttribute("cy", ponto.y); no.setAttribute("r", "3.2");
        no.setAttribute("fill", "#f2b544"); camadaFios.appendChild(no);
      });
    });

    pecas.forEach((peca) => desenharPeca(peca));
    setText("estadoConexao", terminalInicial
      ? "Terminal inicial selecionado · escolha o destino"
      : "Arraste componentes · clique em dois terminais para conectar");
    setText("metricPecas", String(pecas.length));
    if (campoTensao) setText("metricTensao", `${Number(campoTensao.value || 12).toFixed(2).replace(".",",")} V`);
  }

  function desenharPeca(peca) {
    const grupo = document.createElementNS(ns, "g");
    grupo.setAttribute("transform", `translate(${peca.x} ${peca.y})`);
    grupo.style.cursor = "grab";
    const ativo = selecionada === peca.id;
    const mk = (tag, attrs, parent=grupo) => {
      const el = document.createElementNS(ns, tag);
      Object.entries(attrs).forEach(([k,v]) => el.setAttribute(k, v));
      parent.appendChild(el); return el;
    };
    if (ativo) mk("rect", {x:-68,y:-38,width:136,height:76,rx:12,fill:"#087eae", "fill-opacity":".10",stroke:"#f2b544","stroke-width":"1.5","stroke-dasharray":"5 4"});
    mk("line", {x1:-58,y1:0,x2:-36,y2:0,stroke:"#62b9eb","stroke-width":"3"});
    mk("line", {x1:36,y1:0,x2:58,y2:0,stroke:"#62b9eb","stroke-width":"3"});
    const cor="#f5f9fc", azul="#62b9eb", amarelo="#f2b544";
    if (peca.tipo === "fonte") {
      mk("line",{x1:-30,y1:0,x2:-14,y2:0,stroke:cor,"stroke-width":3});
      mk("line",{x1:-14,y1:-17,x2:-14,y2:17,stroke:cor,"stroke-width":3});
      mk("line",{x1:-3,y1:-10,x2:-3,y2:10,stroke:cor,"stroke-width":2});
      mk("line",{x1:9,y1:-17,x2:9,y2:17,stroke:cor,"stroke-width":3});
      mk("line",{x1:20,y1:-10,x2:20,y2:10,stroke:cor,"stroke-width":2});
      mk("line",{x1:20,y1:0,x2:30,y2:0,stroke:cor,"stroke-width":3});
      const plus=mk("text",{x:-15,y:-24,fill:amarelo,"font-size":12,"font-weight":800,"text-anchor":"middle"}); plus.textContent="+";
    } else if (peca.tipo === "resistor") {
      const pts=[[-36,0],[-25,-10],[-14,10],[-3,-10],[8,10],[19,-10],[30,0]];
      mk("polyline",{points:pts.map(p=>p.join(",")).join(" "),fill:"none",stroke:cor,"stroke-width":3,"stroke-linejoin":"round","stroke-linecap":"round"});
    } else if (peca.tipo === "lampada") {
      mk("circle",{cx:0,cy:0,r:19,fill:"#173b55",stroke:peca.ligada?amarelo:cor,"stroke-width":2.5});
      mk("path",{d:"M -10 -10 L 10 10 M 10 -10 L -10 10",stroke:peca.ligada?amarelo:cor,"stroke-width":2.5,"stroke-linecap":"round"});
    } else {
      mk("circle",{cx:-22,cy:0,r:3.5,fill:azul}); mk("circle",{cx:22,cy:0,r:3.5,fill:azul});
      mk("line",{x1:-22,y1:0,x2:peca.fechado?20:10,y2:peca.fechado?0:-15,stroke:peca.fechado?cor:amarelo,"stroke-width":3,"stroke-linecap":"round"});
    }
    const nome = peca.tipo === "fonte" ? "V" : peca.tipo === "resistor" ? "R" : peca.tipo === "lampada" ? "L" : "S";
    const label = mk("text",{x:0,y:34,fill:ativo?"#ffffff":"#b9d1e2","font-size":12,"font-weight":700,"text-anchor":"middle"});
    label.textContent = peca.tipo === "fonte" ? `V${peca.id} · 12 V` : peca.tipo === "resistor" ? `R${peca.id} · ${peca.resistencia} Ω` : peca.tipo === "lampada" ? `L${peca.id} · ${peca.resistencia} Ω` : `S${peca.id} · ${peca.fechado?"FECHADA":"ABERTA"}`;
    grupo.addEventListener("pointerdown", (evento) => {
      if (evento.target.classList.contains("terminal-ponto")) return;
      if (evento.button !== 0) return;
      selecionada = peca.id;
      const campo=document.getElementById("valorPeca"); if(campo && ["resistor","lampada"].includes(peca.tipo)) campo.value=peca.resistencia;
      arrasto = {id:peca.id,inicioX:evento.clientX,inicioY:evento.clientY,x:peca.x,y:peca.y};
      try { svg.setPointerCapture(evento.pointerId); } catch (_) {}
      evento.preventDefault();
    });
    grupo.addEventListener("dblclick", () => { if(peca.tipo==="interruptor"){peca.fechado=!peca.fechado;desenhar();mostrar(peca.fechado?"Interruptor fechado.":"Interruptor aberto.");} });
    camadaPecas.appendChild(grupo);
    ["a","b"].forEach((lado)=>{
      const pos=posTerminal(peca.id,lado);
      const ponto=mk("circle",{cx:pos.x-peca.x,cy:pos.y-peca.y,r:6,fill:"#d9f2ff",stroke:azul,"stroke-width":3},camadaPecas);
      ponto.setAttribute("class","terminal-ponto"); ponto.style.cursor="crosshair";
      ponto.addEventListener("click",(evento)=>{evento.stopPropagation();conectar({id:peca.id,lado});});
    });
  }

  svg.addEventListener("pointermove", (evento) => {
    if (!arrasto) return;
    const p = pecas.find((item) => item.id === arrasto.id);
    if (!p) return;
    const retangulo = svg.getBoundingClientRect();
    if (!retangulo.width || !retangulo.height) return;
    const escalaX = 1000 / retangulo.width;
    const escalaY = 620 / retangulo.height;
    p.x = Math.max(75, Math.min(925, arrasto.x + (evento.clientX - arrasto.inicioX) * escalaX));
    p.y = Math.max(55, Math.min(565, arrasto.y + (evento.clientY - arrasto.inicioY) * escalaY));
    desenhar();
  });
  function finalizarArrasto(evento) {
    if (!arrasto) return;
    arrasto = null;
    try {
      if (evento && svg.hasPointerCapture(evento.pointerId)) svg.releasePointerCapture(evento.pointerId);
    } catch (_) {}
    desenhar();
  }
  svg.addEventListener("pointerup", finalizarArrasto);
  svg.addEventListener("pointercancel", finalizarArrasto);

  function conectar(terminal) {
    if (!terminalInicial) {
      terminalInicial = terminal;
      desenhar();
      mostrar("Primeiro terminal selecionado. Escolha o segundo.");
      return;
    }
    if (terminalInicial.id === terminal.id && terminalInicial.lado === terminal.lado) {
      terminalInicial = null;
      desenhar();
      mostrar("Conexão cancelada.");
      return;
    }
    const repetido = fios.some((f) =>
      (f.a.id === terminalInicial.id && f.a.lado === terminalInicial.lado &&
       f.b.id === terminal.id && f.b.lado === terminal.lado) ||
      (f.b.id === terminalInicial.id && f.b.lado === terminalInicial.lado &&
       f.a.id === terminal.id && f.a.lado === terminal.lado)
    );
    if (!repetido) fios.push({ a: terminalInicial, b: terminal });
    terminalInicial = null;
    desenhar();
    mostrar(repetido ? "Esses terminais já estão conectados." : "Fio conectado.");
  }

  function alterarValor() {
    const p = pecas.find((item) => item.id === selecionada);
    const campo = document.getElementById("valorPeca");
    const valor = Number(campo?.value);
    if (!p) return mostrar("Selecione um resistor ou uma lâmpada primeiro.");
    if (!["resistor", "lampada"].includes(p.tipo)) return mostrar("A peça selecionada não possui resistência editável.");
    if (!Number.isFinite(valor) || valor <= 0) return mostrar("Digite uma resistência maior que zero.");
    p.resistencia = valor;
    desenhar();
    mostrar("Valor da resistência atualizado.");
  }

  function alternarChave() {
    const p = pecas.find((item) => item.id === selecionada);
    if (!p || p.tipo !== "interruptor") return mostrar("Selecione um interruptor.");
    p.fechado = !p.fechado;
    desenhar();
    mostrar(p.fechado ? "Interruptor fechado." : "Interruptor aberto.");
  }

  function removerPeca() {
    if (!selecionada) return mostrar("Selecione uma peça para remover.");
    pecas = pecas.filter((p) => p.id !== selecionada);
    fios = fios.filter((f) => f.a.id !== selecionada && f.b.id !== selecionada);
    selecionada = null;
    terminalInicial = null;
    desenhar();
    mostrar("Peça removida.");
  }

  function limpar() {
    pecas = [];
    fios = [];
    selecionada = null;
    terminalInicial = null;
    desenhar();
    mostrar("Bancada limpa. Adicione os componentes novamente.");
  }

  function desfazerFio() {
    if (!fios.length) return mostrar("Não há fios para desfazer.");
    fios.pop();
    desenhar();
    mostrar("Último fio removido.");
  }

  function mostrar(mensagem) {
    const caixa = document.getElementById("resultadoAvancado");
    if (caixa) caixa.innerHTML = `<strong>Laboratório</strong><p>${mensagem}</p>`;
  }

  function analisar() {
    const fontes = pecas.filter((p) => p.tipo === "fonte");
    if (fontes.length !== 1) return mostrar("Adicione exatamente uma bateria.");

    const fonte = fontes[0];
    const resistores = pecas.filter((p) => ["resistor", "lampada"].includes(p.tipo));
    if (!resistores.length) return mostrar("Adicione pelo menos um resistor ou uma lâmpada.");

    const parent = new Map();
    pecas.forEach((p) => {
      parent.set(terminalId(p.id, "a"), terminalId(p.id, "a"));
      parent.set(terminalId(p.id, "b"), terminalId(p.id, "b"));
    });

    function find(x) {
      if (parent.get(x) !== x) parent.set(x, find(parent.get(x)));
      return parent.get(x);
    }
    function union(a, b) {
      const ra = find(a), rb = find(b);
      if (ra !== rb) parent.set(ra, rb);
    }

    fios.forEach((f) => union(terminalId(f.a.id, f.a.lado), terminalId(f.b.id, f.b.lado)));
    pecas.filter((p) => p.tipo === "interruptor" && p.fechado)
      .forEach((p) => union(terminalId(p.id, "a"), terminalId(p.id, "b")));

    const inicio = find(terminalId(fonte.id, "a"));
    const fim = find(terminalId(fonte.id, "b"));
    if (inicio === fim) return mostrar("Atenção: possível curto-circuito. Revise as conexões.");

    const arestas = resistores.map((p) => ({
      a: find(terminalId(p.id, "a")),
      b: find(terminalId(p.id, "b")),
      r: p.resistencia
    })).filter((e) => e.a !== e.b);

    const caminho = existeCaminho(inicio, fim, arestas);
    if (!caminho) return mostrar("CIRCUITO ABERTO: não há caminho completo para a corrente.");

    const equivalente = reduzirRede(inicio, fim, arestas);
    if (!equivalente) return mostrar("CIRCUITO FECHADO: há caminho para a corrente, mas esta configuração não pode ser calculada automaticamente por este modelo.");

    const valorTensao = Number(campoTensao?.value);
    const tensao = Number.isFinite(valorTensao) && campoTensao?.value.trim() !== "" ? Math.max(0, valorTensao) : 12;
    const corrente = tensao / equivalente.r;
    const potencia = tensao * corrente;
    const tipo = equivalente.paralelo && equivalente.serie ? "Misto"
      : equivalente.paralelo ? "Paralelo" : "Série";

    setText("metricTensao", `${tensao.toFixed(2).replace(".",",")} V`);
    setText("metricCorrente", `${corrente.toFixed(3).replace(".",",")} A`);
    setText("metricResistencia", `${equivalente.r.toFixed(2).replace(".",",")} Ω`);
    setText("metricPotencia", `${potencia.toFixed(2).replace(".",",")} W`);
    const estado=document.getElementById("metricEstado");
    if(estado) estado.innerHTML=`<span>✓</span><div><b>Circuito fechado</b><small>Rede ${tipo.toLowerCase()} reconhecida</small></div>`;
    mostrar(`<strong>CIRCUITO FECHADO · ${tipo.toUpperCase()}</strong><p>Resistência equivalente: ${equivalente.r.toFixed(2)} Ω · Corrente: ${corrente.toFixed(3)} A · Potência: ${potencia.toFixed(2)} W.</p>`);
  }

  function existeCaminho(inicio, fim, arestas) {
    const vistos = new Set([inicio]);
    const fila = [inicio];
    while (fila.length) {
      const atual = fila.shift();
      if (atual === fim) return true;
      arestas.forEach((e) => {
        const proximo = e.a === atual ? e.b : e.b === atual ? e.a : null;
        if (proximo && !vistos.has(proximo)) {
          vistos.add(proximo);
          fila.push(proximo);
        }
      });
    }
    return false;
  }

  function reduzirRede(inicio, fim, arestasOriginais) {
    let edges = arestasOriginais.map((e) => ({ ...e, serie: false, paralelo: false }));
    let mudouSerie = false, mudouParalelo = false;
    for (let rodada = 0; rodada < 100; rodada++) {
      let mudou = false;

      // Resistores em paralelo: mesmas duas extremidades
      for (let i = 0; i < edges.length && !mudou; i++) {
        for (let j = i + 1; j < edges.length; j++) {
          const a = edges[i], b = edges[j];
          if ((a.a === b.a && a.b === b.b) || (a.a === b.b && a.b === b.a)) {
            const r = 1 / (1 / a.r + 1 / b.r);
            edges.splice(j, 1);
            edges.splice(i, 1);
            edges.push({ a: a.a, b: a.b, r, serie: a.serie || b.serie, paralelo: true });
            mudou = true;
            mudouParalelo = true;
            break;
          }
        }
      }
      if (mudou) continue;

      // Resistores em série: nó intermediário com apenas duas ligações
      const nos = new Set(edges.flatMap((e) => [e.a, e.b]));
      for (const no of nos) {
        if (no === inicio || no === fim) continue;
        const ligacoes = edges.filter((e) => e.a === no || e.b === no);
        if (ligacoes.length === 2) {
          const [a, b] = ligacoes;
          const outroA = a.a === no ? a.b : a.a;
          const outroB = b.a === no ? b.b : b.a;
          if (outroA === outroB) continue;
          edges = edges.filter((e) => e !== a && e !== b);
          edges.push({
            a: outroA, b: outroB, r: a.r + b.r,
            serie: true, paralelo: a.paralelo || b.paralelo
          });
          mudou = true;
          mudouSerie = true;
          break;
        }
      }
      if (!mudou) break;
    }

    if (edges.length !== 1) return null;
    const e = edges[0];
    if (!((e.a === inicio && e.b === fim) || (e.a === fim && e.b === inicio))) return null;
    return { r: e.r, serie: mudouSerie || e.serie, paralelo: mudouParalelo || e.paralelo };
  }

  desenhar();
}

function setText(id, valor) {
  const elemento = document.getElementById(id);
  if (elemento) elemento.textContent = valor;
}

function formatar(valor) {
  return Number(valor).toLocaleString("pt-BR", { maximumFractionDigits: 2 });
}
