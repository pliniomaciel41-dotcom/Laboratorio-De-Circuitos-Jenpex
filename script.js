// ==========================================
// LABORATÓRIO VIRTUAL DE CIRCUITOS ELÉTRICOS
// ==========================================

// NAVEGAÇÃO ENTRE AS ABAS
const abas = document.querySelectorAll(".tab");
const paineis = document.querySelectorAll(".tab-content");

abas.forEach((aba) => {
    aba.addEventListener("click", () => {
        abas.forEach((item) => item.classList.remove("active"));
        paineis.forEach((painel) => painel.classList.remove("active"));

        aba.classList.add("active");

        const destino = aba.dataset.tab;
        const painel = document.getElementById(destino);

        if (painel) painel.classList.add("active");
    });
});

// ==========================================
// MONTAGEM SIMPLES
// ==========================================

let componentesSimples = [];
let proximoIdSimples = 1;

function adicionarComponente(tipo) {
    const componente = {
        id: proximoIdSimples++,
        tipo: tipo
    };

    componentesSimples.push(componente);
    atualizarCircuitoSimples();
}

function removerComponente(id) {
    componentesSimples = componentesSimples.filter(
        componente => componente.id !== id
    );

    atualizarCircuitoSimples();
}

function limparCircuito() {
    componentesSimples = [];
    atualizarCircuitoSimples();
}

function atualizarCircuitoSimples() {
    const area = document.getElementById("circuito");
    if (!area) return;

    area.innerHTML = "";

    componentesSimples.forEach((componente) => {
        const elemento = document.createElement("div");

        elemento.className = "componente";
        elemento.innerHTML = `
            <span>${componente.tipo}</span>
            <button onclick="removerComponente(${componente.id})">
                Remover
            </button>
        `;

        area.appendChild(elemento);
    });
}

// ==========================================
// QUESTÕES E EXEMPLOS
// ==========================================

const questoes = [
    {
        pergunta: "O que acontece em um circuito aberto?",
        resposta: "A corrente elétrica não consegue circular."
    },
    {
        pergunta: "O que acontece em um circuito fechado?",
        resposta: "A corrente elétrica consegue circular."
    },
    {
        pergunta: "Como funciona uma associação em série?",
        resposta: "Os componentes ficam ligados em um único caminho."
    },
    {
        pergunta: "Como funciona uma associação em paralelo?",
        resposta: "A corrente possui caminhos diferentes para circular."
    }
];

let indiceQuestao = 0;

function mostrarQuestao() {
    const pergunta = document.getElementById("pergunta");
    const resposta = document.getElementById("resposta");

    if (!pergunta || !resposta) return;

    pergunta.textContent = questoes[indiceQuestao].pergunta;
    resposta.textContent = "";
}

function proximaQuestao() {
    indiceQuestao++;

    if (indiceQuestao >= questoes.length) {
        indiceQuestao = 0;
    }

    mostrarQuestao();
}

function mostrarResposta() {
    const resposta = document.getElementById("resposta");

    if (resposta) {
        resposta.textContent = questoes[indiceQuestao].resposta;
    }
}

// ==========================================
// MONTAGEM AVANÇADA
// ==========================================

const svg = document.getElementById("bancadaAvancada");

let componentes = [];
let fios = [];
let conexaoInicial = null;
let componenteSelecionado = null;
let proximoId = 1;

let tensaoFonte = 12;

const tipos = {
    fonte: {
        nome: "Bateria",
        simbolo: "🔋"
    },
    resistor: {
        nome: "Resistor",
        simbolo: "▰"
    },
    lampada: {
        nome: "Lâmpada",
        simbolo: "💡"
    },
    interruptor: {
        nome: "Interruptor",
        simbolo: "⏻"
    }
};

// ADICIONAR COMPONENTES
function adicionarAvancado(tipo) {
    if (!svg) return;

    const componente = {
        id: proximoId++,
        tipo: tipo,
        x: 150 + Math.random() * 400,
        y: 100 + Math.random() * 250,
        resistencia: tipo === "lampada" ? 10 : 100,
        fechado: true
    };

    componentes.push(componente);
    desenharAvancado();
}

// DESENHAR COMPONENTES E FIOS
function desenharAvancado() {
    if (!svg) return;

    svg.innerHTML = "";

    fios.forEach((fio) => {
        const origem = obterTerminal(fio.a);
        const destino = obterTerminal(fio.b);

        if (!origem || !destino) return;

        const linha = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
        );

        linha.setAttribute("x1", origem.x);
        linha.setAttribute("y1", origem.y);
        linha.setAttribute("x2", destino.x);
        linha.setAttribute("y2", destino.y);
        linha.setAttribute("class", "fio");

        svg.appendChild(linha);
    });

    componentes.forEach((componente) => {
        desenharComponente(componente);
    });
}

