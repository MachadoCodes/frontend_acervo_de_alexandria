function initRegisterForm() {
    const form = document.getElementById('form-cadastro');
    const btnSubmit = document.getElementById('btn-submit-register');
    const termsCheckbox = document.getElementById('reg-terms');

    const countrySelect = document.getElementById('reg-country');
    const docLabel = document.getElementById('label-doc');
    const docInput = document.getElementById('reg-doc');

    if (!form || !btnSubmit) return;

    /* --- 1. Lógica de Validação em Tempo Real --- */
    function checkFormValidity() {
        // .checkValidity() verifica automaticamente todos os campos que possuem 'required'
        const isFormValid = form.checkValidity();
        const areTermsAccepted = termsCheckbox.checked;

        // Se tudo estiver certo, o atributo 'disabled' é removido
        btnSubmit.disabled = !(isFormValid && areTermsAccepted);
    }

    // Escuta qualquer digitação ou clique dentro do formulário
    form.addEventListener('input', checkFormValidity);
    form.addEventListener('change', checkFormValidity);

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