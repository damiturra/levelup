// cart-page.js - Funcionalidad de la página del carrito

document.addEventListener('DOMContentLoaded', function() {
    const tbody = document.getElementById('carritoTbody');
    const subtotalElement = document.getElementById('subtotal');
    const descuentoElement = document.getElementById('descuento');
    const totalElement = document.getElementById('total');
    const btnVaciar = document.getElementById('btnVaciar');
    const carritoVacio = document.getElementById('carritoVacio');
    const msgDescuento = document.getElementById('msgDescuento');
    
    // Formatear precio
    function formatPrice(price) {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(price);
    }

    // Actualizar cantidad de un producto
    function updateQuantity(code, newQty) {
        console.log('updateQuantity:', code, newQty);
        
        if (newQty < 1) {
            if (confirm('¿Deseas eliminar este producto del carrito?')) {
                removeFromCart(code);
            }
            return;
        }

        const cart = Cart.get();
        const item = cart.find(i => i.code === code);
        if (!item) return;

        const product = window.PRODUCTS.find(p => p.code === code);
        if (!product) return;

        if (newQty > product.stock) {
            alert(`Solo hay ${product.stock} unidades disponibles.`);
            return;
        }

        item.quantity = newQty;
        Cart.save(cart);
        renderCart();
    }

    // Eliminar producto del carrito
    function removeFromCart(code) {
        console.log('removeFromCart:', code);
        const cart = Cart.get();
        const newCart = cart.filter(item => item.code !== code);
        Cart.save(newCart);
        renderCart();
    }

    // Vaciar carrito
    function emptyCart() {
        if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
            Cart.save([]);
            renderCart();
        }
    }

    // Calcular descuento DUOC
    function calculateDiscount(subtotal) {
        // Si el usuario tiene correo DUOC, aplicar 20% de descuento
        const user = window.getCurrentUser?.();
        if (user?.email?.toLowerCase().endsWith('@duoc.cl')) {
            msgDescuento?.classList.remove('d-none');
            return subtotal * 0.2; // 20% descuento
        }
        msgDescuento?.classList.add('d-none');
        return 0;
    }

    // Renderizar carrito
    function renderCart() {
        console.log('renderCart - inicio');
        const cart = Cart.get();
        
        // Mostrar/ocultar mensaje de carrito vacío
        if (cart.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-4">
                        <p class="mb-2">Tu carrito está vacío</p>
                        <a href="catalogo.html" class="btn btn-outline-neon">Ver catálogo</a>
                    </td>
                </tr>
            `;
            carritoVacio?.classList.remove('d-none');
            return;
        }
        
        carritoVacio?.classList.add('d-none');
        let subtotal = 0;
        
        // Renderizar productos
        tbody.innerHTML = '';
        cart.forEach(item => {
            const itemSubtotal = item.price * item.quantity;
            subtotal += itemSubtotal;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="d-flex gap-3 align-items-center">
                        <img src="${item.image}" class="product-img" alt="${item.name}">
                        <div>
                            <h6 class="mb-0">${item.name}</h6>
                            <small class="text-secondary">${item.code}</small>
                        </div>
                    </div>
                </td>
                <td class="text-center">
                    <div class="input-group input-group-sm" style="width:100px;margin:auto">
                        <button class="btn btn-outline-secondary" type="button" 
                                onclick="CartPage.updateQuantity('${item.code}', ${item.quantity - 1})">-</button>
                        <input type="number" class="form-control text-center" value="${item.quantity}" 
                               min="1" onchange="CartPage.updateQuantity('${item.code}', this.value)">
                        <button class="btn btn-outline-secondary" type="button"
                                onclick="CartPage.updateQuantity('${item.code}', ${item.quantity + 1})">+</button>
                    </div>
                </td>
                <td class="text-end">${formatPrice(item.price)}</td>
                <td class="text-end">${formatPrice(itemSubtotal)}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-danger" 
                            onclick="CartPage.removeFromCart('${item.code}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Actualizar totales
        const descuento = calculateDiscount(subtotal);
        const total = subtotal - descuento;

        if (subtotalElement) subtotalElement.textContent = formatPrice(subtotal);
        if (descuentoElement) descuentoElement.textContent = formatPrice(descuento);
        if (totalElement) totalElement.textContent = formatPrice(total);

        console.log('renderCart - completado');
    }

    // Event listeners
    btnVaciar?.addEventListener('click', emptyCart);

    // Exponer funciones necesarias
    window.CartPage = {
        updateQuantity,
        removeFromCart,
        emptyCart
    };

    // Renderizar carrito inicial
    renderCart();
});
