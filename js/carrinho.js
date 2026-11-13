// js/carrinho.js — renderiza o carrinho a partir do localStorage (via store.js)
import {findBook} from './catalogo.js';
import {readCart, setQty, removeFromCart, cartCount, cartSubtotalCents, SHIPPING_CENTS, MAX_QTY} from './store.js';
import {formatCents, productUrl, pluralize} from './ui.js';

const list = document.getElementById('cart-items-list');
const content = document.getElementById('cart-content');
const empty = document.getElementById('cart-empty');
const subtotalLabel = document.getElementById('summary-subtotal-label');
const subtotalValue = document.getElementById('summary-subtotal');
const shippingValue = document.getElementById('summary-shipping');
const totalValue = document.getElementById('summary-total');

function createItem(item) {
    const book = findBook(item.slug);
    const article = document.createElement('article');
    article.className = 'cart-item';

    const img = document.createElement('img');
    img.className = 'cart-item-img';
    img.src = book.cover;
    img.alt = `Capa ${book.title}`;
    img.width = 100;
    img.height = 150;

    const details = document.createElement('div');
    details.className = 'cart-item-details';
    const title = document.createElement('h3');
    title.className = 'cart-item-title';
    const link = document.createElement('a');
    link.href = productUrl(book.slug);
    link.textContent = book.title;
    title.append(link);
    details.append(title);
    if (book.author) {
        const author = document.createElement('p');
        author.className = 'cart-item-desc';
        author.textContent = book.author;
        details.append(author);
    }

    const controls = document.createElement('div');
    controls.className = 'cart-item-controls';

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'btn-remove-item';
    remove.textContent = 'Remover';
    remove.setAttribute('aria-label', `Remover ${book.title} do carrinho`);
    remove.dataset.action = 'remove';
    remove.dataset.slug = book.slug;

    const group = document.createElement('div');
    group.className = 'qty-price-group';
    const label = document.createElement('label');
    label.className = 'visually-hidden';
    label.htmlFor = `qtd-${book.slug}`;
    label.textContent = `Quantidade de ${book.title}`;
    const input = document.createElement('input');
    input.type = 'number';
    input.id = `qtd-${book.slug}`;
    input.className = 'cart-qty-input';
    input.min = '1';
    input.max = String(MAX_QTY);
    input.value = String(item.qty);
    input.dataset.action = 'qty';
    input.dataset.slug = book.slug;
    const price = document.createElement('span');
    price.className = 'cart-item-price';
    price.textContent = formatCents(book.price * item.qty);
    group.append(label, input, price);

    controls.append(remove, group);
    article.append(img, details, controls);
    return article;
}

function render() {
    const items = readCart();
    const hasItems = items.length > 0;
    content.hidden = !hasItems;
    empty.hidden = hasItems;
    if (!hasItems) return;

    list.replaceChildren(...items.map(createItem));

    const subtotal = cartSubtotalCents(items);
    const shipping = SHIPPING_CENTS.standard;
    subtotalLabel.textContent = `Subtotal (${pluralize(cartCount(items), 'item', 'itens')})`;
    subtotalValue.textContent = formatCents(subtotal);
    shippingValue.textContent = formatCents(shipping);
    totalValue.textContent = formatCents(subtotal + shipping);
}

list.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action="remove"]');
    if (!button) return;
    removeFromCart(button.dataset.slug);
    render();
    document.getElementById('main').focus();
});

// 'change' (e não 'input'): evita recriar o campo enquanto a pessoa ainda está digitando
list.addEventListener('change', (event) => {
    const input = event.target.closest('[data-action="qty"]');
    if (!input) return;
    setQty(input.dataset.slug, Number(input.value));
    render();
});

render();
