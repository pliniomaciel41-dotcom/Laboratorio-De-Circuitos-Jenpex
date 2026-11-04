const componentes = [];
let proximoId = 1;
let interruptorFechado = true;
let lampadaLigada = false;

const $ = (id) => document.getElementById(id);

// Navegação entre os modos do laboratório.
document.querySelectorAll('[data-aba]').forEach((botao) => {
  botao.addEventListener('click', () => {
    const mostrarQuestoes = botao.dataset.aba === 'questoes';

    $('painelLivre').classList.toggle('escondido', mostrarQuestoes);
    $('painelQuestoes').classList.toggle('escondido', !mostrarQuestoes);

    document.querySelectorAll('[data-aba]').forEach((aba) => {
      aba.classList.toggle('ativa', aba === botao);
    });

    $('statusHeader').textContent = mostrarQuestoes
      ? 'Exemplos de circuitos'
      : 'Montagem livre';
  });
});

document.querySelectorAll('[data-componente]').forEach((botao) => {
  botao.addEventListener('click', () => {
    adicionarComponente(botao.dataset.componente);
  });
});

$('limparCircuito').addEventListener('click', limparCircuito);
$('testarCircuito').addEventListener('click', testarCircuito);
$('tensao').addEventListener('input', atualizarDados);
$('resistencia').addEventListener('input', atualizarDados);

document.querySelectorAll('[data-desafio]').forEach((botao) => {
  botao.addEventListener('click', () => {
    carregarDesafio(Number(botao.dataset.desafio));
  });
});

function adicionarComponente(tipo) {
  componentes.push({ id: proximoId++, tipo });
  renderizarCircuito();

  mostrarMensagem(
    'Componente adicionado',
    'O componente foi incluído na representação do circuito.',
    'info'
  );
}

function removerComponente(id) {
  const indice = componentes.findIndex((item) => item.id === id);

  if (indice >= 0) {
    componentes.splice(indice, 1);
  }

  lampadaLigada = false;
  renderizarCircuito();
  atualizarLampadaVisual();

  mostrarMensagem(
    'Componente removido',
    'O item foi retirado da montagem. Teste novamente o circuito.',
    'info'
  );
}

function renderizarCircuito() {
  const area = $('circuito');
  area.replaceChildren();

  if (!componentes.length) {
    area.innerHTML = `
      <div class="circuito-vazio">
        <span>⚡</span>
        <h3>Seu circuito está vazio</h3>
        <p>Adicione componentes no painel para começar.</p>
      </div>
    `;
    return;
  }

  componentes.forEach((item, indice) => {
    const nomes = {
      fonte: ['🔋', 'Fonte'],
      resistor: ['▱', 'Resistor'],
      lampada: ['💡', 'Lâmpada'],
      interruptor: [
        interruptorFechado ? '🔘' : '⭕',
        interruptorFechado ? 'Interruptor fechado' : 'Interruptor aberto'
      ],
      fio: ['➖', 'Fio']
    };

    const [icone, nome] = nomes[item.tipo];
    const peca = document.createElement('div');

    peca.className = 'peca';

    if (item.tipo === 'lampada' && lampadaLigada) {
      peca.classList.add('lampada-acesa');
    }

    if (item.tipo === 'interruptor') {
      peca.classList.add('interruptor-peca');
      peca.title = 'Clique para abrir ou fechar';

      peca.addEventListener('click', () => {
        interruptorFechado = !interruptorFechado;
        lampadaLigada = false;
        renderizarCircuito();
        testarCircuito();
      });
    }

    const remover = document.createElement('button');
    remover.className = 'remover';
    remover.type = 'button';
    remover.textContent = '×';
    remover.title = 'Remover componente';

    remover.addEventListener('click', (evento) => {
      evento.stopPropagation();
      removerComponente(item.id);
    });

    const simbolo = document.createElement('span');
    simbolo.className = 'icone';
    simbolo.textContent = icone;

    const legenda = document.createElement('small');
    legenda.textContent = nome;

    peca.append(remover, simbolo, legenda);
    area.appendChild(peca);

    if (indice < componentes.length - 1) {
      const fio = document.createElement('span');
      fio.className = 'fio-visual';
      fio.setAttribute('aria-hidden', 'true');
      area.appendChild(fio);
    }
  });
}

function obterParametros() {
  const tensao = Number($('tensao').value);
  const resistencia = Number($('resistencia').value);

  const valido =
    Number.isFinite(tensao) &&
    tensao >= 0 &&
    Number.isFinite(resistencia) &&
    resistencia > 0;

  return { tensao, resistencia, valido };
}

