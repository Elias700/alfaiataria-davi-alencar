# Análise do clone — Fase 0

Referência: `src/clone` (mirror Webflow gerado pelo vibecloner). **Somente o comportamento de movimento será portado.** Nenhum texto, imagem, fonte (Typekit/Maison Neue), logo, nome ou layout de marca do site original entra no projeto.

Fonte principal analisada: `src/clone/mirror/assets.slater.app/slater/20164/60900.qo531e0.js` (script customizado, ~59 KB minificado, ~2.700 linhas formatado), mais `index.html` (CSS inline, atributos `data-*`), o CSS Webflow e os screenshots.

---

## 1. Bibliotecas encontradas

| Lib | Versão no clone | Uso no clone | Decisão |
| --- | --- | --- | --- |
| GSAP core | 3.15 | Todas as animações | **Usar** (`gsap` via npm, versão atual) |
| ScrollTrigger | 3.15 | Gatilhos, scrub, pin, horizontal | **Usar** |
| SplitText | 3.15 | Split em chars/words/lines com `mask` | **Usar** (gratuito desde 3.13, incluso no pacote `gsap`) |
| CustomEase | 3.15 | 8 easings nomeadas | **Usar** (ou cubic-bezier equivalente) |
| Lenis | 1.3.21 | Smooth scroll global + scroll local em modais | **Usar** (`lenis` via npm) |
| Barba.js | — | Transição entre páginas | Não usar (one-page; a Política de Privacidade abre em modal) |
| Lottie | 5.12.2 | Logo de créditos do estúdio | Não usar (é identidade de terceiros) |
| Swiper | — | `initCarousel` (não usado na home) | Não usar |
| jQuery / Webflow.js / GTM / FB Pixel / Typekit | — | Infra do Webflow e tracking | Não usar |

Não há cursor customizado no clone, então não haverá cursor customizado no site (AGENTS §2: "cursor (se houver no clone)").

## 2. Constantes de movimento (viram tokens)

| Token | Valor | Origem |
| --- | --- | --- |
| `durS` | 0.4s | saídas/hides |
| `durM` | 0.8s | hovers, modais, transições |
| `durL` | 1.2s | reveals principais |
| `stagger` | 0.1s | entre itens |
| `delayReveal` | 0.3s | atraso padrão de reveal |
| breakpoint desktop | 992px | efeitos pesados só ≥ 992px (`gsap.matchMedia`) |

| Easing | cubic-bezier | Uso |
| --- | --- | --- |
| `InOut` | `0.75, 0, 0.25, 1` | máscaras de imagem, tabs, menu |
| `Out` | `0.25, 1, 0.5, 1` | reveals de texto, hovers |
| `In` | `0.5, 0, 0.75, 0` | saídas, zoom de saída |
| `Ease` | `0.25, 0.1, 0.25, 1` | hover de nav, snap, hero flow |
| `Write` | `0.333, 0, 0.667, 1` | (reservado) |
| `diveIn` | `0.6, 0, 0, 1` | abertura final do loader |
| `horScroll` | `0.25, 0, 0.75, 1` | scroll horizontal |
| `loaderEase` | path customizado (progresso em degraus) | barra de progresso do loader |

Lenis global: `duration 1.2`, `easing t => min(1, 1.001 - 2^(-10t))` (expo-out), `touchMultiplier 2`, sincronizado com `gsap.ticker` e `lagSmoothing(0)`. Refresh de todos os triggers em `resize` com debounce de 40ms.

---

## 3. Inventário de animações e interações

Gatilho padrão dos reveals: `ScrollTrigger` com `start: 'top bottom'`, `once: true`; o estado inicial é aplicado via JS (`'initial'`), o que bate com a regra `.js-anim` do AGENTS.

