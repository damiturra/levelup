// order-history.js - Manejo del historial de compras en el perfil

document.addEventListener('DOMContentLoaded', function() {
    // Referencias DOM
    const purchaseHistoryTable = document.getElementById('purchaseHistoryTable');
    const purchaseHistoryBody = document.getElementById('purchaseHistoryBody');
    const noPurchasesMessage = document.getElementById('noPurchasesMessage');

    if (!purchaseHistoryTable || !purchaseHistoryBody || !noPurchasesMessage) {
        console.error('No se encontraron elementos del historial de compras');
        return;
    }

    // Obtener usuario actual
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    // Obtener órdenes del usuario
    const orders = getLocalStorage('levelup_orders', [])
        .filter(order => order.user.id === currentUser.id)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (orders.length === 0) {
        purchaseHistoryTable.classList.add('d-none');
        noPurchasesMessage.classList.remove('d-none');
        return;
    }

    purchaseHistoryTable.classList.remove('d-none');
    noPurchasesMessage.classList.add('d-none');
    
    // Limpiar y llenar tabla
    purchaseHistoryBody.innerHTML = orders.map(order => `
        <tr>
            <td>${new Date(order.date).toLocaleDateString()}</td>
            <td>${order.id}</td>
            <td>${order.items.reduce((sum, item) => sum + item.quantity, 0)} productos</td>
            <td class="text-end">$${order.total.toLocaleString()}</td>
            <td class="text-center">
                <a href="comprobante.html?order=${order.id}" class="btn btn-sm btn-outline-neon">
                    Ver detalle
                </a>
            </td>
        </tr>
    `).join('');
});
