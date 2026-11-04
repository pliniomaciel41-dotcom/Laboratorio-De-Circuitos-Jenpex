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
        introducao: "Vamos montar o circuito de 12 V com dois resistores, um de 4 Ω e outro de 2 Ω, ligados em um único caminho.",
        nota: "Em série, a corrente percorre um único caminho. Se um componente ou fio interromper esse caminho, a corrente deixa de circular.",
        etapas: [
          {
            titulo: "Separe os componentes",
            texto: "Antes de ligar qualquer fio, identifique a fonte de 12 V e os dois resistores: R1 = 4 Ω e R2 = 2 Ω.",
            acao: "Na bancada avançada, adicione uma bateria e dois resistores. Selecione cada resistor e ajuste seus valores para 4 Ω e 2 Ω.",
            conferir: "Há uma única bateria e dois resistores com os valores corretos. Não confunda Ω (ohm) com V (volt)."
          },
          {
            titulo: "Identifique os terminais",
            texto: "Cada peça possui dois terminais. No desenho da bancada, eles aparecem como dois círculos, um de cada lado. Para esta simulação, basta identificar os dois terminais da bateria e os dois de cada resistor.",
            acao: "Organize as peças na bancada: bateria à esquerda, R1 no meio e R2 à direita. Deixe espaço para fechar o caminho de retorno por baixo.",
            conferir: "Os três componentes estão separados e os terminais estão visíveis. A posição na tela ajuda a visualizar, mas o que importa é a ligação dos terminais."
          },
          {
            titulo: "Ligue a bateria ao primeiro resistor",
            texto: "Escolha um dos terminais da bateria e leve um fio até uma das extremidades do resistor de 4 Ω. O outro terminal da bateria será usado no fio de retorno.",
            acao: "Clique em um terminal da bateria e depois em um terminal do resistor R1. O laboratório deve indicar que o fio foi conectado. A simulação identifica os dois lados da fonte sem exigir que você escolha a polaridade.",
            conferir: "Existe um fio ligando o positivo da bateria a apenas uma extremidade de R1. O outro terminal de R1 continua livre."
          },
          {
            titulo: "Ligue os resistores em sequência",
            texto: "Agora conecte a outra extremidade de R1 a uma extremidade de R2. Esse ponto é a ligação entre os dois resistores.",
            acao: "Clique no terminal ainda livre de R1 e depois em um terminal de R2. Não conecte os dois resistores lado a lado em terminais iguais da bateria.",
            conferir: "R1 e R2 estão ligados um depois do outro. Entre eles existe apenas um caminho, sem ramificações."
          },
          {
            titulo: "Feche o caminho até a bateria",
            texto: "Para a corrente circular, a outra extremidade de R2 precisa voltar ao segundo terminal da bateria, fechando o caminho.",
            acao: "Conecte o terminal livre de R2 ao segundo terminal da bateria. Agora o caminho fica: terminal A da bateria → R1 → R2 → terminal B da bateria.",
            conferir: "O circuito forma um caminho completo, sem pontas soltas. A resistência equivalente deve ser 4 + 2 = 6 Ω."
          },
          {
            titulo: "Analise o resultado",
            texto: "Com 12 V e resistência equivalente de 6 Ω, a Lei de Ohm determina a corrente total: I = U/R = 12/6 = 2 A.",
            acao: "Clique em “Analisar circuito”. Compare o resultado com 6 Ω de resistência equivalente e 2 A de corrente. A potência total é P = U × I = 24 W.",
            conferir: "O laboratório identifica circuito fechado, tipo série, resistência equivalente de 6 Ω e corrente de 2 A. Se aparecer circuito aberto, revise cada fio."
          }
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
        introducao: "Este circuito começa com um resistor de 2 Ω em série. Depois, o caminho se divide em dois ramos paralelos, cada um com um resistor de 6 Ω.",
        nota: "No paralelo, os dois resistores precisam compartilhar os mesmos dois nós: o ponto onde os ramos se dividem e o ponto onde eles se juntam novamente.",
        etapas: [
          {
            titulo: "Separe os quatro componentes",
            texto: "Você vai usar uma bateria de 12 V, um resistor R1 de 2 Ω e dois resistores de 6 Ω (R2 e R3).",
            acao: "Na bancada avançada, adicione uma bateria e três resistores. Ajuste R1 para 2 Ω e R2 e R3 para 6 Ω cada.",
            conferir: "Há uma bateria e três resistores. Um resistor tem 2 Ω; os outros dois têm 6 Ω."
          },
          {
            titulo: "Monte o primeiro trecho em série",
            texto: "O resistor de 2 Ω fica antes da divisão dos caminhos. Por isso, a corrente total passa por ele antes de chegar aos dois ramos.",
            acao: "Posicione a bateria à esquerda e R1 logo à direita. Ligue o polo positivo da bateria a uma extremidade de R1.",
            conferir: "Um dos terminais da bateria está ligado a R1. Ainda não há ramificações antes desse resistor."
          },
          {
            titulo: "Crie o ponto de divisão",
            texto: "A outra extremidade de R1 será o primeiro nó. A partir desse ponto, a corrente poderá seguir por dois caminhos diferentes.",
            acao: "Use a extremidade livre de R1 como ponto de divisão. Primeiro conecte esse terminal a um terminal de R2. Depois, clique novamente no mesmo terminal de R1 e conecte-o a um terminal de R3. Assim, os dois ramos começam no mesmo nó.",
            conferir: "Os dois resistores de 6 Ω começam no mesmo ponto elétrico, depois de R1. Esse é o início do paralelo."
          },
          {
            titulo: "Forme os dois ramos paralelos",
            texto: "R2 e R3 devem ficar em caminhos separados. Nenhum deles deve ficar depois do outro.",
            acao: "Organize R2 no ramo de cima e R3 no ramo de baixo. Mantenha cada resistor entre o nó de divisão e o futuro nó de encontro.",
            conferir: "Há dois caminhos: um passa somente por R2 e o outro passa somente por R3. Os ramos não estão em série entre si."
          },
          {
            titulo: "Una os ramos novamente",
            texto: "As outras extremidades de R2 e R3 precisam se encontrar em um mesmo segundo nó. É isso que caracteriza a ligação em paralelo.",
            acao: "Conecte o terminal livre de R2 ao terminal livre de R3. Depois, clique novamente no terminal livre de R2 e conecte-o ao segundo terminal da bateria. Isso une os dois ramos e fecha o retorno.",
            conferir: "Os dois resistores de 6 Ω compartilham os mesmos dois nós: o de divisão e o de encontro."
          },
          {
            titulo: "Retorne ao polo negativo",
            texto: "Depois que os dois caminhos se juntam, deve existir apenas um fio de retorno até o polo negativo da bateria.",
            acao: "Ligue o nó de encontro dos ramos ao segundo terminal da bateria. O circuito completo fica: bateria → R1 → (R2 ou R3) → bateria.",
            conferir: "O circuito tem um trecho em série antes da divisão e dois ramos em paralelo, que se juntam antes de voltar à bateria."
          },
          {
            titulo: "Calcule e confira",
            texto: "Primeiro calcule o paralelo: 1/Req = 1/6 + 1/6, então Req do paralelo = 3 Ω. Depois some R1: 2 + 3 = 5 Ω.",
            acao: "Clique em “Analisar circuito”. Com 12 V e 5 Ω, a corrente total é I = 12/5 = 2,4 A. A potência total é 12 × 2,4 = 28,8 W.",
            conferir: "O resultado esperado é circuito fechado, misto, 5 Ω de resistência equivalente e 2,4 A de corrente total."
          }
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
      x: 130 + Math.random() * 600,
      y: 100 + Math.random() * 280,
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

    return {
      x: p.x + (lado === "a" ? -42 : 42),
      y: p.y
    };
  }

  function desenhar() {
    camadaFios.innerHTML = "";
    camadaPreview.innerHTML = "";
    camadaPecas.innerHTML = "";

    fios.forEach((fio) => {
      const a = posTerminal(fio.a.id, fio.a.lado);
      const b = posTerminal(fio.b.id, fio.b.lado);
      if (!a || !b) return;

      const linha = document.createElementNS(ns, "line");
      linha.setAttribute("x1", a.x);
      linha.setAttribute("y1", a.y);
      linha.setAttribute("x2", b.x);
      linha.setAttribute("y2", b.y);
      linha.setAttribute("class", "fio");
      linha.setAttribute("stroke", "#1683d8");
      linha.setAttribute("stroke-width", "4");
      linha.setAttribute("stroke-linecap", "round");
      camadaFios.appendChild(linha);
    });

    pecas.forEach((peca) => desenharPeca(peca));

    setText("estadoConexao", terminalInicial
      ? "Agora clique no segundo terminal para concluir o fio."
      : "Clique em um terminal e depois em outro para ligar um fio.");
  }

  function desenharPeca(peca) {
    const grupo = document.createElementNS(ns, "g");
    grupo.setAttribute("transform", `translate(${peca.x} ${peca.y})`);
    grupo.style.cursor = "grab";

    const caixa = document.createElementNS(ns, "rect");
    caixa.setAttribute("x", "-34");
    caixa.setAttribute("y", "-22");
    caixa.setAttribute("width", "68");
    caixa.setAttribute("height", "44");
    caixa.setAttribute("rx", "8");
    caixa.setAttribute("fill", selecionada === peca.id ? "#dbeafe" : "#ffffff");
    caixa.setAttribute("stroke", selecionada === peca.id ? "#2563eb" : "#64748b");
    caixa.setAttribute("stroke-width", "2");
    grupo.appendChild(caixa);

    const texto = document.createElementNS(ns, "text");
    texto.setAttribute("text-anchor", "middle");
    texto.setAttribute("dominant-baseline", "middle");
    texto.setAttribute("font-size", "11");
    texto.setAttribute("font-weight", "700");
    texto.setAttribute("fill", "#172b4d");
    texto.textContent = peca.tipo === "fonte" ? "BATERIA"
      : peca.tipo === "resistor" ? `${peca.resistencia} Ω`
      : peca.tipo === "lampada" ? `LÂMPADA ${peca.resistencia}Ω`
      : (peca.fechado ? "CHAVE FECHADA" : "CHAVE ABERTA");
    grupo.appendChild(texto);

    grupo.addEventListener("pointerdown", (evento) => {
      if (evento.target.classList.contains("terminal-ponto")) return;

      selecionada = peca.id;
      arrasto = {
        id: peca.id,
        inicioX: evento.clientX,
        inicioY: evento.clientY,
        x: peca.x,
        y: peca.y
      };

      grupo.setPointerCapture?.(evento.pointerId);
      desenhar();
    });

    grupo.addEventListener("dblclick", () => {
      if (peca.tipo === "interruptor") {
        peca.fechado = !peca.fechado;
        desenhar();
        mostrar(peca.fechado ? "Interruptor fechado." : "Interruptor aberto.");
      }
    });

    camadaPecas.appendChild(grupo);

    ["a", "b"].forEach((lado) => {
      const pos = posTerminal(peca.id, lado);
      const ponto = document.createElementNS(ns, "circle");

      ponto.setAttribute("cx", pos.x);
      ponto.setAttribute("cy", pos.y);
      ponto.setAttribute("r", "7");
      ponto.setAttribute("fill", "#ffffff");
      ponto.setAttribute("stroke", "#1683d8");
      ponto.setAttribute("stroke-width", "3");
      ponto.setAttribute("class", "terminal-ponto");
      ponto.style.cursor = "crosshair";

      ponto.addEventListener("click", (evento) => {
        evento.stopPropagation();
        conectar({ id: peca.id, lado });
      });

      camadaPecas.appendChild(ponto);
    });
  }

  svg.addEventListener("pointermove", (evento) => {
    if (!arrasto) return;

    const p = pecas.find((item) => item.id === arrasto.id);
    if (!p) return;

    const escalaX = 900 / svg.getBoundingClientRect().width;
    const escalaY = 500 / svg.getBoundingClientRect().height;

    p.x = Math.max(50, Math.min(850, arrasto.x + (evento.clientX - arrasto.inicioX) * escalaX));
    p.y = Math.max(40, Math.min(460, arrasto.y + (evento.clientY - arrasto.inicioY) * escalaY));

    desenhar();
  });

  svg.addEventListener("pointerup", () => {
    arrasto = null;
  });

  svg.addEventListener("pointerleave", () => {
    arrasto = null;
  });

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
    if (!["resistor", "lampada"].includes(p.tipo)) {
      return mostrar("A peça selecionada não possui resistência editável.");
    }
    if (!Number.isFinite(valor) || valor <= 0) {
      return mostrar("Digite uma resistência maior que zero.");
    }

    p.resistencia = valor;
    desenhar();
    mostrar("Valor da resistência atualizado.");
  }

  function alternarChave() {
    const p = pecas.find((item) => item.id === selecionada);

    if (!p || p.tipo !== "interruptor") {
      return mostrar("Selecione um interruptor.");
    }

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

    if (fontes.length !== 1) {
      return mostrar("Adicione exatamente uma bateria.");
    }

    const fonte = fontes[0];
    const resistores = pecas.filter((p) => ["resistor", "lampada"].includes(p.tipo));

    if (!resistores.length) {
      return mostrar("Adicione pelo menos um resistor ou uma lâmpada.");
    }

    const parent = new Map();

    pecas.forEach((p) => {
      parent.set(terminalId(p.id, "a"), terminalId(p.id, "a"));
      parent.set(terminalId(p.id, "b"), terminalId(p.id, "b"));
    });

    function find(x) {
      if (parent.get(x) !== x) {
        parent.set(x, find(parent.get(x)));
      }
      return parent.get(x);
    }

    function union(a, b) {
      const ra = find(a);
      const rb = find(b);

      if (ra !== rb) {
        parent.set(ra, rb);
      }
    }

    fios.forEach((f) => {
      union(terminalId(f.a.id, f.a.lado), terminalId(f.b.id, f.b.lado));
    });

    pecas.filter((p) => p.tipo === "interruptor" && p.fechado)
      .forEach((p) => {
        union(terminalId(p.id, "a"), terminalId(p.id, "b"));
      });

    const inicio = find(terminalId(fonte.id, "a"));
    const fim = find(terminalId(fonte.id, "b"));

    if (inicio === fim) {
      return mostrar("Atenção: possível curto-circuito. Revise as conexões.");
    }

    const arestas = resistores.map((p) => ({
      a: find(terminalId(p.id, "a")),
      b: find(terminalId(p.id, "b")),
      r: p.resistencia
    })).filter((e) => e.a !== e.b);

    const caminho = existeCaminho(inicio, fim, arestas);

    if (!caminho) {
      return mostrar("CIRCUITO ABERTO: não há caminho completo para a corrente.");
    }

    const equivalente = reduzirRede(inicio, fim, arestas);

    if (!equivalente) {
      return mostrar("CIRCUITO FECHADO: há caminho para a corrente, mas esta configuração não pode ser calculada automaticamente por este modelo.");
    }

    const tensao = Number(campoTensao?.value) || 12;
    const corrente = tensao / equivalente.r;
    const potencia = tensao * corrente;

    const tipo = equivalente.paralelo && equivalente.serie ? "Misto"
      : equivalente.paralelo ? "Paralelo"
      : "Série";

    mostrar(`<strong>CIRCUITO FECHADO</strong><p>
      Classificação: ${tipo}<br>
      Resistência equivalente: ${equivalente.r.toFixed(2)} Ω<br>
      Tensão: ${tensao.toFixed(2)} V<br>
      Corrente total: ${corrente.toFixed(2)} A<br>
      Potência total: ${potencia.toFixed(2)} W
    </p>`);
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
    let edges = arestasOriginais.map((e) => ({
      ...e,
      serie: false,
      paralelo: false
    }));

    let mudouSerie = false;
    let mudouParalelo = false;

    for (let rodada = 0; rodada < 100; rodada++) {
      let mudou = false;

      // Resistores em paralelo: mesmas duas extremidades
      for (let i = 0; i < edges.length && !mudou; i++) {
        for (let j = i + 1; j < edges.length; j++) {
          const a = edges[i];
          const b = edges[j];

          if (
            (a.a === b.a && a.b === b.b) ||
            (a.a === b.b && a.b === b.a)
          ) {
            const r = 1 / (1 / a.r + 1 / b.r);

            edges.splice(j, 1);
            edges.splice(i, 1);

            edges.push({
              a: a.a,
              b: a.b,
              r,
              serie: a.serie || b.serie,
              paralelo: true
            });

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
            a: outroA,
            b: outroB,
            r: a.r + b.r,
            serie: true,
            paralelo: a.paralelo || b.paralelo
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

    if (
      !((e.a === inicio && e.b === fim) ||
        (e.a === fim && e.b === inicio))
    ) {
      return null;
    }

    return {
      r: e.r,
      serie: mudouSerie || e.serie,
      paralelo: mudouParalelo || e.paralelo
    };
  }

  desenhar();
}

// ------------------------------------------
// FUNÇÕES AUXILIARES
// ------------------------------------------
function setText(id, valor) {
  const elemento = document.getElementById(id);
  if (elemento) elemento.textContent = valor;
}

function formatar(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    maximumFractionDigits: 2
  });
}
