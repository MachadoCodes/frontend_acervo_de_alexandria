// js/pagamento.js — carregado com <script type="module"> (deferido, modo estrito, sem globais)

const currency = new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'});
const formatCents = (cents) => currency.format(cents / 100);

const METHOD_LABELS = {
    credit_card: 'CARTÃO DE CRÉDITO',
    pix: 'PIX',
    digital_wallet: 'CARTEIRA DIGITAL',
    paypal: 'PAYPAL',
    crypto: 'CRIPTOMOEDA',
    boleto: 'BOLETO',
};

/*
- Regras APENAS DE EXIBIÇÃO. O valor oficial deve ser calculado e validado no back-end.
- Premissas: Pix = 5% de desconto sobre os livros; cripto = 2% sobre o total do pedido.
 */
const PRICE_ADJUSTMENTS = {
    pix: {label: 'Desconto Pix (5%)', rate: -0.05, base: 'subtotal'},
    crypto: {label: 'Taxa de criptomoeda (2%)', rate: 0.02, base: 'total'},
};

const MAX_INSTALLMENTS = 4;

/* ==========================================================================
   Utilitários de cartão
   ========================================================================== */
const digitsOnly = (value) => value.replace(/\D/g, '');

const formatCardNumber = (value) =>
    digitsOnly(value).slice(0, 16).replace(/(.{4})(?=.)/g, '$1 ');

