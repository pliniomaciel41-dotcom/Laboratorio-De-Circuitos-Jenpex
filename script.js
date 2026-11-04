
document.addEventListener("DOMContentLoaded", () => {

  // ==========================================
  // NAVEGAÇÃO ENTRE AS TRÊS ABAS
  // ==========================================

  const abas = document.querySelectorAll(".aba[data-aba]");

  const paineis = {
    livre: document.getElementById("painelLivre"),
    questoes: document.getElementById("painelQuestoes"),
    avancada: document.getElementById("painelAvancada")
  };

  const statusHeader = document.getElementById("statusHeader");

  const nomesAbas = {
    livre: "Montagem livre",
    questoes: "Circuitos de questões",
    avancada: "Montagem avançada"
  };

  function abrirAba(modo) {
    Object.entries(paineis).forEach(([nome, painel]) => {
      if (painel) {
        painel.classList.toggle("escondido", nome !== modo);
      }
    });

    abas.forEach(aba => {
      aba.classList.toggle("ativa", aba.dataset.aba === modo);
    });

    if (statusHeader) {
      statusHeader.textContent = nomesAbas[modo] || "Laboratório";
    }
  }

  abas.forEach(aba => {
    aba.addEventListener("click", () => {
      abrirAba(aba.dataset.aba);
    });
  });

  abrirAba("livre");


  // ==========================================
  // MONTAGEM LIVRE
  // ==========================================

  const circuito = document.getElementById("circuito");
  const tensaoInput = document.getElementById("tensao");
  const resistenciaInput = document.getElementById("resistencia");

  const valorTensao = document.getElementById("valorTensao");
  const valorResistencia = document.getElementById("valorResistencia");
  const valorCorrente = document.getElementById("valorCorrente");
  const valorPotencia = document.getElementById("valorPotencia");

  const mensagemSistema = document.getElementById("mensagemSistema");
  const tituloMensagem = document.getElementById("tituloMensagem");
  const textoMensagem = document.getElementById("textoMensagem");

  const componentes = [];
  let interruptorAberto = false;

  const nomesComponentes = {
    fonte: "Fonte",
    interruptor: "Interruptor",
    resistor: "Resistor",
    lampada: "Lâmpada",
    fio: "Fio"
  };

  const iconesComponentes = {
    fonte: "🔋",
    interruptor: "🔘",
    resistor: "▱",
    lampada: "💡",
    fio: "➖"
  };

  function numeroValido(valor, padrao) {
    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : padrao;
  }

  function calcularLivre() {
    const tensao = Math.max(0, numeroValido(tensaoInput.value, 12));
    const resistencia = Math.max(0.1, numeroValido(resistenciaInput.value, 6));

    const corrente = resistencia > 0 ? tensao / resistencia : 0;
    const potencia = tensao * corrente;

    valorTensao.textContent = tensao.toLocaleString("pt-BR");
    valorResistencia.textContent = resistencia.toLocaleString("pt-BR");
    valorCorrente.textContent = corrente.toFixed(2).replace(".", ",");
    valorPotencia.textContent = potencia.toFixed(2).replace(".", ",");

    return { tensao, resistencia, corrente, potencia };
  }

  function mostrarMensagem(titulo, texto, tipo = "info") {
    tituloMensagem.textContent = titulo;
    textoMensagem.textContent = texto;
    mensagemSistema.className = "mensagem " + tipo;
  }

  function desenharComponentes() {
    circuito.innerHTML = "";

    if (componentes.length === 0) {
      circuito.innerHTML = `
        <div class="circuito-vazio">
          <span>⚡</span>
          <h3>Seu circuito está vazio</h3>
          <p>Adicione componentes no painel para começar.</p>
        </div>
      `;
      return;
    }

    const linha = document.createElement("div");
    linha.className = "linha-componentes";

    componentes.forEach((tipo, indice) => {
      const item = document.createElement("div");
      item.className = "peca-livre";

      const nome = document.createElement("span");
      nome.className = "icone-peca";
      nome.textContent = iconesComponentes[tipo];

      const legenda = document.createElement("strong");
      legenda.textContent = nomesComponentes[tipo];

      const remover = document.createElement("button");
      remover.type = "button";
      remover.className = "remover-peca";
      remover.textContent = "×";
      remover.title = "Remover componente";

      remover.addEventListener("click", () => {
        componentes.splice(indice, 1);

        if (tipo === "interruptor") {
          interruptorAberto = false;
        }

        desenharComponentes();
      });

      item.append(nome, legenda, remover);

      if (tipo === "interruptor") {
        const estado = document.createElement("button");
        estado.type = "button";
        estado.className = "estado-interruptor";
        estado.textContent = interruptorAberto ? "Aberto" : "Fechado";

        estado.addEventListener("click", () => {
          interruptorAberto = !interruptorAberto;
          desenharComponentes();
        });

        item.appendChild(estado);
      }

      linha.appendChild(item);
    });

    circuito.appendChild(linha);
  }

  document.querySelectorAll("[data-componente]").forEach(botao => {
    botao.addEventListener("click", () => {
      const tipo = botao.dataset.componente;

      if (!nomesComponentes[tipo]) return;

      componentes.push(tipo);
      desenharComponentes();

      mostrarMensagem(
        "Componente adicionado",
        nomesComponentes[tipo] + " foi adicionado à montagem."
      );
    });
  });

  tensaoInput.addEventListener("input", calcularLivre);
  resistenciaInput.addEventListener("input", calcularLivre);

  document.getElementById("testarCircuito").addEventListener("click", () => {
    const calculo = calcularLivre();

    if (!componentes.includes("fonte")) {
      mostrarMensagem(
        "Circuito incompleto",
        "Adicione uma fonte de energia para testar o circuito.",
        "erro"
      );
      return;
    }

    if (!componentes.includes("lampada") && !componentes.includes("resistor")) {
      mostrarMensagem(
        "Falta um componente",
        "Adicione uma lâmpada ou um resistor à montagem.",
        "erro"
      );
      return;
    }

    if (interruptorAberto) {
      mostrarMensagem(
        "Circuito aberto",
        "O interruptor está aberto. Não há passagem de corrente neste modelo.",
        "erro"
      );
      return;
    }

    if (calculo.tensao <= 0) {
      mostrarMensagem(
        "Sem tensão",
        "A fonte está com tensão igual a zero. Não há corrente elétrica.",
        "erro"
      );
      return;
    }

    mostrarMensagem(
      "Circuito funcionando!",
      `Tensão: ${calculo.tensao} V. Corrente: ${calculo.corrente.toFixed(2)} A. Potência: ${calculo.potencia.toFixed(2)} W.`,
      "sucesso"
    );
  });

  document.getElementById("limparCircuito").addEventListener("click", () => {
    componentes.length = 0;
    interruptorAberto = false;
    desenharComponentes();

    mostrarMensagem(
      "Montagem limpa",
      "Adicione novos componentes para começar novamente."
    );
  });

  document.querySelectorAll("[data-desafio]").forEach(botao => {
    botao.addEventListener("click", () => {
      const desafio = botao.dataset.desafio;

      if (desafio === "1") {
        componentes.length = 0;
        componentes.push("fonte", "interruptor", "resistor", "lampada");
        interruptorAberto = false;
        desenharComponentes();

        mostrarMensagem(
          "Desafio 1",
          "Monte um circuito com fonte, interruptor, resistor e lâmpada. Agora clique em testar."
        );
      }

      if (desafio === "2") {
        tensaoInput.value = 12;
        resistenciaInput.value = 6;
        const resultado = calcularLivre();

        mostrarMensagem(
          "Desafio 2",
          `Pela Lei de Ohm, I = V/R. Resultado: ${resultado.tensao}/${resultado.resistencia} = ${resultado.corrente.toFixed(2)} A.`
        );
      }

      if (desafio === "3") {
        if (!componentes.includes("interruptor")) {
          componentes.push("interruptor");
        }

        interruptorAberto = true;
        desenharComponentes();

        mostrarMensagem(
          "Desafio 3",
          "Com o interruptor aberto, o circuito fica interrompido e a corrente não circula.",
          "erro"
        );
      }
    });
  });

  calcularLivre();


  // ==========================================
  // CIRCUITOS DE QUESTÕES
  // ==========================================

  const modelos = {
    basico: {
      nivel: "NÍVEL BÁSICO",
      titulo: "Circuito em série",
      descricao: "Uma fonte de 12 V alimenta dois resistores ligados em série.",
      resistores: [4, 2],
      explicacao: `
        <h3>Resolução passo a passo</h3>
        <p><strong>1.</strong> Em série, somamos as resistências.</p>
        <p>Req = 4 + 2 = 6 Ω</p>
        <p><strong>2.</strong> Aplicamos a Lei de Ohm.</p>
        <p>I = V / R</p>
        <p>I = 12 / 6 = 2 A</p>
        <p><strong>3.</strong> Calculamos a potência total.</p>
        <p>P = V × I = 12 × 2 = 24 W</p>
      `
    },

    complexo: {
      nivel: "NÍVEL INTERMEDIÁRIO",
      titulo: "Circuito misto",
      descricao: "Uma fonte de 12 V alimenta um resistor de 2 Ω em série com dois resistores de 6 Ω em paralelo.",
      resistores: [2, 6, 6],
      explicacao: `
        <h3>Resolução passo a passo</h3>
        <p><strong>1.</strong> Calculamos a associação em paralelo.</p>
        <p>1/Rp = 1/6 + 1/6</p>
        <p>Rp = 3 Ω</p>
        <p><strong>2.</strong> Somamos com o resistor em série.</p>
        <p>Req = 2 + 3 = 5 Ω</p>
        <p><strong>3.</strong> Aplicamos a Lei de Ohm.</p>
        <p>I = 12 / 5 = 2,4 A</p>
        <p><strong>4.</strong> Calculamos a potência total.</p>
        <p>P = 12 × 2,4 = 28,8 W</p>
      `
    }
  };

  function desenharModelo(tipo) {
    const modelo = modelos[tipo];
    if (!modelo) return;

    document.getElementById("nivelCircuito").textContent = modelo.nivel;
    document.getElementById("tituloCircuito").textContent = modelo.titulo;
    document.getElementById("descricaoCircuito").textContent = modelo.descricao;
    document.getElementById("explicacaoCircuito").innerHTML = modelo.explicacao;

    document.querySelectorAll("[data-modelo]").forEach(botao => {
      const ativo = botao.dataset.modelo === tipo;
      botao.classList.toggle("ativo", ativo);
      botao.classList.toggle("principal", ativo);
      botao.classList.toggle("secundario", !ativo);
    });

    let equivalente;
    let corrente;
    let potencia;

    if (tipo === "basico") {
      equivalente = 4 + 2;
    } else {
      equivalente = 2 + (1 / (1 / 6 + 1 / 6));
    }

    corrente = 12 / equivalente;
    potencia = 12 * corrente;

    document.getElementById("esquemaWrap").innerHTML = `
      <div class="esquema-circuito">
        <div class="esquema-fonte">🔋<small>12 V</small></div>
        <div class="esquema-linha"></div>
        ${
          tipo === "basico"
            ? `<div class="esquema-resistor">4 Ω</div>
               <div class="esquema-linha"></div>
               <div class="esquema-resistor">2 Ω</div>`
            : `<div class="esquema-resistor">2 Ω</div>
               <div class="esquema-linha"></div>
               <div class="esquema-paralelo">
                 <span>6 Ω</span>
                 <span>6 Ω</span>
               </div>`
        }
        <div class="esquema-linha"></div>
        <div class="esquema-lampada">💡</div>
      </div>
    `;

    document.getElementById("resultadosCircuito").innerHTML = `
      <div class="resultado-item">
        <small>Resistência equivalente</small>
        <strong>${equivalente.toFixed(2)} Ω</strong>
      </div>
      <div class="resultado-item">
        <small>Corrente total</small>
        <strong>${corrente.toFixed(2)} A</strong>
      </div>
      <div class="resultado-item">
        <small>Potência total</small>
        <strong>${potencia.toFixed(2)} W</strong>
      </div>
    `;
  }

  document.querySelectorAll("[data-modelo]").forEach(botao => {
    botao.addEventListener("click", () => {
      desenharModelo(botao.dataset.modelo);
    });
  });

  desenharModelo("basico");


  // ==========================================
  // MONTAGEM AVANÇADA
  // ==========================================

  const svg = document.getElementById("bancadaAvancada");
  const camadaPecas = document.getElementById("camadaPecas");
  const camadaFios = document.getElementById("camadaFios");

  const estadoConexao = document.getElementById("estadoConexao");
  const resultadoAvancado = document.getElementById("resultadoAvancado");

  const valorPeca = document.getElementById("valorPeca");
  const tensaoAvancada = document.getElementById("tensaoAvancada");

  let pecas = [];
  let fios = [];
  let selecionada = null;
  let terminalInicial = null;
  let proximoId = 1;
  let arrasto = null;

  const NS = "http://www.w3.org/2000/svg";

  function elementoSVG(tag, atributos = {}) {
    const el = document.createElementNS(NS, tag);

    Object.entries(atributos).forEach(([chave, valor]) => {
      el.setAttribute(chave, valor);
    });

    return el;
  }

  function adicionarPeca(tipo) {
    const peca = {
      id: proximoId++,
      tipo,
      x: 150 + (pecas.length % 4) * 170,
      y: 130 + Math.floor(pecas.length / 4) * 150,
      valor: tipo === "fonte" ? 12 : 10,
      aberta: false
    };

    pecas.push(peca);
    selecionada = peca.id;

    valorPeca.value = peca.valor;
    desenharAvancado();

    estadoConexao.textContent = nomesComponentes[tipo] + " adicionada e selecionada.";
  }

  document.querySelectorAll("[data-av-add]").forEach(botao => {
    botao.addEventListener("click", () => {
      adicionarPeca(botao.dataset.avAdd);
    });
  });

  function terminais(peca) {
    return [
      { id: peca.id, lado: "a", x: peca.x - 45, y: peca.y },
      { id: peca.id, lado: "b", x: peca.x + 45, y: peca.y }
    ];
  }

  function desenharAvancado() {
    camadaPecas.innerHTML = "";
    camadaFios.innerHTML = "";

    fios.forEach(fio => {
      const a = encontrarTerminal(fio.a);
      const b = encontrarTerminal(fio.b);

      if (!a || !b) return;

      camadaFios.appendChild(elementoSVG("line", {
        x1: a.x,
        y1: a.y,
        x2: b.x,
        y2: b.y,
        stroke: "#1976d2",
        "stroke-width": 4,
        "stroke-linecap": "round"
      }));
    });

    pecas.forEach(peca => {
      const grupo = elementoSVG("g", {
        transform: `translate(${peca.x}, ${peca.y})`,
        "data-id": peca.id,
        class: "peca-svg"
      });

      const selecionadaAgora = peca.id === selecionada;

      grupo.appendChild(elementoSVG("rect", {
        x: -40,
        y: -27,
        width: 80,
        height: 54,
        rx: 10,
        fill: selecionadaAgora ? "#dbeafe" : "#ffffff",
        stroke: selecionadaAgora ? "#2563eb" : "#64748b",
        "stroke-width": 2
      }));

      const icone = {
        fonte: "🔋",
        resistor: "▱",
        lampada: "💡",
        interruptor: "🔘"
      }[peca.tipo];

      const texto = elementoSVG("text", {
        x: 0,
        y: 5,
        "text-anchor": "middle",
        "font-size": 23
      });

      texto.textContent = icone;
      grupo.appendChild(texto);

      const legenda = elementoSVG("text", {
        x: 0,
        y: 45,
        "text-anchor": "middle",
        "font-size": 12,
        fill: "#243447"
      });

      legenda.textContent =
        peca.tipo === "fonte"
          ? `${peca.valor} V`
          : peca.tipo === "interruptor"
            ? (peca.aberta ? "Aberto" : "Fechado")
            : `${peca.valor} Ω`;

      grupo.appendChild(legenda);

      if (peca.tipo === "interruptor") {
        grupo.addEventListener("dblclick", event => {
          event.stopPropagation();
          peca.aberta = !peca.aberta;
          selecionada = peca.id;
          desenharAvancado();
        });
      }

      grupo.addEventListener("pointerdown", event => {
        if (event.target.classList.contains("terminal-svg")) return;

        event.preventDefault();
        selecionada = peca.id;

        const ponto = converterPonto(event);

        arrasto = {
          id: peca.id,
          dx: ponto.x - peca.x,
          dy: ponto.y - peca.y
        };

        desenharAvancado();
      });

      camadaPecas.appendChild(grupo);

      terminais(peca).forEach(terminal => {
        const circulo = elementoSVG("circle", {
          cx: terminal.x,
          cy: terminal.y,
          r: 8,
          fill: "#f59e0b",
          stroke: "#ffffff",
          "stroke-width": 2,
          class: "terminal-svg"
        });

        circulo.style.cursor = "crosshair";

        circulo.addEventListener("click", event => {
          event.stopPropagation();
          conectarTerminal(terminal);
        });

        camadaPecas.appendChild(circulo);
      });
    });
  }

  function converterPonto(event) {
    const rect = svg.getBoundingClientRect();

    return {
      x: (event.clientX - rect.left) * 900 / rect.width,
      y: (event.clientY - rect.top) * 500 / rect.height
    };
  }

  function encontrarTerminal(ref) {
    const peca = pecas.find(p => p.id === ref.id);
    if (!peca) return null;

    return terminais(peca).find(t => t.lado === ref.lado);
  }

  function conectarTerminal(terminal) {
    if (!terminalInicial) {
      terminalInicial = {
        id: terminal.id,
        lado: terminal.lado
      };

      estadoConexao.textContent = "Agora selecione o segundo terminal.";
      return;
    }

    if (
      terminalInicial.id === terminal.id &&
      terminalInicial.lado === terminal.lado
    ) {
      terminalInicial = null;
      estadoConexao.textContent = "Conexão cancelada.";
      return;
    }

    const repetido = fios.some(fio =>
      (fio.a.id === terminalInicial.id &&
       fio.a.lado === terminalInicial.lado &&
       fio.b.id === terminal.id &&
       fio.b.lado === terminal.lado) ||
      (fio.b.id === terminalInicial.id &&
       fio.b.lado === terminalInicial.lado &&
       fio.a.id === terminal.id &&
       fio.a.lado === terminal.lado)
    );

    if (!repetido) {
      fios.push({
        a: terminalInicial,
        b: { id: terminal.id, lado: terminal.lado }
      });
    }

    terminalInicial = null;
    estadoConexao.textContent = "Fio conectado. Selecione outros terminais para continuar.";
    desenharAvancado();
  }

  svg.addEventListener("pointermove", event => {
    if (!arrasto) return;

    const ponto = converterPonto(event);
    const peca = pecas.find(p => p.id === arrasto.id);

    if (!peca) return;

    peca.x = Math.max(55, Math.min(845, ponto.x - arrasto.dx));
    peca.y = Math.max(45, Math.min(455, ponto.y - arrasto.dy));

    desenharAvancado();
  });

  svg.addEventListener("pointerup", () => {
    arrasto = null;
  });

  svg.addEventListener("pointerleave", () => {
    arrasto = null;
  });

  document.getElementById("aplicarValorPeca").addEventListener("click", () => {
    const peca = pecas.find(p => p.id === selecionada);

    if (!peca) {
      estadoConexao.textContent = "Selecione uma peça primeiro.";
      return;
    }

    const valor = Number(valorPeca.value);

    if (!Number.isFinite(valor) || valor <= 0) {
      estadoConexao.textContent = "Digite um valor maior que zero.";
      return;
    }

    peca.valor = valor;
    desenharAvancado();

    estadoConexao.textContent = "Valor atualizado.";
  });

  document.getElementById("alternarChaveAvancada").addEventListener("click", () => {
    const peca = pecas.find(p => p.id === selecionada);

    if (!peca || peca.tipo !== "interruptor") {
      estadoConexao.textContent = "Selecione um interruptor primeiro.";
      return;
    }

    peca.aberta = !peca.aberta;
    desenharAvancado();
  });

  document.getElementById("removerPecaAvancada").addEventListener("click", () => {
    if (!selecionada) {
      estadoConexao.textContent = "Selecione uma peça primeiro.";
      return;
    }

    pecas = pecas.filter(p => p.id !== selecionada);

    fios = fios.filter(f =>
      f.a.id !== selecionada && f.b.id !== selecionada
    );

    selecionada = null;
    terminalInicial = null;

    desenharAvancado();
    estadoConexao.textContent = "Peça removida.";
  });

  document.getElementById("limparAvancado").addEventListener("click", () => {
    pecas = [];
    fios = [];
    selecionada = null;
    terminalInicial = null;

    desenharAvancado();

    estadoConexao.textContent = "Bancada limpa. Adicione novos componentes.";
    resultadoAvancado.innerHTML = `
      <strong>Seu circuito será analisado aqui</strong>
      <p>Adicione uma fonte e componentes, conecte os terminais e clique em analisar.</p>
    `;
    resultadoAvancado.className = "resultado-avancado mensagem info";
  });

  document.getElementById("desfazerFio").addEventListener("click", () => {
    if (fios.length === 0) {
      estadoConexao.textContent = "Não há fios para desfazer.";
      return;
    }

    fios.pop();
    desenharAvancado();
    estadoConexao.textContent = "Último fio removido.";
  });


  // ==========================================
  // ANÁLISE DA MONTAGEM AVANÇADA
  // ==========================================

  document.getElementById("analisarAvancado").addEventListener("click", () => {
    const fontes = pecas.filter(p => p.tipo === "fonte");
    const resistores = pecas.filter(p =>
      p.tipo === "resistor" || p.tipo === "lampada"
    );
    const interruptores = pecas.filter(p => p.tipo === "interruptor");

    if (fontes.length === 0) {
      resultadoAvancado.innerHTML = `
        <strong>Fonte não encontrada</strong>
        <p>Adicione uma fonte para analisar o circuito.</p>
      `;
      resultadoAvancado.className = "resultado-avancado mensagem erro";
      return;
    }

    if (resistores.length === 0) {
      resultadoAvancado.innerHTML = `
        <strong>Resistência não encontrada</strong>
        <p>Adicione um resistor ou uma lâmpada.</p>
      `;
      resultadoAvancado.className = "resultado-avancado mensagem erro";
      return;
    }

    if (interruptores.some(p => p.aberta)) {
      resultadoAvancado.innerHTML = `
        <strong>Circuito aberto</strong>
        <p>Existe um interruptor aberto. A corrente não circula.</p>
      `;
      resultadoAvancado.className = "resultado-avancado mensagem erro";
      return;
    }

    const fonte = fontes[0];
    const tensao = Math.max(0, Number(tensaoAvancada.value) || fonte.valor);

    // Modelo simplificado: considera os resistores em série.
    const resistenciaTotal = resistores.reduce((soma, p) => soma + p.valor, 0);

    const corrente = resistenciaTotal > 0 ? tensao / resistenciaTotal : 0;
    const potencia = tensao * corrente;

    const todosConectados = resistores.every(peca =>
      fios.some(f =>
        f.a.id === peca.id || f.b.id === peca.id
      )
    );

    if (fios.length < 2 || !todosConectados) {
      resultadoAvancado.innerHTML = `
        <strong>Verifique as conexões</strong>
        <p>Conecte os terminais dos componentes para formar um caminho elétrico. Este analisador simplificado calcula os componentes como uma associação em série.</p>
      `;
      resultadoAvancado.className = "resultado-avancado mensagem erro";
      return;
    }

    resultadoAvancado.innerHTML = `
      <strong>Valores calculados (modelo em série)</strong>
      <p>Tensão da fonte: <b>${tensao.toFixed(2)} V</b></p>
      <p>Resistência total: <b>${resistenciaTotal.toFixed(2)} Ω</b></p>
      <p>Corrente estimada: <b>${corrente.toFixed(2)} A</b></p>
      <p>Potência total: <b>${potencia.toFixed(2)} W</b></p>
      <p class="nota-calculo">A análise numérica considera os resistores em série. A posição visual e as conexões ainda não são resolvidas como uma rede elétrica geral.</p>
    `;

    resultadoAvancado.className = "resultado-avancado mensagem sucesso";
  });

  desenharAvancado();

});