// DESENHAR UM COMPONENTE
function desenharComponente(componente) {
    const grupo = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g"
    );

    grupo.setAttribute(
        "transform",
        `translate(${componente.x}, ${componente.y})`
    );

    grupo.setAttribute("class", "componente-svg");

    const caixa = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
    );

    caixa.setAttribute("x", -35);
    caixa.setAttribute("y", -22);
    caixa.setAttribute("width", 70);
    caixa.setAttribute("height", 44);
    caixa.setAttribute("rx", 8);
    caixa.setAttribute("class", "componente-caixa");

    grupo.appendChild(caixa);

    const texto = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
    );

    texto.setAttribute("text-anchor", "middle");
    texto.setAttribute("y", 5);
    texto.setAttribute("class", "componente-texto");

    if (componente.tipo === "fonte") {
        texto.textContent = "BATERIA";
    } else if (componente.tipo === "resistor") {
        texto.textContent = `${componente.resistencia} Ω`;
    } else if (componente.tipo === "lampada") {
        texto.textContent = "LÂMPADA";
    } else {
        texto.textContent = componente.fechado ? "FECHADO" : "ABERTO";
    }

    grupo.appendChild(texto);

    grupo.addEventListener("click", (evento) => {
        evento.stopPropagation();
        selecionarComponente(componente.id);
    });

    grupo.addEventListener("dblclick", () => {
        if (componente.tipo === "interruptor") {
            componente.fechado = !componente.fechado;
            desenharAvancado();
        }
    });

    svg.appendChild(grupo);

    desenharTerminais(componente);
}

// DESENHAR OS TERMINAIS
function desenharTerminais(componente) {
    const posicoes = [
        { lado: "a", x: componente.x - 40, y: componente.y },
        { lado: "b", x: componente.x + 40, y: componente.y }
    ];

    posicoes.forEach((posicao) => {
        const terminal = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle"
        );

        terminal.setAttribute("cx", posicao.x);
        terminal.setAttribute("cy", posicao.y);
        terminal.setAttribute("r", 7);
        terminal.setAttribute("class", "terminal");

        terminal.addEventListener("click", (evento) => {
            evento.stopPropagation();

            conectarTerminais({
                id: componente.id,
                lado: posicao.lado
            });
        });

        svg.appendChild(terminal);
    });
}

// SELECIONAR COMPONENTE
function selecionarComponente(id) {
    componenteSelecionado = componentes.find(
        componente => componente.id === id
    );

    const campo = document.getElementById("resistenciaSelecionada");

    if (campo && componenteSelecionado) {
        campo.value = componenteSelecionado.resistencia || "";
    }

    desenharAvancado();
}

// CONECTAR DOIS TERMINAIS
function conectarTerminais(terminal) {
    if (!conexaoInicial) {
        conexaoInicial = terminal;
        mostrarResultado("Agora selecione outro terminal para conectar.");
        return;
    }

    if (
        conexaoInicial.id === terminal.id &&
        conexaoInicial.lado === terminal.lado
    ) {
        conexaoInicial = null;
        return;
    }

    fios.push({
        a: conexaoInicial,
        b: terminal
    });

    conexaoInicial = null;

    desenharAvancado();
    mostrarResultado("Fio conectado com sucesso!");
}

// OBTER POSIÇÃO DO TERMINAL
function obterTerminal(terminal) {
    const componente = componentes.find(
        item => item.id === terminal.id
    );

    if (!componente) return null;

    return {
        x: componente.x + (terminal.lado === "a" ? -40 : 40),
        y: componente.y
    };
}

// REMOVER COMPONENTE SELECIONADO
function removerSelecionado() {
    if (!componenteSelecionado) return;

    const id = componenteSelecionado.id;

    componentes = componentes.filter(
        componente => componente.id !== id
    );

    fios = fios.filter(
        fio => fio.a.id !== id && fio.b.id !== id
    );

    componenteSelecionado = null;

    desenharAvancado();
    mostrarResultado("Componente removido.");
}

// LIMPAR BANCADA
function limparAvancado() {
    componentes = [];
    fios = [];
    componenteSelecionado = null;
    conexaoInicial = null;

    desenharAvancado();
    mostrarResultado("Bancada limpa.");
}

