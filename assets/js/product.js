/**
 * Módulo de Detalle de Producto - Level Up Gamer
 * Maneja la visualización y funcionalidad de la página de detalle de producto.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Referencias DOM
    const detalleProducto = document.getElementById('detalleProducto');
    const cartToast = new bootstrap.Toast(document.getElementById('cartToast'));
    const wishlistToast = new bootstrap.Toast(document.getElementById('wishlistToast'));

    // Obtener código de producto de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const productCode = urlParams.get('code');

    // Obtener producto
    const product = window.PRODUCTS?.find(p => p.code === productCode);

    if (!product) {
        detalleProducto.innerHTML = `
            <div class="alert alert-warning" role="alert">
                <h4 class="alert-heading">Producto no encontrado</h4>
                <p>El producto que buscas no existe o ha sido removido del catálogo.</p>
                <hr>
                <a href="catalogo.html" class="btn btn-outline-neon">Volver al catálogo</a>
            </div>
        `;
        return;
    }

    // Formatear precio
    function formatPrice(price) {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(price);
    }

    // Obtener estado de stock
    function getStockStatus(stock) {
        if (stock > 10) return { text: 'En stock', icon: 'bi-circle-fill', class: 'text-success' };
        if (stock > 0) return { text: 'Pocas unidades', icon: 'bi-circle-fill', class: 'text-warning' };
        return { text: 'Sin stock', icon: 'bi-circle-fill', class: 'text-danger' };
    }

    // Obtener URL de imagen
    function getImageUrl(code) {
        // Mapeo específico de productos a sus extensiones
        const extensionMap = {
            'JM001': 'jpeg',  // Catan
            'JM002': 'jpg',   // Carcassonne
            'CG001': 'png',   // PC Gamer
            'AC001': 'webp',  // Controlador Xbox
            'AC002': 'webp',  // Auriculares
            'CO001': 'webp',  // PlayStation 5
            'SG001': 'webp',  // Silla Gamer
            'MS001': 'webp',  // Mouse
            'MP001': 'webp',  // Mousepad
            'PP001': 'webp'   // Polera
        };

        // Obtener la extensión correcta para el código
        const extension = extensionMap[code] || 'webp';
        return `assets/images/${code}.${extension}`;
    }

    // Renderizar detalle de producto
    function renderProductDetail() {
        const stockStatus = getStockStatus(product.stock);
        const currentUser = window.getCurrentUser?.();
        const isDuoc = currentUser?.email?.toLowerCase().endsWith('@duoc.cl');
        const discount = isDuoc ? product.price * 0.2 : 0;
        const finalPrice = product.price - discount;

        detalleProducto.innerHTML = `
            <div class="row g-4">
                <!-- Imagen y galería -->
                <div class="col-md-6">
                    <div class="mb-3">
                        <img src="${getImageUrl(product.code)}" 
                             class="prod-img" 
                             alt="${product.name}"
                             onerror="this.onerror=null; this.src='assets/images/default-product.png'">
                    </div>
                </div>

                <!-- Info producto -->
                <div class="col-md-6">
                    <nav aria-label="breadcrumb" class="mb-3">
                        <ol class="breadcrumb">
                            <li class="breadcrumb-item"><a href="catalogo.html" class="text-muted text-decoration-none">Catálogo</a></li>
                            <li class="breadcrumb-item"><span class="text-muted">${product.category}</span></li>
                        </ol>
                    </nav>

                    <h1 class="h2 brand-orbitron mb-3">${product.name}</h1>

                    <div class="mb-3">
                        <span class="stars">${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5-Math.floor(product.rating))}</span>
                        <small class="text-muted ms-2">${product.rating} de 5</small>
                    </div>

                    <div class="price-line mb-3">
                        ${isDuoc ? `<span class="base">${formatPrice(product.price)}</span>` : ''}
                        <span class="h3 mb-0">${formatPrice(finalPrice)}</span>
                        ${isDuoc ? '<span class="badge badge-duoc ms-2">DUOC -20%</span>' : ''}
                    </div>

                    <div class="mb-4">
                        <span class="${stockStatus.class}">
                            <i class="bi ${stockStatus.icon} me-1"></i>
                            ${stockStatus.text}
                        </span>
                    </div>

                    <div class="mb-4">
                        <label class="form-label">Cantidad</label>
                        <div class="input-group" style="width:140px">
                            <button class="btn btn-outline-neon" type="button" onclick="updateQuantity(-1)">-</button>
                            <input type="number" class="form-control text-center" id="quantity" value="1" min="1" max="${product.stock}">
                            <button class="btn btn-outline-neon" type="button" onclick="updateQuantity(1)">+</button>
                        </div>
                    </div>

                    <div class="d-grid gap-2 mb-4">
                        <button class="btn btn-neon-primary" onclick="addToCart()" ${product.stock ? '' : 'disabled'}>
                            <i class="bi bi-cart-plus me-2"></i>Agregar al carrito
                        </button>
                    </div>

                    <div class="mb-4">
                        <h4 class="h5 brand-orbitron mb-3">Descripción</h4>
                        <p class="mb-3">${product.description}</p>
                        <ul class="list-unstyled specs">
                            ${product.highlights.map(highlight => `
                                <li><i class="bi bi-check2 text-success me-2"></i>${highlight}</li>
                            `).join('')}
                        </ul>
                    </div>

                    <div class="mb-4">
                        <h4 class="h5 brand-orbitron mb-3">Autenticidad y Calidad</h4>
                        <ul class="list-unstyled specs">
                            <li>
                                <i class="bi bi-building me-2 text-muted"></i>
                                <strong>Fabricante:</strong> ${product.manufacturer}
                            </li>
                            <li>
                                <i class="bi bi-truck me-2 text-muted"></i>
                                <strong>Distribuidor:</strong> ${product.distributor}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    // Manejar cantidad
    window.updateQuantity = function(delta) {
        const quantityInput = document.getElementById('quantity');
        let newQty = parseInt(quantityInput.value) + delta;
        
        if (newQty < 1) newQty = 1;
        if (newQty > product.stock) newQty = product.stock;
        
        quantityInput.value = newQty;
    };

    // Manejar agregar al carrito
    window.addToCart = function() {
        const quantity = parseInt(document.getElementById('quantity').value);
        
        if (quantity < 1 || quantity > product.stock) {
            alert('Cantidad no válida');
            return;
        }

        if (!window.Cart || typeof window.Cart.add !== 'function') {
            console.error('Sistema de carrito no disponible');
            alert('Error: Sistema de carrito no disponible');
            return;
        }

        if (window.Cart.add(product.code, quantity)) {
            cartToast.show();
        }
    };

    // Sistema de reseñas
    function loadReviews() {
        const container = document.getElementById('reviewsContainer');
        if (!container) return;

        // Obtener reseñas del localStorage
        const reviews = JSON.parse(localStorage.getItem(`reviews_${productCode}`) || '[]');

        if (reviews.length === 0) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-info" role="alert">
                        <i class="bi bi-info-circle me-2"></i>
                        Sé el primero en dejar una reseña para este producto.
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = reviews.map(review => `
            <div class="col-md-6 mb-4">
                <div class="glass p-4 h-100 review-card">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div>
                            <h5 class="mb-2">${review.title}</h5>
                            <div class="stars mb-2">${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</div>
                        </div>
                        <small class="text-muted ms-3">${review.date}</small>
                    </div>
                    <p class="mb-4">${review.comment}</p>
                    <div class="d-flex justify-content-between align-items-center border-top border-electric pt-3">
                        <div class="d-flex align-items-center">
                            <i class="bi bi-person-circle text-electric me-2 fs-5"></i>
                            <span class="review-author">${review.name}</span>
                        </div>
                        <div class="d-flex gap-2">
                            <button class="btn btn-sm btn-outline-neon" onclick="likeReview(${review.id})">
                                <i class="bi bi-heart-fill me-1 text-danger"></i>
                                <span class="text-white">${review.likes || 0}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Manejar envío de reseña
    window.submitReview = function() {
        const form = document.getElementById('reviewForm');
        const rating = form.querySelector('input[name="rating"]:checked')?.value;
        const name = document.getElementById('reviewName').value;
        const title = document.getElementById('reviewTitle').value;
        const comment = document.getElementById('reviewComment').value;

        if (!rating || !name || !title || !comment) {
            alert('Por favor, completa todos los campos');
            return;
        }

        // Obtener reseñas existentes
        const reviews = JSON.parse(localStorage.getItem(`reviews_${productCode}`) || '[]');
        
        // Agregar nueva reseña
        const newReview = {
            id: Date.now(),
            productCode,
            rating: parseInt(rating),
            name,
            title,
            comment,
            date: new Date().toLocaleDateString('es-CL'),
            likes: 0
        };

        reviews.push(newReview);
        localStorage.setItem(`reviews_${productCode}`, JSON.stringify(reviews));

        // Actualizar UI
        loadReviews();
        
        // Cerrar modal y mostrar toast
        const modal = bootstrap.Modal.getInstance(document.getElementById('reviewModal'));
        modal.hide();
        
        const toast = new bootstrap.Toast(document.getElementById('reviewToast'));
        toast.show();

        // Limpiar formulario
        form.reset();
    };

    // Manejar likes en reseñas
    window.likeReview = function(reviewId) {
        const reviews = JSON.parse(localStorage.getItem(`reviews_${productCode}`) || '[]');
        const review = reviews.find(r => r.id === reviewId);
        if (review) {
            review.likes = (review.likes || 0) + 1;
            localStorage.setItem(`reviews_${productCode}`, JSON.stringify(reviews));
            loadReviews();
        }
    };

    // Renderizar productos relacionados
    function renderRelatedProducts() {
        const container = document.getElementById('productosRelacionados');
        if (!container) return;

        // Obtener productos de la misma categoría, excluyendo el actual
        const relatedProducts = window.PRODUCTS
            .filter(p => p.category === product.category && p.code !== product.code)
            // Agregar algunos productos de otras categorías si no hay suficientes
            .concat(window.PRODUCTS.filter(p => p.category !== product.category && p.code !== product.code))
            // Tomar solo 4 productos
            .slice(0, 4);

        container.innerHTML = relatedProducts.map(related => `
            <div class="col-6 col-md-3">
                <div class="card product-card h-100 glass">
                    <div class="position-relative overflow-hidden">
                        <img src="${getImageUrl(related.code)}" 
                             class="card-img-top" 
                             alt="${related.name}"
                             onerror="this.onerror=null; this.src='assets/images/default-product.png'">
                    </div>
                    <div class="card-body d-flex flex-column">
                        <p class="small text-secondary mb-1">${related.category}</p>
                        <h5 class="card-title h6">${related.name}</h5>
                        <div class="mb-2">
                            <span class="stars">${'★'.repeat(Math.floor(related.rating))}${'☆'.repeat(5-Math.floor(related.rating))}</span>
                        </div>
                        <div class="mt-auto">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <p class="fw-bold mb-0">${formatPrice(related.price)}</p>
                                <small class="text-${related.stock > 0 ? 'success' : 'danger'}">
                                    ${related.stock > 0 ? 'En stock' : 'Sin stock'}
                                </small>
                            </div>
                            <div class="d-flex gap-2">
                                <button onclick="Cart.add('${related.code}')" 
                                        class="btn btn-sm btn-neon-primary flex-grow-1"
                                        ${related.stock === 0 ? 'disabled' : ''}>
                                    <i class="bi bi-cart-plus me-1"></i>Agregar
                                </button>
                                <a href="product.html?code=${related.code}" 
                                   class="btn btn-sm btn-outline-neon">
                                    <i class="bi bi-eye"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Primera renderización
    renderProductDetail();
    renderRelatedProducts();
    loadReviews();
});
