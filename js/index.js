// js/index.js — loaded with <script type="module"> (deferred, strict mode, no global leakage)

const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const scrollBehavior = () => (prefersReducedMotion() ? 'auto' : 'smooth');

/* ==========================================================================
   Small DOM factories shared by the carousels
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
   Back to top
   ========================================================================== */
/**
 * "Voltar ao Topo": scrolls to the top and moves focus to the header,
 * so keyboard and screen-reader users don't stay stranded in the footer.
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
   Category menu
   ========================================================================== */
/**
 * Category menu disclosure (button + panel).
 * Closes on Escape (returning focus to the button) and on outside click.
 */
function setupCategoryMenu() {
    const trigger = document.querySelector('.menu-trigger');
    if (!trigger) return;

    const panel = document.getElementById(trigger.getAttribute('aria-controls'));
    if (!panel) return;

    const setOpen = (open) => {
        trigger.setAttribute('aria-expanded', String(open));
        panel.hidden = !open;
    };

    // 1. Lógica de Clique (Mantida para Celulares e Navegação por Teclado)
    trigger.addEventListener('click', () => {
        setOpen(trigger.getAttribute('aria-expanded') !== 'true');
    });

    // 2. Lógica de Hover para Desktop (Abre ao passar o mouse)
    let hoverTimeout;

    const handleMouseEnter = () => {
        clearTimeout(hoverTimeout);
        setOpen(true);
    };

    const handleMouseLeave = () => {
        // Delay de 150ms permite que o cursor atravesse o espaço entre o botão e o painel
        hoverTimeout = setTimeout(() => {
            setOpen(false);
        }, 150);
    };

    // Ocultar/Mostrar monitorando tanto o botão quanto o próprio menu aberto
    trigger.addEventListener('mouseenter', handleMouseEnter);
    trigger.addEventListener('mouseleave', handleMouseLeave);
    panel.addEventListener('mouseenter', handleMouseEnter);
    panel.addEventListener('mouseleave', handleMouseLeave);

    // 3. Fechamento por Acessibilidade (Tecla ESC)
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !panel.hidden) {
            setOpen(false);
            trigger.focus();
        }
    });

    // 4. Fechamento por Clique fora da área do menu
    document.addEventListener('click', (event) => {
        if (panel.hidden) return;
        if (!panel.contains(event.target) && !trigger.contains(event.target)) {
            setOpen(false);
        }
    });
}

/* ==========================================================================
   Hero banner carousel (one slide per view, autoplay with pause control)
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
    let userPaused = prefersReducedMotion(); // no autoplay for reduced-motion users
    let hovering = false;
    let focusInside = false;

    // --- Build controls -----------------------------------------------------
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

    // --- State helpers ------------------------------------------------------
    const shouldAutoplay = () => !userPaused && !hovering && !focusInside && !document.hidden;

    const renderToggle = () => {
        toggleIcon.textContent = userPaused ? 'play_arrow' : 'pause';
        toggle.setAttribute(
            'aria-label',
            userPaused ? 'Iniciar rotação automática' : 'Pausar rotação automática'
        );
    };

    const goTo = (index) => {
        current = (index + total) % total;
        track.scrollTo({left: current * track.clientWidth, behavior: scrollBehavior()});
        setActiveDot(dots, current);
    };

    const stopTimer = () => {
        clearInterval(timer);
        timer = null;
    };

    // (Re)starts or stops autoplay; announces slide changes only when not auto-rotating
    const updateAutoplay = () => {
        stopTimer();
        const playing = shouldAutoplay();
        track.setAttribute('aria-live', playing ? 'off' : 'polite');
        if (playing) timer = setInterval(() => goTo(current + 1), HERO_AUTOPLAY_MS);
    };

    // --- Events -------------------------------------------------------------
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

    // Keep dots in sync with swipes / trackpad scrolling
    let frame = 0;
    track.addEventListener(
        'scroll',
        () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                const index = Math.round(track.scrollLeft / track.clientWidth);
                if (index !== current && index >= 0 && index < total) {
                    current = index;
                    setActiveDot(dots, current);
                }
            });
        },
        {passive: true}
    );

    // Pause while the user is interacting with the carousel or the tab is hidden
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

    // Keep the current slide aligned when the width changes
    new ResizeObserver(() => {
        track.scrollTo({left: current * track.clientWidth, behavior: 'auto'});
    }).observe(track);

    setActiveDot(dots, current);
    renderToggle();
    updateAutoplay();
}

/* ==========================================================================
   Book shelf carousel (scroll-snap + generated arrows and page dots)
   ========================================================================== */