// DESFAZER ÚLTIMO FIO
function desfazerFio() {
    fios.pop();
    desenharAvancado();
    mostrarResultado("Última conexão desfeita.");
}

// ALTERAR RESISTÊNCIA
function alterarResistencia() {
    if (!componenteSelecionado) {
        mostrarResultado("Selecione um resistor ou uma lâmpada.");
        return;
    }

    if (
        componenteSelecionado.tipo !== "resistor" &&
        componenteSelecionado.tipo !== "lampada"
    ) {
        mostrarResultado("Esse componente não possui resistência editável.");
        return;
    }

    const campo = document.getElementById("resistenciaSelecionada");
    const valor = Number(campo?.value);

    if (!Number.isFinite(valor) || valor <= 0) {
        mostrarResultado("Digite uma resistência maior que zero.");
        return;
    }

    componenteSelecionado.resistencia = valor;

    desenharAvancado();
    mostrarResultado("Resistência atualizada.");
}

// ALTERAR TENSÃO
function alterarTensao() {
    const campo = document.getElementById("tensaoFonte");
    const valor = Number(campo?.value);

    if (!Number.isFinite(valor) || valor <= 0) {
        mostrarResultado("Digite uma tensão válida.");
        return;
    }

    tensaoFonte = valor;
    mostrarResultado(`Tensão da fonte: ${tensaoFonte} V.`);
}

// ABRIR OU FECHAR INTERRUPTOR
function alternarInterruptor() {
    if (
        !componenteSelecionado ||
        componenteSelecionado.tipo !== "interruptor"
    ) {
        mostrarResultado("Selecione um interruptor.");
        return;
    }

    componenteSelecionado.fechado =
        !componenteSelecionado.fechado;

    desenharAvancado();

    mostrarResultado(
        componenteSelecionado.fechado
            ? "Interruptor fechado."
            : "Interruptor aberto."
    );
}

// ==========================================
// ANÁLISE DO CIRCUITO
// ==========================================

function analisarCircuito() {
    const fontes = componentes.filter(c => c.tipo === "fonte");

    if (fontes.length !== 1) {
        mostrarResultado(
            "Adicione exatamente uma bateria para analisar o circuito."
        );
        return;
    }

    const fonte = fontes[0];
    const terminais = [];

    componentes.forEach((componente) => {
        terminais.push(`${componente.id}-a`);
        terminais.push(`${componente.id}-b`);
    });

    const pai = {};

    terminais.forEach(t => pai[t] = t);

    function encontrar(x) {
        if (pai[x] !== x) {
            pai[x] = encontrar(pai[x]);
        }

        return pai[x];
    }

    function unir(a, b) {
        const raizA = encontrar(a);
        const raizB = encontrar(b);

        if (raizA !== raizB) {
            pai[raizB] = raizA;
        }
    }

    fios.forEach((fio) => {
        unir(
            `${fio.a.id}-${fio.a.lado}`,
            `${fio.b.id}-${fio.b.lado}`
        );
    });

    componentes
        .filter(c => c.tipo === "interruptor" && c.fechado)
        .forEach((interruptor) => {
            unir(
                `${interruptor.id}-a`,
                `${interruptor.id}-b`
            );
        });

    const poloA = encontrar(`${fonte.id}-a`);
    const poloB = encontrar(`${fonte.id}-b`);

    if (poloA === poloB) {
        mostrarResultado(
            "ATENÇÃO: foi identificado um curto-circuito na bateria. Revise as conexões."
        );
        return;
    }

    const resistores = componentes.filter(
        c => c.tipo === "resistor" || c.tipo === "lampada"
    );

    const arestas = resistores.map((componente) => ({
        a: encontrar(`${componente.id}-a`),
        b: encontrar(`${componente.id}-b`),
        resistencia: componente.resistencia,
        nome: tipos[componente.tipo].nome
    }));

    const caminhoExiste = existeCaminho(
        poloA,
        poloB,
        arestas
    );

    if (!caminhoExiste) {
        mostrarResultado(
            "CIRCUITO ABERTO: não existe um caminho completo para a corrente elétrica."
        );
        return;
    }

    const resultado = calcularEquivalente(
        poloA,
        poloB,
        arestas
    );

    if (!resultado) {
        mostrarResultado(
            "CIRCUITO FECHADO: existe caminho para a corrente, mas essa montagem é complexa demais para o cálculo automático atual."
        );
        return;
    }

    const corrente = tensaoFonte / resultado.resistencia;
    const potencia = tensaoFonte * corrente;

    let classificacao = "Circuito em série";

    if (resultado.tipo === "paralelo") {
        classificacao = "Circuito em paralelo";
    } else if (resultado.tipo === "misto") {
        classificacao = "Circuito misto";
    }

    mostrarResultado(`
        <strong>CIRCUITO FECHADO</strong><br>
        Classificação: ${classificacao}<br>
        Resistência equivalente: ${resultado.resistencia.toFixed(2)} Ω<br>
        Tensão: ${tensaoFonte.toFixed(2)} V<br>
        Corrente total: ${corrente.toFixed(2)} A<br>
        Potência total: ${potencia.toFixed(2)} W<br><br>
        A corrente elétrica possui um caminho completo para circular.
    `);
}

