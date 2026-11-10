// js/index.js — carregado com <script type="module"> (deferido, modo estrito, sem globais)

const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const scrollBehavior = () => (prefersReducedMotion() ? 'auto' : 'smooth');

/* ==========================================================================
   Fábricas de DOM compartilhadas pelos carrosséis
   ========================================================================== */
function createIcon(name) {
    const icon = document.createElement('span');
    icon.className = 'material-symbols-outlined';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = name;
    return icon;
}

function createArrow(direction, label) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `carousel-arrow carousel-arrow--${direction}`;
    button.setAttribute('aria-label', label);
    button.append(createIcon(direction === 'prev' ? 'chevron_left' : 'chevron_right'));
    return button;
}

function createDot(index, label) {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'dot';
    dot.dataset.index = String(index);
    dot.setAttribute('aria-label', label);
    return dot;
}

function setActiveDot(container, current) {
    container.querySelectorAll('.dot').forEach((dot, i) => {
        const isActive = i === current;
        dot.classList.toggle('active', isActive);
        if (isActive) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
    });
}

/* ==========================================================================
   Voltar ao topo
   ========================================================================== */
/**
 * "Voltar ao Topo": rola até o topo e move o foco para o header,
 * para que usuários de teclado e leitor de tela não fiquem presos no rodapé.
 */
function setupBackToTop() {
    const button = document.getElementById('backToTopBtn');
    const top = document.getElementById('top');
    if (!button || !top) return;

    button.addEventListener('click', () => {
        window.scrollTo({top: 0, behavior: scrollBehavior()});
        top.focus({preventScroll: true});
    });
}

/* ==========================================================================
   Menu de categorias
   ========================================================================== */
/**
 * Botão + painel (disclosure). Abre por hover (somente mouse), clique, toque e teclado.
 * Fecha com Esc (devolvendo o foco ao botão), clique fora e quando o foco sai do menu.
 */
function setupCategoryMenu() {
    const trigger = document.querySelector('.menu-trigger');
    if (!trigger) return;

    const panel = document.getElementById(trigger.getAttribute('aria-controls'));
    if (!panel) return;

    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');
    let closeTimer = 0;

    const setOpen = (open) => {
        clearTimeout(closeTimer);
        trigger.setAttribute('aria-expanded', String(open));
        panel.hidden = !open;
    };

    const scheduleClose = () => {
        clearTimeout(closeTimer);
        // 150ms deixam o cursor atravessar o espaço entre o botão e o painel
        closeTimer = setTimeout(() => setOpen(false), 150);
    };

    trigger.addEventListener('click', (event) => {
        const isOpen = trigger.getAttribute('aria-expanded') === 'true';
        const isMouseClick = canHover.matches && event.detail > 0;

        if (isMouseClick) {
            setOpen(true); // o hover já abriu: o clique não deve fechar
        } else {
            setOpen(!isOpen); // teclado e toque alternam
            if (!isOpen && event.detail === 0) panel.querySelector('a')?.focus();
        }
    });

    // Hover só para mouse (o toque emula eventos de mouse e conflitaria com o clique)
    [trigger, panel].forEach((element) => {
        element.addEventListener('pointerenter', (event) => {
            if (event.pointerType === 'mouse') setOpen(true);
        });
        element.addEventListener('pointerleave', (event) => {
            if (event.pointerType === 'mouse') scheduleClose();
        });
    });

    // Fecha quando o foco do teclado sai do botão e do painel
    document.addEventListener('focusin', (event) => {
        if (panel.hidden) return;
        if (!trigger.contains(event.target) && !panel.contains(event.target)) setOpen(false);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !panel.hidden) {
            setOpen(false);
            trigger.focus();
        }
    });

    document.addEventListener('click', (event) => {
        if (panel.hidden) return;
        if (!panel.contains(event.target) && !trigger.contains(event.target)) setOpen(false);
    });
}

/* ==========================================================================
   Carrossel do banner (um slide por vez, autoplay com botão de pausa)
   ========================================================================== */
const HERO_AUTOPLAY_MS = 6000;