function formatExpiry(value) {
    const digits = digitsOnly(value).slice(0, 4);
    return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

/** Algoritmo de Luhn: detecta erros de digitação no número do cartão. */
function passesLuhn(number) {
    if (number.length < 13) return false;
    let sum = 0;
    let double = false;
    for (let i = number.length - 1; i >= 0; i--) {
        let digit = Number(number[i]);
        if (double) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        double = !double;
    }
    return sum % 10 === 0;
}

function isFutureExpiry(value) {
    const [month, year] = value.split('/').map(Number);
    if (!month || month < 1 || month > 12) return false;
    const lastDayOfMonth = new Date(2000 + year, month, 0, 23, 59, 59);
    return lastDayOfMonth >= new Date();
}

/* ==========================================================================
   Página de pagamento e Motor de Cálculo
   ========================================================================== */
function initPayment() {
    const form = document.getElementById('payment-form');
    const submitButton = document.getElementById('btn-submit-order');
    if (!form || !submitButton) return;

    const bodies = Object.fromEntries(
        Object.keys(METHOD_LABELS).map((key) => [
            key,
            document.getElementById(`body-${key.replace(/_/g, '-')}`),
        ])
    );

    const summary = document.getElementById('order-summary');
    const adjustmentLine = document.getElementById('adjustment-line');
    const adjustmentLabel = document.getElementById('adjustment-label');
    const adjustmentValue = document.getElementById('adjustment-value');
    const finalTotal = document.getElementById('final-total');

    const subtotalCents = Number(summary?.dataset.subtotalCents) || 0;
    const shippingCents = Number(summary?.dataset.shippingCents) || 0;

    /* --- Resumo: reflete cupom + método escolhido + recalcula parcelas --- */
    function updateSummary() {
        if (!summary || !finalTotal) return;

        const method = form.querySelector('input[name="payment_type"]:checked')?.value;
        const rule = PRICE_ADJUSTMENTS[method];

        let promoDiscountCents = 0;

        // 1. Aplica desconto do cupom (lido do HTML data attributes configurados pelo mock)
        if (summary.dataset.promoCode) {
            const type = summary.dataset.promoType;
            const val = Number(summary.dataset.promoValue);

            if (type === 'percent') {
                promoDiscountCents = Math.round(subtotalCents * val);
            } else if (type === 'fixed') {
                promoDiscountCents = val;
            }

            const promoLine = document.getElementById('promo-line');
            const promoLabel = document.getElementById('promo-label');
            const promoValue = document.getElementById('promo-value');

            if (promoLine && promoLabel && promoValue) {
                promoLine.hidden = false;
                promoLabel.textContent = `Cupom (${summary.dataset.promoCode})`;
                promoValue.textContent = `− ${formatCents(promoDiscountCents)}`;
            }
        } else {
            const promoLine = document.getElementById('promo-line');
            if (promoLine) promoLine.hidden = true;
        }

        // 2. Calcula novo subtotal para aplicar o Pix/Cripto por cima (em cascata)
        const subtotalWithPromo = Math.max(0, subtotalCents - promoDiscountCents);
        const baseTotalCents = subtotalWithPromo + shippingCents;

        // 3. Aplica regras do método de pagamento
        let adjustment = 0;
        if (rule) {
            const base = rule.base === 'subtotal' ? subtotalWithPromo : baseTotalCents;
            adjustment = Math.round(base * rule.rate);
            adjustmentLabel.textContent = rule.label;
            adjustmentValue.textContent = `${adjustment < 0 ? '−' : '+'} ${formatCents(Math.abs(adjustment))}`;
        }

        adjustmentLine.hidden = !rule;
        adjustmentLine.classList.toggle('summary-line--discount', adjustment < 0);

        // 4. Exibe Total Final
        const finalPriceCents = baseTotalCents + adjustment;
        finalTotal.textContent = formatCents(finalPriceCents);

        // 5. Atualiza dinamicamente as parcelas do cartão com o novo preço
        const installments = document.getElementById('cardInstallments');
        if (installments && finalPriceCents > 0) {
            const previous = installments.value;
            installments.replaceChildren(
                ...Array.from({length: MAX_INSTALLMENTS}, (_, i) => {
                    const n = i + 1;
                    const option = document.createElement('option');
                    option.value = String(n);
                    option.textContent = `${n}x de ${formatCents(Math.round(finalPriceCents / n))} sem juros`;
                    return option;
                })
            );
            installments.value = previous || '1';
        }
    }

    /* --- Exibição dos blocos e botão de envio --- */
    function updatePaymentView() {
        const selected = form.querySelector('input[name="payment_type"]:checked')?.value;

        Object.entries(bodies).forEach(([key, body]) => {
            if (!body) return;
            const active = key === selected;
            body.hidden = !active;
            // Campos de blocos ocultos ficam desabilitados: não bloqueiam o envio nem são enviados
            body.querySelectorAll('input, select, textarea').forEach((field) => {
                field.disabled = !active;
            });
        });

        submitButton.removeAttribute('aria-busy');
        submitButton.disabled = !selected;
        submitButton.textContent = selected
            ? `PAGAR COM ${METHOD_LABELS[selected]}`
            : 'SELECIONE UM MÉTODO';

        updateSummary();
    }

    form.addEventListener('change', (event) => {
        if (event.target.name === 'payment_type') updatePaymentView();
    });

    // Escuta o evento customizado que o cupom vai disparar quando for aplicado/removido
    summary?.addEventListener('priceUpdate', updateSummary);

    /* --- Máscaras e validação do cartão --- */
    const cardNumber = document.getElementById('cardNumber');
    const cardExpiry = document.getElementById('cardExpiry');
    const cardCvv = document.getElementById('cardCvv');

    function validateCard() {
        if (cardNumber) {
            const invalid = cardNumber.value !== '' && !passesLuhn(digitsOnly(cardNumber.value));
            cardNumber.setCustomValidity(invalid ? 'Número de cartão inválido.' : '');
        }
        if (cardExpiry) {
            const invalid = cardExpiry.value.length === 5 && !isFutureExpiry(cardExpiry.value);
            cardExpiry.setCustomValidity(invalid ? 'Cartão vencido ou validade inválida.' : '');
        }
    }

    cardNumber?.addEventListener('input', () => {
        cardNumber.value = formatCardNumber(cardNumber.value);
        validateCard();
    });

    cardExpiry?.addEventListener('input', () => {
        cardExpiry.value = formatExpiry(cardExpiry.value);
        validateCard();
    });

    cardCvv?.addEventListener('input', () => {
        cardCvv.value = digitsOnly(cardCvv.value).slice(0, 4);
    });

    /* --- Evita clique duplo --- */
    form.addEventListener('submit', () => {
        submitButton.disabled = true;
        submitButton.setAttribute('aria-busy', 'true');
        submitButton.textContent = 'PROCESSANDO…';
    });

    // Restaura o estado ao voltar pelo botão "voltar" do navegador (bfcache)
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) updatePaymentView();
    });

    updatePaymentView();
}

