// js/search.js — resultados de busca / categoria.
// Com a API no ar, a busca roda NO SERVIDOR (GET /livros/busca, paginada): o banco tem milhares de livros.
// Sem a API, filtra o catálogo de exemplo (catalogo.js).
import {BOOKS, CATEGORIES, catalogSource, livroToBook, registerBooks} from './catalogo.js';
import {buscarLivrosPorTitulo, listarPaginaLivros} from './api.js';
import {createBookCard, pluralize} from './ui.js';

const params = new URLSearchParams(window.location.search);
const query = (params.get('q') ?? '').trim().slice(0, 100);
const category = params.get('categoria');
const categoryLabel = CATEGORIES[category]; // slug desconhecido vira undefined: ignorado

const title = document.getElementById('search-title');
const count = document.getElementById('search-count');
const grid = document.getElementById('results-grid');
const emptyState = document.getElementById('results-empty');
const searchInput = document.getElementById('searchInput');
const minPrice = document.getElementById('minPrice');
const maxPrice = document.getElementById('maxPrice');

if (searchInput && query) searchInput.value = query;

// Cabeçalho: busca por texto, categoria ou todos os livros
title.replaceChildren();
if (query) {
    title.append('Resultados para: ');
    const highlight = document.createElement('span');
    highlight.className = 'highlight';
    highlight.textContent = `"${query}"`;
    title.append(highlight);
} else if (categoryLabel) {
    title.append('Categoria: ');
    const highlight = document.createElement('span');
    highlight.className = 'highlight';
    highlight.textContent = categoryLabel;
    title.append(highlight);
} else {
    title.textContent = 'Todos os livros';
}
document.title = `${query ? `Busca: ${query}` : categoryLabel ?? 'Todos os livros'} — Acervo de Alexandria`;

// Pré-marca o gênero da URL, se existir na barra lateral
document.querySelectorAll('input[name="gen"]').forEach((box) => {
    box.checked = box.value === category;
});

const normalize = (text) =>
    text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const PRICE_RANGES = {
    'ate-50': [0, 5000],
    '50-100': [5000, 10000],
    '100-200': [10000, 20000],
    'acima-200': [20000, Infinity],
};

const checkedValues = (name) =>
    [...document.querySelectorAll(`input[name="${name}"]:checked`)].map((box) => box.value);

const useApi = catalogSource === 'api';

// Palavras da busca, sem acento e em minúsculas: o livro precisa ter TODAS (em qualquer ordem) no título ou autor
const queryWords = normalize(query).split(/\s+/).filter(Boolean);

// Filtros extras (só com a API): valores da barra lateral -> dados do livro
const FORMATS = {comum: 'CAPA_COMUM', dura: 'CAPA_DURA', ebook: 'EBOOK', audiobook: 'AUDIOBOOK'};

function matches(book) {
    if (queryWords.length) {
        const haystack = normalize(`${book.title} ${book.author}`);
        if (!queryWords.every((word) => haystack.includes(word))) return false;
    }

    // Gênero: só os quadradinhos marcados filtram. Nenhum marcado = todos os livros.
    // (a categoria da URL apenas pré-marca o quadradinho correspondente)
    const genres = checkedValues('gen');
    if (genres.length && !genres.some((genre) => book.categories.includes(genre))) return false;

    if (useApi) {
        const formats = checkedValues('formato').map((key) => FORMATS[key]);
        if (formats.length && !formats.includes(book.format)) return false;

        const minRatings = checkedValues('aval').map(Number);
        if (minRatings.length && !(book.rating !== null && book.rating >= Math.min(...minRatings))) return false;

        const years = checkedValues('ano');
        if (years.length) {
            const inYears = years.some((year) => (year === 'anteriores' ? book.year !== null && book.year < 2024 : book.year === Number(year)));
            if (!inYears) return false;
        }
    }

    const ranges = checkedValues('preco').map((key) => PRICE_RANGES[key]);
    const min = minPrice.value === '' ? null : Number(minPrice.value) * 100;
    const max = maxPrice.value === '' ? null : Number(maxPrice.value) * 100;
    if (min !== null) ranges.push([min, max ?? Infinity]);
    else if (max !== null) ranges.push([0, max]);
    if (ranges.length && !ranges.some(([low, high]) => book.price >= low && book.price <= high)) {
        return false;
    }
    return true;
}

