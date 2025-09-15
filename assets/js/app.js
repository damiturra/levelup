/* === Compat shims: ensure global helpers exist for storage & presence === */
if (typeof saveLocal !== 'function') {
  window.saveLocal = function(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} };
}
if (typeof loadLocal !== 'function') {
  window.loadLocal = function(k, def){ try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : (def ?? null); } catch(e){ return def; } };
}
if (typeof setLocalStorage !== 'function') {
  window.setLocalStorage = function(k, v){ return saveLocal(k, v); };
}
if (typeof getLocalStorage !== 'function') {
  window.getLocalStorage = function(k, def){ return loadLocal(k, def); };
}
/* === End shims === */
/* ======================================================================
   Level‑Up Gamer · assets/js/app.js (versión limpia y comentada)
   Propósito: JS integral para Registro, Catálogo, Carrito, Producto,
   Perfil, Comprobante, Navbar, WhatsApp y KPIs de Comunidad.

   NOTA RÁPIDA CLAVES localStorage (revisa tu HTML para usar las mismas):
   - Usuario  : 'lug_user'  (en navbar clásico hay compat con 'lv_user'/'users')
   - Carrito  : 'lug_cart'  (algunos bloques de navbar consultan 'cart')
   - Órdenes  : 'lug_orders'
   - Última   : 'lug_last_order'
   - Referidos: 'lug_ref_counts'
   - Puntos   : 'lug_purchase_points'
   Si quieres UNIFICAR 100% (p.ej., usar solo 'lug_cart'), dímelo y lo dejo
   homogéneo en todos los bloques (navbar incluido).
   ====================================================================== */

/* ============================ Storage keys ============================ */
const APP_STORAGE_KEYS = {
  CART: 'cart',
  ORDERS: 'orders',
  LAST_ORDER: 'last_order',
  REF_COUNTS: 'ref_counts',
  PURCHASE_POINTS: 'purchase_points'
};


// Compat wrappers for historical code
function getLocalStorage(k, def){ return loadLocal(k, def); }
function setLocalStorage(k, val){ return saveLocal(k, val); }
/* ============================== Helpers ============================== */
// Atajos DOM
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// Formato CLP
const fmtCLP = (n) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);

// Helpers para perfil y gestión de usuario
function getAge(isoDateStr) {
  if (!isoDateStr) return 0;
  const now = new Date(), d = new Date(isoDateStr);
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

function getLevelName(points) {
  if (points >= 1000) return 'DIAMANTE';
  if (points >= 500) return 'ORO';
  if (points >= 200) return 'PLATA';
  return 'BRONCE';
}

function getUserPoints(user) {
  if (!user?.email) return 0;
  
  // Puntos por compras (100 pts por cada $10000)
  const orders = getLocalStorage(APP_STORAGE_KEYS.ORDERS, [])
    .filter(order => order.email === user.email);
  const purchasePoints = orders.reduce((sum, order) => sum + Math.floor(order.total / 10000) * 100, 0);
  
  // Puntos por referidos (200 pts por cada uno)
  const referralCount = orders.filter(order => order.referral === user.refCode).length;
  const referralPoints = referralCount * 200;
  
  return purchasePoints + referralPoints;
}

// LocalStorage seguro (JSON)
function saveLocal(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
function loadLocal(k, def) { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; } }

// Validación correo DUOC
const isDuocEmail = (email) => /@duoc\.cl$/i.test((email||'').trim());
// Hoy en ISO
const todayISO    = () => new Date().toISOString();

/* ==== Imágenes con fallback seguro (busca varias carpetas/extensiones) ==== */
function setImgWithFallback(imgEl, code) {
  const bases = ['assets/images/', 'images/'];     // intenta ambas carpetas
  const exts  = ['webp', 'png', 'jpg', 'jpeg'];   // intenta múltiples extensiones
  const transparentPixel = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

  let bi = 0, ei = 0, finished = false;
  function tryNext() {
    if (finished) return;
    if (bi < bases.length) {
      if (ei < exts.length) {
        imgEl.src = `${bases[bi]}${code}.${exts[ei++]}`;
        return;
      }
      bi++; ei = 0; return tryNext();
    }
    // Último recurso (pixel transparente y clase placeholder)
    finished = true;
    imgEl.onerror = null;
    imgEl.src = transparentPixel;
    imgEl.classList?.add('img-placeholder');
  }
  imgEl.onerror = tryNext;
  tryNext();
}

/* ===================== Gamificación / Referidos / Puntos ===================== */
// Código de referido simple
function genRefCode(){ return 'LUG-' + Math.random().toString(36).slice(2,6).toUpperCase(); }

// Get/Set referidos y puntos desde storage
function getUserPoints(user) {
  if (!user?.email) return 0;
  
  // Obtener puntos del storage
  const points = getLocalStorage(APP_STORAGE_KEYS.PURCHASE_POINTS, {});
  return points[user.email] || 0;
}

/* ============================== Datos (Catálogo) ============================== */
// Ahora usando el módulo products.js

/* ================================= Carrito ================================= */
// CRUD básico del carrito
// Actualizar el badge del carrito en todas las páginas
function updateCartBadge() {
  const cartCount = document.getElementById('cartCount');
  if (cartCount) {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || item.qty || 0), 0);
    cartCount.textContent = totalItems.toString();
    cartCount.classList.toggle('d-none', totalItems === 0);
  }
}

// Obtener el carrito actual
function getCart() { 
  return getLocalStorage(APP_STORAGE_KEYS.CART, []); 
}

// Guardar el carrito y actualizar la UI
function setCart(cart) {
  setLocalStorage(APP_STORAGE_KEYS.CART, cart);
  updateCartBadge();
  
  // Si estamos en la página del carrito, actualizar la vista
  if (window.location.pathname.includes('carrito.html')) {
    renderCart();
  }
}

