# AGENTS.md — Alfaiataria Davi Alencar

Guia de trabalho para qualquer agente de IA (Claude, Codex, Cursor etc.) neste repositório. **Leia este arquivo inteiro antes de qualquer alteração.**

---

## 1. Visão geral do projeto

Landing page da **Alfaiataria Davi Alencar**, alfaiataria de roupas sob medida.

| Item | Valor |
| --- | --- |
| Produtos | Ternos sob medida e camisas sob medida |
| Proposta | Peças feitas para o corpo de cada cliente: caimento exato, tecidos selecionados, acabamento artesanal |
| Idioma | Português do Brasil (`pt-BR`) |
| Objetivo do site | Encantar visualmente, passar sofisticação e artesania, explicar o processo sob medida e levar o visitante a agendar uma prova/atendimento (WhatsApp ou formulário) |
| Tom | Elegante, confiante, masculino sem ser clichê, atencioso. Linguagem de marca premium: frases curtas, com peso, e muito respiro visual |

O diferencial do projeto são as **animações de scroll**. Elas vêm do site de referência clonado em `src/clone`. Trate essa parte como **prioridade número um**, sem abrir mão de desempenho, acessibilidade e SEO. Num site de moda, a imagem é o produto: as animações precisam valorizar as fotos (texturas de tecido, detalhes de costura, caimento).

---

## 2. Stack e convenções

- **Angular** (versão do `package.json`; não faça downgrade nem upgrade de versão maior sem pedir) com **TypeScript em modo strict**.
- **Standalone components** em tudo. Nada de `NgModule`.
- **Signals** (`signal`, `computed`, `input()`, `output()`) para estado e entradas. Use `inject()` em vez de injeção pelo construtor.
- **Control flow nativo** (`@if`, `@for`, `@defer`). Não use `*ngIf`/`*ngFor`.
- `ChangeDetectionStrategy.OnPush` em todos os componentes.
- **SSR e prerender** com `@angular/ssr` (se ainda não estiver instalado: `ng add @angular/ssr`) e prerender da rota `/`. **Obrigatório para o SEO.**
- Estilos em **SCSS**, com design tokens em CSS custom properties (`src/styles/_tokens.scss`). Sem Bootstrap ou Tailwind, a não ser que o usuário peça.
- Imagens com **`NgOptimizedImage`** (`ngSrc`, `width`/`height` ou `fill`, `priority` só na imagem do hero), em formatos modernos (WebP/AVIF) e com `srcset` responsivo.
- Nomes de arquivos em **kebab-case**. Nomes de classes, variáveis e código em **inglês**. Todo o texto visível em **português**.
- Não adicione dependências sem justificar. Bibliotecas de animação são aceitas só se o clone já usar a mesma (ver seção 4).

### Estrutura de pastas esperada

```
src/
├── app/
│   ├── core/
│   │   ├── animations/        # serviço e diretivas de scroll (port do clone)
│   │   ├── seo/               # SeoService, JSON-LD
│   │   └── data/              # conteúdo do site tipado (site-content.ts)
│   ├── sections/              # hero, manifesto, collections, process, fabrics, lookbook, occasions, faq, booking
│   ├── shared/                # header, footer, botões, whatsapp-fab, ícones, cursor (se houver no clone)
│   ├── app.component.ts
│   ├── app.config.ts
│   └── app.routes.ts
├── clone/                     # SOMENTE REFERÊNCIA, nunca entra no bundle
├── styles/                    # _tokens.scss, _typography.scss, _reset.scss, _mixins.scss
└── styles.scss
public/                        # logo, fotos de produtos/ateliê/tecidos, favicon, og-image, robots.txt, sitemap.xml
docs/
└── clone-analysis.md          # gerado pelo agente na Fase 0
```

---

## 3. A pasta `src/clone` (referência)

`src/clone` tem a cópia de um site de referência baixado com o vibecloner. Regras:

- **Só para estudo.** Nunca importe, referencie ou empacote arquivos de `src/clone` no app. Garanta que ela fique fora do build:
  - em `tsconfig.app.json`: `"exclude": ["src/clone/**"]`;
  - não inclua `src/clone` em `assets` nem em `styles` no `angular.json`.
- Aproveite **apenas o comportamento** de movimento e de interação: timings, easings, sequências, padrões de scroll (pin, parallax, reveal, split text, máscara de imagem, scrub, scroll horizontal, troca de cor de fundo, zoom de imagem, smooth scroll, cursor customizado, loader/intro, transições de menu e hovers).
- **Não copie a identidade** do site original: nenhum texto, imagem, logo, fonte licenciada, nome ou layout idêntico de marca. O resultado precisa ser uma marca própria da Alfaiataria Davi Alencar.
- Antes de programar qualquer seção, gere **`docs/clone-analysis.md`** (ver `PROMPT.md`, Fase 0) com o inventário das animações e de como cada uma será portada.
- Código minificado ou empacotado do clone deve ser **reescrito em TypeScript limpo e tipado**, sem colar blocos minificados.

