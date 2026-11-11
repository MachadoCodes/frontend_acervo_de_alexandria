// js/ui.js — utilidades de interface compartilhadas (formatação e cartões de livro)

const brl = new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'});

/** 20720 -> "R$ 207,20" */
export const formatCents = (cents) => brl.format(cents / 100);

/** Link para a página do produto (o slug vem do catálogo, nunca de texto digitado). */
export const productUrl = (slug) => `produto.html?livro=${encodeURIComponent(slug)}`;

/**
 * Cria um cartão de livro igual ao das prateleiras da home.
 * Todo texto entra por textContent: dados vindos da API nunca são interpretados como HTML.
 */
export function createBookCard(book, {headingTag = 'h3', extraClass = ''} = {}) {
    const card = document.createElement('article');
    card.className = `book-card ${extraClass}`.trim();

    const cover = document.createElement('img');
    cover.className = 'book-cover';
    cover.src = book.cover;
    cover.alt = '';
    cover.width = 120;
    cover.height = 180;
    cover.loading = 'lazy';
    cover.decoding = 'async';

    const title = document.createElement(headingTag);
    title.className = 'book-title';
    const link = document.createElement('a');
    link.className = 'book-link';
    link.href = productUrl(book.slug);
    link.textContent = book.title;
    title.append(link);

    card.append(cover, title);

    if (book.author) {
        const author = document.createElement('p');
        author.className = 'book-author';
        author.textContent = book.author;
        card.append(author);
    }

    const price = document.createElement('p');
    price.className = 'book-price';
    const data = document.createElement('data');
    data.value = (book.price / 100).toFixed(2);
    data.textContent = formatCents(book.price);
    price.append(data);
    card.append(price);

    return card;
}

/** Texto com plural correto: pluralize(1,'livro','livros') -> "1 livro" */
export const pluralize = (n, one, many) => `${n} ${n === 1 ? one : many}`;
