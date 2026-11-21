/**
 * Todo o conteúdo do site, tipado e centralizado.
 *
 * Regras (AGENTS.md §6):
 * - Nada de dados inventados: contatos, endereço, cidade, horário, prazos, número de provas, preços,
 *   tecidos/tecelagens, ano de fundação e história ficam como `null` + comentário TODO até o cliente informar.
 * - Itens com `confirmed: false` NÃO são renderizados na página (ficam aqui aguardando confirmação).
 * - Campos `null` escondem o bloco correspondente na página e no JSON-LD.
 */

export type Theme = 'dark' | 'light' | 'color';

export interface Photo {
  /** Nome-base gerado por scripts/optimize-images.mjs (sem largura nem extensão). */
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
}

export interface Option {
  readonly title: string;
  readonly text: string;
  /** `false` = aguardando confirmação do cliente; não aparece na página. */
  readonly confirmed: boolean;
}

export interface Hotspot {
  readonly label: string;
  readonly text: string;
  /** Posição sobre a foto, em % (x da esquerda, y do topo). */
  readonly x: number;
  readonly y: number;
}

export interface ProcessStep {
  readonly title: string;
  readonly text: string;
  /** TODO: prazo da etapa, ex.: "1 a 2 semanas". `null` = não exibido. */
  readonly duration: string | null;
  readonly photo: Photo | null;
}

export interface FaqItem {
  readonly question: string;
  readonly answer: string;
  readonly confirmed: boolean;
}

export interface NavItem {
  readonly label: string;
  readonly href: `#${string}`;
}