| # | Nome (função de origem) | Seletor no clone | Gatilho | Duração · easing · stagger | Mobile (< 992px) |
| --- | --- | --- | --- | --- | --- |
| A1 | Loader intro (`animatePreloaederIntro`) | `[data-preloader]`, vars CSS `--arch-w/--arch-y`, `.preloader_progress_track`, `.hero-w_bg_master_img` | load, 1ª visita (`sessionStorage.hasVisited`) | textos 1.2 Out → progresso 4s `loaderEase` → máscara abre 1.5s `InOut` → sai 2.4s `diveIn`; imagem do hero 0.75→1. **Total ≈ 9s** | máscara 40vw→50vw, hero scale 1.15 |
| A1b | Loader curto (`animatePreloaederShort`) | idem, sem textos/progresso | visitas seguintes | ≈ 3s | idem |
| A2 | Smooth scroll (`initLenis`, `initLocalLenis`) | `window`, `[data-lenis-scroll]` | sempre | ver §2 | ativo (touchMultiplier 2) |
| A3 | Texto "a" — chars em flip X (`animateTextA`) | `[data-scroll-reveal="a"]` | top bottom, once | `opacity 0, rotateX 90, x 10rem → 0` · 1.2 Out · stagger 0.1 | igual |
| A4 | Texto "h" — chars em flip Y (`animateTextH`) | `[data-scroll-reveal="h"]` (23×) | top bottom, once | `opacity 0, yPercent 50, rotateY 90 → 0` · 1.2 Out · stagger 0.05 | igual |
| A5 | Texto "p" — linhas com máscara (`animateTextP`) | `[data-scroll-reveal="p"]` (55×) | top bottom, once | `yPercent 110 → 0` · 1.2 Out · stagger 0.1 | igual |
| A6 | Container "ctn" (`animateCtn`) | `[data-scroll-reveal="ctn"]` | top bottom, once | `opacity 0, y 3.333rem → 0` · 1.2 Out · stagger 0.1 | deslocamento maior (11.54rem) |
| A7 | Linha "line" (`animateLine`) | `[data-scroll-reveal="line"]` | top bottom, once | `clip-path inset(0 0 100% 0) → inset(0)` · 1.2 Out | igual |
| A8 | Máscara de imagem "slide" (`animateSlide`) | `[data-scroll-reveal="slide"]` (13×) | top bottom, once | wrapper: `polygon` diagonal → retângulo; img interna `scale 1.5, xPercent 25 → 1, 0` · 1.2 `InOut` | igual |
| A9 | Parallax (`initAllParallax`) | `[data-parallax="img/img-in/img-out/ctn-up/ctn-down"]` | scrub 0.5 | img `yPercent -15 → 15`; img-in `-20 → 0`; img-out `0 → 20`; ctn ±10 | desligável por `data-mob="off"` |
| A10 | Hero flow (`initTranistionFlow` › hero) | `.hero-scroll-area` (área alta), `.hero-s`, `.hero-w_bg` | top top → bottom bottom, scrub | conteúdo e fundo sobem; depois fundo `scale 1 → 2` (origin 50% 75%) · `Ease`/`In` | só o zoom |
| A11 | Troca de tema do header (`initThemeChange`) | `[data-theme]` × `[data-bg="light/dark/color"]` | quando a seção cruza o centro de cada elemento fixo | troca de classe `theme_on-*` (transição CSS) | igual |
| A12 | Snap de seções (`initSnapSections`) | `[data-snap]` (2×) | 40ms após parar o scroll; seção > 50% visível | `lenis.scrollTo` 1.2 `Ease` | desligado |
| A13 | Espaçamento de palavras (`[data-circle-text]`) | `.benefits-intro-w` | top bottom → bottom top, scrub | `word-spacing 0 → 10rem` | igual |
| A14 | Bloco que cresce (`.loc-info-w`) | `.loc-info-s` | top 30% → bottom bottom, scrub 0.5 | `opacity 0, scale .75 → 1`; textos p/ctn com reveal no enter e hide no leave-back | igual |
| A15 | Scroll horizontal (`.loc-scroll-area`) | track `.loc-scroll-area_track`; altura = `scrollWidth` | 2.5% top → 97.5% bottom, scrub 0.25 | `x: -(scrollWidth - width)` · `horScroll`; linhas do título com `xPercent` alternado (`wrap[-5,25,-15] → [5,-25,25]`); reveals internos via `containerAnimation` | **desligado** (layout vertical) |
| A16 | Desenho por clip horizontal (`.img.loc-path`) | imagem de trajeto | once dentro do horizontal | `inset(0 100% 0 0) → inset(0)` · 2.4s Out · delay .8 | igual |
| A17 | Zoom-out de fundo (`.loc-w_bg_img`) | `.loc-w` | top bottom → bottom bottom, scrub 0.25 | `scale 1.15 → 1` (origin bottom) | igual |
| A18 | Zoom de saída (`.amen-scroll-area`) | `.amen-cms`, `.amen-w` | top top → bottom bottom, scrub | `scale 1 → 2` + `opacity 1 → 0` · In | igual |
| A19 | Janela que se abre (`.arch-scroll-area`) | `.arch-intro-s_bg_l/_r` (clip-path polygon), `.arch-w` | top bottom → 200% top, scrub | duas metades abrem um vão (polygon), depois `scale 1 → 1.84` e o conteúdo interno `.75 → 1`; texto h/p revela em 30%; imagem `yPercent 25` | **desligado** |
| A20 | Clip do CTA final (`[data-footer-clip]`) | imagem do CTA + `.footer-s` | top 30% → bottom bottom, scrub 0.5 | imagem `inset(0) → inset(8% 22%)`; conteúdo `opacity 0, scale .75 → 1` | inset `4% 32%` |
| A21 | Indicador "scroll" (`.s-down`) | seta lateral | perto do footer, scrub | `opacity → 0` | — |
| A22 | Barra de progresso (`initScrollBar`) | `[data-s-bar]`, thumb arrastável, rótulo "00–100" | onUpdate | `--progress` + contador | desligado |
| A23 | Selo giratório do logo (`initLogo`) | `.header-logo_bg` (texto circular) | sempre | gira 30°/s; velocidade e direção seguem a velocidade do Lenis | igual |
| A24 | Botão magnético (`initMagneticEffect`) | `[data-magnetic-btn]` | mousemove | segue o ponteiro (`strength 25`), volta com `elastic.out(1, .3)` 1.6s | desligado |
| A25 | Hover de nav — chars rolando (`initNavItemHover`) | `[hover-nav-item]` (30×) | mouseenter/leave | 2 cópias do texto; chars `yPercent 0 → -100` / `100 → 0`, stagger proporcional à posição · .8 `Ease` | — |
| A26 | Hover de link (`initLinkHover`) | `[hover-link]` | mouseenter/leave | chars `rotateY` trocam + sublinhado `scaleX 1 → 0 → 1` | — |
| A27 | Hover de botão circular (`initBtnCircleHover`) | `[hover-btn-circle] [data-arc]` | mouseenter/leave | arco SVG `stroke-dasharray` 4% → 50% · .8 InOut | — |
| A28 | Pins com pulso (`initPins`) | `[data-pin]`, `[data-pin-pulse]` | contínuo + hover | anéis `scale 1 → 1.6` + fade, repeat; "+" gira -90° | igual |
| A29 | Card com partes no hover (`initCardParts`) | `[hover-card]` | mouseenter/leave | h/p/line do card com reveal/hide | conteúdo visível |
| A30 | Acordeão (`initAccordion`) | `[data-accordion-card]` | click | altura `0 → auto` 1.2 Out; ícone `rotate -45`; texto p com reveal | igual |
| A31 | Slider com autoplay (`initSlider`) | `[data-slider]` | autoplay 6s quando ≥ 20% visível; pausa com aba oculta | barra de progresso linear; slide sai/entra com A8 + textos A4/A5; contador atual/total | igual |
| A32 | Tabs do hero (`initTabsHero`) | `[data-tabs-hero]` (Dia/Noite) | click | crossfade da imagem .8 InOut; divisória muda de lado | igual |
| A33 | Tabs de conteúdo + destaque (`initTabs`, `initTabsHilight`) | `[data-tabs]`, `[data-tab-hilight]` | click | conteúdo troca com A4/A5/A6/A8; indicador desliza (x/width) | igual |
| A34 | Modal CTA (`initModalCta`) | `[data-modal-cta]` | click | card `scale 0, rotateX -90, yPercent -100, rotate -25 → 0` · 1.2 Out; saída rotaciona para baixo | igual |
| A35 | Menu em modal (`initModalMenu`) | `[data-modal-menu]` | click/Esc | overlay fade, ícone vira X (±45°), links com A3/A4/A5/A6; trava o scroll | igual |
| A36 | Dicas flutuantes (`initFloatingTips`) | `[floating-tip]` | hover | tooltip segue o ponteiro (2.4s power3) | desligado |
| A37 | Lightbox com zoom (`initLightbox`, `initImageZoom`) | `[data-lightbox]` | click | abre `scale .5 → 1`; prev/next desliza ±125%; zoom por clique + pan com mouse (desktop), pinça e duplo toque (mobile) | pinça/duplo toque |
| A38 | Marquee CSS (`[data-marquee-css]`) | nuvens no `.loc-w` | contínuo | `translateX(-50%) → 0`, 32s linear infinite | igual |
| A39 | Fit text (`fitText`) | `[data-fit-text]` | load/resize | fonte ajustada para ocupar 100% da largura | igual |
| A40 | Contador de índice (`initIndexCounter`) | `[data-index="text"]` | load | "1.0", "2.0"… | igual |
| A41 | Vídeo play/pause por scroll | `[data-video-playpause]` | enter/leave | play/pause | igual |
| A42 | Banner de cookies (`initCookies`) | `[data-cookies]` | 0.3s após load | `yPercent 100 → 0` | igual |
| A43 | Label flutuante de formulário (`initForm`) | `.input_field` | focus/blur | classe `focused` | igual |
| — | Filtro, ordenação, select, reset, carousel Swiper, transições Barba, Lottie | listagem de apartamentos / multipágina | — | — | **Não portados**: sem equivalente numa landing de alfaiataria |

