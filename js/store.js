// js/store.js — carrinho e lista de desejos guardados no navegador (localStorage).
// MOCK de front-end: quando existir back-end, o carrinho/lista devem ficar no servidor.
// O localStorage é editável pelo usuário: tudo é revalidado contra o catálogo ao ler.

import {findBook} from './catalogo.js';

export const CART_KEY = 'alexandria_cart';
export const WISHLIST_KEY = 'alexandria_wishlist';
export const SHIPPING_CENTS = {standard: 1590, express: 3290};
export const MAX_QTY = 99;

function readJson(key) {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return Array.isArray(value) ? value : [];
    } catch {
        return [];
    }
}

function writeJson(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        /* armazenamento indisponível (modo privado/cheio): segue sem persistir */
    }
    window.dispatchEvent(new CustomEvent('acervo:store-changed', {detail: {key}}));
}

/* ----- Carrinho: [{slug, qty}] ----- */
export function readCart() {
    return readJson(CART_KEY)
        .filter((item) => item && findBook(item.slug))
        .map((item) => ({
            slug: item.slug,
            qty: Number.isInteger(item.qty) ? Math.min(Math.max(item.qty, 1), MAX_QTY) : 1,
        }));
}

export function addToCart(slug, qty = 1) {
    if (!findBook(slug)) return;
    const items = readCart();
    const existing = items.find((item) => item.slug === slug);
    if (existing) existing.qty = Math.min(existing.qty + qty, MAX_QTY);
    else items.push({slug, qty: Math.min(Math.max(qty, 1), MAX_QTY)});
    writeJson(CART_KEY, items);
}

export function setQty(slug, qty) {
    const items = readCart();
    const item = items.find((entry) => entry.slug === slug);
    if (!item) return;
    item.qty = Math.min(Math.max(Math.trunc(qty) || 1, 1), MAX_QTY);
    writeJson(CART_KEY, items);
}

export function removeFromCart(slug) {
    writeJson(CART_KEY, readCart().filter((item) => item.slug !== slug));
}

export function clearCart() {
    writeJson(CART_KEY, []);
}

export const cartCount = (items = readCart()) => items.reduce((total, item) => total + item.qty, 0);

export const cartSubtotalCents = (items = readCart()) =>
    items.reduce((total, item) => total + findBook(item.slug).price * item.qty, 0);

/* ----- Lista de desejos: ["slug", ...] ----- */
export function readWishlist() {
    return readJson(WISHLIST_KEY).filter((slug) => typeof slug === 'string' && findBook(slug));
}

export const isWished = (slug) => readWishlist().includes(slug);

/** Alterna o item e devolve true se ele agora está na lista. */
export function toggleWishlist(slug) {
    const list = readWishlist();
    const index = list.indexOf(slug);
    if (index >= 0) list.splice(index, 1);
    else list.push(slug);
    writeJson(WISHLIST_KEY, list);
    return index < 0;
}

export function removeFromWishlist(slug) {
    writeJson(WISHLIST_KEY, readWishlist().filter((entry) => entry !== slug));
}

/* ----- Entrega e pedido (sessionStorage: dura só enquanto a aba estiver aberta) ----- */
export const DELIVERY_KEY = 'alexandria_delivery';
export const ORDER_KEY = 'alexandria_order';
const DELIVERY_FIELDS = ['nome', 'sobrenome', 'email', 'pais', 'cep', 'estado', 'cidade', 'endereco', 'numero', 'complemento', 'notas'];

function readSession(key) {
    try {
        const value = JSON.parse(sessionStorage.getItem(key));
        return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
    } catch {
        return null;
    }
}

function writeSession(key, value) {
    try {
        sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
        /* sem armazenamento: o fluxo precisa de entrega salva, então a próxima página volta para a entrega */
    }
}

/** Salva só os campos conhecidos, como texto limitado a 200 caracteres. */
export function saveDelivery(data) {
    const clean = {method: data.method === 'express' ? 'express' : 'standard', member: data.member === true};
    DELIVERY_FIELDS.forEach((field) => {
        if (typeof data[field] === 'string') clean[field] = data[field].trim().slice(0, 200);
    });
    writeSession(DELIVERY_KEY, clean);
}

export const readDelivery = () => readSession(DELIVERY_KEY);

export function saveOrder(order) {
    writeSession(ORDER_KEY, {
        id: String(order.id).slice(0, 30),
        method: String(order.method).slice(0, 40),
        total: String(order.total).slice(0, 30),
    });
}

export const readOrder = () => readSession(ORDER_KEY);