function atualizarDados() {
  const { tensao, resistencia, valido } = obterParametros();

  $('valorTensao').textContent = valido ? tensao : '—';

  $('valorResistencia').textContent = valido
    ? resistencia
    : '—';

  $('valorCorrente').textContent = valido
    ? (tensao / resistencia).toFixed(2).replace('.', ',')
    : '—';

  $('valorPotencia').textContent = valido
    ? (tensao * tensao / resistencia).toFixed(2).replace('.', ',')
    : '—';
}

function testarCircuito() {
  atualizarDados();

  const { tensao, resistencia, valido } = obterParametros();

  if (!valido) {
    return mostrarMensagem(
      'Valores inválidos',
      'Informe tensão igual ou maior que zero e resistência maior que zero.',
      'erro'
    );
  }

  const temFonte = componentes.some((c) => c.tipo === 'fonte');
  const temLampada = componentes.some((c) => c.tipo === 'lampada');
  const temResistor = componentes.some((c) => c.tipo === 'resistor');
  const temInterruptor = componentes.some((c) => c.tipo === 'interruptor');

  if (!componentes.length) {
    return mostrarMensagem(
      'Montagem vazia',
      'Adicione componentes antes de testar.',
      'aviso'
    );
  }

  if (!temFonte || !temLampada || !temResistor || !temInterruptor) {
    lampadaLigada = false;
    renderizarCircuito();

    const faltam = [
      !temFonte && 'fonte',
      !temLampada && 'lâmpada',
      !temResistor && 'resistor',
      !temInterruptor && 'interruptor'
    ].filter(Boolean);

    return mostrarMensagem(
      'Faltam componentes',
      `Para este teste didático, adicione: ${faltam.join(', ')}.`,
      'aviso'
    );
  }

  if (!interruptorFechado || tensao === 0) {
    lampadaLigada = false;
    renderizarCircuito();

    return mostrarMensagem(
      'Circuito sem corrente',
      !interruptorFechado
        ? 'O interruptor está aberto: o caminho está interrompido.'
        : 'A tensão configurada é zero.',
      'erro'
    );
  }

  lampadaLigada = true;
  renderizarCircuito();

  const corrente = tensao / resistencia;

  mostrarMensagem(
    'Condições atendidas',
    `Na representação simplificada, a lâmpada acende. Corrente calculada: ${corrente.toFixed(2).replace('.', ',')} A.`,
    'sucesso'
  );
}

function limparCircuito() {
  componentes.length = 0;
  proximoId = 1;
  interruptorFechado = true;
  lampadaLigada = false;

  renderizarCircuito();
  atualizarDados();

  mostrarMensagem(
    'Montagem limpa',
    'Todos os componentes foram removidos.',
    'info'
  );
}

function mostrarMensagem(titulo, texto, tipo) {
  $('tituloMensagem').textContent = titulo;
  $('textoMensagem').textContent = texto;
  $('mensagemSistema').className = `mensagem ${tipo}`;
  $('statusHeader').textContent = titulo;
}

function atualizarLampadaVisual() {
  document.querySelectorAll('.peca').forEach((peca) => {
    peca.classList.remove('lampada-acesa');
  });
}

function carregarDesafio(numero) {
  limparCircuito();

  const listas = {
    1: ['fonte', 'interruptor', 'resistor', 'lampada'],
    2: ['fonte', 'resistor'],
    3: ['fonte', 'interruptor', 'resistor', 'lampada']
  };

  if (numero === 2) {
    $('tensao').value = 12;
    $('resistencia').value = 6;
  }

  listas[numero].forEach(adicionarComponente);

  if (numero === 3) {
    interruptorFechado = false;
  }

  renderizarCircuito();
  atualizarDados();

  mostrarMensagem(
    `Desafio ${numero} preparado`,
    numero === 3
      ? 'O interruptor começa aberto. Clique nele e depois teste.'
      : 'Observe os componentes e pressione “Testar circuito”.',
    'aviso'
  );
}