// ---------------------------------------------------------------------------
// Fotos (public/images). Alt descritivo em todas as fotos de conteúdo.
// ---------------------------------------------------------------------------
export const PHOTOS = {
  daviNavySuit: {
    src: 'davi-terno-azul-marinho-atelie',
    width: 1440,
    height: 1920,
    alt: 'Davi Alencar sentado numa poltrona de couro, vestindo terno azul-marinho de três peças com lapela pontiaguda, no ateliê com ternos em manequins ao fundo',
  },
  daviScissors: {
    src: 'davi-terno-cinza-tesoura',
    width: 1440,
    height: 1799,
    alt: 'Davi Alencar de terno cinza segurando uma tesoura de alfaiate com a fita métrica enrolada no braço',
  },
  shirtNavy: {
    src: 'camisa-azul-marinho-etiqueta',
    width: 1440,
    height: 1440,
    alt: 'Close da gola de uma camisa sob medida azul-marinho com listras finas e a etiqueta bordada Davi Alencar Alfaiataria',
  },
  shirtStriped: {
    src: 'camisa-listrada-azul-etiqueta',
    width: 1440,
    height: 1440,
    alt: 'Gola de camisa sob medida listrada em azul e branco com a etiqueta da alfaiataria, ao lado de uma fita métrica',
  },
  daviBlueCheck: {
    src: 'davi-terno-azul-xadrez-atelie',
    width: 1440,
    height: 2157,
    alt: 'Davi Alencar no ateliê ajustando o paletó de um terno azul de três peças com xadrez discreto, gravata azul e camisa branca, com um manequim de terno ao fundo',
  },
  daviGreyDoubleBreasted: {
    src: 'davi-terno-cinza-colete-trespassado-atelie',
    width: 1440,
    height: 2157,
    alt: 'Davi Alencar sorrindo no ateliê, de terno cinza com colete trespassado e gravata dourada, diante da estante de gravatas',
  },
  greyVestDetail: {
    src: 'terno-cinza-colete-trespassado-detalhe',
    width: 1440,
    height: 2157,
    alt: 'Detalhe de um terno cinza sob medida: lapela, colete trespassado com botões, gravata dourada e punho da camisa branca',
  },
  daviTapeMeasure: {
    src: 'davi-terno-cinza-fita-metrica',
    width: 1440,
    height: 2157,
    alt: 'Davi Alencar de terno cinza e gravata verde com a fita métrica de alfaiate sobre os ombros',
  },
  daviTapeMeasureSmile: {
    src: 'davi-terno-cinza-fita-metrica-sorrindo',
    width: 1440,
    height: 2157,
    alt: 'Davi Alencar sorrindo, de terno cinza, segurando a fita métrica de alfaiate apoiada nos ombros',
  },
  daviPoloNavy: {
    src: 'davi-polo-azul-marinho',
    width: 1440,
    height: 2157,
    alt: 'Davi Alencar vestindo camisa polo azul-marinho com calça clara',
  },
  daviPoloGreen: {
    src: 'davi-polo-verde',
    width: 1440,
    height: 2157,
    alt: 'Davi Alencar sorrindo, vestindo camisa polo verde',
  },
  atelierFoldedJacket: {
    src: 'atelie-paleto-azul-marinho-dobrado',
    width: 1440,
    height: 960,
    alt: 'Paletó azul-marinho dobrado sobre a mesa do ateliê, entre fita métrica, carretéis de linha, tesoura dourada e molde de papel',
  },
  atelierGoldButtons: {
    src: 'atelie-botoes-dourados',
    width: 1440,
    height: 960,
    alt: 'Botões dourados sobre tecido azul-marinho, ao lado de carretéis de linha, fita métrica e tesoura de alfaiate',
  },
  atelierFabrics: {
    src: 'atelie-tecidos-e-ferramentas',
    width: 1024,
    height: 1536,
    alt: 'Amostras de tecido azul-marinho com risca de giz e espinha de peixe, fita métrica, giz de alfaiate, botões dourados e tesoura',
  },
  // Recortes em alta resolução gerados por scripts/optimize-images.mjs (CROPS).
  shirtCollarWide: {
    src: 'camisa-branca-colarinho-panoramica',
    width: 2560,
    height: 1600,
    alt: 'Camisa branca sob medida de colarinho estruturado, com gravata verde estampada, terno cinza e fita métrica de alfaiate sobre os ombros',
  },
  textureBlueCheck: {
    src: 'textura-xadrez-azul',
    width: 1365,
    height: 1706,
    alt: 'Textura: colete azul com xadrez discreto e botões',
  },
  textureGreyLapel: {
    src: 'textura-cinza-lapela',
    width: 1365,
    height: 1706,
    alt: 'Textura: lapela de terno cinza com o pesponto à mostra',
  },
  textureWhiteShirt: {
    src: 'textura-camisa-branca-gravata',
    width: 1446,
    height: 1808,
    alt: 'Textura: colarinho de camisa branca com gravata verde estampada',
  },
} as const satisfies Record<string, Photo>;

// ---------------------------------------------------------------------------
// Marca e contato
// ---------------------------------------------------------------------------
export const BRAND = {
  name: 'Alfaiataria Davi Alencar',
  shortName: 'Davi Alencar',
  tagline: 'Ternos e camisas sob medida',
  /** TODO: domínio de produção, ex.: 'https://www.davialencar.com.br' (sem barra no final). */
  siteUrl: null as string | null,
  /** TODO: cidade de atendimento (entra no title, textos e JSON-LD quando informada). */
  city: null as string | null,
  /** TODO: estado (UF). */
  state: null as string | null,
  /** TODO: ano de fundação. Não exibir até o cliente informar. */
  foundingYear: null as number | null,
} as const;

export const CONTACT = {
  /** TODO: número do WhatsApp só com dígitos e DDI, ex.: '5511999999999'. */
  whatsapp: null as string | null,
  whatsappMessage: 'Olá, gostaria de agendar um atendimento para um terno/camisa sob medida.',
  /** TODO: telefone para exibição, ex.: '(11) 99999-9999'. */
  phoneDisplay: null as string | null,
  /** TODO: e-mail de contato. */
  email: null as string | null,
  /** TODO: endereço completo (rua, número, bairro, CEP). */
  address: null as {
    street: string;
    district: string;
    city: string;
    state: string;
    postalCode: string;
  } | null,
  /** TODO: horário de atendimento, ex.: ['Seg. a sex.: 9h às 18h', 'Sáb.: 9h às 13h']. */
  hours: null as readonly string[] | null,
  /** TODO: URL de incorporação do Google Maps (iframe). */
  mapEmbedUrl: null as string | null,
  /** TODO: perfil do Instagram, ex.: 'https://www.instagram.com/...'. */
  instagram: null as string | null,
  /** TODO: endpoint que recebe o formulário (POST JSON). Enquanto null, o envio é desativado. */
  formEndpoint: null as string | null,
} as const;