---

## 4. Animações de scroll (prioridade máxima)

### Arquitetura

Centralize tudo em `src/app/core/animations/`:

- `scroll-animation.service.ts`: inicializa a biblioteca (ex.: GSAP + ScrollTrigger, Lenis), registra plugins, faz o refresh e expõe utilitários;
- diretivas reutilizáveis aplicadas no template, por exemplo `appReveal`, `appParallax`, `appSplitText`, `appPinSection`, `appImageMask`, `appImageZoom`, `appHorizontalScroll`, `appBgShift`, `appMarquee`. Cada padrão encontrado no clone vira uma diretiva configurável por `input()`.

Se o clone usar GSAP/ScrollTrigger/Lenis/Locomotive, use a mesma lib via npm (versão atual, licença compatível). Se usar animação própria com `IntersectionObserver` ou CSS, reimplemente da mesma forma, sem lib extra.

### Regras obrigatórias

- **Compatível com SSR:** nenhum acesso a `window`, `document` ou `gsap` no servidor. Inicialize com `afterNextRender()` ou proteja com `isPlatformBrowser()`.
- **Fora da zona do Angular:** rode loops e listeners de scroll dentro de `NgZone.runOutsideAngular()`.
- **Limpeza:** todo ScrollTrigger, timeline, observer e instância do Lenis é destruído no `DestroyRef.onDestroy` (use `gsap.context()` + `ctx.revert()`).
- **Conteúdo visível sem JS:** o estado inicial "escondido" só pode ser aplicado depois que o JS iniciar (ex.: classe `.js-anim` no `<html>`). O HTML do SSR precisa ser legível e indexável sem animação.
- **Loader/intro** (se houver no clone): curto (no máximo ~1,5s), sem bloquear o LCP, e não deve se repetir na mesma sessão.
- **`prefers-reduced-motion: reduce`:** desligue parallax, pin, scrub, zoom, marquee e smooth scroll; mostre o conteúdo direto ou com um fade curto.
- **Desempenho:** anime só `transform` e `opacity` (e `clip-path` quando necessário). Nada de animar `top`, `left`, `width`, `height` ou `margin`. Use `will-change` com moderação e remova depois. Meta: 60 fps num celular intermediário.
- **Sem CLS:** reserve o espaço dos elementos animados com `aspect-ratio` nas imagens. Animação nunca empurra layout.
- **Mobile:** simplifique onde preciso (pins longos, scroll horizontal e parallax pesado viram reveals ou carrossel com swipe abaixo de 768px), via `gsap.matchMedia()` ou `matchMedia`. Cursor customizado só em dispositivos com `pointer: fine`.
- **Âncoras e smooth scroll:** os links do menu devem rolar até a seção certa com o smooth scroll ativo, compensando a altura do header fixo, e o foco deve ir para a seção (acessibilidade).
- **Recalcule os gatilhos** depois que imagens e fontes carregarem (`ScrollTrigger.refresh()`).

---

## 5. Design

- **Direção de arte:** luxo discreto, ateliê, "feito à mão". Pense em revista de moda masculina: fotos grandes e sangradas, tipografia editorial, muito espaço negativo, detalhes em close (tesoura, fita métrica, giz de alfaiate, linha, botões, tramas de tecido).
- **Paleta:** extraia a cor principal do logo em `public/`. Direção sugerida: base escura (preto profundo, grafite ou azul-marinho) alternando com seções claras (off-white, linho, areia), com um destaque discreto (dourado envelhecido, conhaque ou bordô) vindo do logo. Use as trocas de cor de fundo do clone para alternar entre escuro e claro.
- **Tipografia:** uma serifada de alto contraste para títulos (ex.: Cormorant Garamond, Playfair Display, Bodoni Moda ou Fraunces) e uma sans limpa para texto (ex.: Inter, Manrope ou Jost), carregadas com `font-display: swap`, de preferência hospedadas localmente. Use títulos grandes e fluidos com `clamp()` e caixa-alta espaçada em rótulos e eyebrows.
- **Imagens:** use **somente** as de `public/`. Liste os arquivos antes de usar e escolha cada foto pela função (hero, close de tecido, processo, peça pronta). **Nunca invente caminhos de arquivo.** Se faltar imagem para alguma seção, avise e use um bloco tipográfico em vez de um placeholder feio.
- **Responsividade total:** teste em 320, 375, 414, 768, 1024, 1280, 1440, 1920 e 2560px. Mobile-first. Áreas de toque com no mínimo 44×44px. Sem rolagem horizontal involuntária em nenhuma largura.

---

## 6. Conteúdo e regras de marca

