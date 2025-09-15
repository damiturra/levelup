// Manejo del carrito de compras
(function() {
    // Constantes
    const CART_KEY = 'cart';
    const DEBUG = true;

    // Función de debug
    function debug(...args) {
        if (DEBUG) console.log('[Cart]', ...args);
    }

    // Obtener carrito
    function getCart() {
        try {
            const cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
            debug('getCart:', cart);
            return Array.isArray(cart) ? cart : [];
        } catch (e) {
            console.error('Error al leer el carrito:', e);
            return [];
        }
    }

    // Guardar carrito
    function saveCart(cart) {
        try {
            localStorage.setItem(CART_KEY, JSON.stringify(cart));
            updateBadge();
            debug('saveCart:', cart);
        } catch (e) {
            console.error('Error al guardar el carrito:', e);
        }
    }

    // Actualizar badge del carrito
    function updateBadge() {
        const badge = document.getElementById('cartCount');
        if (badge) {
            const cart = getCart();
            const total = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
            badge.textContent = total.toString();
            badge.style.display = total > 0 ? '' : 'none';
            debug('updateBadge:', total);
        }
    }

    // Mostrar notificación
    function showToast(message) {
        const toastEl = document.getElementById('cartToast');
        if (!toastEl) {
            debug('Toast element not found');
            return;
        }

        const toastBody = toastEl.querySelector('.toast-body');
        if (toastBody) {
            toastBody.textContent = message;
        }

        const toast = new bootstrap.Toast(toastEl);
        toast.show();
        debug('showToast:', message);
    }

    // Agregar al carrito
    function addToCart(code, quantity = 1) {
        debug('addToCart - start:', { code, quantity });

        // Validar cantidad
        quantity = parseInt(quantity);
        if (isNaN(quantity) || quantity < 1) {
            console.error('Cantidad inválida:', quantity);
            return false;
        }

        // Buscar producto
        const product = window.PRODUCTS?.find(p => p.code === code);
        if (!product) {
            console.error('Producto no encontrado:', code);
            return false;
        }

        debug('addToCart - product found:', product);

        // Verificar stock
        if (product.stock < 1) {
            alert('Lo sentimos, este producto está agotado.');
            return false;
        }

        // Obtener carrito actual
        const cart = getCart();
        const existingItem = cart.find(item => item.code === code);
        
        if (existingItem) {
            // Verificar stock antes de incrementar
            if (existingItem.quantity + quantity > product.stock) {
                alert(`Solo hay ${product.stock} unidades disponibles y ya tienes ${existingItem.quantity} en el carrito.`);
                return false;
            }
            existingItem.quantity += quantity;
        } else {
            cart.push({
                code: product.code,
                name: product.name,
                price: product.price,
                quantity: quantity,
                image: `assets/images/${product.code}.webp`
            });
        }

        // Guardar y notificar
        saveCart(cart);
        showToast(`¡${product.name} fue agregado al carrito!`);
        debug('addToCart - success');
        return true;
    }

    // Exponer funciones necesarias globalmente
    window.Cart = {
        add: addToCart,
        get: getCart,
        save: saveCart,
        update: updateBadge
    };

    // Inicializar al cargar la página
    document.addEventListener('DOMContentLoaded', () => {
        updateBadge();
        debug('Cart system initialized');
    });
})();
