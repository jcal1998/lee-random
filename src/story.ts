export interface Choice {
  text: string;
  outcome: string;
}

export interface Scene {
  title: string;
  text: string[];
  choices?: Choice[];
  epilogue?: string;
  final?: boolean;
}

export interface Names {
  dele: string;
  dela: string;
}

// --- Personagens ---
export const NOME_DELE = "Lee";
export const NOME_DELA_PADRAO = "Mozinha";
export const NOME_DELA_JOLEE = "Joropopo";

/** Modo "jolee": ativado por `?jolee` na URL. Troca o nome dela e libera o capítulo extra e as fotos. */
export function isJoleeMode(search: string): boolean {
  return new URLSearchParams(search).has("jolee");
}

export function getNames(jolee: boolean): Names {
  return {
    dele: NOME_DELE,
    dela: jolee ? NOME_DELA_JOLEE : NOME_DELA_PADRAO,
  };
}

/** Substitui os marcadores ${NOME_DELE} e ${NOME_DELA} pelos nomes reais. */
export function replaceNames(text: string, names: Names): string {
  return text.replace(/\$\{NOME_DELE\}/g, names.dele).replace(/\$\{NOME_DELA\}/g, names.dela);
}

// --- Conteúdo da História ---
// Os textos usam os marcadores ${NOME_DELE} e ${NOME_DELA} (strings normais, não template literals),
// que são trocados pelos nomes na hora de exibir.
const capituloPontesAereas: Scene = {
  title: "Capítulo 9: Pontes Aéreas",
  text: [
    "A vida trouxe um novo desafio. ${NOME_DELE} recebeu uma proposta de emprego irrecusável: trabalhar na Google, em São Paulo.",
    "A distância parecia assustadora, mas o compromisso deles era maior. Ele se mudou, mas o coração ficou em Goiânia.",
    "Toda semana, ele pegava um avião. A ponte aérea São Paulo-Goiânia se tornou sua rotina. Ele voltava para continuar a faculdade, mas, principalmente, para ver sua noiva.",
    "As despedidas no aeroporto eram doídas, cheias de abraços apertados. Mas as chegadas eram pura felicidade. A saudade só serviu para mostrar o quanto o amor deles havia amadurecido e se tornado inabalável.",
  ],
};