/* ----- Resultados e paginação ----- */
let results = useApi ? [] : BOOKS; // livros carregados até agora
let page = 0;
let total = null;
let hasMore = useApi;
let loading = false;
let loadError = '';

const moreButton = document.createElement('button');
moreButton.type = 'button';
moreButton.className = 'btn-primary btn-load-more';
moreButton.textContent = 'CARREGAR MAIS';
moreButton.hidden = true;
grid.after(moreButton);

function render() {
    const visible = results.filter(matches);
    grid.replaceChildren(...visible.map((book) => createBookCard(book)));
    grid.hidden = visible.length === 0;
    emptyState.hidden = visible.length > 0 || loading;
    const filtering = visible.length !== results.length;
    if (visible.length) {
        const of = useApi && total !== null && !filtering ? ` de ${total}` : '';
        count.textContent = `Exibindo ${visible.length}${of} ${visible.length === 1 ? 'livro' : 'livros'}`;
    } else {
        count.textContent = loading ? 'Buscando…' : 'Nenhum livro encontrado';
    }
    if (loadError) count.textContent = loadError;
    moreButton.hidden = !(useApi && hasMore && !loadError);
    moreButton.disabled = loading;
    moreButton.textContent = loading ? 'CARREGANDO…' : 'CARREGAR MAIS';
}

// O servidor procura uma só expressão no título. Para aceitar palavras em qualquer ordem, mandamos a
// palavra mais longa e o front filtra o resto (todas as palavras, no título ou no autor).
const serverTerm = query.split(/\s+/).filter(Boolean).sort((a, b) => b.length - a.length)[0] ?? '';
const MIN_VISIBLE = 24; // enquanto houver menos que isso na tela (por causa dos filtros), busca mais páginas
const MAX_AUTO_PAGES = 6;
let autoPages = 0;

async function loadMore() {
    if (loading || !hasMore) return;
    loading = true;
    loadError = '';
    render();
    try {
        const data = serverTerm
            ? await buscarLivrosPorTitulo(serverTerm, {page})
            : await listarPaginaLivros({page});
        results = results.concat(registerBooks(data.content.map(livroToBook)));
        total = data.total;
        hasMore = !data.last;
        page += 1;
    } catch (error) {
        loadError = error.message || 'Não foi possível buscar os livros agora.';
        hasMore = false;
    } finally {
        loading = false;
        render();
    }
    // Filtros deixaram poucos resultados na tela: continua buscando algumas páginas sozinho
    if (hasMore && !loadError && results.filter(matches).length < MIN_VISIBLE && autoPages < MAX_AUTO_PAGES) {
        autoPages += 1;
        loadMore();
    }
}

moreButton.addEventListener('click', loadMore);
document.querySelector('.search-filters').addEventListener('change', render);
document.querySelector('.btn-price-apply').addEventListener('click', render);
[minPrice, maxPrice].forEach((input) =>
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            render();
        }
    })
);

// Filtros que dependem de dados da API
if (useApi) {
    // Gênero: a API ainda não tem categorias, então esse filtro não tem como funcionar
    const genreGroup = document.querySelector('input[name="gen"]')?.closest('fieldset');
    genreGroup?.querySelectorAll('input').forEach((box) => {
        box.checked = false;
        box.disabled = true;
    });
    if (genreGroup) {
        const note = document.createElement('p');
        note.className = 'filter-note';
        note.textContent = 'Disponível quando a API tiver categorias.';
        genreGroup.append(note);
    }
    // Formato, avaliação e lançamento já vêm da API (valem para os livros já carregados na tela)
    ['formato', 'aval', 'ano'].forEach((name) => {
        document.querySelectorAll(`input[name="${name}"]`).forEach((box) => {
            box.disabled = false;
        });
        document.querySelector(`input[name="${name}"]`)?.closest('fieldset')?.querySelector('.filter-note')?.remove();
    });
    // Página de categoria sem categorias na API: avisa e oferece o catálogo completo
    if (categoryLabel && !query) {
        hasMore = false;
        const text = emptyState.querySelector('p');
        const link = emptyState.querySelector('a');
        if (text) text.textContent = 'As categorias ainda não estão disponíveis. Veja o catálogo completo ou use a busca.';
        if (link) {
            link.href = 'resultado-busca.html';
            link.textContent = 'Ver catálogo completo';
        }
    }
}

render();
if (useApi && hasMore) loadMore();