// Añadir producto al carrito
function addToCart(code, quantity = 1) {
  const product = window.PRODUCTS?.find(p => p.code === code);
  if (!product) {
    console.error('Producto no encontrado:', code);
    return false;
  }

  // Verificar stock
  if (product.stock === 0) {
    alert('Lo sentimos, este producto está agotado');
    return false;
  }

  // Obtener carrito actual
  const cart = getCart();
  const existingItem = cart.find(item => item.code === code);

  if (existingItem) {
    // Verificar que no exceda el stock
    if (existingItem.quantity + quantity > product.stock) {
      alert(`Solo hay ${product.stock} unidades disponibles y ya tienes ${existingItem.quantity} en el carrito`);
      return false;
    }
    existingItem.quantity += quantity;
  } else {
    cart.push({
      code: product.code,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: `assets/images/${code}.webp`
    });
  }

  // Guardar carrito
  setCart(cart);

  // Mostrar toast
  const toastContainer = document.querySelector('.toast-container') || 
    document.createElement('div');
  
  if (!document.body.contains(toastContainer)) {
    toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    toastContainer.style.zIndex = '1500';
    document.body.appendChild(toastContainer);
  }

  const toastElement = document.createElement('div');
  toastElement.className = 'toast';
  toastElement.setAttribute('role', 'alert');
  toastElement.innerHTML = `
    <div class="toast-header">
      <strong class="me-auto text-primary">Carrito actualizado</strong>
      <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
    </div>
    <div class="toast-body">
      ${product.name} fue agregado al carrito
    </div>
  `;
  
  toastContainer.appendChild(toastElement);
  const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
  toast.show();
  
  toastElement.addEventListener('hidden.bs.toast', () => {
    toastElement.remove();
  });

  return true;
}



function removeFromCart(code){ setCart(getCart().filter(i => i.code !== code)); }
function updateQty(code, qty){ setCart(getCart().map(i => i.code === code ? { ...i, qty: Math.max(1, qty) } : i)); }

/* ============================== Orden / Comprobante ============================== */
// ID amigable p/orden
function genOrderId(){
  const d = new Date();
  const ymd = d.toISOString().slice(0,10).replaceAll('-','');
  const rnd = Math.random().toString(36).slice(2,6).toUpperCase();
  return `LUG-${ymd}-${rnd}`;
}

// Crea orden desde carrito validando usuario y mayoría de edad
function createOrderFromCart(){
  const user = loadLocal(STORAGE_USER, null);
  if (!user)        return { error: 'NO_USER' };
  if (!user.isAdult) return { error: 'UNDERAGE' };
  const cart = getCart();
  if (!cart.length) return { error: 'EMPTY' };

  let subtotal = 0;
  const items = cart.map(it => {
    const p = byCode(it.code);
    if (!p) return null;
    const line = { code:p.code, name:p.name, price:p.price, qty:it.qty, subtotal: p.price * it.qty };
    subtotal += line.subtotal; return line;
  }).filter(Boolean);

  const descuento = user.isDuoc ? Math.round(subtotal * 0.20) : 0;
  const total = subtotal - descuento;

  const order = {
    id: genOrderId(),
    timestamp: todayISO(),
    user: { nombre:user.nombre, apellido:user.apellido, email:user.email, isDuoc:user.isDuoc },
    items, subtotal, descuento, total
  };

  const orders = loadLocal(STORAGE_ORDERS, []);
  orders.push(order);
  saveLocal(STORAGE_ORDERS, orders);
  saveLocal(STORAGE_LAST_ORDER, order.id);

  setCart([]); // limpia carrito
  return { order };
}

/* ================================== Registro ================================== */
// Fecha máxima permitida para tener 18+
function maxDateFor18(){
  const d = new Date(); d.setFullYear(d.getFullYear()-18);
  return d.toISOString().slice(0,10);
}

// Lógica de formulario de Registro
function initRegistro(){
  const form = $('#formRegistro'); if (!form) return;

  const nombre = $('#nombre'), apellido = $('#apellido'), email = $('#email');
  const fechaNac = $('#fechaNacimiento'), acepta = $('#acepta'), refInput = $('#refCode');
  const duocBadge = $('#duocBadge'), okMsg = $('#registroOk');

  duocBadge?.setAttribute('role','status'); duocBadge?.setAttribute('aria-live','polite');
  okMsg?.setAttribute('role','status');     okMsg?.setAttribute('aria-live','assertive');
  if (fechaNac) fechaNac.max = maxDateFor18();

  // Muestra badge DUOC si email termina en @duoc.cl
  email?.addEventListener('input', () => {
    duocBadge?.classList.toggle('d-none', !isDuocEmail(email.value));
  });

  // Envío del formulario
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    let valid = form.checkValidity();

    // Validación edad 18+
    const age = getAge(fechaNac?.value);
    if (age < 18){ valid = false; fechaNac?.classList.add('is-invalid'); }
    else { fechaNac?.classList.remove('is-invalid'); fechaNac?.classList.add('is-valid'); }

    // Acepta términos
    if (!acepta?.checked){ acepta?.classList.add('is-invalid'); valid = false; } else { acepta?.classList.remove('is-invalid'); }
    if (!valid){ form.classList.add('was-validated'); return; }

    // Construir usuario y guardar
    const user = {
      nombre: nombre?.value.trim() || '',
      apellido: apellido?.value.trim() || '',
      email: email?.value.trim() || '',
      fechaNacimiento: fechaNac?.value || '',
      isAdult: age >= 18,
      isDuoc: isDuocEmail(email?.value),
      discount: isDuocEmail(email?.value) ? 0.20 : 0,
      refCode: genRefCode()
    };

    // Registrar referido si el código existe y es válido
    const val = (refInput?.value || '').trim().toUpperCase();
    if (/^LUG-\w{4}$/.test(val)){
      const counts = getRefCounts();
      counts[val] = (counts[val] || 0) + 1;
      setRefCounts(counts);
    }

    saveLocal(STORAGE_USER, user);
    okMsg?.classList.remove('d-none'); okMsg?.focus?.();
    setTimeout(()=>{ window.location.href = 'catalogo.html'; }, 900);
  });
}