const capitulosIniciais: Scene[] = [
  {
    title: "Capítulo 1: O Encontro na UFG",
    text: [
      "Era um dia comum em 2016, na Universidade Federal de Goiás. O sol da tarde batia na calçada em frente ao Restaurante Universitário, o famoso RU.",
      "${NOME_DELE} estava conversando com um grupo de amigas. Dias depois, uma menina morena, que fazia parte do grupo, o abordou pelo celular...",
      '<p class="dialogue"><strong>${NOME_DELA}:</strong> "Oi! Desculpa incomodar... Será que você poderia me ajudar coma matéria de Cálculo? Eu tô quase chorando aqui."</p>',
      '${NOME_DELE}, surpreso e um pouco encantado, sorriu ao ler a mensagem. <p class="dialogue"><strong>${NOME_DELE}:</strong> "Claro! Essa parte é chata mesmo, mas a gente dá um jeito."</p>',
      "O que começou com uma ajudinha em matemática, virou uma longa conversa. E depois outra, e mais outra. Eles começaram a conversar todos os dias.",
    ],
  },
  {
    title: "Capítulo 2: Cinema no Flamboyant",
    text: [
      "Três meses se passaram. As conversas que começaram na UFG agora enchiam as janelas de chat do celular, com risadas e flertes inocentes.",
      "Ele a convidou para ir ao cinema. O coração batia forte. Finalmente, um encontro de verdade! Eles combinaram de se ver no Cinemark do Shopping Flamboyant.",
      "Quando ${NOME_DELE} chegou, uma surpresa: ${NOME_DELA} não estava sozinha. Ela tinha levado duas amigas junto.",
    ],
    choices: [
      {
        text: "Pensar: 'Ah, não vai rolar nada...'",
        outcome:
          "Ele pensou consigo mesmo: 'Ok, com as amigas junto, acho que hoje não vai rolar nada'. Ele ficou um pouco desapontado, mas decidiu relaxar e curtir o filme e a companhia.",
      },
      {
        text: "Pensar: 'Que legal, mais gente pra conversar!'",
        outcome:
          "Ele sorriu e pensou: 'Ótimo, mais gente pra conversar!'. Ele foi simpático com todas, fez piadas e garantiu que todo mundo se divertisse.",
      },
    ],
    epilogue:
      "Apesar da torcida contra, durante o filme Nerve, aconteceu. Um beijo simples, rápido e cheio de significado. No dia seguinte, o pedido de namoro veio por mensagem, e ela aceitou com o coração aos pulos. Era o começo de tudo.",
  },
  {
    title: "Capítulo 3: Fugindo da Aula",
    text: [
      "O começo do namoro foi mágico. Aquele frio na barriga constante, a troca de mensagens cheias de carinho e a vontade de estar junto o tempo todo.",
      "Muitas vezes, a saudade apertava no meio da tarde. A solução? Matar uma aulinha ou outra para se encontrarem atrás do Centro de Aulas C, o CAC da UFG.",
      "Era o esconderijo perfeito. Ali, atrás da janela da sala 103, eles trocavam beijos, abraços e promessas, com o som das aulas acontecendo ao fundo, como se o mundo deles fosse só aquele pequeno pedaço de cimento.",
    ],
  },
  {
    title: "Capítulo 4: Banana Shopping",
    text: [
      "Os encontros não precisavam ser grandiosos. Alguns dos melhores momentos aconteceram no Banana Shopping, um lugar simples e acessível de ônibus.",
      "Eram tardes de passeios de mãos dadas, lanchinhos baratos e muitas, muitas risadas. Cada cantinho daquele shopping se tornou um cenário para uma memória feliz.",
    ],
    choices: [
      {
        text: "Comer pão de queijo",
        outcome:
          '<p class="dialogue"><strong>${NOME_DELA}:</strong> "Amor, vamos dividir um pão de queijo?"</p><p class="dialogue"><strong>${NOME_DELE}:</strong> "O melhor pão de queijo do mundo! Só se for agora."</p>Eles dividiam o pão de queijo quentinho, roubando pedaços um do outro.',
      },
      {
        text: "Tomar açaí",
        outcome:
          '<p class="dialogue"><strong>${NOME_DELE}:</strong> "Calor, né? Bora um açaí?"</p><p class="dialogue"><strong>${NOME_DELA}:</strong> "Com leite em pó e morango! Por favorzinho!"</p>Eles sentavam e dividiam um açaí gelado, sujando o canto da boca e rindo um do outro.',
      },
    ],
    epilogue:
      "Eram nesses pequenos momentos que o amor deles se fortalecia, na simplicidade de apenas estarem juntos.",
  },
  {
    title: "Capítulo 5: Mutirama e a Montanha-Russa",
    text: [
      "Em um fim de semana ensolarado, decidiram ser turistas na própria cidade e foram ao Parque Mutirama.",
      'Ela, aventureira, correu direto para a montanha-russa, com os olhos brilhando de animação. <p class="dialogue"><strong>${NOME_DELA}:</strong> "Vamos, vamos, vamos! Vai ser divertido!"</p>',
      "Ele, por outro lado, sentiu um calafrio. Altura e velocidade não eram seus melhores amigos. Mas como dizer não para aquele sorriso?",
      '<p class="dialogue"><strong>${NOME_DELE}:</strong> "Divertido? Isso parece uma máquina de tortura... Mas vamos lá, por você."</p>',
      "A volta foi exatamente como o esperado: ela gritava de alegria, com os braços para o alto. Ele gritava de pânico, agarrado na trava de segurança. A cena foi hilária: ela gargalhando, ele com uma cara de pavor impagável. Ele sobreviveu, e ganhou mais uma boa história para contar.",
    ],
  },
  {
    title: "Capítulo 6: Chega o Bolt! POTITO!",
    text: [
      "A família estava prestes a crescer. Eles decidiram pegar um cachorrinho.",
      "E então, um pequeno furacão marrom e branco, da raça husky siberiano, entrou na vida deles. Seu nome: Bolt.",
      "A casa nunca mais foi a mesma. Eram pelos por toda parte, chinelos roídos e uma energia que não acabava nunca. Mas também era um amor incondicional, passeios no parque e muitas sessões de abraços no tapete da sala. Eles agora eram três.",
    ],
  },
  {
    title: "Capítulo 7: E agora, Luna! Luninha, tampinha!",
    text: [
      "Com a rotina estabelecida, eles sentiram que faltava algo. Ou melhor, outro alguém.",
      "E assim, Luna chegou. Outra husky marrom e branca, tão bagunceira quanto Bolt. Na verdade... muito pior! A casa ficou ainda mais cheia de pelos, latidos e alegria.",
      "Agora a família estava completa: ${NOME_DELE}, ${NOME_DELA}, Bolt e Luna. Uma pequena matilha, uma grande família.",
    ],
  },
  {
    title: "Capítulo 8: Construindo a Vida",
    text: [
      "Os anos foram passando e o relacionamento amadurecendo. A vida a dois foi sendo construída, tijolo por tijolo.",
      "Vieram os encontros em restaurantes novos, a primeira viagem para ver o mar, uma memória salgada e inesquecível.",
      "Houve também conversas sérias e medos compartilhados, como a ansiedade sobre uma possível gravidez não planejada. Nesses momentos, eles se apoiavam, mostrando que a parceria ia muito além da diversão.",
      "Compraram o primeiro carro, um símbolo de independência e de novas aventuras pela frente. E, finalmente, o passo mais importante: decidiram morar juntos. A busca pelo lugar, a decoração, as primeiras noites no novo lar... cada momento era especial.",
    ],
  },
];

const capituloFinal: Scene = {
  title: "Capítulo Final: O Presente",
  text: [
    "E aqui estamos, 9 anos depois daquele 'oi' na frente do RU.",
    "Nove anos de história, de crescimento, de parceria e de um amor que só ficou mais forte com o tempo.",
    "Este joguinho simples é o meu presente de aniversário para você, meu amor. Uma forma de registrar e celebrar cada passo da nossa jornada.",
    "É uma pequena homenagem à nossa história, que é a minha história favorita no mundo inteiro.",
    '<p class="dialogue"><strong>${NOME_DELE}:</strong> "Feliz aniversário, ${NOME_DELA}. Obrigado por esses 9 anos incríveis. Mal posso esperar por tudo que ainda vamos viver."</p>',
    "A nossa história continua...",
  ],
  final: true,
};

/** Monta a lista de capítulos. O capítulo "Pontes Aéreas" só aparece no modo jolee. */
export function buildStory(jolee: boolean): Scene[] {
  return [...capitulosIniciais, ...(jolee ? [capituloPontesAereas] : []), capituloFinal];
}