---

## 4. Mapeamento → seções do novo site → diretivas Angular

Ordem proposta (a da Fase 2, com uma troca justificada abaixo):

| Seção | Animações do clone | Implementação Angular |
| --- | --- | --- |
| **0. Loader** (1ª visita) | A1 adaptado: o monograma "DA" se desenha (traço SVG ou máscara) e a "janela" abre sobre o hero (vars CSS de largura e posição, como o arco do clone, porém em formato de **cortina de provador** retangular); hero entra com scale 0.92 → 1. **Encurtado para ≤ 1,5s**, sem barra de progresso. Visitas seguintes: A1b com ~0,6s ou nenhum loader | `LoaderComponent` + `ScrollAnimationService.lock/unlock()` |
| **1. Header fixo** | A11 (tema claro/escuro/destaque conforme a seção), A23 (selo circular "ALFAIATARIA · DAVI ALENCAR ·" girando com a velocidade do scroll, monograma no centro), A25 (hover dos links), A24 (CTA magnético), A35 (menu em tela cheia, mobile e desktop) | `HeaderComponent`, `MenuComponent`, `appBgShift` (seções) + `appThemeTarget` (header), `appRotatingBadge`, `appHoverRoll`, `appMagnetic` |
| Trilho lateral | A22 (progresso 00–100 + "ROLE" + seta) e A21 (some perto do fim). Só desktop | `ScrollProgressComponent` |
| **2. Hero** | A3 no título editorial gigante (chars em flip), A10 (área de scroll alta: conteúdo sobe, foto dá zoom 1 → 2 ao sair), A32 (alternância **Ternos / Camisas** troca a foto de fundo com crossfade), A27 (CTA circular "Agendar"), A12 (snap só aqui, desktop) | `HeroComponent`, `appSplitText="chars-flip"`, `appHeroFlow`, `appCircleHover`, `appSnapSection` |
| **3. Manifesto / A Alfaiataria** | A13 (palavras de "sob · medida · para · você" se afastam no scrub), A5 (linhas do texto; **variante scrub** palavra a palavra, opacidade 0.15 → 1, pedida no prompt), A9 (fotos de detalhe em parallax `img` e `ctn-up/down`), A7 (linhas divisórias) | `appWordSpread`, `appSplitText="lines"` / `appScrubWords`, `appParallax`, `appReveal="line"` |
| **4. Ternos sob medida** | A8 (fotos com máscara diagonal), A17 (foto principal com zoom-out 1.15 → 1), A28 + A36 (**pontos pulsantes sobre a foto do terno**: lapela, botões, bolso, colete, com dica que segue o cursor no desktop e lista no mobile), A33 (abas de personalização com indicador deslizante) | `appImageMask`, `appImageZoom`, `HotspotComponent`, `TabsComponent` |
| **5. Camisas sob medida** | A19 (no desktop, duas metades abrem a "janela" que revela a gola em close, depois a foto fica fixa enquanto o texto rola), A18 (zoom de saída da lista de personalização). Mobile: A8 + A5 | `appPinSection` (timeline configurável) |
| **6. O processo sob medida** | A15 (pin + scroll horizontal com 5 etapas; título com linhas em xPercent alternado), A40 (01–05 grandes), A16 (um "fio de costura" SVG/clip que se desenha atravessando as etapas), reveals internos via `containerAnimation`. Mobile < 992px: pilha vertical com reveals (ou swipe nativo com scroll-snap) | `appHorizontalScroll`, `appReveal` com `containerAnimation` |
| **7. Tecidos** | A38 (marquee de palavras, 32s, reverse), zoom de hover nas texturas (scale 1.1 · .8 Out, padrão do lightbox), A6 | `appMarquee`, `appImageZoom` (modo hover) |
| **8. Lookbook** | A31 (slider editorial com autoplay de 6s, barra de progresso, contador "01 / 04", troca com A8 + A4), A37 (lightbox com zoom) | `LookbookComponent`, `LightboxComponent` |
| **9. Ocasiões** | A29 (no hover do card, título, texto e linha revelam; troca de imagem quando houver fotos) | `appHoverCard` |
| **10. FAQ** | A30 (acordeão: um aberto por vez, ícone gira, texto revela com A5; `ScrollTrigger.refresh()` ao fim) | `FaqComponent` (`<button aria-expanded>`) |
| **11. Agendamento** | A14 (bloco cresce 0.75 → 1 com opacidade no scrub; textos revelam no enter e escondem no leave-back), A20 (foto de fundo encolhe em `inset(8% 22%)` enquanto o conteúdo cresce), A43 (labels flutuantes), A24 (botão de WhatsApp magnético) | `BookingComponent`, `appClipShrink`, `appGrowIn` |
| **12. Footer** | A39 (wordmark "DAVI ALENCAR" ocupando a largura inteira), A38 (marquee opcional), A26 (hover dos links) | `FooterComponent`, `appFitText`, `appHoverLink` |
| FAB WhatsApp | A24 + entrada com A6 após sair do hero | `WhatsappFabComponent` |
| Política de Privacidade | A34 (modal com rotação 3D) + A2 local (Lenis dentro do modal) | `PrivacyModalComponent` |
| Aviso de cookies | A42, **só se** houver analytics/cookies não essenciais (hoje não há) | fica fora por enquanto |

