// ============================================
// LABORATÓRIO VIRTUAL DE CIRCUITOS
// ============================================


// Lista que armazena os componentes do circuito
let componentes = [];


// Identificador utilizado para cada componente
let proximoId = 1;


// Estado do interruptor
let interruptorFechado = true;


// Estado atual da lâmpada
let lampadaLigada = false;



// ============================================
// ADICIONAR COMPONENTE
// ============================================

function adicionarComponente(tipo) {

    const componente = {

        id: proximoId,

        tipo: tipo

    };


    proximoId++;


    componentes.push(componente);


    renderizarCircuito();


    atualizarDados();


    mostrarMensagem(
        "Componente adicionado",
        "O componente foi adicionado ao circuito.",
        "neutro"
    );
}



// ============================================
// DESENHAR CIRCUITO
// ============================================

function renderizarCircuito() {

    const circuito = document.getElementById("circuito");


    circuito.innerHTML = "";


    if (componentes.length === 0) {

        circuito.innerHTML = `

            <div class="circuito-vazio">

                <div class="icone-vazio">
                    ⚡
                </div>

                <h3>
                    Seu circuito está vazio
                </h3>

                <p>
                    Adicione componentes no painel ao lado
                    para começar.
                </p>

            </div>

        `;

        return;
    }


    componentes.forEach((componente, index) => {

        const elemento =
            criarElementoComponente(componente);


        circuito.appendChild(elemento);


        // Adiciona um fio entre os componentes
        if (index < componentes.length - 1) {

            const fio = document.createElement("div");

            fio.className = "fio";

            circuito.appendChild(fio);

        }

    });


    atualizarLampadaVisual();
}



// ============================================
// CRIAR COMPONENTE VISUAL
// ============================================

function criarElementoComponente(componente) {

    const div = document.createElement("div");


    div.className = "componente-circuito";


    let icone = "";

    let nome = "";


    // ==========================
    // FONTE
    // ==========================

    if (componente.tipo === "fonte") {

        icone = "🔋";

        nome = "Fonte";

    }



    // ==========================
    // RESISTOR
    // ==========================

    else if (componente.tipo === "resistor") {

        icone = "▱";

        nome = "Resistor";

    }



    // ==========================
    // LÂMPADA
    // ==========================

    else if (componente.tipo === "lampada") {

        icone = "💡";

        nome = "Lâmpada";

        div.id = "lampada";

    }



    // ==========================
    // INTERRUPTOR
    // ==========================

    else if (componente.tipo === "interruptor") {

        icone = interruptorFechado
            ? "🔘"
            : "⭕";

        nome = interruptorFechado
            ? "Interruptor fechado"
            : "Interruptor aberto";


        div.classList.add("interruptor");


        div.onclick = alternarInterruptor;


        if (interruptorFechado) {

            div.classList.add("interruptor-fechado");

        } else {

            div.classList.add("interruptor-aberto");

        }

    }



    // ==========================
    // FIO
    // ==========================

    else if (componente.tipo === "fio") {

        icone = "➖";

        nome = "Fio";

    }



    div.innerHTML = `

        <button
            class="remover"
            onclick="event.stopPropagation(); removerComponente(${componente.id})"
        >
            ✕
        </button>


        <div class="icone">
            ${icone}
        </div>


        <div class="nome">
            ${nome}
        </div>

    `;


    return div;
}



// ============================================
// REMOVER COMPONENTE
// ============================================

function removerComponente(id) {

    componentes =
        componentes.filter(
            componente => componente.id !== id
        );


    renderizarCircuito();


    atualizarDados();


    mostrarMensagem(
        "Componente removido",
        "O componente foi retirado do circuito.",
        "neutro"
    );
}



// ============================================
// LIMPAR CIRCUITO
// ============================================

function limparCircuito() {

    componentes = [];


    proximoId = 1;


    interruptorFechado = true;


    lampadaLigada = false;


    renderizarCircuito();


    atualizarDados();


    mostrarMensagem(
        "Circuito limpo",
        "Todos os componentes foram removidos.",
        "neutro"
    );
}



// ============================================
// INTERRUPTOR
// ============================================

function alternarInterruptor() {

    interruptorFechado =
        !interruptorFechado;


    renderizarCircuito();


    testarCircuito();
}



// ============================================
// CALCULAR CORRENTE
// ============================================

function calcularCorrente() {

    const tensao =
        Number(
            document.getElementById("tensao").value
        );


    const resistencia =
        Number(
            document.getElementById("resistencia").value
        );


    if (resistencia <= 0) {

        return 0;

    }


    const corrente =
        tensao / resistencia;


    return corrente;
}



// ============================================
// ATUALIZAR DADOS
// ============================================

function atualizarDados() {

    const tensao =
        Number(
            document.getElementById("tensao").value
        );


    const resistencia =
        Number(
            document.getElementById("resistencia").value
        );


    const corrente =
        calcularCorrente();


    document.getElementById("valorTensao")
        .textContent = tensao;


    document.getElementById("valorResistencia")
        .textContent = resistencia;


    document.getElementById("valorCorrente")
        .textContent =
        corrente.toFixed(2);
}



// ============================================
// TESTAR CIRCUITO
// ============================================