/**
 * Without JS the shelf is still natively scrollable; arrows and dots are an enhancement
 * and only appear when there are more cards than fit on screen.
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
        return track.clientWidth + gap; // one "page" of scrolling
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
            frame = requestAnimationFrame(sync); // one update per frame
        },
        {passive: true}
    );

    prev.addEventListener('click', () => {
        track.scrollBy({left: -getStep(), behavior: scrollBehavior()});
    });

    next.addEventListener('click', () => {
        track.scrollBy({left: getStep(), behavior: scrollBehavior()});
    });

    // Event delegation: one listener per shelf instead of one per dot
    indicators.addEventListener('click', (event) => {
        const dot = event.target.closest('.dot');
        if (!dot) return;
        track.scrollTo({
            left: Number(dot.dataset.index) * getStep(),
            behavior: scrollBehavior(),
        });
    });

    // Re-renders on resize (cards-per-view changes); also fires once on observe
    new ResizeObserver(render).observe(track);
}

/* ==========================================================================
   Init
   ========================================================================== */
setupBackToTop();
setupCategoryMenu();
document.querySelectorAll('.hero-banner').forEach(setupHeroCarousel);
document.querySelectorAll('.book-shelf').forEach(setupShelfCarousel);

/* ==========================================================================
   Lógica do Modal de Login Global
   ========================================================================== */
const modalOverlay = document.getElementById('login-modal');
const btnOpenLogin = document.getElementById('btn-open-login'); // Opção do dropdown
const btnIconLogin = document.getElementById('btn-icon-login'); // Clique direto no ícone
const btnCloseLogin = document.getElementById('btn-close-login');

// Elementos das Visões
const loginView = document.getElementById('login-view');
const forgotPasswordView = document.getElementById('forgot-password-view');
const btnShowForgot = document.getElementById('btn-show-forgot');
const btnBackLogin = document.getElementById('btn-back-login');

// Elementos do Formulário e Senha
const pwdInput = document.getElementById('login-password');
const togglePwdBtn = document.getElementById('toggle-password-btn');
const togglePwdIcon = document.getElementById('toggle-password-icon');

const formLogin = document.getElementById('form-login');
const formForgot = document.getElementById('form-forgot');

if (modalOverlay) {
    // 1. Abrir e Fechar Modal
    function openModal() {
        modalOverlay.classList.remove('is-hidden');
        // Reseta sempre para a visão de login ao abrir
        loginView.classList.remove('is-hidden');
        forgotPasswordView.classList.add('is-hidden');
    }

    function closeModal() {
        modalOverlay.classList.add('is-hidden');
    }

    // O modal abre tanto pelo dropdown quanto pelo clique no ícone
    if (btnOpenLogin) btnOpenLogin.addEventListener('click', openModal);
    if (btnIconLogin) btnIconLogin.addEventListener('click', openModal);
    if (btnCloseLogin) btnCloseLogin.addEventListener('click', closeModal);

    // Fechar ao clicar fora da caixa branca
    modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) {
            closeModal();
        }
    });

    // Fechar com a tecla ESC
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !modalOverlay.classList.contains('is-hidden')) {
            closeModal();
        }
    });

    // 2. Transição: Login <-> Esqueci Senha (substituição total)
    if (btnShowForgot) {
        btnShowForgot.addEventListener('click', () => {
            loginView.classList.add('is-hidden');
            forgotPasswordView.classList.remove('is-hidden');
        });
    }

    if (btnBackLogin) {
        btnBackLogin.addEventListener('click', () => {
            forgotPasswordView.classList.add('is-hidden');
            loginView.classList.remove('is-hidden');
        });
    }

    // 3. Mostrar/Esconder Senha
    if (togglePwdBtn && pwdInput) {
        togglePwdBtn.addEventListener('click', () => {
            const isPassword = pwdInput.type === 'password';
            pwdInput.type = isPassword ? 'text' : 'password';
            togglePwdIcon.textContent = isPassword ? 'visibility' : 'visibility_off';
        });
    }

    // 4. Submissão dos Formulários (Mockup)
    if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Simulação: Usuário autenticado com sucesso!');
            closeModal();
        });
    }

    if (formForgot) {
        formForgot.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Se o e-mail existir, você receberá as instruções em breve!');
            closeModal();
        });
    }
}

/* ==========================================================================
   Lógica do Contador do Carrinho (Badge)
   ========================================================================== */
function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (!badge) return;

    // A lógica real vai ler os dados que o seu site salvar no navegador (localStorage).
    // Supondo que você salve uma lista na chave 'alexandria_cart':
    let cartCount = 0;
    try {
        const cartData = JSON.parse(localStorage.getItem('alexandria_cart')) || [];
        // Soma a quantidade de cada item na lista (se houver a propriedade 'qty', senão apenas conta os itens)
        cartCount = cartData.reduce((total, item) => total + (item.qty || 1), 0);
    } catch (error) {
        console.error('Erro ao ler o carrinho:', error);
    }

    // SIMULAÇÃO: Descomente a linha abaixo para forçar o número e ver como fica o design!
    // cartCount = 3;

    // Atualiza a interface
    if (cartCount > 0) {
        badge.textContent = cartCount > 99 ? '99+' : cartCount;
        badge.hidden = false;
    } else {
        badge.hidden = true;
    }
}

// Atualiza o contador imediatamente ao carregar a página
updateCartBadge();

// Se o usuário abrir duas abas do site e adicionar algo em uma, a outra aba atualiza na hora
window.addEventListener('storage', (event) => {
    if (event.key === 'alexandria_cart') {
        updateCartBadge();
    }
});