**Ajustes feitos na implementação (Fase 2–4):**

- **A12 (snap de seções) não foi portado.** Ele disputa o controle do scroll com as áreas com scrub (hero, camisas, processo) e "puxa" a página contra a vontade do usuário.
- **A22:** o trilho de progresso foi portado sem o "arrastar a barra"; é decorativo (`aria-hidden`) e a rolagem nativa continua disponível.
- **A13:** o clone anima `word-spacing`; aqui o mesmo efeito usa `transform` em cada palavra, sem recalcular layout.
- **A3 no hero:** feito em CSS puro, com as letras já no HTML do SSR. A entrada começa na primeira pintura sem esperar o JS, o que é bom para o LCP.
- **A1 (loader):** CSS puro, 1,5 s, só na primeira visita da sessão.
- **A30, A31, A33, A34, A35, A37:** interações de UI (acordeão, slider, abas, modal, menu, lightbox) feitas com CSS + signals, sem GSAP.
- **A11 (troca de tema):** usa IntersectionObserver, então funciona também com movimento reduzido.
- **Inicialização:** o GSAP/Lenis só carrega na primeira interação ou quando o navegador fica ocioso, e cada texto só é dividido pelo SplitText perto de entrar na tela.

**Troca de ordem justificada:** nenhuma em relação à Fase 2. O processo (pin + horizontal, a animação mais forte depois do hero) fica no meio da página, como no clone, separado do hero por três seções verticais. Assim os dois "momentos fixos" não ficam colados.

