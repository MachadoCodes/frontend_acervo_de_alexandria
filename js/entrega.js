// js/entrega.js — etapa de entrega (carregado como módulo)
import {readCart, cartSubtotalCents, cartCount, SHIPPING_CENTS} from './store.js';
import {saveDelivery} from './store.js';
import {isLoggedIn, login, currentUser, ApiError} from './api.js';
import {formatCents, pluralize} from './ui.js';

const items = readCart();
// Sem itens não há o que entregar: volta para o carrinho
if (items.length === 0) window.location.replace('carrinho.html');

const init = () => {
    const form = document.querySelector('.delivery-form');
    const loginBlock = document.getElementById('login-block');
    const guestBlock = document.getElementById('guest-block');
    const checkoutFooter = document.getElementById('checkout-footer');
    if (!form || !loginBlock || !guestBlock || !checkoutFooter) return;

    const subtotalLabel = document.getElementById('summary-subtotal-label');
    const subtotalValue = document.getElementById('summary-subtotal');
    const shippingValue = document.getElementById('summary-shipping');
    const totalValue = document.getElementById('summary-total');
    const subtotal = cartSubtotalCents(items);

    /** Resumo: o frete só é somado depois que o cliente escolhe como vai receber. */
    function updateSummary() {
        const answer = form.querySelector('input[name="has_account"]:checked')?.value;
        const method = form.querySelector('input[name="delivery_method"]:checked')?.value ?? 'standard';
        const shipping = answer ? SHIPPING_CENTS[method] : null;

        subtotalLabel.textContent = `Subtotal (${pluralize(cartCount(items), 'item', 'itens')})`;
        subtotalValue.textContent = formatCents(subtotal);
        shippingValue.textContent = shipping === null ? 'A calcular' : formatCents(shipping);
        totalValue.textContent = formatCents(subtotal + (shipping ?? 0));
    }

    /**
     * Mostra/oculta um bloco e desabilita seus campos enquanto ele está oculto.
     * Assim, campos "required" escondidos não travam o envio.
     */
    function setBlockVisible(block, visible) {
        block.hidden = !visible;
        block.querySelectorAll('input, select, textarea, button').forEach((field) => {
            field.disabled = !visible;
        });
    }

    /** Se a pessoa já está logada, sugere o e-mail da conta no campo de e-mail da entrega. */
    function prefillEmail() {
        const email = currentUser()?.email;
        const field = document.getElementById('guestEmail');
        if (email && field && !field.value) field.value = email;
    }

    function updateBlocks() {
        const answer = form.querySelector('input[name="has_account"]:checked')?.value;

        // Quem tem conta entra aqui mesmo (login de verdade) e também informa o endereço de entrega
        setBlockVisible(loginBlock, answer === 'yes' && !isLoggedIn());
        setBlockVisible(guestBlock, Boolean(answer));
        setBlockVisible(checkoutFooter, Boolean(answer));
        prefillEmail();
        updateSummary();
    }

    // Um único listener cobre os radios de conta e de método de entrega
    form.addEventListener('change', (event) => {
        if (event.target.name === 'has_account') updateBlocks();
        if (event.target.name === 'delivery_method') updateSummary();
    });

    // Estado inicial (tudo oculto) e restauração ao voltar pelo botão "voltar" do navegador
    updateBlocks();
    window.addEventListener('pageshow', updateBlocks);

    /* --- Convidado: o navegador já validou os campos; guardamos e seguimos (sem dados na URL) --- */
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(form));
        saveDelivery({
            nome: data.nome, sobrenome: data.sobrenome, email: data.email, pais: data.pais, cep: data.cep,
            estado: data.estado, cidade: data.cidade, endereco: data.endereco, numero: data.numero,
            complemento: data.complemento, notas: data.notas, method: data.delivery_method,
        });
        window.location.href = 'pagamento.html';
    });

    /* --- Já tenho conta: login de verdade na API; depois a pessoa preenche o endereço --- */
    const loginError = document.getElementById('login-checkout-error');
    document.getElementById('btn-login-continue')?.addEventListener('click', async (event) => {
        const emailField = document.getElementById('loginEmail');
        const senhaField = document.getElementById('loginSenha');
        if (!emailField.reportValidity() || !senhaField.reportValidity()) return;
        const button = event.currentTarget;
        button.disabled = true;
        loginError.hidden = true;
        try {
            await login(emailField.value.trim(), senhaField.value);
            senhaField.value = '';
            updateBlocks(); // esconde o login e sugere o e-mail da conta
        } catch (error) {
            loginError.textContent = error instanceof ApiError && error.status === 0
                ? error.message
                : 'E-mail ou senha incorretos.';
            loginError.hidden = false;
        } finally {
            button.disabled = false;
        }
    });

    document.getElementById('btn-forgot-from-checkout')?.addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('acervo:open-login', {detail: {view: 'forgot'}}));
    });

    /* --- Validação do e-mail do convidado (mostra o erro só quando há erro) --- */
    const guestEmail = document.getElementById('guestEmail');
    const guestEmailError = document.getElementById('guestEmail-error');

    if (guestEmail && guestEmailError) {
        const showEmailError = (show) => {
            guestEmailError.hidden = !show;
            guestEmail.closest('.form-group').classList.toggle('has-error', show);
            guestEmail.setAttribute('aria-invalid', String(show));

            if (show) guestEmail.setAttribute('aria-describedby', guestEmailError.id);
            else guestEmail.removeAttribute('aria-describedby');
        };

        guestEmail.addEventListener('blur', () => {
            showEmailError(guestEmail.value !== '' && !guestEmail.validity.valid);
        });

        guestEmail.addEventListener('input', () => {
            if (guestEmail.validity.valid) showEmailError(false);
        });
    }
};
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