const modelos = {
  basico: {
    nivel: 'NÍVEL BÁSICO',
    titulo: 'Circuito em série',
    descricao: 'Uma fonte de 12 V alimenta um resistor de 6 Ω em um único caminho fechado.',

    svg: `
      <svg viewBox="0 0 760 270" role="img"
      aria-label="Fonte de 12 volts ligada em série a um resistor de 6 ohms">
        <g fill="none" stroke="#25394c" stroke-width="4"
        stroke-linecap="round" stroke-linejoin="round">
          <path d="M130 65 H320 M430 65 H640 V205 H130 V65"/>
          <path d="M130 112 V205 M112 128 H148 M118 148 H142"/>
          <path d="M320 65 l12 -15 l18 30 l18 -30 l18 30 l18 -30 l16 15"/>
        </g>
        <g fill="#172b40" font-family="Arial" font-size="18" text-anchor="middle">
          <text x="130" y="38">Fonte</text>
          <text x="375" y="38">R₁ = 6 Ω</text>
          <text x="385" y="246">Circuito em série</text>
          <text x="84" y="177">12 V</text>
        </g>
        <g fill="#0b8cbd">
          <circle cx="130" cy="65" r="6"/>
          <circle cx="640" cy="65" r="6"/>
        </g>
      </svg>
    `,

    resultados: [
      ['Tensão total', '12 V'],
      ['Resistência equivalente', '6 Ω'],
      ['Corrente total', '2 A'],
      ['Potência total', '24 W']
    ],

    explicacao: `
      <strong>Resolução:</strong>
      como existe apenas um resistor, a resistência equivalente é 6 Ω.
      Pela Lei de Ohm, I = V/R = 12/6 = <strong>2 A</strong>.
      A potência total é P = V × I = 12 × 2 = <strong>24 W</strong>.
    `
  },

  complexo: {
    nivel: 'NÍVEL MAIS COMPLEXO',
    titulo: 'Circuito misto: série e paralelo',
    descricao: 'O resistor R₁ está em série com um conjunto paralelo formado por R₂ e R₃.',

    svg: `
      <svg viewBox="0 0 760 330" role="img"
      aria-label="Fonte de 12 volts, resistor R1 de 6 ohms em série com resistores R2 de 6 ohms e R3 de 3 ohms em paralelo">
        <g fill="none" stroke="#25394c" stroke-width="4"
        stroke-linecap="round" stroke-linejoin="round">
          <path d="M95 80 H220 M330 80 H430 V80 H620 V260 H95 V80"/>
          <path d="M95 135 V260 M77 151 H113 M83 171 H107"/>
          <path d="M220 80 l12 -14 l18 28 l18 -28 l18 28 l18 -28 l16 14"/>
          <path d="M430 80 V145 H480 M560 145 H620 V80"/>
          <path d="M430 80 V235 H480 M560 235 H620 V260"/>
          <path d="M480 145 l12 -13 l15 26 l15 -26 l15 26 l15 -13"/>
          <path d="M480 235 l12 -13 l15 26 l15 -26 l15 26 l15 -13"/>
        </g>
        <g fill="#172b40" font-family="Arial" font-size="17" text-anchor="middle">
          <text x="95" y="47">Fonte 12 V</text>
          <text x="275" y="47">R₁ = 6 Ω</text>
          <text x="520" y="119">R₂ = 6 Ω</text>
          <text x="520" y="209">R₃ = 3 Ω</text>
          <text x="365" y="307">R₁ em série com (R₂ // R₃)</text>
        </g>
        <g fill="#0b8cbd">
          <circle cx="95" cy="80" r="6"/>
          <circle cx="620" cy="80" r="6"/>
        </g>
      </svg>
    `,

    resultados: [
      ['Paralelo (R₂ // R₃)', '2 Ω'],
      ['Resistência equivalente', '8 Ω'],
      ['Corrente total', '1,5 A'],
      ['Potência total', '18 W']
    ],

    explicacao: `
      <strong>Resolução:</strong>
      primeiro, R₂ // R₃ = (6 × 3)/(6 + 3) = <strong>2 Ω</strong>.
      Depois, R_eq = R₁ + 2 = <strong>8 Ω</strong>.
      A corrente total é I = 12/8 = <strong>1,5 A</strong>.
      A queda de tensão em R₁ é 1,5 × 6 = 9 V;
      portanto, o paralelo recebe 3 V.
      Assim, I₂ = 3/6 = 0,5 A e I₃ = 3/3 = 1 A.
    `
  }
};

function mostrarModelo(chave) {
  const modelo = modelos[chave];

  $('nivelCircuito').textContent = modelo.nivel;
  $('tituloCircuito').textContent = modelo.titulo;
  $('descricaoCircuito').textContent = modelo.descricao;

  $('esquemaWrap').innerHTML = modelo.svg;

  $('resultadosCircuito').innerHTML = modelo.resultados
    .map(([nome, valor]) => `
      <div class="resultado">
        <span>${nome}</span>
        <strong>${valor}</strong>
      </div>
    `)
    .join('');

  $('explicacaoCircuito').innerHTML = modelo.explicacao;

  document.querySelectorAll('[data-modelo]').forEach((botao) => {
    botao.classList.toggle(
      'ativo',
      botao.dataset.modelo === chave
    );
  });
}

document.querySelectorAll('[data-modelo]').forEach((botao) => {
  botao.addEventListener('click', () => {
    mostrarModelo(botao.dataset.modelo);
  });
});

atualizarDados();
mostrarModelo('basico');