### Diretivas e serviços (em `src/app/core/animations/`)

- `scroll-animation.service.ts`: registra os plugins, cria os easings (§2), inicia o Lenis (sincronizado com `gsap.ticker`), faz `refresh` após fontes, imagens e resize, e expõe `lock()`, `unlock()`, `scrollTo(el)` (compensa o header e move o foco) e `isReducedMotion`. Tudo dentro de `afterNextRender` + `runOutsideAngular`.
- Base comum: cada diretiva cria um `gsap.context()` em `afterNextRender` e chama `ctx.revert()` no `DestroyRef`. Com `prefers-reduced-motion: reduce`, não faz nada (o conteúdo já está visível) ou aplica fade de 0.3s.
- `appSplitText` (`chars-flip` = A3, `chars` = A4, `lines` = A5, `scrub-words`), `appReveal` (`ctn` = A6, `line` = A7), `appImageMask` (A8), `appParallax` (A9, 5 variantes), `appHeroFlow` (A10), `appBgShift` + `appThemeTarget` (A11), `appSnapSection` (A12), `appWordSpread` (A13), `appGrowIn` (A14), `appHorizontalScroll` (A15/A16), `appImageZoom` (A17/A18 e hover), `appPinSection` (A19), `appClipShrink` (A20), `appRotatingBadge` (A23), `appMagnetic` (A24), `appHoverRoll` (A25), `appHoverLink` (A26), `appCircleHover` (A27), `appHoverCard` (A29), `appMarquee` (A38, CSS puro com pausa), `appFitText` (A39).

