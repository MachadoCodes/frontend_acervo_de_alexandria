// cliente da API REST (Spring Boot + JWT). Todas as chamadas à rede passam por aqui.
import {API_BASE_URL, API_TIMEOUT_MS, CATALOG_PAGE_SIZE} from './config.js';

const TOKEN_KEY = 'alexandria_token';

/* ----- Erros ----- */
export class ApiError extends Error {
    /** @param {number} status 0 = sem resposta (rede/CORS/timeout) */
    constructor(message, status = 0, fields = []) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.fields = fields; // [{campo, mensagem}] vindo da validação do Spring
    }
}

/** A API responde texto puro (400/404/500) ou um array JSON [{campo, mensagem}] (validação). */
async function readError(response) {
    const text = await response.text().catch(() => '');
    try {
        const data = JSON.parse(text);
        if (Array.isArray(data) && data.length) {
            const fields = data.filter((item) => item && typeof item.mensagem === 'string');
            return new ApiError(fields.map((item) => item.mensagem).join(' '), response.status, fields);
        }
        if (data && typeof data.message === 'string') return new ApiError(data.message, response.status);
    } catch {
        /* não era JSON: segue com o texto */
    }
    return new ApiError(text.trim().slice(0, 300) || `Erro ${response.status}`, response.status);
}

/* ----- Token (JWT) ----- */
function decodeJwt(token) {
    try {
        const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(decodeURIComponent(escape(atob(payload))));
    } catch {
        return null;
    }
}

function notifyAuthChanged() {
    window.dispatchEvent(new CustomEvent('acervo:auth-changed'));
}

export function getToken() {
    try {
        const token = localStorage.getItem(TOKEN_KEY);
        const claims = token && decodeJwt(token);
        if (!claims) return null;
        if (claims.exp && claims.exp * 1000 <= Date.now()) {
            localStorage.removeItem(TOKEN_KEY); // expirado: evita mandar token inútil
            return null;
        }
        return token;
    } catch {
        return null;
    }
}

export const isLoggedIn = () => getToken() !== null;

/** {email, role} do usuário logado (só para exibir; quem decide permissão é sempre o servidor). */
export function currentUser() {
    const claims = getToken() && decodeJwt(getToken());
    return claims ? {email: claims.sub, role: claims.role} : null;
}

export function logout() {
    try {
        localStorage.removeItem(TOKEN_KEY);
        // Dados da compra em andamento (nome, endereço) não devem sobrar para a próxima pessoa do computador
        sessionStorage.removeItem('alexandria_delivery');
        sessionStorage.removeItem('alexandria_order');
    } catch {
        /* ignora */
    }
    notifyAuthChanged();
}

/* ----- Requisição base ----- */
async function request(path, {method = 'GET', body, auth = false, timeout = API_TIMEOUT_MS} = {}) {
    const headers = {Accept: 'application/json'};
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (auth) {
        const token = getToken();
        if (!token) throw new ApiError('Faça login para continuar.', 401);
        headers.Authorization = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    let response;
    try {
        response = await fetch(`${API_BASE_URL}${path}`, {
            method,
            headers,
            body: body === undefined ? undefined : JSON.stringify(body),
            signal: controller.signal,
        });
    } catch {
        throw new ApiError('Não foi possível conectar ao servidor. Tente novamente em instantes.', 0);
    } finally {
        clearTimeout(timer);
    }

    if (!response.ok) {
        const error = await readError(response);
        // Sessão inválida/expirada: descarta o token (o Spring devolve 401 ou 403 sem token válido)
        if (auth && (response.status === 401 || response.status === 403)) {
            logout();
            throw new ApiError('Sua sessão expirou. Entre novamente.', response.status);
        }
        throw error;
    }
    if (response.status === 204) return null;
    const text = await response.text();
    return text ? JSON.parse(text) : null;
}

/* ----- Autenticação e usuários ----- */
export async function login(email, senha) {
    const data = await request('/login', {method: 'POST', body: {email, senha}});
    if (!data?.token || !decodeJwt(data.token)) throw new ApiError('Resposta de login inválida.', 500);
    try {
        localStorage.setItem(TOKEN_KEY, data.token);
    } catch {
        throw new ApiError('Não foi possível guardar a sessão neste navegador.', 0);
    }
    notifyAuthChanged();
    return currentUser();
}

/** dto = {nome, cpf, telefoneFixo?, telefoneMovel, email, senha, endereco} */
export const registrarUsuario = (dto) => request('/usuarios', {method: 'POST', body: dto});

/* ----- Perfil do usuário (exigem login) ----- */
// A API ainda não tem "GET /usuarios/me": procuramos o usuário logado pelo e-mail na lista.
export async function meuPerfil() {
    const email = currentUser()?.email?.toLowerCase();
    const lista = await request('/usuarios', {auth: true});
    const perfil = Array.isArray(lista) ? lista.find((u) => String(u?.email).toLowerCase() === email) : null;
    if (!perfil) throw new ApiError('Não encontramos o seu perfil.', 404);
    return perfil;
}

/** dto = {nome, cpf, telefoneFixo?, telefoneMovel, email, senha, endereco} (a API exige todos, inclusive CPF e senha) */
export const atualizarUsuario = (id, dto) =>
    request(`/usuarios/${encodeURIComponent(id)}`, {method: 'PUT', body: dto, auth: true});

/* ----- Livros (públicos) ----- */

// A API devolve um Page do Spring: {content, totalElements, last, ...}. `sort` ex.: 'anoPublicacao,desc'
function toPage(data) {
    return {
        content: Array.isArray(data?.content) ? data.content : [],
        total: Number.isInteger(data?.totalElements) ? data.totalElements : null,
        last: data?.last !== false,
    };
}

/** Uma página de livros (GET /livros). */
export async function listarPaginaLivros({size = CATALOG_PAGE_SIZE, page = 0, sort, timeout} = {}) {
    const params = new URLSearchParams({size, page});
    if (sort) params.set('sort', sort);
    return toPage(await request(`/livros?${params}`, {timeout}));
}

/** Atalho: só a lista de livros da primeira página. */
export async function listarLivros(options = {}) {
    return (await listarPaginaLivros(options)).content;
}

export const buscarLivro = (id) => request(`/livros/${encodeURIComponent(id)}`);

/** Busca no servidor pelo título (GET /livros/busca), paginada. */
export async function buscarLivrosPorTitulo(titulo, {size = CATALOG_PAGE_SIZE, page = 0} = {}) {
    const params = new URLSearchParams({titulo, size, page});
    return toPage(await request(`/livros/busca?${params}`));
}

/* ----- Carrinho e pedidos (exigem login) ----- */
export const listarCarrinho = () => request('/carrinhos/itens', {auth: true});
export const adicionarAoCarrinho = (livroId, quantidade) =>
    request('/carrinhos/itens', {method: 'POST', body: {livroId, quantidade}, auth: true});
export const removerDoCarrinho = (livroId) =>
    request(`/carrinhos/itens/${encodeURIComponent(livroId)}`, {method: 'DELETE', auth: true});
export const criarPedido = () => request('/pedidos', {method: 'POST', auth: true});
export const historicoPedidos = () => request('/pedidos/historico', {auth: true});