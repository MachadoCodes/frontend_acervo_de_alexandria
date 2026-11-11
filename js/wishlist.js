// js/wishlist.js — lista de desejos guardada no navegador (ver store.js)
import {findBook} from './catalogo.js';
import {readWishlist, removeFromWishlist, addToCart} from './store.js';
import {createBookCard, productUrl, pluralize} from './ui.js';

const grid = document.getElementById('wishlist-grid');
const empty = document.getElementById('wishlist-empty');
const controls = document.getElementById('wishlist-controls');
const count = document.getElementById('wishlist-count');
const sortSelect = document.getElementById('sort-wishlist');

const collator = new Intl.Collator('pt-BR', {sensitivity: 'base'});
const SORTERS = {
    'date-desc': (a, b) => b.index - a.index,
    'date-asc': (a, b) => a.index - b.index,
    'alpha-asc': (a, b) => collator.compare(a.book.title, b.book.title),
    'alpha-desc': (a, b) => collator.compare(b.book.title, a.book.title),
    'price-asc': (a, b) => a.book.price - b.book.price,
    'price-desc': (a, b) => b.book.price - a.book.price,
};

function createCard(book) {
    const card = createBookCard(book, {headingTag: 'h2', extraClass: 'wishlist-card'});
    card.dataset.slug = book.slug;

    const actions = document.createElement('div');
    actions.className = 'wishlist-actions';

    const buy = document.createElement('button');
    buy.type = 'button';
    buy.className = 'btn-primary btn-wishlist-cart';
    buy.textContent = 'Comprar';
    buy.dataset.action = 'buy';

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'btn-remove-icon';
    remove.dataset.action = 'remove';
    remove.setAttribute('aria-label', `Remover ${book.title} da lista de desejos`);
    const icon = document.createElement('span');
    icon.className = 'material-symbols-outlined';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = 'delete';
    remove.append(icon);

    actions.append(buy, remove);
    card.append(actions);
    return card;
}

function render() {
    const entries = readWishlist().map((slug, index) => ({book: findBook(slug), index}));
    const hasItems = entries.length > 0;
    grid.hidden = !hasItems;
    controls.hidden = !hasItems;
    empty.hidden = hasItems;
    count.textContent = hasItems ? pluralize(entries.length, 'livro', 'livros') : '';

    entries.sort(SORTERS[sortSelect.value] ?? SORTERS['date-desc']);
    grid.replaceChildren(...entries.map(({book}) => createCard(book)));
}

grid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    const card = event.target.closest('.wishlist-card');
    if (!button || !card) return;

    if (button.dataset.action === 'remove') {
        removeFromWishlist(card.dataset.slug);
        render();
        document.getElementById('main').focus();
    } else if (button.dataset.action === 'buy') {
        addToCart(card.dataset.slug, 1);
        window.location.href = 'carrinho.html';
    }
});

sortSelect.addEventListener('change', render);
render();
