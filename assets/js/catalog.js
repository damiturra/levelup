// catalog.js - Catálogo Level-Up Gamer
// Requiere products.js (PRODUCTS y CATEGORIES disponibles globalmente)

// Función para formatear precios (usar fmtCLP de app.js si está disponible)
const formatPrice = (price) => {
    if (typeof window.fmtCLP === 'function') {
        return window.fmtCLP(price);
    }
    return `$${price.toLocaleString('es-CL')} CLP`;
};

// Función para obtener la URL correcta de la imagen según el código
function getImageUrl(code) {
    const extensions = ['webp', 'jpeg', 'jpg', 'png'];
    for (let ext of extensions) {
        if (code === 'JM001' && ext === 'jpeg') return `assets/images/${code}.${ext}`;
        if (code === 'JM002' && ext === 'jpg') return `assets/images/${code}.${ext}`;
        if (code === 'CG001' && ext === 'png') return `assets/images/${code}.${ext}`;
    }
    return `assets/images/${code}.webp`; // Default to webp
}

// Verificar que PRODUCTS esté disponible
if (!window.PRODUCTS) {
    console.error('Error: PRODUCTS no está definido. Asegúrate de cargar products.js antes de catalog.js');
    window.PRODUCTS = []; // Evitar que la app se rompa completamente
}

// Estado global del catálogo
const state = {
    category: 'all',         // Categoría seleccionada
    search: '',              // Texto de búsqueda
    maxPrice: Math.max(...(window.PRODUCTS || []).map(p => p.price || 0)), // Precio máximo inicial
    orderBy: 'relevancia'   // Criterio de ordenamiento
};

// Función para agregar al carrito (usa el sistema Cart)
function addToCart(code, quantity = 1) {
    if (window.Cart && typeof window.Cart.add === 'function') {
        return window.Cart.add(code, quantity);
    } else {
        console.error('Error: Sistema Cart no disponible. Verifica que cart.js esté cargado.');
        return false;
    }
}

// Filtra y ordena productos según el estado actual
function getFilteredProducts() {
    // Aplicar filtros
    const filtered = PRODUCTS.filter(product => {
        // Filtro por categoría
        const matchCategory = state.category === 'all' || product.category === state.category;
        
        // Filtro por precio máximo
        const matchPrice = product.price <= state.maxPrice;
        
        // Filtro por búsqueda (en nombre o descripción)
        const searchLower = state.search.toLowerCase();
        const matchSearch = searchLower === '' || 
            product.name.toLowerCase().includes(searchLower) || 
            product.description.toLowerCase().includes(searchLower) ||
            product.code.toLowerCase().includes(searchLower);
        
        return matchCategory && matchPrice && matchSearch;
    });

    // Ordenar según criterio seleccionado
    switch(state.orderBy) {
        case 'precio_asc':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'precio_desc':
            filtered.sort((a, b) => b.price - a.price);
            break;
        case 'nombre_asc':
            filtered.sort((a, b) => a.name.localeCompare(b.name));
            break;
        // Por defecto (relevancia) mantiene el orden original
    }

    return filtered;
}