/* ================================== Catálogo ================================== */
// Grid con filtros/orden, y botón Agregar al carrito
function initCatalogo(){
  const grid = $('#catalogoGrid'); if (!grid) return;

  const filtro = $('#filtroCategoria');
  const busqueda = $('#busqueda');
  const precioMax = $('#precioMax');
  const precioMaxVal = $('#precioMaxVal');
  const ordenarPor = $('#ordenarPor');
  const contador = $('#contadorResultados');

  const withFilters = !!(filtro && busqueda && precioMax && ordenarPor);

  // Rellenar categorías únicas
  if (filtro && !filtro.dataset.filled){
    const cats = Array.from(new Set(PRODUCTS.map(p=>p.category))).sort();
    cats.forEach(c => { const opt = document.createElement('option'); opt.value = c; opt.textContent = c; filtro.appendChild(opt); });
    filtro.dataset.filled = '1';
  }

  // Preselección por ?cat=...
  const qs = new URLSearchParams(location.search);
  const catParam = qs.get('cat');
  if (catParam && filtro) {
    const exists = Array.from(filtro.options).some(o => o.value === catParam);
    if (exists) filtro.value = catParam;
  }

  // Slider precio inicia en el máximo real
  if (precioMax){
    const maxP = Math.max(...PRODUCTS.map(p=>p.price));
    precioMax.min = '0';
    precioMax.max = String(maxP);
    if (!precioMax.value || Number(precioMax.value) <= 0) precioMax.value = String(maxP);
    if (precioMaxVal) precioMaxVal.textContent = fmtCLP(Number(precioMax.value||maxP));
  }

  // Configurar eventos de filtros
  if (filtro) filtro.addEventListener('change', renderProducts);
  if (busqueda) busqueda.addEventListener('input', renderProducts);
  if (precioMax) {
    precioMax.addEventListener('input', () => {
      if (precioMaxVal) precioMaxVal.textContent = fmtCLP(Number(precioMax.value));
      renderProducts();
    });
  }
  if (ordenarPor) ordenarPor.addEventListener('change', renderProducts);

  // Renderizar productos filtrados
  function renderProducts() {
    const filtered = getFilteredProducts();
    grid.innerHTML = ''; // Limpiar grid
    
    filtered.forEach(product => {
      const col = document.createElement('div');
      col.className = 'col-12 col-sm-6 col-lg-3 col-xl-3';
      
      const card = document.createElement('div');
      card.className = 'card glass product-card h-100';
      
      // Construir la ruta de la imagen
      const imgPath = `assets/images/${product.code}.webp`;
      
      card.innerHTML = `
        <img src="${imgPath}" class="card-img-top" alt="${product.name}" onerror="this.src='assets/images/placeholder.webp'">
        <div class="card-body">
          <h3 class="h5 mb-3 brand-orbitron">${product.name}</h3>
          <p class="text-muted small mb-3">${product.desc}</p>
          <div class="d-flex justify-content-between align-items-center">
            <strong class="text-neon">${fmtCLP(product.price)}</strong>
            <button class="btn btn-sm btn-outline-neon" onclick="addToCart('${product.code}')">
              Agregar al carrito
            </button>
          </div>
        </div>
      `;
      
      col.appendChild(card);
      grid.appendChild(col);
    });
    
    // Actualizar contador
    if (contador) {
      contador.textContent = `${filtered.length} resultado${filtered.length === 1 ? '' : 's'}`;
    }
  }

  // Obtener productos filtrados y ordenados
  function getFilteredProducts() {
    if (!withFilters) return PRODUCTS.slice();
    
    const q = (busqueda?.value || '').trim().toLowerCase();
    const cat = filtro?.value || 'all';
    const pmax = Number(precioMax?.value || Infinity);
    const ord = ordenarPor?.value || 'relevancia';

    let arr = PRODUCTS.filter(p =>
      (cat === 'all' || p.category === cat) &&
      p.price <= pmax &&
      (q === '' || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q))
    );

    switch (ord) {
      case 'precio_asc': arr.sort((a,b) => a.price - b.price); break;
      case 'precio_desc': arr.sort((a,b) => b.price - a.price); break;
      case 'nombre_asc': arr.sort((a,b) => a.name.localeCompare(b.name)); break;
    }
    return arr;
  }

  // Pinta tarjetas
  function render(){
    const user = loadLocal(STORAGE_USER, null);
    const isDuoc = !!user?.isDuoc;

    const items = getFilteredProducts();
    if (contador) contador.textContent = `${items.length} resultado${items.length!==1?'s':''}`;
    grid.innerHTML = '';

    if (!items.length){
      grid.innerHTML = `<div class="col-12"><div class="alert alert-dark border-primary-subtle">Sin resultados. Ajusta tus filtros.</div></div>`;
      return;
    }

    items.forEach(p=>{
      const col = document.createElement('div');
      col.className = 'col-12 col-sm-6 col-lg-3 col-xl-3';
      const priceBlock = isDuoc
        ? `<div class="text-end"><div class="price-old">${fmtCLP(p.price)}</div><strong class="price-new">${fmtCLP(Math.round(p.price*0.8))}</strong></div>`
        : `<strong>${fmtCLP(p.price)}</strong>`;

      col.innerHTML = `
        <div class="card card-glow h-100">
          <a href="product.html?code=${p.code}" aria-label="Ver ${p.name}">
            <img data-code="${p.code}" class="card-img-top" alt="${p.name}">
          </a>
          <div class="card-body d-flex flex-column">
            <h3 class="h5 text-white mb-1">
              <a class="link-underline-opacity-0" href="product.html?code=${p.code}">${p.name}</a>
            </h3>
            <div class="text-secondary small mb-2">${p.category} · ${p.code}</div>
            <div class="mt-auto d-flex align-items-center justify-content-between">
              ${priceBlock}
              <button class="btn btn-neon-primary btn-sm" data-add="${p.code}">Agregar</button>
            </div>
          </div>
        </div>`;
      grid.appendChild(col);
      setImgWithFallback(col.querySelector('img[data-code]'), p.code);
    });
  }

  // Eventos de filtros
  filtro?.addEventListener('change', render);
  ordenarPor?.addEventListener('change', render);
  busqueda?.addEventListener('input', render);
  precioMax?.addEventListener('input', ()=>{
    if (precioMaxVal) precioMaxVal.textContent = fmtCLP(Number(precioMax.value));
    render();
  });

  // Agregar al carrito (delegación)
  grid.addEventListener('click', (e)=>{
    const btn = e.target.closest('[data-add]'); if (!btn) return;
    addToCart(btn.getAttribute('data-add'), 1);
    window.LUG?.updateCartBadge?.();
    const toast = document.createElement('div');
    toast.className = 'alert alert-success position-fixed bottom-0 end-0 m-3';
    toast.textContent = 'Producto agregado al carrito.';
    document.body.appendChild(toast);
    setTimeout(()=>toast.remove(), 1000);
  });
  

  render();
}

