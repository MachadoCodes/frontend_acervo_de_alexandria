// js/search.js — resultados de busca / categoria sobre o catálogo MOCK (ver catalogo.js)
import {BOOKS, CATEGORIES} from './catalogo.js';
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

function matches(book) {
    if (query) {
        const haystack = normalize(`${book.title} ${book.author}`);
        if (!normalize(query).split(/\s+/).every((word) => haystack.includes(word))) return false;
    }
    if (categoryLabel && !book.categories.includes(category)) return false;

    const genres = checkedValues('gen');
    if (genres.length && !genres.some((genre) => book.categories.includes(genre))) return false;

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

function render() {
    const results = BOOKS.filter(matches);
    grid.replaceChildren(...results.map((book) => createBookCard(book)));
    grid.hidden = results.length === 0;
    emptyState.hidden = results.length > 0;
    count.textContent = results.length
        ? `Exibindo ${pluralize(results.length, 'livro encontrado', 'livros encontrados')}`
        : 'Nenhum livro encontrado';
}

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
render();
