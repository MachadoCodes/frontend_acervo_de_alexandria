// js/sucesso.js — mostra os dados do pedido concluído (guardados por pagamento.js)
import {readOrder} from './store.js';

const order = readOrder();

// Sem pedido recente não há o que confirmar: volta para a loja
if (!order) {
    window.location.replace('index.html');
} else {
    document.getElementById('order-id').textContent = order.id;
    document.getElementById('order-method').textContent = order.method;
    document.getElementById('order-total').textContent = order.total;
}
