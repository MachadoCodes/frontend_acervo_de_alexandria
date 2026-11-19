// js/conta.js — dados da conta guardados só neste navegador (foto e nome de exibição).
// A API ainda não guarda foto: ela fica em localStorage, por e-mail, e não acompanha a pessoa em outros aparelhos.

const AVATAR_PREFIX = 'alexandria_avatar:';
const NAME_PREFIX = 'alexandria_nome:';
const AVATAR_SIZE = 256;
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const key = (prefix, email) => `${prefix}${String(email ?? '').toLowerCase()}`;

function read(k) {
    try {
        return localStorage.getItem(k);
    } catch {
        return null;
    }
}

function write(k, value) {
    try {
        if (value === null) localStorage.removeItem(k);
        else localStorage.setItem(k, value);
        window.dispatchEvent(new CustomEvent('acervo:auth-changed'));
        return true;
    } catch {
        return false;
    }
}

/** Foto salva (data URL de imagem) ou null. Só aceita data:image para nunca carregar URL de terceiros. */
export function getAvatar(email) {
    const value = read(key(AVATAR_PREFIX, email));
    return value && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value) ? value : null;
}

export const removeAvatar = (email) => write(key(AVATAR_PREFIX, email), null);

export const getDisplayName = (email) => read(key(NAME_PREFIX, email)) || null;
export const setDisplayName = (email, name) => write(key(NAME_PREFIX, email), String(name).slice(0, 150));

/** Recorta a imagem em quadrado, reduz para 256x256 e salva como JPEG. Lança Error com texto para exibir. */
export async function saveAvatarFromFile(email, file) {
    if (!file || !ALLOWED_TYPES.includes(file.type)) throw new Error('Use uma imagem JPG, PNG ou WebP.');
    if (file.size > MAX_FILE_BYTES) throw new Error('A imagem deve ter no máximo 8 MB.');

    let bitmap;
    try {
        bitmap = await createImageBitmap(file);
    } catch {
        throw new Error('Não foi possível ler essa imagem.');
    }
    const side = Math.min(bitmap.width, bitmap.height);
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = AVATAR_SIZE;
    canvas.getContext('2d').drawImage(
        bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, AVATAR_SIZE, AVATAR_SIZE,
    );
    bitmap.close?.();
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    if (!write(key(AVATAR_PREFIX, email), dataUrl)) throw new Error('Sem espaço para guardar a foto neste navegador.');
    return dataUrl;
}