- **Honestidade (Código de Defesa do Consumidor):** nada de afirmações que não possam ser comprovadas ("o melhor alfaiate do Brasil", "entrega em 24h"), números inventados ("+5.000 clientes", "20 anos de tradição") ou depoimentos fictícios. Depoimentos só entram se o usuário fornecer textos reais e autorizados.
- **Preços:** não exiba preços nem "a partir de" sem o usuário informar. A conversão é o agendamento.
- **Tecidos e marcas de tecelagem** (ex.: Vitale Barberis Canonico, Loro Piana, Ermenegildo Zegna): só cite se o usuário confirmar que trabalha com elas.
- **Escopo:** os produtos confirmados são **ternos e camisas sob medida**. Outros serviços (blazers avulsos, calças, smoking, trajes de noivo, ajustes) só entram se o usuário confirmar; enquanto isso, ficam como `TODO` em `site-content.ts` e fora da página.

### Dados que não podem ser inventados

Nunca invente telefone/WhatsApp, e-mail, endereço, cidade, horário de atendimento, redes sociais, prazos de entrega, preços, ano de fundação ou história do Davi Alencar. Centralize tudo em `src/app/core/data/site-content.ts` e use placeholders explícitos, por exemplo `'TODO: prazo médio de confecção'`. **No fim de cada tarefa, liste os TODOs pendentes.**

---

## 7. SEO (obrigatório)

- `<html lang="pt-BR">`, **um único `<h1>`** (no hero), hierarquia de headings correta e HTML semântico (`header`, `nav`, `main`, `section` com `aria-labelledby`, `footer`). O título visual do hero pode ser poético, mas o `<h1>` precisa conter os termos principais (ex.: "Ternos e camisas sob medida"); se for preciso, use um texto acessível complementar.
- **`SeoService`** usando `Title` e `Meta`: title com até ~60 caracteres, meta description com 140–160, canonical, robots, theme-color.
- **Open Graph e Twitter Card** com `public/og-image.jpg` (1200×630) usando uma foto forte da marca.
- **JSON-LD injetado no SSR:** `ClothingStore` (ou `LocalBusiness`) com nome, logo, imagem, `areaServed`, `makesOffer` com `Offer`/`Service` para "Terno sob medida" e "Camisa sob medida" (sem preço inventado), mais `FAQPage` para a seção de FAQ e `WebSite`. Endereço, telefone, horário e geo entram **somente com dados reais**; campos sem dado ficam fora do schema.
- `public/robots.txt` e `public/sitemap.xml` com a URL de produção (`TODO` se ainda não houver domínio).
- **Favicons completos** (`ico`, `svg`, `apple-touch-icon`, `site.webmanifest`).
- **`alt` descritivo** em todas as imagens de conteúdo (ex.: "Terno azul-marinho sob medida em lã fria, detalhe da lapela") e `alt=""` nas decorativas.
- **Palavras-chave naturais** no texto: "alfaiataria", "alfaiate", "terno sob medida", "camisa sob medida", "roupa sob medida masculina", "terno para casamento", "terno para noivo", mais a cidade quando ela for informada. Sem repetição forçada.
- **Core Web Vitals:** LCP < 2,5s, CLS < 0,1, INP < 200ms. Pré-carregue a imagem e a fonte do hero, use `loading="lazy"` e `@defer` abaixo da dobra (sem quebrar o SSR do texto) e comprima as imagens (o site é pesado em fotos, então isso é crítico).
- **Meta Lighthouse (mobile):** ≥ 90 em Performance e ≥ 95 em Acessibilidade, Boas Práticas e SEO.

---

## 8. Acessibilidade

- **WCAG 2.2 AA:** contraste ≥ 4.5:1 no texto (atenção ao texto sobre fotos: use overlay ou gradiente), foco visível, navegação completa por teclado, link "Pular para o conteúdo".
- **Menu mobile acessível** (`aria-expanded`, `aria-controls`, trap de foco, fechar com Esc).
- **Carrosséis, galerias e lookbook** navegáveis por teclado, com pausa em autoplay/marquee e `aria-label` nos controles.
- **Formulário** com `<label>`, mensagens de erro associadas (`aria-describedby`) e checkbox de consentimento LGPD com link para a política de privacidade.

---

## 9. Comandos

```bash
npm install
npm start                 # ng serve
npm run build             # build de produção (com prerender)
npm run serve:ssr:<app>   # testar o SSR localmente (nome no package.json)
npx ng lint               # se configurado
```

---

## 10. Definição de pronto

Uma tarefa só está pronta quando:

- [ ] `npm run build` termina sem erros nem warnings novos;
- [ ] o HTML pré-renderizado (`dist/.../index.html`) contém todo o texto, as metatags e o JSON-LD;
- [ ] não há acesso a `window`/`document` no servidor (nenhum erro no console do SSR);
- [ ] as animações funcionam, são destruídas corretamente e respeitam `prefers-reduced-motion`;
- [ ] o layout foi verificado em todas as larguras da seção 5;
- [ ] nada de `src/clone` foi parar no bundle;
- [ ] o texto respeita a seção 6 (nada de números, preços, prazos ou depoimentos inventados);
- [ ] a lista de TODOs de conteúdo pendente foi informada ao usuário.
