// receipt-page.js - Funcionalidad de la página de comprobante

document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos DOM
    const compNotFound = document.getElementById('compNotFound');
    const compOrdenId = document.getElementById('compOrdenId');
    const compFecha = document.getElementById('compFecha');
    const compCliente = document.getElementById('compCliente');
    const compCorreo = document.getElementById('compCorreo');
    const compDuoc = document.getElementById('compDuoc');
    const compTbody = document.getElementById('compTbody');
    const compSubtotal = document.getElementById('compSubtotal');
    const compDescuento = document.getElementById('compDescuento');
    const compTotal = document.getElementById('compTotal');
    const btnImprimir = document.getElementById('btnImprimir');

    // Formatear precio en CLP
    function formatPrice(price) {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(price);
    }

    // Generar ID único para la orden
    function generateOrderId() {
        const timestamp = new Date().getTime().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        return `ORD-${timestamp}-${random}`.toUpperCase();
    }

    // Renderizar comprobante
    function renderReceipt() {
        // Obtener datos necesarios
        const cart = Cart?.get() || [];
        const currentUser = window.getCurrentUser?.();

        // Si no hay carrito o usuario, mostrar error
        if (!cart.length || !currentUser) {
            compNotFound?.classList.remove('d-none');
            return;
        }

        // Ocultar mensaje de error si llegamos aquí
        compNotFound?.classList.add('d-none');

        // Generar datos de la orden
        const orderId = generateOrderId();
        const now = new Date();
        const fecha = now.toLocaleDateString('es-CL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Llenar datos del comprobante
        compOrdenId.textContent = orderId;
        compFecha.textContent = fecha;
        compCliente.textContent = currentUser.name;
        compCorreo.textContent = currentUser.email;
        
        // Validar si es usuario DUOC
        const isDuoc = currentUser.email?.toLowerCase().endsWith('@duoc.cl');
        compDuoc.textContent = isDuoc ? 'Sí (-20%)' : 'No';

        // Calcular totales
        let subtotal = 0;
        
        // Limpiar y llenar tabla de productos
        compTbody.innerHTML = '';
        cart.forEach(item => {
            const itemSubtotal = item.price * item.quantity;
            subtotal += itemSubtotal;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.code}</td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-end">${formatPrice(item.price)}</td>
                <td class="text-end">${formatPrice(itemSubtotal)}</td>
            `;
            compTbody.appendChild(row);
        });

        // Calcular descuento y total
        const descuento = isDuoc ? subtotal * 0.2 : 0;
        const total = subtotal - descuento;

        // Mostrar totales
        compSubtotal.textContent = formatPrice(subtotal);
        compDescuento.textContent = formatPrice(descuento);
        compTotal.textContent = formatPrice(total);

        // Guardar la orden en el historial
        const orderData = {
            id: orderId,
            date: now.toISOString(),
            userId: currentUser.id,     // ← NUEVO: llave plana para filtrar fácil en Perfil
            user: currentUser,          // (mantén esto por compatibilidad)
            items: cart,
            subtotal,
            discount: descuento,
            total,
            isDuoc
            };


        // Guardar orden en localStorage
        const orders = JSON.parse(localStorage.getItem('levelup_orders') || '[]');
        orders.push(orderData);
        localStorage.setItem('levelup_orders', JSON.stringify(orders));
        localStorage.setItem('levelup_last_order', orderId);

        // Agregar puntos al usuario
        const pointsEarned = Math.floor(total * 0.01); // 1% en puntos
        const users = JSON.parse(localStorage.getItem('levelup_users') || '[]');
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex].points = (users[userIndex].points || 0) + pointsEarned;
            localStorage.setItem('levelup_users', JSON.stringify(users));
            localStorage.setItem('levelup_session', JSON.stringify(users[userIndex]));
        }

        // Vaciar carrito después de mostrar el comprobante
        Cart.save([]);

        // Guardar la orden en el historial del usuario
        const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
        const order = {
            id: orderId,
            date: now.toISOString(),
            user: {
                name: currentUser.name,
                email: currentUser.email
            },
            items: cart,
            subtotal,
            discount: descuento,
            total,
            isDuoc
        };
        orderHistory.push(order);
        localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
    }

    // Event Listeners
    btnImprimir?.addEventListener('click', () => {
        window.print();
    });

    // Renderizar comprobante al cargar
    renderReceipt();
});