---

## 5. Assets em `public/`

| Arquivo | Formato real | Dimensões | Conteúdo | Uso pretendido |
| --- | --- | --- | --- | --- |
| `snapinsta-1795105996045.jpg` | JPEG | 1440×1920 | Homem sorrindo, sentado em poltrona chesterfield, terno azul-marinho de três peças, lapela pontiaguda; ao fundo, manequins com ternos e araras do ateliê | **Hero** (aba "Ternos") e `og-image` (recorte 1200×630) |
| `snapinsta-1795105753857.jpg` | JPEG | 1440×1799 | Mesmo homem de terno cinza, segurando tesoura de alfaiate e fita métrica, fundo cinza de estúdio | **Manifesto** (o ofício) e etapa "Tomada de medidas" do processo |
| `snapinsta-1795105792600.jpg` | **WebP** (extensão errada) | 1440×1440 | Close de camisa azul-marinho listrada com etiqueta "Davi Alencar Alfaiataria" dourada | **Camisas** (janela A19) e aba "Camisas" do hero |
| `snapinsta-1795106272325.jpg` | **WebP** (extensão errada) | 1440×1440 | Close de camisa azul-clara listrada, etiqueta da marca, fita métrica e papéis coloridos | **Camisas** / **Tecidos** (textura) |
| `snapinsta-1795105900797.jpg` | JPEG | 1080×1080 | Monograma "DA" branco num círculo azul-marinho | Fonte do favicon, apple-touch-icon e ícones do webmanifest. Não é foto de conteúdo |
| `Monograma DA em Caligrafia Branca.png` | PNG | 1254×1254 | Monograma "DA" branco com textura "pincel" nas bordas | Loader, selo do header, footer |
| `favicon.ico` | ICO | — | Favicon padrão do Angular | Substituir |

**Paleta extraída do logo e das fotos** (a confirmar por amostragem de pixel na Fase 1):

- base escura: azul-marinho profundo do círculo do logo (≈ `#08102A`);
- azul da etiqueta (≈ `#1C2B55`), para superfícies;
- destaque: dourado envelhecido do bordado da etiqueta (≈ `#C6A24E`);
- tema "cor" (o 3º tema do clone): conhaque/couro da chesterfield (≈ `#4A2018`);
- seções claras: linho/off-white (≈ `#F2EFE8`).

### Fotos que faltam

| Seção | Situação | Plano enquanto não houver foto |
| --- | --- | --- |
| Ternos | Só há o terno vestido no hero. Faltam a peça inteira e closes (lapela, botões, forro, bolso, casas de botão) | Reusar a foto do hero recortada para os pontos pulsantes. Personalização vira bloco tipográfico |
| Processo (5 etapas) | Só a etapa "medidas" (tesoura e fita) | Etapas sem foto viram cards tipográficos com número grande e o fio de costura |
| Tecidos | Não há closes de tramas de lã/linho; só tecido de camisa | 2 recortes das camisas + bloco tipográfico + marquee |
| Lookbook | 4 fotos no total, todas já usadas em outras seções | Ver pergunta 3 |
| Ocasiões | Nenhuma foto de casamento, trabalho ou evento | Cards tipográficos, sem troca de imagem no hover |
| Ateliê (fachada/interior) | Só aparece ao fundo do hero | — |
| Monograma vetorial | Só PNG/JPG com bordas texturizadas | O "desenho" do loader fica mais bonito com SVG. Sem SVG, uso uma máscara revelando o PNG |

---

## 6. Ajustes de projeto detectados

- **Tailwind** está em `devDependencies` e conflita com o AGENTS ("sem Tailwind"). Plano: remover `tailwindcss` e `@tailwindcss/postcss` (e a config PostCSS, se houver) e migrar `styles.css` para `styles.scss`.
- **SSR** ausente: `ng add @angular/ssr` + prerender de `/`.
- `src/clone` (260 MB) precisa ir para `exclude` no `tsconfig.app.json`.
- **Nomes de arquivo** de `public/` têm espaço e extensão errada. Plano: mover os originais para `assets-src/` (fora do build) e gerar versões otimizadas em `public/images/` com nomes kebab-case (`hero-terno-azul-marinho.avif` etc.), em AVIF e WebP com 3 a 4 larguras. Para isso vou instalar `sharp` como devDependency (justificativa: conversão e redimensionamento das fotos, que é crítico para o LCP).
