// js/produto.js — preenche a página do produto a partir de ?livro=<slug>
import {BOOKS, findBook} from './catalogo.js';
import {addToCart, isWished, toggleWishlist} from './store.js';
import {formatCents} from './ui.js';

const params = new URLSearchParams(window.location.search);
const book = findBook(params.get('livro')) ?? (params.has('livro') ? null : BOOKS[0]);

const content = document.getElementById('product-content');
const notFound = document.getElementById('product-not-found');

if (!book) {
    content.hidden = true;
    notFound.hidden = false;
    document.title = 'Livro não encontrado — Acervo de Alexandria';
} else {
    document.title = `${book.title} — Acervo de Alexandria`;
    document.querySelector('meta[name="description"]')
        ?.setAttribute('content', `Detalhes do livro ${book.title} no Acervo de Alexandria.`);

    const cover = document.getElementById('product-cover');
    cover.src = book.cover;
    cover.alt = `Capa do livro ${book.title}`;

    document.getElementById('product-title').textContent = book.title;
    const author = document.getElementById('product-author');
    author.textContent = book.author ? `por ${book.author}` : '';
    author.hidden = !book.author;
    document.getElementById('product-synopsis').textContent = book.synopsis;
    document.getElementById('product-price').textContent = formatCents(book.price);

    // Especificações: só aparecem as que existem para este livro
    const specs = document.getElementById('product-specs');
    const entries = Object.entries(book.specs ?? {});
    document.getElementById('product-details').hidden = entries.length === 0;
    specs.replaceChildren(...entries.map(([label, value]) => {
        const li = document.createElement('li');
        const strong = document.createElement('strong');
        strong.textContent = `${label}: `;
        li.append(strong, value);
        return li;
    }));

    // Adicionar ao carrinho -> vai para o carrinho
    document.getElementById('purchase-form').addEventListener('submit', (event) => {
        event.preventDefault();
        addToCart(book.slug, Number(document.getElementById('quantity').value) || 1);
        window.location.href = 'carrinho.html';
    });

    // Lista de desejos
    const wishButton = document.getElementById('btn-wishlist');
    const renderWish = () => {
        const wished = isWished(book.slug);
        wishButton.textContent = wished ? 'Remover da wishlist' : 'Adicionar à wishlist';
        wishButton.setAttribute('aria-pressed', String(wished));
    };
    wishButton.addEventListener('click', () => {
        toggleWishlist(book.slug);
        renderWish();
    });
    renderWish();
}
