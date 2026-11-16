import {registrarUsuario, ApiError} from './api.js';

const onlyDigits = (value) => value.replace(/\D/g, '');

/** Campos do formulário -> UsuarioRequestDTO da API. O endereço é um único texto no back-end. */
function buildRegisterPayload(form) {
    const value = (name) => (form.elements[name]?.value ?? '').trim();
    const address = [
        `${value('address')}, ${value('number')}`,
        value('complement'),
        `${value('city')} - ${value('state')}`,
        `CEP ${value('zip')}`,
    ].filter(Boolean).join(', ');
    return {
        nome: value('name'),
        cpf: onlyDigits(value('document')),
        telefoneMovel: `${value('phoneCode')}${onlyDigits(value('phone'))}`.replace(/\s/g, ''),
        email: value('email'),
        senha: form.elements.password.value,
        endereco: address.slice(0, 255),
    };
}

function registerErrorMessage(error) {
    if (error.status === 0) return error.message;
    if (error.status === 401 || error.status === 403) {
        return 'O servidor ainda não aceita cadastros públicos. Avise a equipe do back-end.';
    }
    return error.message || 'Não foi possível criar a conta. Confira os dados e tente novamente.';
}
function initRegisterForm() {
    const form = document.getElementById('form-cadastro');
    const btnSubmit = document.getElementById('btn-submit-register');
    const termsCheckbox = document.getElementById('reg-terms');

    const countrySelect = document.getElementById('reg-country');
    const docLabel = document.getElementById('label-doc');
    const docInput = document.getElementById('reg-doc');

    if (!form || !btnSubmit) return;

    /* --- 0. Senhas: mínimo de 8 caracteres e confirmação igual --- */
    const password = document.getElementById('reg-password');
    const passwordConfirm = document.getElementById('reg-password-confirm');

    function checkPasswords() {
        if (!password || !passwordConfirm) return;
        password.setCustomValidity(
            password.value && password.value.length < 8 ? 'A senha precisa ter no mínimo 8 caracteres.' : ''
        );
        const mismatch = passwordConfirm.value !== '' && passwordConfirm.value !== password.value;
        passwordConfirm.setCustomValidity(mismatch ? 'As senhas não coincidem.' : '');

        // Aviso visível: sem ele o botão "Criar Conta" ficaria desativado sem explicação
        const hint = document.getElementById('password-confirm-hint');
        if (hint) {
            hint.textContent = mismatch ? 'As senhas não coincidem.' : '';
            hint.classList.toggle('is-error', mismatch);
        }
    }

    /* --- 1. Lógica de Validação em Tempo Real --- */
    function checkFormValidity() {
        checkPasswords();
        // .checkValidity() verifica automaticamente todos os campos que possuem 'required'
        const isFormValid = form.checkValidity();
        const areTermsAccepted = termsCheckbox.checked;

        // Se tudo estiver certo, o atributo 'disabled' é removido
        btnSubmit.disabled = !(isFormValid && areTermsAccepted);
    }

    // Escuta qualquer digitação ou clique dentro do formulário
    form.addEventListener('input', checkFormValidity);
    form.addEventListener('change', checkFormValidity);

    // MOCK: sem back-end, segue para a página de sucesso. Em produção, remova o preventDefault
    // para o POST seguir ao servidor (a senha nunca deve ir na URL: por isso o form é POST).
    // Envia o cadastro para a API (POST /usuarios). A senha vai no corpo JSON, nunca na URL.
    const formError = document.createElement('p');
    formError.className = 'form-submit-error';
    formError.setAttribute('role', 'alert');
    formError.hidden = true;
    btnSubmit.before(formError);

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        checkFormValidity();
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        formError.hidden = true;
        btnSubmit.disabled = true;
        const originalLabel = btnSubmit.textContent;
        btnSubmit.textContent = 'CRIANDO CONTA…';
        try {
            await registrarUsuario(buildRegisterPayload(form));
            window.location.href = 'sucesso-cadastro.html';
        } catch (error) {
            formError.textContent = error instanceof ApiError
                ? registerErrorMessage(error)
                : 'Não foi possível criar a conta agora. Tente novamente.';
            formError.hidden = false;
            btnSubmit.textContent = originalLabel;
            checkFormValidity();
        }
    });

    /* --- 2. Lógica Dinâmica: CPF vs Passaporte --- */
    if (countrySelect && docLabel && docInput) {
        countrySelect.addEventListener('change', (e) => {
            if (e.target.value === 'BR') {
                docLabel.innerHTML = 'CPF <span class="required">*</span>';
                docInput.placeholder = '000.000.000-00';
            } else {
                docLabel.innerHTML = 'Número do Passaporte <span class="required">*</span>';
                docInput.placeholder = 'Ex: AB123456';
            }

            // Limpa o campo sempre que o país mudar para evitar formato errado
            docInput.value = '';
            checkFormValidity();
        });
    }

    /* --- 3. Revelar Senhas (Reaproveitamento) --- */
    const toggles = form.querySelectorAll('.btn-toggle-password');
    toggles.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const input = e.currentTarget.previousElementSibling;
            const icon = e.currentTarget.querySelector('.material-symbols-outlined');

            if (input.type === 'password') {
                input.type = 'text';
                icon.textContent = 'visibility';
            } else {
                input.type = 'password';
                icon.textContent = 'visibility_off';
            }
        });
    });

    /* --- 4. Truque de Encurtamento Automático do DDI --- */
    const ddiSelect = document.getElementById('reg-phone-code');
    if (ddiSelect) {
        // Primeiro, salva o texto original completo (ex: "+55 (Brasil)") na memória de cada option
        Array.from(ddiSelect.options).forEach(opt => {
            if (!opt.dataset.full) opt.dataset.full = opt.text;
        });

        // Encolhe o item que está selecionado para mostrar só o código
        function shrinkDDI() {
            Array.from(ddiSelect.options).forEach(opt => {
                if (opt.selected && opt.value !== "") {
                    opt.text = opt.value; // Fica só "+55"
                } else {
                    opt.text = opt.dataset.full; // Os outros ficam normais para aparecerem na lista
                }
            });
        }

        // Expande tudo quando o usuário clica para abrir a lista
        function expandDDI() {
            Array.from(ddiSelect.options).forEach(opt => {
                opt.text = opt.dataset.full;
            });
        }

        // Escuta as ações de clicar, sair e mudar
        ddiSelect.addEventListener('focus', expandDDI);
        ddiSelect.addEventListener('blur', shrinkDDI);
        ddiSelect.addEventListener('change', shrinkDDI);

        // Roda uma vez no início para a tela já nascer encurtada
        shrinkDDI();
    }
}

// Inicializa a lógica quando a página carrega
initRegisterForm();