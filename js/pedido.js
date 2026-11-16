// js/pedido.js — transforma o carrinho do navegador em pedido na API.
// A API mantém o carrinho no servidor (por usuário logado); o front guarda o carrinho localmente para
// funcionar sem login. No checkout os dois são sincronizados: o carrinho do servidor é esvaziado,
// recebe exatamente os itens do navegador e então POST /pedidos finaliza a compra.
import {
    listarCarrinho, adicionarAoCarrinho, removerDoCarrinho, criarPedido,
} from './api.js';

/** @param {{slug: string, qty: number}[]} items slug = id do livro na API */
export async function submitOrderToApi(items) {
    if (!items.length) throw new Error('O carrinho está vazio.');

    const stale = await listarCarrinho();
    for (const entry of stale) await removerDoCarrinho(entry.livroId);

    for (const item of items) {
        const livroId = Number(item.slug);
        if (!Number.isInteger(livroId)) throw new Error('Item inválido no carrinho. Remova-o e tente de novo.');
        await adicionarAoCarrinho(livroId, item.qty);
    }
    return criarPedido();
}