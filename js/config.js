//Configuração de integração com a API Spring Boot (um único lugar para ajustar).
//
// URL da API, em ordem de prioridade:
//   1. window.ACERVO_API_URL (defina num <script> antes dos módulos, ex.: no deploy)
//   2. localStorage 'acervo_api_url' (útil em desenvolvimento: localStorage.setItem('acervo_api_url','http://192.168.0.10:8080'))
//   3. http://localhost:8080 (porta padrão do Spring Boot)

function storedUrl() {
    try {
        return localStorage.getItem('acervo_api_url');
    } catch {
        return null;
    }
}

const rawUrl = window.ACERVO_API_URL || storedUrl() || 'https://api-acervo-alexandria-cnft.onrender.com';

export const API_BASE_URL = String(rawUrl).replace(/\/+$/, '');

/** false = usa só o catálogo de exemplo (catalogo.js), sem tentar a API. */
export const USE_API = window.ACERVO_USE_API !== false;

/** Tempo máximo de espera por resposta (ms). */
export const API_TIMEOUT_MS = 45000;

/** Livros por página nas listagens e na busca (o banco tem milhares: nunca carregamos tudo). */
export const CATALOG_PAGE_SIZE = 48;

/**
 * A API ainda não tem campo de capa. Enquanto isso, tenta a capa pelo ISBN no Open Library;
 * se não existir, o front troca pelo placeholder (setupCoverFallback em index.js).
 * Troque por `null` para usar sempre o placeholder, ou ajuste quando a API devolver a URL da capa.
 */
export const coverUrlForIsbn = (isbn) =>
    isbn ? `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(isbn)}-M.jpg?default=false` : null;