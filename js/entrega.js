document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.delivery-form');
    const loginBlock = document.getElementById('login-block');
    const guestBlock = document.getElementById('guest-block');
    const checkoutFooter = document.getElementById('checkout-footer');
    if (!form || !loginBlock || !guestBlock || !checkoutFooter) return;

    /**
     * Mostra/oculta um bloco e desabilita seus campos enquanto ele está oculto.
     * Assim, campos "required" escondidos não travam o envio e não vão na URL.
     */
    function setBlockVisible(block, visible) {
        block.hidden = !visible;
        block.querySelectorAll('input, select, textarea, button').forEach((field) => {
            field.disabled = !visible;
        });
    }

    function updateBlocks() {
        const answer = form.querySelector('input[name="has_account"]:checked')?.value;

        setBlockVisible(loginBlock, answer === 'yes');
        setBlockVisible(guestBlock, answer === 'no');
        setBlockVisible(checkoutFooter, answer === 'no');
    }

    // Um único listener cobre os dois radios
    form.addEventListener('change', (event) => {
        if (event.target.name === 'has_account') updateBlocks();
    });

    // Estado inicial (tudo oculto) e restauração ao voltar pelo botão "voltar" do navegador
    updateBlocks();
    window.addEventListener('pageshow', updateBlocks);

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
});