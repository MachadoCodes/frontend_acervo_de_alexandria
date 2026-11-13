// js/produto.js — preenche a página do produto a partir de ?livro=<slug>
import {BOOKS, findBook} from './catalogo.js';
import {addToCart, readCart, removeFromCart, setQty, isWished, toggleWishlist} from './store.js';
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

    // Carrinho: o card mostra se o livro já foi adicionado e o botão alterna entre adicionar e remover.
    // A pessoa continua na página (a regra de negócio não manda ir para o carrinho).
    const quantity = document.getElementById('quantity');
    const addButton = document.getElementById('btn-add-cart');
    const cartStatus = document.getElementById('cart-status');
    const cartStatusText = document.getElementById('cart-status-text');

    const cartItem = () => readCart().find((item) => item.slug === book.slug);

    function renderCart() {
        const item = cartItem();
        addButton.textContent = item ? 'Remover do carrinho' : 'Adicionar ao carrinho';
        addButton.classList.toggle('is-in-cart', Boolean(item));
        cartStatus.hidden = !item;
        if (!item) return;

        // O carrinho aceita mais de 5 unidades; garante que o seletor tenha essa opção
        if (![...quantity.options].some((option) => option.value === String(item.qty))) {
            quantity.add(new Option(String(item.qty), String(item.qty)));
        }
        quantity.value = String(item.qty);
        cartStatusText.textContent = `Adicionado ao carrinho (${item.qty} ${item.qty === 1 ? 'unidade' : 'unidades'})`;
    }

    document.getElementById('purchase-form').addEventListener('submit', (event) => {
        event.preventDefault();
        if (cartItem()) removeFromCart(book.slug);
        else addToCart(book.slug, Number(quantity.value) || 1);
        renderCart();
    });

    // Mudar a quantidade com o livro já no carrinho atualiza o carrinho
    quantity.addEventListener('change', () => {
        if (!cartItem()) return;
        setQty(book.slug, Number(quantity.value));
        renderCart();
    });

    // Carrinho alterado em outra aba, ou volta pelo botão "voltar" do navegador
    window.addEventListener('storage', renderCart);
    window.addEventListener('pageshow', renderCart);
    renderCart();

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