function testarCircuito() {

    atualizarDados();


    const possuiFonte =
        componentes.some(
            componente =>
                componente.tipo === "fonte"
        );


    const possuiLampada =
        componentes.some(
            componente =>
                componente.tipo === "lampada"
        );


    const possuiResistor =
        componentes.some(
            componente =>
                componente.tipo === "resistor"
        );


    const possuiInterruptor =
        componentes.some(
            componente =>
                componente.tipo === "interruptor"
        );



    // ========================================
    // CIRCUITO VAZIO
    // ========================================

    if (componentes.length === 0) {

        lampadaLigada = false;

        atualizarLampadaVisual();


        mostrarMensagem(
            "Circuito vazio",
            "Adicione componentes para começar.",
            "aviso"
        );

        return;
    }



    // ========================================
    // SEM FONTE
    // ========================================

    if (!possuiFonte) {

        lampadaLigada = false;

        atualizarLampadaVisual();


        mostrarMensagem(
            "Fonte não encontrada",
            "O circuito precisa de uma fonte de energia.",
            "erro"
        );

        return;
    }



    // ========================================
    // SEM LÂMPADA
    // ========================================

    if (!possuiLampada) {

        mostrarMensagem(
            "Lâmpada não encontrada",
            "Adicione uma lâmpada para visualizar o funcionamento.",
            "aviso"
        );

        return;
    }



    // ========================================
    // SEM RESISTOR
    // ========================================

    if (!possuiResistor) {

        lampadaLigada = false;

        atualizarLampadaVisual();


        mostrarMensagem(
            "Resistor não encontrado",
            "Adicione um resistor ao circuito.",
            "aviso"
        );

        return;
    }



    // ========================================
    // SEM INTERRUPTOR
    // ========================================

    if (!possuiInterruptor) {

        lampadaLigada = false;

        atualizarLampadaVisual();


        mostrarMensagem(
            "Interruptor não encontrado",
            "Adicione um interruptor para controlar o circuito.",
            "aviso"
        );

        return;
    }



    // ========================================
    // INTERRUPTOR ABERTO
    // ========================================

    if (!interruptorFechado) {

        lampadaLigada = false;

        atualizarLampadaVisual();


        mostrarMensagem(
            "Circuito aberto",
            "O interruptor está aberto. A corrente não está circulando.",
            "erro"
        );

        return;
    }



    // ========================================
    // CIRCUITO FUNCIONANDO
    // ========================================

    const corrente =
        calcularCorrente();


    lampadaLigada = true;


    atualizarLampadaVisual();


    if (corrente > 5) {

        mostrarMensagem(
            "⚠️ Corrente elevada",
            `Circuito funcionando, mas a corrente calculada é ${corrente.toFixed(2)} A.`,
            "aviso"
        );

    } else {

        mostrarMensagem(
            "Circuito funcionando!",
            `A lâmpada está acesa. Corrente: ${corrente.toFixed(2)} A.`,
            "sucesso"
        );

    }

}



// ============================================
// ATUALIZAR LÂMPADA
// ============================================

function atualizarLampadaVisual() {

    const lampada =
        document.getElementById("lampada");


    if (!lampada) {

        return;

    }


    if (lampadaLigada) {

        lampada.classList.add(
            "lampada-acesa"
        );

        lampada.classList.remove(
            "lampada-apagada"
        );

    } else {

        lampada.classList.remove(
            "lampada-acesa"
        );

        lampada.classList.add(
            "lampada-apagada"
        );

    }

}



// ============================================
// MENSAGENS
// ============================================

function mostrarMensagem(
    titulo,
    texto,
    tipo
) {

    const caixa =
        document.getElementById(
            "mensagemSistema"
        );


    const tituloElemento =
        document.getElementById(
            "tituloMensagem"
        );


    const textoElemento =
        document.getElementById(
            "textoMensagem"
        );


    const icone =
        document.getElementById(
            "iconeMensagem"
        );


    caixa.className = "mensagem";


    tituloElemento.textContent =
        titulo;


    textoElemento.textContent =
        texto;


    if (tipo === "sucesso") {

        caixa.classList.add(
            "sistema-sucesso"
        );

        icone.textContent = "🟢";

    }


    else if (tipo === "erro") {

        caixa.classList.add(
            "sistema-erro"
        );

        icone.textContent = "🔴";

    }


    else if (tipo === "aviso") {

        caixa.classList.add(
            "sistema-aviso"
        );

        icone.textContent = "⚠️";

    }


    else {

        caixa.classList.add(
            "sistema-neutro"
        );

        icone.textContent = "ℹ️";

    }


    document.getElementById(
        "statusHeader"
    ).textContent = titulo;
}



// ============================================
// DESAFIOS
// ============================================

function carregarDesafio(numero) {


    limparCircuito();



    // ========================================
    // DESAFIO 1
    // ========================================

    if (numero === 1) {

        adicionarComponente("fonte");

        adicionarComponente("interruptor");

        adicionarComponente("resistor");

        adicionarComponente("lampada");


        mostrarMensagem(
            "Desafio 1",
            "Agora teste o circuito e faça a lâmpada acender.",
            "aviso"
        );

    }



    // ========================================
    // DESAFIO 2
    // ========================================

    else if (numero === 2) {

        document.getElementById("tensao")
            .value = 12;


        document.getElementById("resistencia")
            .value = 6;


        adicionarComponente("fonte");

        adicionarComponente("resistor");


        atualizarDados();


        mostrarMensagem(
            "Desafio 2",
            "Com 12 V e 6 Ω, observe a corrente calculada.",
            "aviso"
        );

    }



    // ========================================
    // DESAFIO 3
    // ========================================

    else if (numero === 3) {

        adicionarComponente("fonte");

        adicionarComponente("interruptor");

        adicionarComponente("resistor");

        adicionarComponente("lampada");


        interruptorFechado = false;


        renderizarCircuito();


        mostrarMensagem(
            "Desafio 3",
            "O interruptor está aberto. Clique nele e observe o que acontece.",
            "aviso"
        );

    }

}



// ============================================
// INICIALIZAÇÃO
// ============================================

atualizarDados();

mostrarMensagem(
    "Laboratório pronto",
    "Adicione componentes e monte seu circuito.",
    "neutro"
);