// VERIFICAR SE EXISTE CAMINHO
function existeCaminho(inicio, fim, arestas) {
    const visitados = new Set();
    const fila = [inicio];

    while (fila.length > 0) {
        const atual = fila.shift();

        if (atual === fim) return true;
        if (visitados.has(atual)) continue;

        visitados.add(atual);

        arestas.forEach((aresta) => {
            if (aresta.a === atual) fila.push(aresta.b);
            if (aresta.b === atual) fila.push(aresta.a);
        });
    }

    return false;
}

// ==========================================
// CÁLCULO DA RESISTÊNCIA EQUIVALENTE
// ==========================================

function calcularEquivalente(inicio, fim, arestas) {
    let conexoes = arestas.map((aresta) => ({
        a: aresta.a,
        b: aresta.b,
        r: aresta.resistencia,
        tipo: "simples"
    }));

    if (conexoes.length === 0) return null;

    let houveParalelo = false;
    let houveSerie = false;

    for (let tentativa = 0; tentativa < 100; tentativa++) {
        let mudou = false;

        // REDUÇÃO EM PARALELO
        for (let i = 0; i < conexoes.length; i++) {
            for (let j = i + 1; j < conexoes.length; j++) {
                const a = conexoes[i];
                const b = conexoes[j];

                const mesmosNos =
                    (a.a === b.a && a.b === b.b) ||
                    (a.a === b.b && a.b === b.a);

                if (mesmosNos) {
                    const novaResistencia =
                        1 / (1 / a.r + 1 / b.r);

                    conexoes.splice(j, 1);
                    conexoes.splice(i, 1);

                    conexoes.push({
                        a: a.a,
                        b: a.b,
                        r: novaResistencia,
                        tipo: "paralelo"
                    });

                    houveParalelo = true;
                    mudou = true;
                    break;
                }
            }

            if (mudou) break;
        }

        if (mudou) continue;

        // REDUÇÃO EM SÉRIE
        const nos = new Set();

        conexoes.forEach((aresta) => {
            nos.add(aresta.a);
            nos.add(aresta.b);
        });

        for (const no of nos) {
            if (no === inicio || no === fim) continue;

            const ligacoes = conexoes.filter(
                aresta => aresta.a === no || aresta.b === no
            );

            if (ligacoes.length === 2) {
                const primeira = ligacoes[0];
                const segunda = ligacoes[1];

                const outroA =
                    primeira.a === no ? primeira.b : primeira.a;

                const outroB =
                    segunda.a === no ? segunda.b : segunda.a;

                if (outroA === outroB) continue;

                const novaResistencia =
                    primeira.r + segunda.r;

                conexoes = conexoes.filter(
                    aresta =>
                        aresta !== primeira &&
                        aresta !== segunda
                );

                conexoes.push({
                    a: outroA,
                    b: outroB,
                    r: novaResistencia,
                    tipo: "serie"
                });

                houveSerie = true;
                mudou = true;
                break;
            }
        }

        if (!mudou) break;
    }

    if (
        conexoes.length !== 1 ||
        !(
            (conexoes[0].a === inicio && conexoes[0].b === fim) ||
            (conexoes[0].a === fim && conexoes[0].b === inicio)
        )
    ) {
        return null;
    }

    let tipo = "serie";

    if (houveSerie && houveParalelo) {
        tipo = "misto";
    } else if (houveParalelo) {
        tipo = "paralelo";
    }

    return {
        resistencia: conexoes[0].r,
        tipo: tipo
    };
}

// ==========================================
// MOSTRAR RESULTADOS
// ==========================================

function mostrarResultado(mensagem) {
    const resultado = document.getElementById("resultadoAvancado");

    if (resultado) {
        resultado.innerHTML = mensagem;
    }
}

// ==========================================
// INICIALIZAÇÃO
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    mostrarQuestao();
    desenharAvancado();
});