function setupHeroCarousel(hero) {
    const viewport = hero.querySelector('.hero-viewport');
    const track = hero.querySelector('.hero-track');
    const controls = hero.querySelector('.hero-controls');
    const slides = track ? [...track.querySelectorAll('.hero-slide')] : [];
    if (!viewport || !controls || slides.length < 2) return;

    const total = slides.length;
    let current = 0;
    let timer = null;
    let userPaused = prefersReducedMotion(); // sem autoplay para quem prefere movimento reduzido
    let hovering = false;
    let focusInside = false;

    // --- Controles ----------------------------------------------------------
    const prev = createArrow('prev', 'Slide anterior');
    const next = createArrow('next', 'Próximo slide');
    viewport.append(prev, next);

    const dots = document.createElement('div');
    dots.className = 'carousel-indicators';
    slides.forEach((_, i) => dots.append(createDot(i, `Ir para o slide ${i + 1} de ${total}`)));

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'hero-toggle';
    const toggleIcon = createIcon('pause');
    toggle.append(toggleIcon);

    controls.append(dots, toggle);

    // --- Estado -------------------------------------------------------------
    const shouldAutoplay = () => !userPaused && !hovering && !focusInside && !document.hidden;

    const renderToggle = () => {
        toggleIcon.textContent = userPaused ? 'play_arrow' : 'pause';
        toggle.setAttribute(
            'aria-label',
            userPaused ? 'Iniciar rotação automática' : 'Pausar rotação automática'
        );
    };

    // Durante a rolagem animada o evento 'scroll' não pode devolver o índice ao slide antigo
    let ignoreScrollUntil = 0;

    const goTo = (index) => {
        current = (index + total) % total;
        ignoreScrollUntil = performance.now() + (prefersReducedMotion() ? 0 : 800);
        track.scrollTo({left: current * track.clientWidth, behavior: scrollBehavior()});
        setActiveDot(dots, current);
    };

    const stopTimer = () => {
        clearInterval(timer);
        timer = null;
    };

    // (Re)inicia ou para o autoplay; só anuncia a troca de slide quando não está girando sozinho
    const updateAutoplay = () => {
        stopTimer();
        const playing = shouldAutoplay();
        track.setAttribute('aria-live', playing ? 'off' : 'polite');
        if (playing) timer = setInterval(() => goTo(current + 1), HERO_AUTOPLAY_MS);
    };

    // --- Eventos ------------------------------------------------------------
    prev.addEventListener('click', () => {
        goTo(current - 1);
        updateAutoplay();
    });
    next.addEventListener('click', () => {
        goTo(current + 1);
        updateAutoplay();
    });

    dots.addEventListener('click', (event) => {
        const dot = event.target.closest('.dot');
        if (!dot) return;
        goTo(Number(dot.dataset.index));
        updateAutoplay();
    });

    toggle.addEventListener('click', () => {
        userPaused = !userPaused;
        renderToggle();
        updateAutoplay();
    });

    // Mantém os pontos sincronizados com swipe / trackpad
    let frame = 0;
    track.addEventListener(
        'scroll',
        () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                if (performance.now() < ignoreScrollUntil) return;
                const index = Math.round(track.scrollLeft / track.clientWidth);
                if (index !== current && index >= 0 && index < total) {
                    current = index;
                    setActiveDot(dots, current);
                }
            });
        },
        {passive: true}
    );

    // Pausa durante a interação ou com a aba oculta
    hero.addEventListener('mouseenter', () => {
        hovering = true;
        updateAutoplay();
    });
    hero.addEventListener('mouseleave', () => {
        hovering = false;
        updateAutoplay();
    });
    hero.addEventListener('focusin', () => {
        focusInside = true;
        updateAutoplay();
    });
    hero.addEventListener('focusout', (event) => {
        focusInside = hero.contains(event.relatedTarget);
        updateAutoplay();
    });
    document.addEventListener('visibilitychange', updateAutoplay);

    // Mantém o slide atual alinhado quando a largura muda
    new ResizeObserver(() => {
        track.scrollTo({left: current * track.clientWidth, behavior: 'auto'});
    }).observe(track);

    setActiveDot(dots, current);
    renderToggle();
    updateAutoplay();
}

/* ==========================================================================
   Carrossel das prateleiras (scroll-snap + setas e pontos gerados)
   ========================================================================== */
/**
 * Sem JS a prateleira continua rolável; setas e pontos são um incremento
 * e só aparecem quando há mais cards do que cabem na tela.
 */
