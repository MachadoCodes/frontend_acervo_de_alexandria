// js/perfil.js — página "Meu perfil": ver e editar os dados da conta (API) e a foto (neste navegador).
import {isLoggedIn, currentUser, meuPerfil, atualizarMeuPerfil, alterarMinhaSenha, ApiError} from './api.js';
import {getAvatar, saveAvatarFromFile, removeAvatar, setDisplayName} from './conta.js';

const $ = (id) => document.getElementById(id);
const guest = $('profile-guest');
const loading = $('profile-loading');
const loadError = $('profile-error');
const content = $('profile-content');
const form = $('form-perfil');
const saveError = $('profile-save-error');
const saveOk = $('profile-save-ok');
const saveButton = $('profile-save');
const avatarBox = $('profile-avatar');
const photoRemove = $('profile-photo-remove');
const photoError = $('profile-photo-error');

let profile = null;

function showAvatar() {
    const email = currentUser()?.email;
    const src = email ? getAvatar(email) : null;
    avatarBox.replaceChildren();
    if (src) {
        const img = document.createElement('img');
        img.src = src;
        img.alt = '';
        img.className = 'profile-avatar-img';
        avatarBox.append(img);
    } else {
        const icon = document.createElement('span');
        icon.className = 'material-symbols-outlined profile-avatar-icon';
        icon.textContent = 'account_circle';
        avatarBox.append(icon);
    }
    photoRemove.hidden = !src;
}

function fillForm(data) {
    form.elements.nome.value = data.nome ?? '';
    form.elements.email.value = data.email ?? '';
    form.elements.telefoneMovel.value = data.telefoneMovel ?? '';
    form.elements.telefoneFixo.value = data.telefoneFixo ?? '';
    form.elements.endereco.value = data.endereco ?? '';
    $('profile-subtitle').textContent = `Conectado como ${data.email}`;
}

async function load() {
    guest.hidden = true;
    content.hidden = true;
    loadError.hidden = true;

    if (!isLoggedIn()) {
        loading.hidden = true;
        guest.hidden = false;
        return;
    }
    loading.hidden = false;
    try {
        profile = await meuPerfil();
        fillForm(profile);
        setDisplayName(profile.email, profile.nome);
        showAvatar();
        content.hidden = false;
    } catch (error) {
        if (isLoggedIn()) {
            loadError.textContent = error.message || 'Não foi possível carregar o perfil.';
            loadError.hidden = false;
        } else {
            guest.hidden = false; // a sessão expirou durante a chamada
        }
    } finally {
        loading.hidden = true;
    }
}

/* ----- Foto ----- */
$('profile-photo-input').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    event.target.value = '';
    photoError.hidden = true;
    if (!file) return;
    try {
        await saveAvatarFromFile(currentUser().email, file);
        showAvatar();
    } catch (error) {
        photoError.textContent = error.message;
        photoError.hidden = false;
    }
});

photoRemove.addEventListener('click', () => {
    removeAvatar(currentUser().email);
    showAvatar();
});

/* ----- Salvar dados ----- */
form.addEventListener('submit', async (event) => {
    event.preventDefault();
    saveError.hidden = true;
    saveOk.hidden = true;

    const fields = form.elements;
    const nome = fields.nome.value.trim();
    const movel = fields.telefoneMovel.value.trim();
    const endereco = fields.endereco.value.trim();
    const senhaAtual = fields.senha.value;
    const novaSenha = fields.novaSenha.value;

    const fail = (message) => {
        saveError.textContent = message;
        saveError.hidden = false;
    };
    if (!nome || !movel || !endereco) return fail('Preencha nome, celular e endereço.');
    if (novaSenha && !senhaAtual) return fail('Para trocar a senha, informe a senha atual.');
    if (novaSenha && (novaSenha.length < 8 || novaSenha.length > 72)) return fail('A nova senha deve ter de 8 a 72 caracteres.');

    saveButton.disabled = true;
    saveButton.textContent = 'SALVANDO…';
    try {
        const updated = await atualizarMeuPerfil({
            nome,
            telefoneFixo: fields.telefoneFixo.value.trim() || null,
            telefoneMovel: movel,
            endereco,
        });
        // A troca de senha é um passo à parte: a API confere a senha atual
        if (novaSenha) await alterarMinhaSenha(senhaAtual, novaSenha);
        profile = updated;
        fillForm(updated);
        setDisplayName(updated.email, updated.nome);
        fields.senha.value = '';
        fields.novaSenha.value = '';
        saveOk.hidden = false;
    } catch (error) {
        fail(error instanceof ApiError ? error.message : 'Não foi possível salvar agora. Tente novamente.');
    } finally {
        saveButton.disabled = false;
        saveButton.textContent = 'SALVAR ALTERAÇÕES';
    }
});

$('profile-login-btn').addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('acervo:open-login'));
});

// Entrou ou saiu (nesta ou em outra aba): recarrega a página de perfil
let lastEmail = currentUser()?.email ?? null;
window.addEventListener('acervo:auth-changed', () => {
    const email = currentUser()?.email ?? null;
    if (email !== lastEmail) {
        lastEmail = email;
        load();
    }
});

load();