export function whatsappLink(message: string = CONTACT.whatsappMessage): string | null {
  if (!CONTACT.whatsapp) return null;
  return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(message)}`;
}

// ---------------------------------------------------------------------------
// Navegação
// ---------------------------------------------------------------------------
export const NAV: readonly NavItem[] = [
  { label: 'A Alfaiataria', href: '#alfaiataria' },
  { label: 'Ternos', href: '#ternos' },
  { label: 'Camisas', href: '#camisas' },
  { label: 'Processo', href: '#processo' },
  { label: 'Tecidos', href: '#tecidos' },
  { label: 'Dúvidas', href: '#duvidas' },
  { label: 'Agendar', href: '#agendar' },
];

export const CTA_LABEL = 'Agendar atendimento';

// ---------------------------------------------------------------------------
// Seções
// ---------------------------------------------------------------------------
export const HERO = {
  h1Brand: 'Alfaiataria Davi Alencar',
  h1Products: 'Ternos e camisas sob medida',
  display: ['Feito', 'para você.'],
  lead: 'Cada peça nasce das suas medidas, da sua postura e da ocasião que você tem pela frente.',
  tabs: [
    { id: 'ternos', label: 'Ternos', photo: PHOTOS.daviNavySuit },
    { id: 'camisas', label: 'Camisas', photo: PHOTOS.shirtStriped },
  ],
  scrollHint: 'Role',
} as const;

export const MANIFESTO = {
  eyebrow: 'A Alfaiataria',
  spread: ['Sob', 'medida,', 'de', 'verdade.'],
  text: 'Uma roupa pronta é feita para um corpo médio, que ninguém tem. Na alfaiataria, o ponto de partida é você: suas medidas, sua postura, o jeito como o ombro cai e o braço se movimenta. A partir daí, cada corte tem um motivo e cada prova aproxima a peça do caimento exato.',
  pillars: [
    {
      title: 'Caimento exato',
      text: 'O molde é feito a partir das suas medidas, e não ajustado depois de pronto.',
    },
    {
      title: 'Tecidos selecionados',
      text: 'O tecido é escolhido com você, pensando no toque, no clima e na ocasião.',
    },
    {
      title: 'Acabamento artesanal',
      text: 'Detalhes que só aparecem de perto e que fazem diferença com o uso.',
    },
  ],
  /** TODO: história do Davi Alencar (como começou, formação, o que o move). Não exibida até ser enviada. */
  story: null as string | null,
} as const;

export const SUITS = {
  eyebrow: 'Ternos sob medida',
  title: ['Construído', 'para o seu corpo.'],
  text: 'Do primeiro risco de giz à última prova, o terno é pensado para quem vai usá-lo. Ombros, cintura, comprimento da manga e da barra seguem as suas medidas.',
  photo: PHOTOS.greyVestDetail,
  /**
   * Pontos sobre o close do terno cinza (descrevem o que aparece na foto).
   * Coordenadas em % do quadro 3:4 da seção (a foto 2:3 é recortada em cima e embaixo).
   */
  hotspots: [
    { label: 'Lapela', text: 'Lapela com caimento limpo, rente ao peito.', x: 26, y: 25 },
    {
      label: 'Colete',
      text: 'Colete trespassado, do mesmo tecido do terno.',
      x: 51,
      y: 59,
    },
    { label: 'Bolso', text: 'Bolso de peito com acabamento limpo.', x: 83, y: 29 },
    { label: 'Punho', text: 'Manga na medida certa: o punho da camisa aparece.', x: 17, y: 67 },
  ] satisfies readonly Hotspot[],
  /** TODO: confirmar cada opção de personalização com o cliente. */
  options: [
    {
      title: 'Modelagem',
      text: 'Mais ajustada ou mais solta, conforme seu corpo e seu estilo.',
      confirmed: true,
    },
    { title: 'Lapelas', text: 'Formato e largura da lapela definidos com você.', confirmed: true },
    { title: 'Botões', text: 'Quantidade, material e cor dos botões.', confirmed: true },
    {
      title: 'Forro',
      text: 'Cor e tipo de forro, discreto ou com personalidade.',
      confirmed: true,
    },
    { title: 'Bolsos', text: 'Modelo dos bolsos externos e internos.', confirmed: true },
    { title: 'Monograma', text: 'Suas iniciais bordadas por dentro da peça.', confirmed: true },
  ] satisfies readonly Option[],
} as const;

export const SHIRTS = {
  eyebrow: 'Camisas sob medida',
  title: ['A camisa', 'que veste certo.'],
  text: 'Colarinho no ponto, punho na medida do pulso e um caimento que não sobra nem aperta. A camisa sob medida acompanha o terno ou vai sozinha, com a mesma atenção.',
  /** Foto da "janela" em tela cheia: recorte panorâmico de 2560 px do ensaio. */
  photo: PHOTOS.shirtCollarWide,
  detailPhoto: PHOTOS.shirtNavy,
  /** TODO: confirmar cada opção de personalização com o cliente. */
  options: [
    { title: 'Colarinho', text: 'Altura, abertura e estrutura do colarinho.', confirmed: true },
    { title: 'Punho', text: 'Punho simples ou duplo, ajustado ao pulso.', confirmed: true },
    { title: 'Tecido', text: 'Cor, padronagem e trama escolhidas com você.', confirmed: true },
    { title: 'Caimento', text: 'Mais ajustada ou mais confortável, sem sobras.', confirmed: true },
    { title: 'Monograma', text: 'Iniciais bordadas no punho ou no peito.', confirmed: true },
  ] satisfies readonly Option[],
} as const;

export const PROCESS = {
  eyebrow: 'O processo sob medida',
  title: ['Cinco etapas,', 'um caimento.'],
  intro: 'Do primeiro encontro à entrega, cada etapa existe para chegar ao caimento certo.',
  /** TODO: confirmar nomes das etapas e informar prazos (campo duration) e número de provas. */
  steps: [
    {
      title: 'Atendimento e conversa',
      text: 'Entendemos a ocasião, sua rotina e o que você espera da peça.',
      duration: null,
      photo: PHOTOS.daviGreyDoubleBreasted,
    },
    {
      title: 'Tomada de medidas',
      text: 'Medidas detalhadas e observação da postura: a base de todo o molde.',
      duration: null,
      photo: PHOTOS.daviTapeMeasure,
    },
    {
      title: 'Escolha do tecido e dos detalhes',
      text: 'Tecido, cor, modelagem e acabamentos definidos juntos.',
      duration: null,
      photo: PHOTOS.atelierFabrics,
    },
    {
      title: 'Provas e ajustes',
      text: 'A peça é provada e ajustada até o caimento ficar como deve.',
      duration: null,
      photo: null,
    },
    {
      title: 'Entrega',
      text: 'Sua peça pronta, conferida em uma última prova.',
      duration: null,
      photo: PHOTOS.atelierFoldedJacket,
    },
  ] satisfies readonly ProcessStep[],
} as const;

export const FABRICS = {
  eyebrow: 'Tecidos',
  title: ['O toque', 'vem primeiro.'],
  text: 'O tecido define o caimento, o conforto e a ocasião. A escolha é feita no atendimento, olhando e sentindo cada opção.',
  /** Texturas visíveis nas fotos (não citam tecelagens nem composições não confirmadas). */
  textures: [
    // Recortes já em alta resolução: sem zoom via CSS, para não esticar pixels.
    { photo: PHOTOS.textureBlueCheck, label: 'Xadrez discreto em azul', position: '50% 50%', zoom: 1 },
    { photo: PHOTOS.textureGreyLapel, label: 'Cinza para ternos', position: '50% 50%', zoom: 1 },
    {
      photo: PHOTOS.textureWhiteShirt,
      label: 'Camisa branca e gravata',
      position: '50% 50%',
      zoom: 1,
    },
  ],
  /** TODO: tecidos/tecelagens que a alfaiataria trabalha (ex.: lã fria, linho, algodão egípcio). Não exibidos até confirmação. */
  confirmedFabrics: [] as readonly string[],
  /** Palavras do marquee: só termos do ofício, sem afirmar tecidos não confirmados. */
  marquee: ['Sob medida', 'Caimento', 'Corte', 'Prova', 'Acabamento', 'Ternos', 'Camisas'],
} as const;

export const LOOKBOOK = {
  eyebrow: 'Lookbook',
  title: 'Peças da casa',
  slides: [
    {
      photo: PHOTOS.daviBlueCheck,
      position: '50% 30%',
      title: 'Terno azul com xadrez discreto',
      caption: 'Três peças, com colete do mesmo tecido.',
    },
    {
      photo: PHOTOS.daviGreyDoubleBreasted,
      position: '50% 30%',
      title: 'Terno cinza com colete trespassado',
      caption: 'Seis botões no colete e gravata em tom dourado.',
    },
    {
      photo: PHOTOS.daviNavySuit,
      position: '50% 30%',
      title: 'Terno azul-marinho de três peças',
      caption: 'Lapela pontiaguda e colete do mesmo tecido.',
    },
    {
      photo: PHOTOS.daviPoloNavy,
      position: '50% 25%',
      title: 'Camisa polo azul-marinho',
      caption: 'Para os dias sem terno, com o mesmo cuidado no caimento.',
    },
    {
      photo: PHOTOS.shirtNavy,
      position: '50% 50%',
      title: 'Camisa azul-marinho',
      caption: 'Listra fina e colarinho estruturado.',
    },
    {
      photo: PHOTOS.daviPoloGreen,
      position: '50% 25%',
      title: 'Camisa polo verde',
      caption: 'Cor sóbria, para o fim de semana.',
    },
    {
      photo: PHOTOS.daviScissors,
      position: '50% 25%',
      title: 'Terno cinza',
      caption: 'Corte limpo para o dia a dia.',
    },
  ],
} as const;

export const OCCASIONS = {
  eyebrow: 'Ocasiões',
  title: ['Para cada', 'compromisso.'],
  /** TODO: confirmar ocasiões. Casamento (noivo e padrinhos) depende de confirmação de trajes de noivo. */
  items: [
    {
      title: 'Trabalho',
      text: 'Ternos e camisas para a rotina, que mantêm a forma do começo ao fim do dia.',
      confirmed: true,
    },
    {
      title: 'Eventos e formaturas',
      text: 'Uma peça pensada para a data, para as fotos e para durar depois dela.',
      confirmed: true,
    },
    {
      title: 'Casamento: noivo e padrinhos',
      text: 'TODO: texto após confirmação dos trajes para noivo e padrinhos.',
      confirmed: false,
    },
  ] satisfies readonly Option[],
  /** Card de fechamento: convida a contar a ocasião (não afirma serviço). */
  yours: {
    title: 'A sua ocasião',
    text: 'Tem uma data marcada? Conte no atendimento e a peça é pensada para ela.',
  },
} as const;

export const FAQ = {
  eyebrow: 'Dúvidas frequentes',
  title: 'Antes de agendar',
  items: [
    {
      question: 'Quanto tempo leva para ficar pronto?',
      // TODO: substituir pelo prazo médio real de confecção.
      answer:
        'O prazo varia conforme a peça e os ajustes necessários. No primeiro atendimento você recebe uma estimativa para o seu caso.',
      confirmed: true,
    },
    {
      question: 'Quantas provas são necessárias?',
      // TODO: informar o número habitual de provas.
      answer: 'Depende da peça e do seu corpo. As provas acontecem até o caimento ficar correto.',
      confirmed: true,
    },
    {
      question: 'Preciso levar alguma referência?',
      answer:
        'Não é obrigatório. Se tiver fotos de modelos de que gosta, ou o sapato que pretende usar com a peça, leve: ajuda na conversa.',
      confirmed: true,
    },
    {
      question: 'Como funciona o primeiro atendimento?',
      answer:
        'É uma conversa sobre a ocasião, o seu estilo e a peça que você procura, seguida da tomada de medidas.',
      confirmed: true,
    },
    {
      question: 'Posso escolher o tecido?',
      answer:
        'Sim. O tecido é escolhido com você, considerando o uso, o clima e o caimento desejado.',
      confirmed: true,
    },
    {
      question: 'Vocês fazem camisas sem o terno?',
      answer: 'Sim. A camisa sob medida pode ser feita sozinha ou junto com o terno.',
      confirmed: true,
    },
    {
      question: 'Vocês fazem trajes para noivo e padrinhos?',
      answer: 'TODO: resposta após confirmação do cliente.',
      confirmed: false,
    },
    {
      question: 'Como agendar?',
      answer:
        'Pelo WhatsApp ou pelo formulário no fim desta página. Retornamos para combinar o melhor dia e horário.',
      confirmed: true,
    },
  ] satisfies readonly FaqItem[],
} as const;

export const BOOKING = {
  eyebrow: 'Agendamento',
  title: ['Vamos começar', 'pela sua medida.'],
  text: 'Conte o que você procura. Retornamos para combinar o atendimento.',
  photo: PHOTOS.daviTapeMeasureSmile,
  interests: [
    { value: 'terno', label: 'Terno' },
    { value: 'camisa', label: 'Camisa' },
    { value: 'ambos', label: 'Terno e camisa' },
  ],
  occasions: [
    { value: 'trabalho', label: 'Trabalho' },
    { value: 'evento', label: 'Evento ou formatura' },
    { value: 'casamento', label: 'Casamento' },
    { value: 'outra', label: 'Outra' },
  ],
} as const;

export const FOOTER = {
  wordmark: 'Davi Alencar',
  marquee: ['Alfaiataria Davi Alencar', 'Ternos sob medida', 'Camisas sob medida'],
} as const;

/** Texto-base da política de privacidade. TODO: revisão jurídica e dados do controlador. */
export const PRIVACY = {
  title: 'Política de Privacidade',
  updatedAt: null as string | null, // TODO: data da última revisão, ex.: '19/11/2026'
  sections: [
    {
      heading: 'Quem somos',
      body: [
        'Esta política explica como a Alfaiataria Davi Alencar trata os dados pessoais enviados por este site, conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).',
        'TODO: razão social, CNPJ e endereço do controlador dos dados.',
      ],
    },
    {
      heading: 'Quais dados coletamos',
      body: [
        'Pelo formulário de agendamento: nome, telefone, interesse (terno, camisa ou ambos), ocasião, data do evento (opcional) e a mensagem que você escrever.',
        'Ao clicar no botão de WhatsApp, a conversa acontece no aplicativo do WhatsApp, sujeito à política de privacidade dele.',
      ],
    },
    {
      heading: 'Para que usamos',
      body: [
        'Somente para responder ao seu pedido e combinar o atendimento. Não vendemos nem compartilhamos seus dados para fins de publicidade.',
      ],
    },
    {
      heading: 'Base legal e prazo de guarda',
      body: [
        'O tratamento se baseia no seu consentimento, dado ao marcar a caixa do formulário.',
        'TODO: definir por quanto tempo os dados são guardados e onde ficam armazenados.',
      ],
    },
    {
      heading: 'Cookies',
      body: [
        'Este site não usa cookies de publicidade nem de rastreamento. TODO: atualizar esta seção se alguma ferramenta de análise for instalada.',
      ],
    },
    {
      heading: 'Seus direitos',
      body: [
        'Você pode pedir acesso, correção ou exclusão dos seus dados, e revogar o consentimento a qualquer momento.',
        'TODO: canal para esses pedidos (e-mail do encarregado de dados).',
      ],
    },
  ],
} as const;