function setupShelfCarousel(shelf) {
    const viewport = shelf.querySelector('.shelf-viewport');
    const track = shelf.querySelector('.shelf-carousel');
    const indicators = shelf.querySelector('.carousel-indicators');
    if (!viewport || !track || !indicators) return;

    const prev = createArrow('prev', 'Livros anteriores');
    const next = createArrow('next', 'Próximos livros');
    viewport.append(prev, next);

    const getStep = () => {
        const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
        return track.clientWidth + gap; // uma "página" de rolagem
    };

    const getMaxScroll = () => track.scrollWidth - track.clientWidth;

    const getPageCount = () => {
        const max = getMaxScroll();
        return max > 1 ? Math.ceil(max / getStep() - 0.001) + 1 : 1;
    };

    const getCurrentPage = () => {
        const last = getPageCount() - 1;
        if (track.scrollLeft >= getMaxScroll() - 1) return last;
        return Math.min(Math.round(track.scrollLeft / getStep()), last);
    };

    const sync = () => {
        setActiveDot(indicators, getCurrentPage());
        prev.disabled = track.scrollLeft <= 1;
        next.disabled = track.scrollLeft >= getMaxScroll() - 1;
    };

    const render = () => {
        const pages = getPageCount();
        const hasOverflow = pages > 1;

        indicators.hidden = !hasOverflow;
        prev.hidden = !hasOverflow;
        next.hidden = !hasOverflow;

        indicators.replaceChildren(
            ...Array.from({length: pages}, (_, i) =>
                createDot(i, `Página ${i + 1} de ${pages}`)
            )
        );
        sync();
    };

    let frame = 0;
    track.addEventListener(
        'scroll',
        () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(sync); // uma atualização por frame
        },
        {passive: true}
    );

    prev.addEventListener('click', () => {
        track.scrollBy({left: -getStep(), behavior: scrollBehavior()});
    });

    next.addEventListener('click', () => {
        track.scrollBy({left: getStep(), behavior: scrollBehavior()});
    });

    // Delegação de eventos: um listener por prateleira em vez de um por ponto
    indicators.addEventListener('click', (event) => {
        const dot = event.target.closest('.dot');
        if (!dot) return;
        track.scrollTo({
            left: Number(dot.dataset.index) * getStep(),
            behavior: scrollBehavior(),
        });
    });

    // Recalcula ao redimensionar (muda cards por tela); também dispara uma vez ao observar
    new ResizeObserver(render).observe(track);
}

/* ==========================================================================
   Modal de login (<dialog> nativo, criado uma única vez para todas as páginas)
   ========================================================================== */
// String ESTÁTICA: nunca interpole dados do usuário aqui (evita XSS).
const LOGIN_MODAL_HTML = `
<dialog class="modal" id="login-modal" aria-labelledby="login-title">
    <div class="modal-box">
        <button type="button" class="btn-close-modal" id="btn-close-login" aria-label="Fechar">
            <span class="material-symbols-outlined" aria-hidden="true">close</span>
        </button>

        <div id="login-view">
            <h2 class="modal-title" id="login-title">Entrar</h2>
            <!-- method="post": se o JS falhar, as credenciais nunca vão parar na URL -->
            <form id="form-login" class="modal-form" method="post" action="/login">
                <div class="form-group">
                    <label for="login-email">E-mail</label>
                    <input type="email" id="login-email" name="username" class="form-input"
                           placeholder="email@exemplo.com.br" autocomplete="off" required>
                </div>
                <div class="form-group">
                    <label for="login-password">Senha</label>
                    <div class="password-wrapper">
                        <input type="password" id="login-password" name="password" class="form-input"
                               autocomplete="new-password" required>
                        <button type="button" class="btn-toggle-password" id="toggle-password-btn"
                                aria-label="Mostrar senha">
                            <span class="material-symbols-outlined" id="toggle-password-icon"
                                  aria-hidden="true">visibility_off</span>
                        </button>
                    </div>
                </div>
                <div class="login-options-row">
                    <label class="checkbox-label">
                        <input type="checkbox" name="remember-me">
                        <span class="terms-text">Lembrar de mim</span>
                    </label>
                    <button type="button" class="link-inline btn-forgot-password" id="btn-show-forgot">
                        Esqueci minha senha
                    </button>
                </div>
                <div class="modal-actions">
                    <button type="submit" class="btn-primary btn-login-submit">ENTRAR</button>
                </div>
                <div class="modal-footer-text">
                    Ainda não possui uma conta? <a href="cadastro.html" class="link-inline">Crie uma</a>
                </div>
            </form>
        </div>

        <div id="forgot-password-view" hidden>
            <button type="button" class="btn-back-login" id="btn-back-login">
                <span aria-hidden="true">&lt;</span> Voltar
            </button>
            <h2 class="modal-title" id="forgot-title">Recuperar Senha</h2>
            <p class="modal-desc">Enviaremos as instruções de recuperação para o seu e-mail, caso ele exista em nossos registros.</p>

            <form id="form-forgot" class="modal-form" method="post" action="/recuperar-senha">
                <div class="form-group">
                    <label for="recovery-email">E-mail</label>
                    <input type="email" id="recovery-email" name="email" class="form-input"
                           placeholder="email@exemplo.com.br" autocomplete="off" required>
                </div>

                <!-- Captcha apenas visual (mockup). Em produção use reCAPTCHA/hCaptcha/Turnstile validado no servidor. -->
                <div class="mock-captcha">
                    <label class="checkbox-label">
                        <input type="checkbox" required>
                        <span class="terms-text">Não sou um robô</span>
                    </label>
                    <span class="material-symbols-outlined captcha-logo" aria-hidden="true">verified_user</span>
                </div>

                <p class="modal-status" id="forgot-status" role="status"></p>

                <div class="modal-actions">
                    <button type="submit" class="btn-primary btn-login-submit">RESETAR</button>
                </div>
            </form>
        </div>
    </div>
</dialog>`;

