// Envia o pedido para a API (POST /pedidos). A API calcula frete, desconto e total.
import {criarPedido} from './api.js';

const PAYMENT_METHODS = {
    credit_card: 'CREDIT_CARD', pix: 'PIX', digital_wallet: 'DIGITAL_WALLET',
    paypal: 'PAYPAL', crypto: 'CRYPTO', boleto: 'BOLETO',
};

/** Monta o corpo do POST /pedidos a partir do carrinho, da entrega e do pagamento escolhidos. */
export function buildOrderPayload({items, delivery, paymentType, installments, coupon}) {
    const itens = items.map((item) => {
        const livroId = Number(item.slug);
        if (!Number.isInteger(livroId)) throw new Error('Item inválido no carrinho. Remova-o e tente de novo.');
        return {livroId, quantidade: item.qty};
    });
    if (!itens.length) throw new Error('O carrinho está vazio.');
    if (!delivery || !delivery.cep || !delivery.endereco) {
        throw new Error('Informe o endereço de entrega para continuar.');
    }
    const metodoPagamento = PAYMENT_METHODS[paymentType];
    if (!metodoPagamento) throw new Error('Escolha uma forma de pagamento.');
    const text = (value) => (typeof value === 'string' ? value.trim() : '');
    return {
        itens,
        entrega: {
            metodo: delivery.method === 'express' ? 'EXPRESS' : 'STANDARD',
            nome: text(delivery.nome), sobrenome: text(delivery.sobrenome), email: text(delivery.email),
            pais: text(delivery.pais), cep: text(delivery.cep), estado: text(delivery.estado),
            cidade: text(delivery.cidade), endereco: text(delivery.endereco), numero: text(delivery.numero),
            complemento: text(delivery.complemento) || null, observacoes: text(delivery.notas) || null,
        },
        pagamento: {
            metodo: metodoPagamento,
            parcelas: paymentType === 'credit_card' ? Math.max(1, Number(installments) || 1) : 1,
        },
        cupom: coupon || null,
    };
}

export const submitOrderToApi = (options) => criarPedido(buildOrderPayload(options));