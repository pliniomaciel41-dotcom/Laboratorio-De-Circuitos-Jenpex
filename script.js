
// ==========================================
// LABORATÓRIO VIRTUAL DE CIRCUITOS ELÉTRICOS
// Compatível com o index.html enviado
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    iniciarAbas();
    iniciarMontagemLivre();
    iniciarQuestoes();
    iniciarMontagemAvancada();
});

// ==========================================
// NAVEGAÇÃO ENTRE ABAS
// ==========================================

function iniciarAbas() {
    const abas = document.querySelectorAll(".aba[data-aba]");

    const paineis = {
        livre: document.getElementById("painelLivre"),
        questoes: document.getElementById("painelQuestoes"),
        avancada: document.getElementById("painelAvancada")
    };

    abas.forEach(aba => {
        aba.addEventListener("click", () => {
            abas.forEach(item => item.classList.remove("ativa"));

            Object.values(paineis).forEach(painel => {
                if (painel) painel.classList.add("escondido");
            });

            aba.classList.add("ativa");

            const destino = paineis[aba.dataset.aba];

            if (destino) {
                destino.classList.remove("escondido");
            }
        });
    });
}

// ==========================================
// MONTAGEM LIVRE
// ==========================================

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

    document.querySelectorAll("[data-componente]").forEach(botao => {
        botao.addEventListener("click", () => {
            const tipo = botao.dataset.componente;

            if (!nomes[tipo]) return;

            componentes.push({
                id: proximoId++,
                tipo
            });

            desenhar();

            atualizarMensagem(
                "Componente adicionado",
                `${nomes[tipo]} foi adicionado à montagem.`
            );
        });
    });

    const tensao = document.getElementById("tensao");
    const resistencia = document.getElementById("resistencia");

    [tensao, resistencia].forEach(campo => {
        if (campo) {
            campo.addEventListener("input", atualizarValores);
        }
    });

    document.getElementById("testarCircuito")
        ?.addEventListener("click", testarMontagem);

    document.getElementById("limparCircuito")
        ?.addEventListener("click", () => {
            componentes = [];
            interruptorFechado = true;

            desenhar();

            atualizarMensagem(
                "Montagem limpa",
                "Adicione componentes para começar novamente."
            );
        });

    document.querySelectorAll("[data-desafio]").forEach(botao => {
        botao.addEventListener("click", () => {
            const desafio = botao.dataset.desafio;

            if (desafio === "1") {
                componentes = ["fonte", "interruptor", "resistor", "lampada"]
                    .map(tipo => ({
                        id: proximoId++,
                        tipo
                    }));

                atualizarMensagem(
                    "Desafio 1",
                    "Monte e teste um circuito com os quatro componentes."
                );
            }

            if (desafio === "2") {
                if (tensao) tensao.value = 12;
                if (resistencia) resistencia.value = 6;

                atualizarValores();

                atualizarMensagem(
                    "Desafio 2",
                    "Com 12 V e 6 Ω, use a Lei de Ohm para encontrar a corrente."
                );
            }

            if (desafio === "3") {
                componentes = [
                    { id: proximoId++, tipo: "fonte" },
                    { id: proximoId++, tipo: "interruptor" },
                    { id: proximoId++, tipo: "lampada" }
                ];

                interruptorFechado = false;

                atualizarMensagem(
                    "Desafio 3",
                    "Teste o circuito com o interruptor aberto."
                );
            }

            desenhar();
        });
    });

    function desenhar() {
        area.innerHTML = "";

        if (componentes.length === 0) {
            area.innerHTML = `
                <div class="circuito-vazio">
                    <span>⚡</span>
                    <h3>Seu circuito está vazio</h3>
                    <p>Adicione componentes no painel para começar.</p>
                </div>
            `;

            return;
        }

        componentes.forEach(item => {
            const card = document.createElement("div");

            card.className = "componente";

            const estado = item.tipo === "interruptor"
                ? (interruptorFechado ? "Fechado" : "Aberto")
                : "";

            card.innerHTML = `
                <span>
                    ${nomes[item.tipo]}
                    ${estado ? " — " + estado : ""}
                </span>
                <button type="button">×</button>
            `;

            card.querySelector("button").addEventListener("click", () => {
                componentes = componentes.filter(c => c.id !== item.id);
                desenhar();
            });

            if (item.tipo === "interruptor") {
                card.addEventListener("click", evento => {
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

        const corrente = v / r;
        const potencia = v * corrente;

        setText("valorTensao", formatar(v));
        setText("valorResistencia", formatar(r));
        setText("valorCorrente", corrente.toFixed(2).replace(".", ","));
        setText("valorPotencia", potencia.toFixed(2).replace(".", ","));
    }

    function testarMontagem() {
        const temFonte = componentes.some(c => c.tipo === "fonte");

        const temCarga = componentes.some(c =>
            c.tipo === "resistor" || c.tipo === "lampada"
        );

        const temInterruptor = componentes.some(
            c => c.tipo === "interruptor"
        );

        if (!temFonte || !temCarga) {
            atualizarMensagem(
                "Circuito incompleto",
                "Adicione uma fonte e um resistor ou lâmpada."
            );

            return;
        }

        if (temInterruptor && !interruptorFechado) {
            atualizarMensagem(
                "Circuito aberto",
                "O interruptor está aberto. A corrente não circula."
            );

            return;
        }

        atualizarMensagem(
            "Representação de circuito fechado",
            "Há uma fonte e uma carga. Os fios desta montagem são ilustrativos."
        );

        atualizarValores();
    }

    function atualizarMensagem(titulo, texto) {
        setText("tituloMensagem", titulo);
        setText("textoMensagem", texto);
    }

    atualizarValores();
    desenhar();
}

// ==========================================
// CIRCUITOS DE QUESTÕES
// ==========================================

function iniciarQuestoes() {
    const modelos = {
        basico: {
            nivel: "NÍVEL BÁSICO",
            titulo: "Circuito em série",
            descricao: "Uma bateria de 12 V alimenta dois resistores em série, de 4 Ω e 2 Ω.",
            resultados: [
                ["Resistência equivalente", "6 Ω"],
                ["Corrente total", "2 A"],
                ["Potência total", "24 W"]
            ],
            explicacao: "Em série, somamos as resistências: Req = 4 + 2 = 6 Ω. Pela Lei de Ohm: I = 12/6 = 2 A.",
            esquema: "serie"
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
            explicacao: "Primeiro calculamos o paralelo: Req = 3 Ω. Depois somamos o resistor em série: 2 + 3 = 5 Ω. A corrente total é 12/5 = 2,4 A.",
            esquema: "misto"
        }
    };

    document.querySelectorAll("[data-modelo]").forEach(botao => {
        botao.addEventListener("click", () => {
            document.querySelectorAll("[data-modelo]").forEach(b => {
                b.classList.remove("ativo");
            });

            botao.classList.add("ativo");

            mostrarModelo(modelos[botao.dataset.modelo]);
        });
    });

    mostrarModelo(modelos.basico);

    function mostrarModelo(modelo) {
        if (!modelo) return;

        setText("nivelCircuito", modelo.nivel);
        setText("tituloCircuito", modelo.titulo);
        setText("descricaoCircuito", modelo.descricao);

        const esquema = document.getElementById("esquemaWrap");

        if (esquema) {
            esquema.innerHTML = modelo.esquema === "serie"
                ? `
                <svg viewBox="0 0 620 170">
                    <path d="M70 85 H150 M210 85 H300 M360 85 H500 V130 H70 V85"
                        fill="none" stroke="currentColor" stroke-width="4"/>
                    <path d="M70 55 V115 M82 65 V105"
                        stroke="currentColor" stroke-width="4"/>
                    <rect x="150" y="65" width="60" height="40" rx="5"
                        fill="#dceafe" stroke="#2563eb" stroke-width="3"/>
                    <rect x="300" y="65" width="60" height="40" rx="5"
                        fill="#dceafe" stroke="#2563eb" stroke-width="3"/>
                    <g fill="currentColor" font-size="15" text-anchor="middle">
                        <text x="70" y="35">12 V</text>
                        <text x="180" y="55">4 Ω</text>
                        <text x="330" y="55">2 Ω</text>
                    </g>
                </svg>
                `
                : `
                <svg viewBox="0 0 620 210">
                    <path d="M55 100 H130 M190 100 H255 M255 100 V45 H390 V100 M255 100 V155 H390 V100 M390 100 H520 V175 H55 V100"
                        fill="none" stroke="currentColor" stroke-width="4"/>
                    <path d="M55 70 V130 M67 80 V120"
                        stroke="currentColor" stroke-width="4"/>
                    <rect x="130" y="80" width="60" height="40" rx="5"
                        fill="#dceafe" stroke="#2563eb" stroke-width="3"/>
                    <rect x="315" y="25" width="60" height="40" rx="5"
                        fill="#dceafe" stroke="#2563eb" stroke-width="3"/>
                    <rect x="315" y="135" width="60" height="40" rx="5"
                        fill="#dceafe" stroke="#2563eb" stroke-width="3"/>
                    <g fill="currentColor" font-size="15" text-anchor="middle">
                        <text x="55" y="50">12 V</text>
                        <text x="160" y="70">2 Ω</text>
                        <text x="345" y="18">6 Ω</text>
                        <text x="345" y="195">6 Ω</text>
                    </g>
                </svg>
                `;
        }

        const resultados = document.getElementById("resultadosCircuito");

        if (resultados) {
            resultados.innerHTML = modelo.resultados.map(([nome, valor]) => `
                <div class="resultado-item">
                    <small>${nome}</small>
                    <strong>${valor}</strong>
                </div>
            `).join("");
        }

        const explicacao = document.getElementById("explicacaoCircuito");

        if (explicacao) {
            explicacao.textContent = modelo.explicacao;
        }
    }
}

// ==========================================
// MONTAGEM AVANÇADA
// ==========================================

function iniciarMontagemAvancada() {
    const svg = document.getElementById("bancadaAvancada");

    if (!svg) return;

    const ns = "http://www.w3.org/2000/svg";

    const camadaFios = document.getElementById("camadaFios");
    const camadaPecas = document.getElementById("camadaPecas");

    if (!camadaFios || !camadaPecas) return;

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

    document.querySelectorAll("[data-av-add]").forEach(botao => {
        botao.addEventListener("click", () => {
            adicionarPeca(botao.dataset.avAdd);
        });
    });

    ligar("aplicarValorPeca", alterarValor);
    ligar("alternarChaveAvancada", alternarChave);
    ligar("removerPecaAvancada", removerPeca);
    ligar("limparAvancado", limpar);
    ligar("analisarAvancado", analisar);
    ligar("desfazerFio", desfazerFio);

    const campoTensao = document.getElementById("tensaoAvancada");

    function ligar(id, funcao) {
        document.getElementById(id)?.addEventListener("click", funcao);
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

        mostrarResultado(`${nomes[tipo]} adicionado.`);
    }

    function idTerminal(id, lado) {
        return `${id}-${lado}`;
    }

    function posTerminal(id, lado) {
        const peca = pecas.find(p => p.id === id);

        if (!peca) return null;

        return {
            x: peca.x + (lado === "a" ? -42 : 42),
            y: peca.y
        };
    }

    function desenhar() {
        camadaFios.innerHTML = "";
        camadaPecas.innerHTML = "";

        fios.forEach(fio => {
            const a = posTerminal(fio.a.id, fio.a.lado);
            const b = posTerminal(fio.b.id, fio.b.lado);

            if (!a || !b) return;

            const linha = document.createElementNS(ns, "line");

            linha.setAttribute("x1", a.x);
            linha.setAttribute("y1", a.y);
            linha.setAttribute("x2", b.x);
            linha.setAttribute("y2", b.y);
            linha.setAttribute("stroke", "#1683d8");
            linha.setAttribute("stroke-width", "4");
            linha.setAttribute("stroke-linecap", "round");

            camadaFios.appendChild(linha);
        });

        pecas.forEach(desenharPeca);

        setText(
            "estadoConexao",
            terminalInicial
                ? "Agora clique no segundo terminal."
                : "Clique em um terminal e depois em outro para conectar."
        );
    }

    function desenharPeca(peca) {
        const grupo = document.createElementNS(ns, "g");

        grupo.setAttribute(
            "transform",
            `translate(${peca.x} ${peca.y})`
        );

        grupo.style.cursor = "grab";

        const caixa = document.createElementNS(ns, "rect");

        caixa.setAttribute("x", -34);
        caixa.setAttribute("y", -22);
        caixa.setAttribute("width", 68);
        caixa.setAttribute("height", 44);
        caixa.setAttribute("rx", 8);
        caixa.setAttribute("fill", selecionada === peca.id ? "#dbeafe" : "#ffffff");
        caixa.setAttribute("stroke", selecionada === peca.id ? "#2563eb" : "#64748b");
        caixa.setAttribute("stroke-width", 2);

        grupo.appendChild(caixa);

        const texto = document.createElementNS(ns, "text");

        texto.setAttribute("text-anchor", "middle");
        texto.setAttribute("dominant-baseline", "middle");
        texto.setAttribute("font-size", 11);
        texto.setAttribute("font-weight", "700");
        texto.setAttribute("fill", "#172b4d");

        if (peca.tipo === "fonte") {
            texto.textContent = "BATERIA";
        } else if (peca.tipo === "resistor") {
            texto.textContent = `${peca.resistencia} Ω`;
        } else if (peca.tipo === "lampada") {
            texto.textContent = `LÂMPADA ${peca.resistencia}Ω`;
        } else {
            texto.textContent = peca.fechado ? "CHAVE FECHADA" : "CHAVE ABERTA";
        }

        grupo.appendChild(texto);

        grupo.addEventListener("pointerdown", evento => {
            selecionada = peca.id;

            arrasto = {
                id: peca.id,
                inicioX: evento.clientX,
                inicioY: evento.clientY,
                x: peca.x,
                y: peca.y
            };
        });

        grupo.addEventListener("dblclick", () => {
            if (peca.tipo === "interruptor") {
                peca.fechado = !peca.fechado;
                desenhar();

                mostrarResultado(
                    peca.fechado ? "Interruptor fechado." : "Interruptor aberto."
                );
            }
        });

        camadaPecas.appendChild(grupo);

        ["a", "b"].forEach(lado => {
            const pos = posTerminal(peca.id, lado);

            const ponto = document.createElementNS(ns, "circle");

            ponto.setAttribute("cx", pos.x);
            ponto.setAttribute("cy", pos.y);
            ponto.setAttribute("r", 7);
            ponto.setAttribute("fill", "#ffffff");
            ponto.setAttribute("stroke", "#1683d8");
            ponto.setAttribute("stroke-width", 3);
            ponto.style.cursor = "crosshair";

            ponto.addEventListener("click", evento => {
                evento.stopPropagation();

                conectar({
                    id: peca.id,
                    lado
                });
            });

            camadaPecas.appendChild(ponto);
        });
    }

    svg.addEventListener("pointermove", evento => {
        if (!arrasto) return;

        const peca = pecas.find(p => p.id === arrasto.id);

        if (!peca) return;

        const escalaX = 900 / svg.getBoundingClientRect().width;
        const escalaY = 500 / svg.getBoundingClientRect().height;

        peca.x = Math.max(
            50,
            Math.min(850, arrasto.x + (evento.clientX - arrasto.inicioX) * escalaX)
        );

        peca.y = Math.max(
            40,
            Math.min(460, arrasto.y + (evento.clientY - arrasto.inicioY) * escalaY)
        );

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

            mostrarResultado("Primeiro terminal selecionado. Escolha o segundo.");

            return;
        }

        if (
            terminalInicial.id === terminal.id &&
            terminalInicial.lado === terminal.lado
        ) {
            terminalInicial = null;
            desenhar();
            return;
        }

        const repetido = fios.some(fio =>
            (
                fio.a.id === terminalInicial.id &&
                fio.a.lado === terminalInicial.lado &&
                fio.b.id === terminal.id &&
                fio.b.lado === terminal.lado
            ) ||
            (
                fio.b.id === terminalInicial.id &&
                fio.b.lado === terminalInicial.lado &&
                fio.a.id === terminal.id &&
                fio.a.lado === terminal.lado
            )
        );

        if (!repetido) {
            fios.push({
                a: terminalInicial,
                b: terminal
            });
        }

        terminalInicial = null;

        desenhar();

        mostrarResultado(
            repetido ? "Esses terminais já estão conectados." : "Fio conectado."
        );
    }

    function alterarValor() {
        const peca = pecas.find(p => p.id === selecionada);
        const campo = document.getElementById("valorPeca");
        const valor = Number(campo?.value);

        if (!peca) {
            mostrarResultado("Selecione um resistor ou uma lâmpada.");
            return;
        }

        if (!["resistor", "lampada"].includes(peca.tipo)) {
            mostrarResultado("Essa peça não possui resistência editável.");
            return;
        }

        if (!Number.isFinite(valor) || valor <= 0) {
            mostrarResultado("Digite uma resistência maior que zero.");
            return;
        }

        peca.resistencia = valor;

        desenhar();

        mostrarResultado("Resistência atualizada.");
    }

    function alternarChave() {
        const peca = pecas.find(p => p.id === selecionada);

        if (!peca || peca.tipo !== "interruptor") {
            mostrarResultado("Selecione um interruptor.");
            return;
        }

        peca.fechado = !peca.fechado;

        desenhar();

        mostrarResultado(
            peca.fechado ? "Interruptor fechado." : "Interruptor aberto."
        );
    }

    function removerPeca() {
        if (!selecionada) {
            mostrarResultado("Selecione uma peça para remover.");
            return;
        }

        pecas = pecas.filter(p => p.id !== selecionada);

        fios = fios.filter(f =>
            f.a.id !== selecionada && f.b.id !== selecionada
        );

        selecionada = null;
        terminalInicial = null;

        desenhar();

        mostrarResultado("Peça removida.");
    }

    function limpar() {
        pecas = [];
        fios = [];
        selecionada = null;
        terminalInicial = null;

        desenhar();

        mostrarResultado("Bancada limpa.");
    }

    function desfazerFio() {
        if (!fios.length) {
            mostrarResultado("Não há fios para desfazer.");
            return;
        }

        fios.pop();

        desenhar();

        mostrarResultado("Último fio removido.");
    }

    function analisar() {
        const fontes = pecas.filter(p => p.tipo === "fonte");

        if (fontes.length !== 1) {
            mostrarResultado("Adicione exatamente uma bateria.");
            return;
        }

        const fonte = fontes[0];

        const resistores = pecas.filter(p =>
            p.tipo === "resistor" || p.tipo === "lampada"
        );

        if (!resistores.length) {
            mostrarResultado("Adicione pelo menos um resistor ou uma lâmpada.");
            return;
        }

        const pai = new Map();

        pecas.forEach(p => {
            pai.set(idTerminal(p.id, "a"), idTerminal(p.id, "a"));
            pai.set(idTerminal(p.id, "b"), idTerminal(p.id, "b"));
        });

        function encontrar(x) {
            if (pai.get(x) !== x) {
                pai.set(x, encontrar(pai.get(x)));
            }

            return pai.get(x);
        }

        function unir(a, b) {
            const raizA = encontrar(a);
            const raizB = encontrar(b);

            if (raizA !== raizB) {
                pai.set(raizA, raizB);
            }
        }

        fios.forEach(fio => {
            unir(
                idTerminal(fio.a.id, fio.a.lado),
                idTerminal(fio.b.id, fio.b.lado)
            );
        });

        pecas
            .filter(p => p.tipo === "interruptor" && p.fechado)
            .forEach(p => {
                unir(idTerminal(p.id, "a"), idTerminal(p.id, "b"));
            });

        const inicio = encontrar(idTerminal(fonte.id, "a"));
        const fim = encontrar(idTerminal(fonte.id, "b"));

        if (inicio === fim) {
            mostrarResultado("Atenção: possível curto-circuito. Revise as conexões.");
            return;
        }

        const arestas = resistores.map(p => ({
            a: encontrar(idTerminal(p.id, "a")),
            b: encontrar(idTerminal(p.id, "b")),
            r: p.resistencia
        })).filter(e => e.a !== e.b);

        if (!existeCaminho(inicio, fim, arestas)) {
            mostrarResultado("CIRCUITO ABERTO: não há caminho completo para a corrente.");
            return;
        }

        const equivalente = reduzirRede(inicio, fim, arestas);

        if (!equivalente) {
            mostrarResultado("CIRCUITO FECHADO: há caminho para a corrente, mas essa configuração não pode ser calculada automaticamente.");
            return;
        }

        const tensao = Number(campoTensao?.value) || 12;
        const corrente = tensao / equivalente.r;
        const potencia = tensao * corrente;

        let tipo = "Série";

        if (equivalente.paralelo && equivalente.serie) {
            tipo = "Misto";
        } else if (equivalente.paralelo) {
            tipo = "Paralelo";
        }

        mostrarResultado(`
            <strong>CIRCUITO FECHADO</strong>
            <p>
                Classificação: ${tipo}<br>
                Resistência equivalente: ${equivalente.r.toFixed(2)} Ω<br>
                Tensão: ${tensao.toFixed(2)} V<br>
                Corrente total: ${corrente.toFixed(2)} A<br>
                Potência total: ${potencia.toFixed(2)} W
            </p>
        `);
    }

    function existeCaminho(inicio, fim, arestas) {
        const visitados = new Set([inicio]);
        const fila = [inicio];

        while (fila.length) {
            const atual = fila.shift();

            if (atual === fim) return true;

            arestas.forEach(aresta => {
                const proximo = aresta.a === atual
                    ? aresta.b
                    : aresta.b === atual
                        ? aresta.a
                        : null;

                if (proximo && !visitados.has(proximo)) {
                    visitados.add(proximo);
                    fila.push(proximo);
                }
            });
        }

        return false;
    }

    function reduzirRede(inicio, fim, originais) {
        let arestas = originais.map(e => ({
            ...e,
            serie: false,
            paralelo: false
        }));

        let houveSerie = false;
        let houveParalelo = false;

        for (let rodada = 0; rodada < 100; rodada++) {
            let mudou = false;

            // REDUÇÃO EM PARALELO
            for (let i = 0; i < arestas.length && !mudou; i++) {
                for (let j = i + 1; j < arestas.length; j++) {
                    const a = arestas[i];
                    const b = arestas[j];

                    const iguais =
                        (a.a === b.a && a.b === b.b) ||
                        (a.a === b.b && a.b === b.a);

                    if (iguais) {
                        const r = 1 / (1 / a.r + 1 / b.r);

                        arestas.splice(j, 1);
                        arestas.splice(i, 1);

                        arestas.push({
                            a: a.a,
                            b: a.b,
                            r,
                            serie: a.serie || b.serie,
                            paralelo: true
                        });

                        houveParalelo = true;
                        mudou = true;
                        break;
                    }
                }
            }

            if (mudou) continue;

            // REDUÇÃO EM SÉRIE
            const nos = new Set(
                arestas.flatMap(e => [e.a, e.b])
            );

            for (const no of nos) {
                if (no === inicio || no === fim) continue;

                const ligacoes = arestas.filter(
                    e => e.a === no || e.b === no
                );

                if (ligacoes.length === 2) {
                    const [a, b] = ligacoes;

                    const outroA = a.a === no ? a.b : a.a;
                    const outroB = b.a === no ? b.b : b.a;

                    if (outroA === outroB) continue;

                    arestas = arestas.filter(
                        e => e !== a && e !== b
                    );

                    arestas.push({
                        a: outroA,
                        b: outroB,
                        r: a.r + b.r,
                        serie: true,
                        paralelo: a.paralelo || b.paralelo
                    });

                    houveSerie = true;
                    mudou = true;
                    break;
                }
            }

            if (!mudou) break;
        }

        if (arestas.length !== 1) return null;

        const resultado = arestas[0];

        const ligaFonte =
            (resultado.a === inicio && resultado.b === fim) ||
            (resultado.a === fim && resultado.b === inicio);

        if (!ligaFonte) return null;

        return {
            r: resultado.r,
            serie: houveSerie || resultado.serie,
            paralelo: houveParalelo || resultado.paralelo
        };
    }

    function mostrarResultado(mensagem) {
        const resultado = document.getElementById("resultadoAvancado");

        if (resultado) {
            resultado.innerHTML = `<strong>Laboratório</strong><p>${mensagem}</p>`;
        }
    }

    desenhar();
}

// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================

function setText(id, valor) {
    const elemento = document.getElementById(id);

    if (elemento) {
        elemento.textContent = valor;
    }
}

function formatar(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        maximumFractionDigits: 2
    });
}