// Renderiza la lista de productos
function renderProducts() {
    console.log('Renderizando productos...'); // Debug
    
    if (!window.PRODUCTS || !Array.isArray(window.PRODUCTS)) {
        console.error('PRODUCTS no está disponible');
        return;
    }

    const products = getFilteredProducts();
    console.log('Productos filtrados:', products); // Debug
    
    const container = document.getElementById('catalogoProductos');
    if (!container) {
        console.error('No se encontró el contenedor catalogoProductos');
        return;
    }
    
    // Actualizar contador de resultados
    const counter = document.getElementById('contadorResultados');
    if (counter) {
        counter.textContent = `${products.length} resultado${products.length === 1 ? '' : 's'}`;
    }

    // Limpiar contenedor
    container.innerHTML = '';

    // Mostrar mensaje si no hay resultados
    if (products.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-warning" role="alert">
                    No se encontraron productos que coincidan con los filtros seleccionados.
                </div>
            </div>
        `;
        return;
    }

    // Renderizar cada producto
    products.forEach(product => {
        const imgSrc = getImageUrl(product.code);

        container.innerHTML += `
            <div class="col-12 col-sm-6 col-lg-3 mb-4">
                <div class="card h-100 shadow-sm product-card">
                    <img src="${imgSrc}" 
                         class="card-img-top" 
                         alt="${product.name}"
                         onerror="this.onerror=null; this.src='assets/images/${product.code}.png'">
                    <div class="card-body d-flex flex-column">
                        <p class="small text-secondary mb-1">${product.category}</p>
                        <a href="product.html?code=${product.code}" class="product-title-link">
                            <h5 class="card-title h6">${product.name}</h5>
                        </a>
                        <p class="card-text small text-secondary flex-grow-1">${product.description ? product.description.substring(0, 100) + '...' : ''}</p>
                        <div class="mt-auto">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <p class="fw-bold text-neon mb-0">${formatPrice(product.price)}</p>
                                <small class="text-${product.stock > 0 ? 'success' : 'danger'}">
                                    ${product.stock > 0 ? `Stock: ${product.stock}` : 'Sin stock'}
                                </small>
                            </div>
                            <div class="d-grid gap-2">
                                <div class="d-flex gap-2 align-items-center mb-2">
                                    <div class="input-group input-group-sm flex-nowrap">
                                        <button class="btn btn-outline-neon" type="button" 
                                                onclick="updateCatalogQuantity('${product.code}', -1)"
                                                ${product.stock === 0 ? 'disabled' : ''}>
                                            <i class="bi bi-dash"></i>
                                        </button>
                                        <input type="number" class="form-control text-center" 
                                               id="qty-${product.code}" 
                                               value="1" min="1" max="${product.stock}"
                                               onchange="validateCatalogQuantity('${product.code}')"
                                               ${product.stock === 0 ? 'disabled' : ''}>
                                        <button class="btn btn-outline-neon" type="button" 
                                                onclick="updateCatalogQuantity('${product.code}', 1)"
                                                ${product.stock === 0 ? 'disabled' : ''}>
                                            <i class="bi bi-plus"></i>
                                        </button>
                                    </div>
                                </div>
                                <div class="d-flex gap-2">
                                    <button onclick="addToCartFromCatalog('${product.code}')" 
                                            class="btn btn-sm btn-neon-primary flex-grow-1"
                                            ${product.stock === 0 ? 'disabled' : ''}>
                                        <i class="bi bi-cart-plus me-1"></i>Agregar
                                    </button>
                                    <a href="product.html?code=${product.code}" 
                                       class="btn btn-sm btn-outline-neon">
                                        <i class="bi bi-eye"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
}

// Configura los filtros y sus eventos
function setupFilters() {
    // Categorías
    const categorySelect = document.getElementById('filtroCategoria');
    if (categorySelect && Array.isArray(CATEGORIES)) {
        categorySelect.innerHTML = `
            <option value="all">Todas las categorías</option>
            ${CATEGORIES.map(cat => `
                <option value="${cat}">${cat}</option>
            `).join('')}
        `;
    }

    // Precio máximo
    const maxPriceInput = document.getElementById('precioMax');
    const maxPriceDisplay = document.getElementById('precioMaxVal');
    if (maxPriceInput && maxPriceDisplay) {
        // Encontrar el precio más alto del catálogo
        const maxCatalogPrice = Math.max(...PRODUCTS.map(p => p.price));
        maxPriceInput.max = maxCatalogPrice;
        maxPriceInput.value = maxCatalogPrice;
        state.maxPrice = maxCatalogPrice;
        maxPriceDisplay.textContent = formatPrice(maxCatalogPrice);
    }

    // Si hay un parámetro de categoría en la URL, aplicarlo
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get('cat');
    if (catParam && categorySelect) {
        const option = Array.from(categorySelect.options)
            .find(opt => opt.value.toLowerCase() === catParam.toLowerCase());
        if (option) {
            categorySelect.value = option.value;
            state.category = option.value;
        }
    }

    // Eventos de filtros
    document.getElementById('filtroCategoria')?.addEventListener('change', e => {
        state.category = e.target.value;
        renderProducts();
    });

    // Búsqueda con debounce para mejor rendimiento
    let searchTimeout;
    document.getElementById('busqueda')?.addEventListener('input', e => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            state.search = e.target.value;
            renderProducts();
        }, 300);
    });

    document.getElementById('precioMax')?.addEventListener('input', e => {
        state.maxPrice = parseInt(e.target.value);
        document.getElementById('precioMaxVal').textContent = formatPrice(state.maxPrice);
        renderProducts();
    });

    document.getElementById('ordenarPor')?.addEventListener('change', e => {
        state.orderBy = e.target.value;
        renderProducts();
    });
}

// Inicialización cuando el DOM está listo
function initCatalogo() {
    console.log('Iniciando catálogo...'); // Debug
    if (!Array.isArray(window.PRODUCTS)) {
        console.error('Error: PRODUCTS no está definido. Asegúrate de cargar products.js antes de catalog.js');
        return;
    }
    console.log('PRODUCTS disponible:', window.PRODUCTS.length, 'productos'); // Debug
    setupFilters();
    renderProducts();
}