function setupLoginModal() {
    const openers = document.querySelectorAll('#btn-open-login, #btn-icon-login, [data-open-login]');
    if (openers.length === 0) return;

    document.body.insertAdjacentHTML('beforeend', LOGIN_MODAL_HTML);

    const dialog = document.getElementById('login-modal');
    if (typeof dialog.showModal !== 'function') return;

    const loginView = dialog.querySelector('#login-view');
    const forgotView = dialog.querySelector('#forgot-password-view');
    const loginEmail = dialog.querySelector('#login-email');
    const recoveryEmail = dialog.querySelector('#recovery-email');
    const forgotStatus = dialog.querySelector('#forgot-status');
    const passwordInput = dialog.querySelector('#login-password');
    const toggleButton = dialog.querySelector('#toggle-password-btn');
    const toggleIcon = dialog.querySelector('#toggle-password-icon');

    const showView = (name) => {
        loginView.hidden = name !== 'login';
        forgotView.hidden = name !== 'forgot';
        dialog.setAttribute('aria-labelledby', name === 'login' ? 'login-title' : 'forgot-title');
    };

    const setPasswordVisible = (visible) => {
        passwordInput.type = visible ? 'text' : 'password';
        toggleIcon.textContent = visible ? 'visibility' : 'visibility_off';
        toggleButton.setAttribute('aria-label', visible ? 'Ocultar senha' : 'Mostrar senha');
    };

    // Anti-preenchimento automático: o Chrome ignora autocomplete="off" em campos de login.
    // Campos somente-leitura não são preenchidos; liberamos quando o usuário foca o campo.
    const guarded = [loginEmail, passwordInput, recoveryEmail];
    let userTyped = false;
    const lockFields = () => {
        userTyped = false;
        guarded.forEach((input) => {
            input.value = '';
            input.readOnly = true;
        });
    };
    guarded.forEach((input) => {
        input.addEventListener('focus', () => {
            input.readOnly = false;
        });
        ['keydown', 'paste'].forEach((type) =>
            input.addEventListener(type, () => {
                userTyped = true;
            })
        );
    });
    // Se algo preencheu os campos sem o usuário digitar, limpa de novo
    const clearAutofill = () => {
        if (userTyped) return;
        guarded.forEach((input) => {
            input.value = '';
        });
    };
    const clearSoon = () => [0, 100, 400].forEach((ms) => setTimeout(clearAutofill, ms));

    // Abrir: limpa os formulários toda vez; o <dialog> prende o foco e o devolve ao botão de origem
    const openLogin = (view = 'login') => {
        if (dialog.open) return;
        dialog.querySelectorAll('form').forEach((form) => form.reset());
        lockFields();
        showView(view === 'forgot' ? 'forgot' : 'login');
        dialog.showModal();
        (view === 'forgot' ? recoveryEmail : loginEmail).focus();
        clearSoon();
    };

    openers.forEach((button) => button.addEventListener('click', () => openLogin('login')));

    // Outras páginas pedem o modal por evento (ex.: "Esqueceu a senha?" da entrega)
    document.addEventListener('acervo:open-login', (event) => openLogin(event.detail?.view));

    dialog.querySelector('#btn-close-login').addEventListener('click', () => dialog.close());

    // Clique no fundo escuro fecha (só se o clique COMEÇOU e TERMINOU no fundo)
    let pressStartedOnBackdrop = false;
    dialog.addEventListener('pointerdown', (event) => {
        pressStartedOnBackdrop = event.target === dialog;
    });
    dialog.addEventListener('click', (event) => {
        if (pressStartedOnBackdrop && event.target === dialog) dialog.close();
    });

    // Disparado também pela tecla Esc: limpa tudo para não deixar dados ou senha visível
    dialog.addEventListener('close', () => {
        dialog.querySelectorAll('form').forEach((form) => form.reset());
        lockFields();
        forgotStatus.textContent = '';
        setPasswordVisible(false);
    });

    dialog.querySelector('#btn-show-forgot').addEventListener('click', () => {
        userTyped = false;
        recoveryEmail.value = '';
        showView('forgot');
        recoveryEmail.focus();
        clearSoon();
    });

    dialog.querySelector('#btn-back-login').addEventListener('click', () => {
        showView('login');
        loginEmail.focus();
    });

    toggleButton.addEventListener('click', () => {
        setPasswordVisible(passwordInput.type === 'password');
    });

    // MOCK. Em produção, remova o preventDefault para o POST nativo seguir ao Spring Security
    // (com token CSRF) ou use fetch() enviando o token no cabeçalho.
    dialog.querySelector('#form-login').addEventListener('submit', (event) => {
        event.preventDefault();
        dialog.close();
    });

    dialog.querySelector('#form-forgot').addEventListener('submit', (event) => {
        event.preventDefault();
        forgotStatus.textContent =
            'Se o e-mail existir em nossos registros, você receberá as instruções em breve.';
    });
}