/* ==========================================================================
   Cupom de desconto (Mock de Back-end)
   ========================================================================== */
function initPromo() {
    const promoForm = document.getElementById('promo-form');
    const promoInput = document.getElementById('promoCode');
    const promoMessage = document.getElementById('promo-message');
    const promoToggleBtn = document.getElementById('promo-toggle-btn');
    const promoContent = document.getElementById('promo-content');
    const submitBtn = promoForm?.querySelector('button[type="submit"]');

    if (!promoForm || !promoInput || !promoMessage || !submitBtn) return;

    // Regras simulando a resposta da futura API Spring Boot
    const MOCK_API_COUPONS = {
        'ALEXANDRIA10': { type: 'percent', value: 0.10 }, // 10% de desconto
        'BEMVINDO20': { type: 'fixed', value: 2000 }      // 2000 centavos = R$ 20,00
    };

    let appliedCouponCode = null;

    // Lógica para abrir/fechar a caixa do cupom
    if (promoToggleBtn && promoContent) {
        promoToggleBtn.addEventListener('click', () => {
            const isHidden = promoContent.classList.toggle('is-hidden');
            promoToggleBtn.setAttribute('aria-expanded', String(!isHidden));
            if (!isHidden) promoInput.focus();
        });
    }

    promoForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        promoMessage.textContent = '';
        promoMessage.style.color = '';

        // Se tem cupom aplicado, o botão atua como "REMOVER"
        if (appliedCouponCode) {
            removeCoupon();
            return;
        }

        const code = promoInput.value.trim().toUpperCase();
        if (!code) {
            showPromoMessage('Digite um código de cupom.', 'error');
            promoInput.focus();
            return;
        }

        // SIMULAÇÃO DE REQUEST HTTP (delay na interface)
        submitBtn.textContent = 'VALIDANDO...';
        submitBtn.disabled = true;

        await new Promise(resolve => setTimeout(resolve, 800));

        const validCoupon = MOCK_API_COUPONS[code];

        if (validCoupon) {
            applyCoupon(code, validCoupon);
        } else {
            showPromoMessage('Cupom inválido, esgotado ou expirado.', 'error');
            submitBtn.textContent = 'APLICAR';
            submitBtn.disabled = false;
        }
    });

    promoInput.addEventListener('input', () => {
        promoMessage.textContent = '';
    });

    function showPromoMessage(msg, type) {
        promoMessage.textContent = msg;
        promoMessage.style.color = type === 'error' ? '#c62828' : '#2e7d32';
        promoMessage.style.display = 'block';
    }

    function applyCoupon(code, couponData) {
        showPromoMessage(`Cupom ${code} aplicado com sucesso!`, 'success');
        promoInput.disabled = true;

        // Altera o layout do botão para estado de "Remover"
        submitBtn.textContent = 'REMOVER';
        submitBtn.style.backgroundColor = '#c62828'; // Vermelho
        submitBtn.style.color = '#ffffff';
        submitBtn.disabled = false;
        appliedCouponCode = code;

        // Avisa a página que os cálculos precisam ser refeitos
        const summary = document.getElementById('order-summary');
        if (summary) {
            summary.dataset.promoCode = code;
            summary.dataset.promoType = couponData.type;
            summary.dataset.promoValue = couponData.value;
            summary.dispatchEvent(new Event('priceUpdate'));
        }
    }

    function removeCoupon() {
        promoInput.value = '';
        promoInput.disabled = false;

        // Retorna o botão ao estado padrão original
        submitBtn.textContent = 'APLICAR';
        submitBtn.style.backgroundColor = '';
        submitBtn.style.color = '';

        promoMessage.textContent = '';
        appliedCouponCode = null;
        promoInput.focus();

        // Avisa a página para retirar o desconto
        const summary = document.getElementById('order-summary');
        if (summary) {
            delete summary.dataset.promoCode;
            delete summary.dataset.promoType;
            delete summary.dataset.promoValue;
            summary.dispatchEvent(new Event('priceUpdate'));
        }
    }
}

// Inicializa as funções quando o script é carregado
initPayment();
initPromo();