// Funciones de manejo de cantidad
window.updateCatalogQuantity = function(code, delta) {
    const qtyInput = document.getElementById(`qty-${code}`);
    if (!qtyInput) return;

    const product = PRODUCTS.find(p => p.code === code);
    if (!product) return;

    let newQty = parseInt(qtyInput.value) + delta;
    
    if (newQty < 1) newQty = 1;
    if (newQty > product.stock) newQty = product.stock;
    
    qtyInput.value = newQty;
};

window.validateCatalogQuantity = function(code) {
    const qtyInput = document.getElementById(`qty-${code}`);
    if (!qtyInput) return;

    const product = PRODUCTS.find(p => p.code === code);
    if (!product) return;

    let qty = parseInt(qtyInput.value);
    
    if (isNaN(qty) || qty < 1) qty = 1;
    if (qty > product.stock) qty = product.stock;
    
    qtyInput.value = qty;
};

window.addToCartFromCatalog = function(code) {
    const product = PRODUCTS.find(p => p.code === code);
    if (!product) return;

    const qtyInput = document.getElementById(`qty-${code}`);
    const quantity = qtyInput ? parseInt(qtyInput.value) : 1;

    if (isNaN(quantity) || quantity < 1 || quantity > product.stock) {
        alert(`La cantidad debe estar entre 1 y ${product.stock}`);
        return;
    }

    if (!window.Cart || typeof window.Cart.add !== 'function') {
        console.error('Sistema de carrito no disponible');
        alert('Error: Sistema de carrito no disponible');
        return;
    }

    if (window.Cart.add(code, quantity)) {
        // Mostrar toast de confirmación
        const toast = new bootstrap.Toast(document.getElementById('cartToast'));
        toast.show();
    }
};

// Asegurarnos de que la función esté disponible globalmente
window.initCatalogo = initCatalogo;

// Inicializar cuando el DOM esté listo
// Función para actualizar la UI según el estado de la sesión
function updateSessionUI() {
    const currentUser = getCurrentUser();
    
    // Elementos de navegación desktop
    const loginLink = document.getElementById('navLoginLink');
    const registerLink = document.getElementById('navRegisterLink');
    const profileLink = document.getElementById('navProfileLink');
    const divider = document.getElementById('navDivider');
    const logoutBtn = document.getElementById('navLogoutBtn');

    // Elementos de navegación móvil
    const mobileLoginLink = document.getElementById('mobileLoginLink');
    const mobileRegisterLink = document.getElementById('mobileRegisterLink');
    const mobileProfileLink = document.getElementById('mobileProfileLink');
    const mobileLogoutItem = document.getElementById('mobileLogoutItem');
    const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');

    if (currentUser) {
        // Usuario logueado - Desktop
        loginLink.classList.add('d-none');
        registerLink.classList.add('d-none');
        profileLink.classList.remove('d-none');
        divider.classList.remove('d-none');
        logoutBtn.classList.remove('d-none');

        // Usuario logueado - Móvil
        mobileLoginLink.classList.add('d-none');
        mobileRegisterLink.classList.add('d-none');
        mobileProfileLink.classList.remove('d-none');
        mobileLogoutItem.classList.remove('d-none');
        
        // Agregar eventos de logout si no existen
        if (!logoutBtn.hasListener) {
            logoutBtn.addEventListener('click', () => {
                if (window.logoutUser) {
                    window.logoutUser();
                    updateSessionUI();
                }
            });
            logoutBtn.hasListener = true;
        }
        
        if (!mobileLogoutBtn.hasListener) {
            mobileLogoutBtn.addEventListener('click', () => {
                if (window.logoutUser) {
                    window.logoutUser();
                    updateSessionUI();
                }
            });
            mobileLogoutBtn.hasListener = true;
        }
    } else {
        // No hay usuario logueado - Desktop
        loginLink.classList.remove('d-none');
        registerLink.classList.remove('d-none');
        profileLink.classList.add('d-none');
        divider.classList.add('d-none');
        logoutBtn.classList.add('d-none');

        // No hay usuario logueado - Móvil
        mobileLoginLink.classList.remove('d-none');
        mobileRegisterLink.classList.remove('d-none');
        mobileProfileLink.classList.add('d-none');
        mobileLogoutItem.classList.add('d-none');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado, inicializando catálogo...'); // Debug
    initCatalogo();
    updateSessionUI(); // Inicializar estado de la UI según la sesión

    // Escuchar cambios en la sesión
    window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEYS.SESSION) {
            updateSessionUI();
        }
    });
});