/* ==========================================================================
   Contador do carrinho (badge)
   ========================================================================== */
const CART_STORAGE_KEY = 'alexandria_cart';

function readCartCount() {
    try {
        const items = JSON.parse(localStorage.getItem(CART_STORAGE_KEY));
        if (!Array.isArray(items)) return 0;

        // localStorage é editável pelo usuário: só aceita inteiros positivos
        return items.reduce((total, item) => {
            const qty = Number.isInteger(item?.qty) && item.qty > 0 ? Math.min(item.qty, 999) : 1;
            return total + qty;
        }, 0);
    } catch {
        return 0;
    }
}

function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (!badge) return;

    const count = readCartCount();
    badge.textContent = count > 99 ? '99+' : String(count);
    badge.hidden = count === 0;

    // O aria-label do link substitui o conteúdo interno: sem isto o leitor de tela ignora o número
    badge.closest('a')?.setAttribute(
        'aria-label',
        count > 0 ? `Carrinho, ${count} ${count === 1 ? 'item' : 'itens'}` : 'Carrinho'
    );
}

/* ==========================================================================
   Capas ausentes: troca por um placeholder em vez de mostrar imagem quebrada
   ========================================================================== */
const COVER_SELECTOR = '.book-cover, .cart-item-img, .product-image';
const COVER_PLACEHOLDER = 'assets/img/placeholder-capa.svg';

function setupCoverFallback() {
    const swap = (img) => {
        if (img.dataset.fallback) return; // evita laço se o próprio placeholder faltar
        img.dataset.fallback = '1';
        img.src = COVER_PLACEHOLDER;
    };
    // 'error' não borbulha: a captura no document cobre também imagens criadas depois por JS
    document.addEventListener('error', (event) => {
        if (event.target instanceof HTMLImageElement && event.target.matches(COVER_SELECTOR)) swap(event.target);
    }, true);
    // Imagens que já falharam antes deste script rodar
    document.querySelectorAll(COVER_SELECTOR).forEach((img) => {
        if (img.complete && img.naturalWidth === 0) swap(img);
    });
}

/* ==========================================================================
   Init
   ========================================================================== */
setupCoverFallback();
setupBackToTop();
setupCategoryMenu();
setupLoginModal();
updateCartBadge();
document.querySelectorAll('.hero-banner').forEach(setupHeroCarousel);
document.querySelectorAll('.book-shelf').forEach(setupShelfCarousel);

// Outra aba alterou o carrinho
window.addEventListener('storage', (event) => {
    if (event.key === CART_STORAGE_KEY) updateCartBadge();
});
// Esta mesma aba alterou o carrinho (store.js)
window.addEventListener('acervo:store-changed', (event) => {
    if (event.detail?.key === CART_STORAGE_KEY) updateCartBadge();
});