/* ================================== Carrito ================================== */
// Tabla del carrito, totales y pago -> crea orden
function initCarrito(){
  const tbody = $('#carritoTbody'); if (!tbody) return;

  const subtotalEl = $('#subtotal'), descuentoEl = $('#descuento'), totalEl = $('#total');
  const msgDescuento = $('#msgDescuento');
  const btnVaciar = $('#btnVaciar'), btnPagar = $('#btnPagar');
  const alertaVacio = $('#carritoVacio');

  function render(){
    const cart = getCart();
    tbody.innerHTML = '';
    if (!cart.length){
      alertaVacio?.classList.remove('d-none');
      subtotalEl.textContent = fmtCLP(0); descuentoEl.textContent = fmtCLP(0); totalEl.textContent = fmtCLP(0);
      msgDescuento?.classList.add('d-none'); return;
    }
    alertaVacio?.classList.add('d-none');

    let subtotal = 0;
    cart.forEach(item=>{
      const p = byCode(item.code); if (!p) return;
      const sub = p.price * item.qty; subtotal += sub;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div class="d-flex align-items-center gap-3">
            <img data-code="${p.code}" width="64" height="64" class="rounded shadow-sm" alt="${p.name}">
            <div>
              <div class="fw-semibold">${p.name}</div>
              <div class="text-secondary small">${p.category} · ${p.code}</div>
            </div>
          </div>
        </td>
        <td class="text-center">
          <div class="btn-group" role="group">
            <button class="btn btn-sm btn-outline-light" data-dec="${p.code}" aria-label="Disminuir cantidad">−</button>
            <span class="btn btn-sm btn-dark disabled">${item.qty}</span>
            <button class="btn btn-sm btn-outline-light" data-inc="${p.code}" aria-label="Aumentar cantidad">+</button>
          </div>
        </td>
        <td class="text-end">${fmtCLP(p.price)}</td>
        <td class="text-end">${fmtCLP(sub)}</td>
        <td class="text-end"><button class="btn btn-sm btn-outline-danger" data-del="${p.code}" aria-label="Quitar ${p.name}">Quitar</button></td>`;
      setImgWithFallback(tr.querySelector('img[data-code]'), p.code);
      tbody.appendChild(tr);
    });

    const user = loadLocal(STORAGE_USER, null);
    const descuento = user?.isDuoc ? Math.round(subtotal * 0.20) : 0;
    const total = subtotal - descuento;

    subtotalEl.textContent = fmtCLP(subtotal);
    descuentoEl.textContent = descuento ? `− ${fmtCLP(descuento)}` : fmtCLP(0);
    totalEl.textContent = fmtCLP(total);
    msgDescuento?.classList.toggle('d-none', !user?.isDuoc);
  }

  // Botones +/-/Eliminar en la tabla
  tbody.addEventListener('click', e=>{
    const inc = e.target.closest('[data-inc]');
    const dec = e.target.closest('[data-dec]');
    const del = e.target.closest('[data-del]');
    if (inc){ const code = inc.getAttribute('data-inc'); const it = getCart().find(i=>i.code===code); updateQty(code, (it?.qty??1)+1); render(); }
    if (dec){ const code = dec.getAttribute('data-dec'); const it = getCart().find(i=>i.code===code); updateQty(code, Math.max(1, (it?.qty??1)-1)); render(); }
    if (del){ removeFromCart(del.getAttribute('data-del')); render(); }
  });

  // Vaciar carrito
  btnVaciar?.addEventListener('click', ()=>{ setCart([]); render(); });

  // Pagar: valida, crea orden y redirige a comprobante
  btnPagar?.addEventListener('click', ()=>{
    const user = loadLocal(STORAGE_USER, null);
    if (!user){ alert('Debes registrarte antes de pagar.'); window.location.href='registro.html'; return; }
    if (!user.isAdult){ alert('Solo pueden comprar mayores de 18 años.'); return; }

    const result = createOrderFromCart();
    if (result.error === 'EMPTY'){ alert('Tu carrito está vacío.'); return; }
    if (result.order){
      addPurchasePoints(user.email, result.order.total);
      window.location.href = `comprobante.html?orderId=${encodeURIComponent(result.order.id)}`;
    } else {
      alert('Ocurrió un problema al crear la orden.');
    }
  });

  render();
}

/* ================================== Perfil ================================== */
// Mostrar/editar datos de perfil y KPIs de gamificación
function initPerfil(){
  const form = $('#formPerfil'), noUser = $('#perfilNoUser');
  if (!form && !noUser) return;

  const user = loadLocal(STORAGE_USER, null);
  if (!user){ noUser?.classList.remove('d-none'); return; }

  const nombre=$('#nombre'), apellido=$('#apellido'), email=$('#email'), fechaNac=$('#fechaNacimiento');
  const duocBadge=$('#duocBadge'), okMsg=$('#perfilOk');
  const rEdad=$('#perfilEdad'), rDuoc=$('#perfilDuoc'), rCorreo=$('#perfilCorreo');
  const puntosEl=$('#perfilPuntos'), nivelEl=$('#perfilNivel'), refEl=$('#perfilRef');

  duocBadge?.setAttribute('role','status'); duocBadge?.setAttribute('aria-live','polite');
  okMsg?.setAttribute('role','status');     okMsg?.setAttribute('aria-live','assertive');
  if (fechaNac) fechaNac.max = maxDateFor18();

  // Cargar valores
  nombre && (nombre.value=user.nombre||'');
  apellido && (apellido.value=user.apellido||'');
  email && (email.value=user.email||'');
  fechaNac && (fechaNac.value=user.fechaNacimiento||'');
  duocBadge?.classList.toggle('d-none', !user.isDuoc);

  function renderResumen(u){
    if (rEdad)   rEdad.textContent   = getAge(u.fechaNacimiento||'') || '—';
    if (rDuoc)   rDuoc.textContent   = u.isDuoc ? 'Activo' : 'No activo';
    if (rCorreo) rCorreo.textContent = u.email || '—';
  }
  function renderGamificacion(u){
    if (!puntosEl || !nivelEl || !refEl) return;
    const pts = getUserPoints(u);
    const lvl = calcLevel(pts);
    const names = ['','Bronze','Silver','Gold','Platinum'];
    puntosEl.textContent = pts;
    nivelEl.textContent  = names[lvl] || 'Bronze';
    refEl.textContent    = u.refCode || '—';
    $('#btnCopiarRef')?.addEventListener('click', ()=>{
      if (!u?.refCode) return;
      navigator.clipboard.writeText(u.refCode);
      alert('Código copiado: ' + u.refCode);
    }, { once:true });
  }
  renderResumen(user);
  renderGamificacion(user);

  // Mostrar/esconder badge DUOC al editar correo
  email?.addEventListener('input', ()=>{ duocBadge?.classList.toggle('d-none', !isDuocEmail(email.value)); });

  // Guardar perfil
  form?.addEventListener('submit', ev=>{
    ev.preventDefault();
    let valid = form.checkValidity();
    const age = getAge(fechaNac?.value);
    if (age < 18){ valid=false; fechaNac?.classList.add('is-invalid'); }
    else { fechaNac?.classList.remove('is-invalid'); fechaNac?.classList.add('is-valid'); }
    if (!valid){ form.classList.add('was-validated'); return; }

    const updated = { ...user,
      nombre: nombre?.value.trim() || '',
      apellido: apellido?.value.trim() || '',
      email: email?.value.trim() || '',
      fechaNacimiento: fechaNac?.value || '',
      isAdult: age >= 18,
      isDuoc: isDuocEmail(email?.value),
      discount: isDuocEmail(email?.value) ? 0.20 : 0
    };
    saveLocal(STORAGE_USER, updated);
    renderResumen(updated); renderGamificacion(updated);
    okMsg?.classList.remove('d-none'); okMsg?.focus?.(); setTimeout(()=>okMsg?.classList.add('d-none'), 1200);
  });

  // Eliminar cuenta
  $('#btnEliminarCuenta')?.addEventListener('click', ()=>{
    if (!confirm('¿Eliminar cuenta y limpiar carrito?')) return;
    localStorage.removeItem(STORAGE_USER);
    localStorage.removeItem(STORAGE_CART);
    window.location.href='registro.html';
  });
}

/* ================================== Producto ================================== */
// Página de producto: detalle, relacionados, compartir y reseñas
function initProducto(){
  const cont = $('#productoDetalle'); if (!cont) return;

  const params = new URLSearchParams(location.search);
  const code = params.get('code');
  const prod = byCode(code || '');

  const notFound=$('#productoNoEncontrado'), bc=$('#bcProducto'), img=$('#productoImg'),
        titulo=$('#productoTitulo'), categoria=$('#productoCategoria'), cod=$('#productoCodigo'),
        precioBloque=$('#precioBloque'), qty=$('#qtyInput'), form=$('#formCompra'),
        alerta=$('#alertaProducto'), relacionadosGrid=$('#relacionadosGrid'),
        schemaSku=$('#schemaSku'), schemaPrice=$('#schemaPrice');

  const descEl = $('#productoDesc');
  const mfgEl1 = $('#productoMfg'), distEl1 = $('#productoDist');
  const mfgEl2 = $('#pMfg'),      distEl2 = $('#pDist');

  if (!prod){ cont.classList.add('d-none'); notFound?.classList.remove('d-none'); return; }

  // Rellenar encabezado y precio (con 20% OFF si es DUOC)
  bc.textContent = prod.name;
  setImgWithFallback(img, prod.code); img.alt = prod.name;
  titulo.textContent = prod.name; categoria.textContent = prod.category; cod.textContent = prod.code;

  const user = loadLocal(STORAGE_USER, null); const isDuoc = !!user?.isDuoc;
  const precio = prod.price; const precioDesc = Math.round(precio * 0.8);

  precioBloque.innerHTML = isDuoc
    ? `<div><div class="price-old">${fmtCLP(precio)}</div><strong class="price-new" itemprop="price">${fmtCLP(precioDesc)}</strong><span class="badge text-bg-success ms-2">20% OFF Duoc</span></div>`
    : `<strong itemprop="price">${fmtCLP(precio)}</strong>`;
  schemaSku?.setAttribute('content', prod.code);
  schemaPrice?.setAttribute('content', String(isDuoc ? precioDesc : precio));

  if (descEl) descEl.textContent = prod.desc || 'Producto para potenciar tu setup gamer.';
  [mfgEl1, mfgEl2].forEach(el => el && (el.textContent = prod.mfg || '—'));
  [distEl1, distEl2].forEach(el => el && (el.textContent = prod.dist || '—'));

  // Enlaces para compartir
  const url = location.href, text = encodeURIComponent(`${prod.name} en Level‑Up Gamer`);
  $('#shareWsp')?.setAttribute('href', `https://wa.me/?text=${text}%20${encodeURIComponent(url)}`);
  $('#shareTw') ?.setAttribute('href', `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`);
  $('#shareFb') ?.setAttribute('href', `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);

  // Relacionados (misma categoría)
  const relacionados = PRODUCTS.filter(p=>p.category===prod.category && p.code!==prod.code).slice(0,3);
  relacionadosGrid.innerHTML = '';
  relacionados.forEach(p=>{
    const col = document.createElement('div'); col.className = 'col-12 col-sm-6 col-lg-3 col-xl-3';
    col.innerHTML = `
      <div class="card card-glow h-100">
        <a href="product.html?code=${p.code}" aria-label="Ver ${p.name}">
          <img data-code="${p.code}" class="card-img-top" alt="${p.name}">
        </a>
        <div class="card-body d-flex flex-column">
          <h3 class="h6 text-white mb-1"><a class="link-underline-opacity-0" href="product.html?code=${p.code}">${p.name}</a></h3>
          <div class="text-secondary small mb-2">${p.category} · ${p.code}</div>
          <div class="mt-auto d-flex align-items-center justify-content-between">
            <strong>${fmtCLP(p.price)}</strong>
            <button class="btn btn-neon-primary btn-sm" data-add="${p.code}">Agregar</button>
          </div>
        </div>
      </div>`;
    relacionadosGrid.appendChild(col);
    setImgWithFallback(col.querySelector('img[data-code]'), p.code);
  });

  // Agregar relacionado al carrito
  relacionadosGrid.addEventListener('click', (e)=>{
    const btn = e.target.closest('[data-add]'); if (!btn) return;
    addToCart(btn.getAttribute('data-add'), 1);
    window.LUG?.updateCartBadge?.();
    const toast = document.createElement('div');
    toast.className = 'alert alert-success position-fixed bottom-0 end-0 m-3';
    toast.setAttribute('role','alert'); toast.setAttribute('aria-live','assertive'); toast.tabIndex = -1;
    toast.textContent = 'Producto agregado al carrito.'; document.body.appendChild(toast); toast.focus();
    setTimeout(()=>toast.remove(), 1200);
  });
  

  // Comprar desde qty
  form.addEventListener('submit', (ev)=>{
    ev.preventDefault();
    const q = Math.max(1, parseInt(qty.value || '1', 10));
    addToCart(prod.code, q);
    window.LUG?.updateCartBadge?.();
    alerta.classList.remove('d-none'); alerta.focus(); setTimeout(()=>alerta.classList.add('d-none'), 1200);
  });
  

  $('#btnComprarAhora')?.addEventListener('click', ()=>{
    const q = Math.max(1, parseInt(qty.value || '1', 10));
    addToCart(prod.code, q);
    window.LUG?.updateCartBadge?.();
    window.location.href = 'carrito.html';
  });
  

  // Reseñas locales por producto
  const REVKEY = 'lug_reviews_' + prod.code;
  const list = $('#reviewsList'), formRev = $('#reviewForm');
  const revName = $('#revName'), revRate = $('#revRate'), revText = $('#revText');
  const loadReviews = () => loadLocal(REVKEY, []);
  const saveReviews = (arr) => saveLocal(REVKEY, arr);

  function renderReviews(){
    const items = loadReviews();
    list.innerHTML = '';
    if (!items.length){
      list.innerHTML = '<div class="text-secondary small">Aún no hay reseñas.</div>';
      return;
    }
    items.forEach(r=>{
      const div = document.createElement('div');
      div.className = 'card card-glow p-2';
      div.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
          <strong>${r.name}</strong>
          <span aria-label="${r.rate} de 5">${'★'.repeat(r.rate)}${'☆'.repeat(5-r.rate)}</span>
        </div>
        <div class="small mt-1">${r.text}</div>`;
      list.appendChild(div);
    });
  }
  renderReviews();

  formRev?.addEventListener('submit', (ev)=>{
    ev.preventDefault();
    const name = (revName?.value||'').trim();
    const rate = parseInt(revRate?.value||'', 10);
    const text = (revText?.value||'').trim();
    if (!name || !rate || !text) return;
    const items = loadReviews();
    items.unshift({ name, rate, text, ts:new Date().toISOString() });
    saveReviews(items); formRev.reset(); renderReviews();
  });
}

/* ================================ Comprobante ================================ */
// Muestra ticket/imprimible de la última orden o por ID
function initComprobante(){
  const tbody = $('#compTbody'); if (!tbody) return;

  const params = new URLSearchParams(location.search);
  const qId = params.get('orderId');
  const orders = loadLocal(STORAGE_ORDERS, []);
  const lastId = loadLocal(STORAGE_LAST_ORDER, null);
  const order = orders.find(o=>o.id===qId) || orders.find(o=>o.id===lastId);

  const notFound = $('#compNotFound');
  if (!order){ notFound?.classList.remove('d-none'); return; }

  $('#compOrdenId').textContent = order.id;
  $('#compFecha').textContent   = new Date(order.timestamp).toLocaleString('es-CL');
  $('#compCliente').textContent = `${order.user.nombre} ${order.user.apellido}`;
  $('#compCorreo').textContent  = order.user.email;
  $('#compDuoc').textContent    = order.user.isDuoc ? 'Activo (20%)' : 'No activo';

  tbody.innerHTML = '';
  order.items.forEach(it=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${it.name}</td>
      <td>${it.code}</td>
      <td class="text-center">${it.qty}</td>
      <td class="text-end">${fmtCLP(it.price)}</td>
      <td class="text-end">${fmtCLP(it.subtotal)}</td>`;
    tbody.appendChild(tr);
  });

  $('#compSubtotal').textContent = fmtCLP(order.subtotal);
  $('#compDescuento').textContent= order.descuento ? `− ${fmtCLP(order.descuento)}` : fmtCLP(0);
  $('#compTotal').textContent    = fmtCLP(order.total);

  $('#btnImprimir')?.addEventListener('click', ()=> window.print());
}

/* ============================ WhatsApp soporte ============================ */
// Botón flotante para soporte
function addWhatsApp(){
  const PHONE = '56912345678'; // ← reemplaza por el número real (sin +)
  const a = document.createElement('a');
  a.id = 'whatsappFloat';
  a.href = `https://wa.me/${PHONE}?text=Hola%20Level-Up%20Gamer,%20necesito%20soporte.`;
  a.target = '_blank';
  a.rel = 'noopener';
  a.ariaLabel = 'Chat de soporte por WhatsApp';
  a.textContent = '💬';
  document.body.appendChild(a);
}

/* ============================ Impacto comunidad ============================ */
// % de cada venta destinado a fondo comunitario (demo académica)
const COMMUNITY_RATE = 0.02;

// Agenda de eventos (demo). Puedes editar/añadir más.
const COMMUNITY_EVENTS = [
  { id:'ev01', name:'Torneo FGC Santiago',      city:'Santiago',     date:'2025-10-05', points:150, supported:true },
  { id:'ev02', name:'Meetup Indie Valparaíso',  city:'Valparaíso',   date:'2025-11-10', points:100, supported:true },
  { id:'ev03', name:'LAN Party Concepción',     city:'Concepción',   date:'2025-12-01', points:200, supported:true },
  { id:'ev04', name:'Game Jam Temuco',          city:'Temuco',       date:'2026-01-18', points:120, supported:true },
];

// Sumas/KPIs
function getOrdersTotalCLP(){
  const orders = loadLocal(STORAGE_ORDERS, []);
  return orders.reduce((acc,o)=> acc + (o?.total||0), 0);
}
function getCommunityFundCLP(){
  return Math.round(getOrdersTotalCLP() * COMMUNITY_RATE);
}
function getTotalPointsDistributed(){
  const buyMap = getPurchasePoints();
  const buyPts = Object.values(buyMap).reduce((a,b)=>a+(b||0),0);
  const refCounts = getRefCounts();
  const totalRefs = Object.values(refCounts).reduce((a,b)=>a+(b||0),0);
  const refPts = totalRefs * 100;
  return buyPts + refPts;
}
function getUpcomingEvents(){
  const now = new Date();
  return COMMUNITY_EVENTS
    .filter(ev => new Date(ev.date) >= now)
    .sort((a,b)=> new Date(a.date)-new Date(b.date));
}

// KPIs en la home/landing
function initImpactoComunidad(){
  const totalComprasEl  = $('#impactTotalCompras');
  const fondoEl         = $('#impactFondo');
  const eventosEl       = $('#impactEventosApoyados');
  const puntosEl        = $('#impactPuntosEntregados');
  const proxCountEl     = $('#impactProxEventos');
  const listaEventosEl  = $('#impactListaEventos');

  // Si no estamos en index, no hacer nada
  if (!totalComprasEl && !listaEventosEl) return;

  const total = getOrdersTotalCLP();
  const fondo = getCommunityFundCLP();
  const pts   = getTotalPointsDistributed();

  totalComprasEl && (totalComprasEl.textContent = fmtCLP(total));
  fondoEl        && (fondoEl.textContent        = fmtCLP(fondo));
  eventosEl      && (eventosEl.textContent      = String(COMMUNITY_EVENTS.filter(e=>e.supported).length));
  puntosEl       && (puntosEl.textContent       = String(pts));

  if (listaEventosEl){
    const upcoming = getUpcomingEvents();
    proxCountEl && (proxCountEl.textContent = `${upcoming.length} próximo${upcoming.length===1?'':'s'} evento${upcoming.length===1?'':'s'}`);
    listaEventosEl.innerHTML = '';
    if (!upcoming.length){
      listaEventosEl.innerHTML = `<div class="text-secondary small">Pronto anunciaremos nuevos eventos.</div>`;
    } else {
      upcoming.slice(0,3).forEach(ev=>{
        const div = document.createElement('div');
        div.className = 'card glass p-2';
        const when = new Date(ev.date).toLocaleDateString('es-CL', { year:'numeric', month:'short', day:'numeric' });
        div.innerHTML = `
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <strong>${ev.name}</strong>
              <div class="small text-secondary">${ev.city} · ${when}</div>
            </div>
            <span class="badge text-bg-success">+${ev.points} pts</span>
          </div>`;
        listaEventosEl.appendChild(div);
      });
    }
  }
}

/* ============================== Init global ============================== */
// Arranque de todas las páginas (según IDs presentes en el DOM)
// Migración de claves antiguas a las nuevas unificadas
function migrateLegacyKeys(){
  try {
    // 1) Cart: 'cart' -> 'lug_cart'
    const legacyCart = localStorage.getItem('STORAGE_CART');
    if (legacyCart && !localStorage.getItem(STORAGE_CART)) {
      localStorage.setItem(STORAGE_CART, legacyCart);
    }
  } catch {}

  try {
    // 2) Usuario: 'lv_user' o 'sessionEmail/users' -> 'lug_user'
    if (!localStorage.getItem(STORAGE_USER)) {
      let u = null;
      try { u = JSON.parse(localStorage.getItem('lv_user') || 'null'); } catch {}
      if (!u) {
        const sEmail = localStorage.getItem('sessionEmail');
        if (sEmail) {
          try {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const found = users.find(x => (x.email || '').toLowerCase() === sEmail.toLowerCase());
            if (found) u = found;
          } catch {}
        }
      }
      if (u) {
        const email = (u.email || '').trim();
        const nombre = (u.nombre || u.name || (email ? email.split('@')[0] : 'Usuario'));
        const isDuoc = /@duoc\.cl$/i.test(email);
        const mapped = {
          nombre, apellido: u.apellido || '', email,
          fechaNacimiento: u.fechaNacimiento || '',
          isAdult: true, // asumimos mayor de edad si venía de flujo antiguo
          isDuoc, discount: isDuoc ? 0.20 : 0,
          refCode: u.refCode || genRefCode()
        };
        localStorage.setItem(STORAGE_USER, JSON.stringify(mapped));
      }
    }
  } catch {}
}

document.addEventListener('DOMContentLoaded', ()=>{
  migrateLegacyKeys();   // <— añadir esta línea
  initRegistro();
  initCatalogo();
  initCarrito();
  initPerfil();
  initProducto();
  initComprobante();
  initImpactoComunidad();
  addWhatsApp();
});


/* ======================================================================
   Navbar / Cuenta / Carrito (compat con proyectos existentes)
   * OJO: aquí el badge lee la clave 'cart'. Si quieres que use 'lug_cart',
     puedo cambiarlo en todo el sitio para que quede consistente.
   ====================================================================== */
(() => {
  const ready = (cb) =>
    document.readyState !== 'loading'
      ? cb()
      : document.addEventListener('DOMContentLoaded', cb);

  ready(() => {
    /* --- 1) Activo automático según página --- */
    const current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    document.querySelectorAll('.navbar .nav-link[data-page]').forEach((a) => {
      const page = (a.getAttribute('data-page') || '').toLowerCase();
      if (page === current) a.classList.add('active');
      if (
        current === 'index.html' &&
        page.startsWith('index.html#') &&
        location.hash &&
        page.endsWith(location.hash.toLowerCase())
      ) {
        a.classList.add('active');
      }
    });

    /* --- 2) Carrito: badge con total de ítems --- */
    function updateCartBadge() {
      const cart = getCart();
      const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
      
      // Actualizar contador del carrito
      const badge = document.getElementById('cartCount');
      if (badge) {
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'inline' : 'none';
      }
      
      // Actualizar total si estamos en la página del carrito
      const totalElement = document.getElementById('total');
      if (totalElement) {
        const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
        const currentUser = getCurrentUser();
        const discount = currentUser?.email?.endsWith('@duoc.cl') ? total * 0.2 : 0;
        
        document.getElementById('subtotal').textContent = fmtCLP(total);
        document.getElementById('descuento').textContent = `-${fmtCLP(discount)}`;
        totalElement.textContent = fmtCLP(total - discount);
      }
    }
    
    updateCartBadge();
    window.updateCartBadge = updateCartBadge;
    window.addEventListener('storage', (e) => { 
      if (e.key === APP_STORAGE_KEYS.CART) updateCartBadge(); 
    });

    /* --- 3) Cuenta: estado logeado / no logeado --- */
    function updateNavigation() {
      const currentUser = getCurrentUser();
      
      const loginL = document.getElementById('navLoginLink');
      const regL   = document.getElementById('navRegisterLink');
      const profL  = document.getElementById('navProfileLink');
      const divi   = document.getElementById('navDivider');
      const outB   = document.getElementById('navLogoutBtn');
      const btn    = document.getElementById('cuentaMenu');

      if (currentUser) {
        loginL?.classList.add('d-none');
        regL?.classList.add('d-none');
        profL?.classList.remove('d-none');
        divi?.classList.remove('d-none');
        outB?.classList.remove('d-none');
        
        const displayName = currentUser.name || currentUser.email.split('@')[0];
        if (btn) btn.textContent = displayName;
      } else {
        loginL?.classList.remove('d-none');
        regL?.classList.remove('d-none');
        profL?.classList.add('d-none');
        divi?.classList.add('d-none');
        outB?.classList.add('d-none');
        if (btn) btn.textContent = 'Cuenta';
      }
    }
    
    updateNavigation();
    
    outB?.addEventListener('click', () => {
      logout(); // Cierra sesión
      window.location.href = 'index.html';
      location.href = 'index.html';
    });
  });
})();

/* =======================
   Variante Navbar (compat con sessionEmail/users)
   ======================= */
(() => {
  const $  = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  // Storage helper (compatibles con login.html antiguo)
  const Storage = {
    getUsers(){ try { return JSON.parse(localStorage.getItem('users')) || []; } catch { return []; } },
    getSessionEmail(){
      const sEmail = localStorage.getItem('sessionEmail');
      if (sEmail) return sEmail;
      try { const s = JSON.parse(localStorage.getItem('session')); return s?.email || null; }
      catch { return null; }
    },
    clearSession(){ localStorage.removeItem('sessionEmail'); localStorage.removeItem('session'); localStorage.removeItem('rememberEmail'); }
  };

  const currentUser = () => {
  // Prioriza el esquema unificado
  try {
    const lu = JSON.parse(localStorage.getItem(STORAGE_USER) || 'null');
    if (lu) return lu;
  } catch {}
  const email = (Storage.getSessionEmail() || '').toLowerCase();
  if (!email) return null;
  const u = Storage.getUsers().find(x => (x.email || '').toLowerCase() === email);
  return u || null;
};

  // Activo según página
  function setActiveNav(){
    const links = $$('.navbar a.nav-link');
    const here  = (location.pathname.split('/').pop() || 'index.html') + (location.hash || '');
    links.forEach(a => {
      a.classList.remove('active');
      const dp = a.getAttribute('data-page');
      if (dp && (here.startsWith(dp) || here === dp)) { a.classList.add('active'); }
      else {
        const href = a.getAttribute('href') || '';
        if (href && (here === href || here.startsWith(href))) a.classList.add('active');
      }
    });
  }

  // Estado de cuenta en navbar
  function renderAccountMenu(){
    const u = currentUser();
    const loginLink   = $('#navLoginLink');
    const registerLink= $('#navRegisterLink');
    const profileLink = $('#navProfileLink');
    const divider     = $('#navDivider');
    const logoutBtn   = $('#navLogoutBtn');
    const cuentaBtn   = $('#cuentaMenu');

    if (u) {
      loginLink?.classList.add('d-none');
      registerLink?.classList.add('d-none');
      profileLink?.classList.remove('d-none');
      divider?.classList.remove('d-none');
      logoutBtn?.classList.remove('d-none');
      if (cuentaBtn) {
        const nombre = (u.name || u.email || 'Mi cuenta').split(' ')[0];
        cuentaBtn.textContent = nombre;
      }
    } else {
      loginLink?.classList.remove('d-none');
      registerLink?.classList.remove('d-none');
      profileLink?.classList.add('d-none');
      divider?.classList.add('d-none');
      logoutBtn?.classList.add('d-none');
      if (cuentaBtn) cuentaBtn.textContent = 'Cuenta';
    }
  }

  function wireLogout(){
    const btn = $('#navLogoutBtn');
    if (!btn) return;
    btn.addEventListener('click', () => { localStorage.removeItem(STORAGE_USER); Storage.clearSession(); });
  }

  // Badge carrito
  function updateCartBadge(){
    const badge = $('#cartCount'); if (!badge) return;
    let count = 0;
    try { const cart = JSON.parse(localStorage.getItem('STORAGE_CART') || '[]'); count = cart.reduce((s, it) => s + (Number(it.qty) || 1), 0); }
    catch {}
    badge.textContent = count;
  }

  document.addEventListener('DOMContentLoaded', () => {
    setActiveNav();
    renderAccountMenu();
    wireLogout();
    updateCartBadge();
    window.App = { Storage, currentUser, renderAccountMenu, updateCartBadge };
  });
})();

/* =========================================================
   Tercera variante global (máxima compatibilidad)
   ========================================================= */
(function () {
  'use strict';

  // Helpers JSON seguros
  const safeJSON = (txt, fallback) => { try { return JSON.parse(txt); } catch { return fallback; } };

  const getSessionEmail = () => {
    const byKey = localStorage.getItem('sessionEmail');
    if (byKey) return byKey;
    const sess = safeJSON(localStorage.getItem('session'), null);
    return sess?.email || null;
  };
  const clearSession = () => { localStorage.removeItem('sessionEmail'); localStorage.removeItem('session'); };

  const getCartItems = () => safeJSON(localStorage.getItem(STORAGE_CART), []);
  const cartCount    = () => getCartItems().reduce((n, it) => n + (Number(it.qty) || 1), 0);


  // Activo según URL
  function setActiveNavLink(){
    const links = document.querySelectorAll('.navbar .nav-link'); if (!links.length) return;
    const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const hash = (location.hash || '').toLowerCase();
    const current = path + hash;
    links.forEach((a) => {
      a.classList.remove('active');
      try {
        const url = new URL(a.getAttribute('href'), location.origin);
        const targetPath = (url.pathname.split('/').pop() || 'index.html').toLowerCase();
        const targetHash = (url.hash || '').toLowerCase();
        const target = targetPath + targetHash;
        const isActive = current === target || (target === 'index.html' && (path === '' || path === 'index.html') && hash === '');
        if (isActive) a.classList.add('active');
      } catch {/* externos -> ignorar */}
    });
  }

  // Cuenta (dropdown)
  function refreshAccountUI(){
    const $ = (id) => document.getElementById(id);

    // Lee el usuario unificado
    let u = null;
    try { u = JSON.parse(localStorage.getItem(STORAGE_USER) || 'null'); } catch {}

    const loginL = $('navLoginLink');
    const regL   = $('navRegisterLink');
    const profL  = $('navProfileLink');
    const divi   = $('navDivider');
    const logoutB= $('navLogoutBtn');
    const isLogged = !!u;

    [loginL, regL].forEach(el => el && el.classList.toggle('d-none', isLogged));
    profL && profL.classList.toggle('d-none', !isLogged);
    divi  && divi.classList.toggle('d-none', !isLogged);
    logoutB && logoutB.classList.toggle('d-none', !isLogged);

    if (logoutB) {
      logoutB.onclick = () => {
        localStorage.removeItem(STORAGE_USER);  // cierra sesión unificada
        clearSession();                         // compat viejo
        refreshAccountUI();
        if ((location.pathname || '').toLowerCase().endsWith('perfil.html')) location.href = 'index.html';
        else location.reload();
      };
    }
  }


  // Badge carrito reactivo
  function updateCartBadge(){
    const badge = document.getElementById('cartCount'); if (!badge) return;
    const n = cartCount();
    badge.textContent = n;
    badge.classList.toggle('d-none', n <= 0);
  }

  // Escucha cambios cross‑tab
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_CART) updateCartBadge();
    if (e.key === STORAGE_USER) refreshAccountUI();
  });


  // Init
  document.addEventListener('DOMContentLoaded', () => {
    setActiveNavLink();
    refreshAccountUI();
    updateCartBadge();
  });

  // Utilidades globales opcionales
  window.LUG = window.LUG || {};
  window.LUG.updateCartBadge = updateCartBadge;
  window.LUG.refreshAccountUI = refreshAccountUI;
})();
