# GRID 26 — Guia Editorial & Temporada Ao Vivo da Fórmula 1 (2026)

Aplicação web interativa (SPA) desenvolvida para apresentar as **11 equipes**, **monopostos**, **pilotos**, **regulamento técnico** e o acompanhamento em tempo real da **Temporada 2026 da Fórmula 1** (pódios por Grande Prêmio, classificação de pilotos e construtores, traçados aéreos dos circuitos e calendário com contagem regressiva).

---

## Destaques de Engenharia & Arquitetura

1. **Zero-Framework SPA (Vanilla JS Puro & Alta Performance):**
   - Roteamento client-side via Hash (`#/`, `#/equipes`, `#/equipe/:id`, `#/temporada`) com transições suaves e controle de ciclo de vida de *observers* e *timers* ([js/app.js](js/app.js)).
   - Carregamento instantâneo sem *bundle bloat* de dependências externas.

2. **Integração com API em Tempo Real + Cache Inteligente ([js/season.js](js/season.js)):**
   - Consumo assíncrono em lotes paralelos (`Promise.all`) da **Jolpica F1 API** (sucessora oficial da Ergast API), respeitando limites de *rate-limit*.
   - **Cache de Sessão (`sessionStorage`):** Na primeira visita, os dados da temporada (calendário, horários de treinos/corrida convertidos para o fuso do usuário, pódios e tabelas) são normalizados e armazenados no navegador. Recarregar a página (F5) ou navegar entre abas realiza **zero requisições extras** à API.
   - **Atualização sob demanda & Fallback resiliente:** Botão discreto de sincronização manual (`↻`) com indicador de horário da última coleta e manutenção da cópia em cache caso o usuário fique offline.

3. **Cartografia de Circuitos (GeoJSON → SVG Vetorial):**
   - Os 26 traçados aéreos em `assets/img/circuits/` foram gerados a partir de coordenadas geográficas oficiais com correção de projeção por cosseno de latitude, exibindo a silhueta real de cada autódromo, extensão em quilômetros e marcação do ponto de largada.

4. **Design System Editorial (*Impeccable & Hallmark Anti-AI Slop*):**
   - Arquitetura de superfícies em 3 níveis (`--bg-canvas`, `--bg-surface`, `--bg-surface-elevated`) e tokens dinâmicos por construtor (`--team-accent`).
   - Tipografia numérica alinhada (`font-variant-numeric: tabular-nums`) em tabelas, cronômetros e tempos de prova.
   - Contraste rigoroso (WCAG AA/AAA), navegação semântica (`aria-live`, `role="tablist"`, `:focus-visible`) e suporte nativo a `prefers-reduced-motion: reduce`.

---

## Estrutura do Projeto

```text
f1-site-impeccable/
├── assets/
│   ├── img/
│   │   ├── cars/       # Monopostos 2026 em WebP otimizado
│   │   ├── circuits/   # 26 traçados aéreos de circuitos em SVG
│   │   ├── drivers/    # Fotos dos pilotos titulares em WebP
│   │   ├── flags/      # Bandeiras oficiais dos países-sede em SVG
│   │   └── logos/      # Emblemas das 11 equipes
│   ├── photos/         # Registros fotográficos de pista
│   └── video/          # Vídeo e poster da seção Hero
├── css/
│   └── styles.css      # Design system, componentes e responsividade
├── js/
│   ├── data.js         # Base de dados estática das 11 equipes e pilotos
│   ├── season.js       # Integração de API, cache sessionStorage e views da Temporada
│   └── app.js          # Roteador SPA, views de equipes e ciclo de vida
├── index.html          # Shell semântico + metadados Open Graph
└── vercel.json         # Configuração de cache CDN para deploy na Vercel
```

---

## Como executar localmente

Basta servir a pasta com qualquer servidor estático:

```bash
# Usando Python
python -m http.server 5507

# Ou usando Node.js (npx)
npx serve .
```

Acesse `http://localhost:5507` no navegador.

---

## Como publicar na Vercel

### Opção 1 — Pelo terminal (Vercel CLI)
Dentro da pasta `f1-site-impeccable`, execute:
```bash
npx vercel
```
Para publicar em produção:
```bash
npx vercel --prod
```

### Opção 2 — Pelo GitHub (Deploy contínuo)
1. Suba a pasta `f1-site-impeccable` em um repositório no seu GitHub.
2. Acesse [vercel.com/new](https://vercel.com/new) e importe o repositório.
3. Mantenha **Framework Preset** como `Other` e clique em **Deploy**.

---

## Aviso Legal
Projeto editorial de estudo e demonstração técnica de desenvolvimento Front-end e UI/UX. Sem fins comerciais e sem afiliação oficial com a FIA ou Formula One Management. Marcas e imagens pertencem aos seus respectivos proprietários.

