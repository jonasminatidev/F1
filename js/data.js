// Dados das 11 equipes da temporada 2026.
// Todas as mídias são locais, em assets/ (imagens e vídeo da capa).
// Estatísticas aproximadas, conferir antes de uso real.
const logo = (k) => `assets/img/logos/${k}.webp`;
const car = (k) => `assets/img/cars/${k}.webp`;
const drv = (k, d) => `assets/img/drivers/${d}.webp`;

const TEAMS = [
  {
    id: "red-bull-racing", k: "redbullracing", name: "Oracle Red Bull Racing", short: "Red Bull", color: "#3671C6",
    pu: "Red Bull Ford", base: "Milton Keynes, Reino Unido", principal: "Laurent Mekies", debut: 2005,
    wcc: 6, wdc: 8, tagline: "Asas, ousadia e uma nova era com motor próprio.",
    desc: [
      "Nascida em 2005 das cinzas da Jaguar, a Red Bull transformou uma marca de energéticos em uma das potências mais dominantes da história da F1, com quatro títulos seguidos de Sebastian Vettel e a era Max Verstappen.",
      "Em 2026 começa um capítulo inédito: pela primeira vez a equipe desenvolve o próprio motor, em parceria com a Ford, sob as novas regras de eletrificação e combustível sustentável."
    ],
    drivers: [
      { id: "maxver01", name: "Max Verstappen", n: 3, country: "Holanda" },
      { id: "isahad01", name: "Isack Hadjar", n: 6, country: "França" }
    ]
  },
  {
    id: "ferrari", k: "ferrari", name: "Scuderia Ferrari HP", short: "Ferrari", color: "#E8002D",
    pu: "Ferrari", base: "Maranello, Itália", principal: "Frédéric Vasseur", debut: 1950,
    wcc: 16, wdc: 15, tagline: "A lenda vermelha. A única presente desde o primeiro dia.",
    desc: [
      "A Ferrari é a única equipe que disputou todas as temporadas da F1 desde 1950. Com 16 títulos de construtores, é a mais vitoriosa da história e o maior símbolo do automobilismo mundial.",
      "A dupla Charles Leclerc e Lewis Hamilton — sete vezes campeão — reúne talento e experiência na busca por encerrar um jejum de títulos que a Scuderia quer terminar."
    ],
    drivers: [
      { id: "chalec01", name: "Charles Leclerc", n: 16, country: "Mônaco" },
      { id: "lewham01", name: "Lewis Hamilton", n: 44, country: "Reino Unido" }
    ]
  },
  {
    id: "mercedes", k: "mercedes", name: "Mercedes-AMG Petronas", short: "Mercedes", color: "#27F4D2",
    pu: "Mercedes", base: "Brackley, Reino Unido", principal: "Toto Wolff", debut: 1954,
    wcc: 8, wdc: 9, tagline: "Precisão alemã. Oito títulos consecutivos de construtores.",
    desc: [
      "Entre 2014 e 2021 a Mercedes escreveu o maior domínio da história da F1: oito títulos seguidos de construtores e sete de pilotos, a maioria com Lewis Hamilton.",
      "Com a renovação de regras em 2026, a fábrica de Brackley aposta em George Russell e no jovem italiano Kimi Antonelli para liderar a nova geração."
    ],
    drivers: [
      { id: "georus01", name: "George Russell", n: 63, country: "Reino Unido" },
      { id: "andant01", name: "Kimi Antonelli", n: 12, country: "Itália" }
    ]
  },
  {
    id: "mclaren", k: "mclaren", name: "McLaren Mastercard", short: "McLaren", color: "#FF8000",
    pu: "Mercedes", base: "Woking, Reino Unido", principal: "Andrea Stella", debut: 1966,
    wcc: 10, wdc: 12, tagline: "Papaya de volta ao topo da grid.",
    desc: [
      "Fundada por Bruce McLaren, a equipe de Woking é sinônimo de Senna, Prost, Häkkinen e Hamilton. Depois de anos difíceis, voltou a dominar com carros afiados e uma gestão que valoriza igualdade entre pilotos.",
      "Lando Norris e Oscar Piastri formam uma das duplas mais talentosas e equilibradas do grid atual."
    ],
    drivers: [
      { id: "lannor01", name: "Lando Norris", n: 1, country: "Reino Unido" },
      { id: "oscpia01", name: "Oscar Piastri", n: 81, country: "Austrália" }
    ]
  },
  {
    id: "aston-martin", k: "astonmartin", name: "Aston Martin Aramco", short: "Aston Martin", color: "#229971",
    pu: "Honda", base: "Silverstone, Reino Unido", principal: "Adrian Newey (sócio-gerente)", debut: 2021,
    wcc: 0, wdc: 0, tagline: "Verde-britânico, ambição bilionária e Newey na prancheta.",
    desc: [
      "Dona de uma das fábricas mais modernas do paddock, a Aston Martin investiu pesado para sair do pelotão intermediário. O projeto ganhou o maior engenheiro da F1: Adrian Newey.",
      "Em 2026 estreia a parceria de motor com a Honda e conta com o experiente bicampeão Fernando Alonso."
    ],
    drivers: [
      { id: "feralo01", name: "Fernando Alonso", n: 14, country: "Espanha" },
      { id: "lanstr01", name: "Lance Stroll", n: 18, country: "Canadá" }
    ]
  },
  {
    id: "alpine", k: "alpine", name: "BWT Alpine", short: "Alpine", color: "#00A1E8",
    pu: "Mercedes", base: "Enstone, Reino Unido", principal: "Flavio Briatore (consultor executivo)", debut: 2021,
    wcc: 3, wdc: 4, tagline: "Herança francesa com sotaque de Enstone.",
    desc: [
      "A fábrica de Enstone já foi Benetton e Renault, e levou Schumacher e Alonso aos títulos. Hoje, como Alpine, mira o retorno ao grupo da frente.",
      "Para 2026 muda de rumo e passa a usar motor Mercedes, com Pierre Gasly e o jovem argentino Franco Colapinto."
    ],
    drivers: [
      { id: "piegas01", name: "Pierre Gasly", n: 10, country: "França" },
      { id: "fracol01", name: "Franco Colapinto", n: 43, country: "Argentina" }
    ]
  },
  {
    id: "williams", k: "williams", name: "Atlassian Williams", short: "Williams", color: "#64C4FF",
    pu: "Mercedes", base: "Grove, Reino Unido", principal: "James Vowles", debut: 1977,
    wcc: 9, wdc: 7, tagline: "Uma lenda independente em plena reconstrução.",
    desc: [
      "Criada por Sir Frank Williams, a equipe conquistou nove títulos de construtores e lançou carros icônicos nos anos 80 e 90, com Mansell, Prost, Hill e Villeneuve.",
      "Sob o comando de James Vowles, a Williams ressurge com Alex Albon e Carlos Sainz."
    ],
    drivers: [
      { id: "alealb01", name: "Alexander Albon", n: 23, country: "Tailândia" },
      { id: "carsai01", name: "Carlos Sainz", n: 55, country: "Espanha" }
    ]
  },
  {
    id: "racing-bulls", k: "racingbulls", name: "Visa Cash App Racing Bulls", short: "Racing Bulls", color: "#6692FF",
    pu: "Red Bull Ford", base: "Faenza, Itália", principal: "Alan Permane", debut: 1985,
    wcc: 0, wdc: 0, tagline: "O laboratório de talentos da Red Bull.",
    desc: [
      "Herdeira da Minardi e da Toro Rosso, a equipe italiana é a porta de entrada para jovens pilotos do programa Red Bull — foi aqui que Vettel e Verstappen venceram suas primeiras corridas.",
      "Em 2026 aposta em Liam Lawson e na nova promessa britânica Arvid Lindblad."
    ],
    drivers: [
      { id: "lialaw01", name: "Liam Lawson", n: 30, country: "Nova Zelândia" },
      { id: "arvlin01", name: "Arvid Lindblad", n: 41, country: "Reino Unido" }
    ]
  },
  {
    id: "audi", k: "audi", name: "Audi Revolut F1", short: "Audi", color: "#F50537",
    pu: "Audi", base: "Hinwil, Suíça / Neuburg, Alemanha", principal: "Jonathan Wheatley", debut: 2026,
    wcc: 0, wdc: 0, tagline: "Quatro anéis chegam à F1.",
    desc: [
      "A Audi estreia em 2026 ao assumir a estrutura da Sauber e construir do zero a própria unidade de potência em Neuburg, na Alemanha.",
      "Nico Hülkenberg traz experiência e Gabriel Bortoleto, campeão da F2, representa o futuro do automobilismo brasileiro."
    ],
    drivers: [
      { id: "nichul01", name: "Nico Hülkenberg", n: 27, country: "Alemanha" },
      { id: "gabbor01", name: "Gabriel Bortoleto", n: 5, country: "Brasil" }
    ]
  },
  {
    id: "haas", k: "haasf1team", name: "TGR Haas F1 Team", short: "Haas", color: "#B6BABD",
    pu: "Ferrari", base: "Kannapolis, EUA / Banbury, Reino Unido", principal: "Ayao Komatsu", debut: 2016,
    wcc: 0, wdc: 0, tagline: "A equipe americana que faz muito com pouco.",
    desc: [
      "Criada por Gene Haas, a equipe americana é conhecida pelo modelo enxuto, apoiada em parceria técnica com a Ferrari.",
      "Com Esteban Ocon e o jovem Oliver Bearman, a Haas busca consolidar-se no meio do pelotão."
    ],
    drivers: [
      { id: "estoco01", name: "Esteban Ocon", n: 31, country: "França" },
      { id: "olibea01", name: "Oliver Bearman", n: 87, country: "Reino Unido" }
    ]
  },
  {
    id: "cadillac", k: "cadillac", name: "Cadillac Formula 1 Team", short: "Cadillac", color: "#C9A24B",
    pu: "Ferrari", base: "Fishers (EUA) / Silverstone (Reino Unido)", principal: "Graeme Lowdon", debut: 2026,
    wcc: 0, wdc: 0, tagline: "A 11ª equipe. O sonho americano na F1.",
    desc: [
      "A Cadillac, com apoio da General Motors, é a grande novidade de 2026: a 11ª equipe do grid e a primeira nova inscrição em quase uma década.",
      "Com dois veteranos — Valtteri Bottas e Sergio Pérez — e motor Ferrari na largada, quer provar que veio para ficar."
    ],
    drivers: [
      { id: "valbot01", name: "Valtteri Bottas", n: 77, country: "Finlândia" },
      { id: "serper01", name: "Sergio Pérez", n: 11, country: "México" }
    ]
  }
];

