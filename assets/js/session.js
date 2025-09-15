/* ======================================================================
   Level‑Up Gamer · session.js
   Manejo integral de sesión, registro, login, perfil y UI dinámica.
   Almacenamiento: localStorage (usuarios), sessionStorage (sesión activa).
   Claves:
     - 'lug_users'        : Array de usuarios registrados
     - 'lug_current_user' : ID del usuario con sesión activa (sessionStorage)
     - 'lug_persist_user' : ID del usuario para recordar sesión (localStorage)
   ====================================================================== */

// ---------- utils storage ----------
const STORAGE_KEYS = {
  USERS: 'levelup_users',
  SESSION: 'levelup_session',
  CART: 'levelup_cart',
  ORDERS: 'levelup_orders',
  REMEMBER: 'levelup_remember',
  POINTS: 'levelup_points',
  REFS: 'levelup_refs'
};

// Funciones de almacenamiento
function getLocalStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error('Error reading from localStorage:', e);
    return defaultValue;
  }
}

function setLocalStorage(key, value) {
  try {
    if (value === null || value === undefined) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
    return true;
  } catch (e) {
    console.error('Error writing to localStorage:', e);
    return false;
  }
}

// Funciones de usuario
function getCurrentUser() {
  return getLocalStorage(STORAGE_KEYS.SESSION);
}

function getAllUsers() {
  return getLocalStorage(STORAGE_KEYS.USERS, []);
}

function saveUser(user) {
  const users = getAllUsers();
  users.push(user);
  setLocalStorage(STORAGE_KEYS.USERS, users);
}

function updateUser(email, updates) {
  const users = getAllUsers();
  const index = users.findIndex(u => u.email === email);
  if (index === -1) return false;

  users[index] = { ...users[index], ...updates };
  setLocalStorage(STORAGE_KEYS.USERS, users);
  
  // Actualizar sesión si es el usuario actual
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.email === email) {
    setLocalStorage(STORAGE_KEYS.SESSION, users[index]);
  }
  
  return true;
}

// ---------- helpers de dominio ----------
function isDuocEmail(email) {
  return /@duoc\./i.test(email) || /@duocuc\./i.test(email);
}

function calcAge(isoDate) {
  // isoDate: 'YYYY-MM-DD'
  if (!isoDate) return 0;
  const b = new Date(isoDate + 'T00:00:00');
  const t = new Date();
  let age = t.getFullYear() - b.getFullYear();
  const m = t.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < b.getDate())) age--;
  return age;
}

// ---------- registro/login/logout ----------
function registerUser({ name, email, password, birthdate, address = '', preferences = '' }) {
  const users = getAllUsers();

  // Validaciones
  if (!name || !email || !password || !birthdate) {
    throw new Error('Por favor completa todos los campos obligatorios.');
  }
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('El correo ya está registrado.');
  }
  const age = calcAge(birthdate);
  if (age < 18) {
    throw new Error('Debes ser mayor de 18 años para registrarte.');
  }

  // Crear nuevo usuario
  const duoc = isDuocEmail(email);
  const newUser = {
    id: 'u_' + Math.random().toString(36).slice(2, 10),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
    birthdate,
    address: address.trim(),
    preferences: preferences.trim(),
    isDuoc: duoc,
    discount: duoc ? 0.20 : 0,
    points: 0,
    level: 'Bronze',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Guardar y activar sesión
  saveUser(newUser);
  setCurrentUser(newUser);
  return newUser;
}

function setCurrentUser(user, remember = false) {
  setLocalStorage(STORAGE_KEYS.SESSION, user);
  if (remember && user?.email) {
    setLocalStorage(STORAGE_KEYS.REMEMBER, user.email);
  }
}

function loginUser(email, password, remember = false) {
  const users = getAllUsers();
  const user = users.find(u => 
    u.email.toLowerCase() === email.toLowerCase() && 
    u.password === password
  );
  
  if (!user) {
    throw new Error('Credenciales incorrectas');
  }

  setCurrentUser(user, remember);
  return user;
}

function logout() {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
}
// ---------- perfil ----------
function updateCurrentUserProfile({ name, address, preferences }) {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('No hay sesión activa.');
  
  const users = getAllUsers();
  const i = users.findIndex(u => u.id === currentUser.id);
  if (i < 0) throw new Error('Usuario no encontrado.');

  if (typeof name === 'string') users[i].name = name.trim();
  if (typeof address === 'string') users[i].address = address.trim();
  if (typeof preferences === 'string') users[i].preferences = preferences.trim();
  users[i].updatedAt = new Date().toISOString();
  setLocalStorage(STORAGE_KEYS.USERS, users);
  return users[i];
}

// ---------- UI helpers (navbar + guards) ----------
function requireAuth(redirectIfMissing = 'login.html') {
  if (!getCurrentUser()) {
    window.location.href = redirectIfMissing;
  }
}

function renderAuthUI() {
  const user = getCurrentUser();
  const welcomeEl = document.getElementById('welcomeUser');
  const loginLink = document.getElementById('navLoginLink');
  const registroLink = document.getElementById('navRegistroLink');
  const perfilLink = document.getElementById('navPerfilLink');
  const logoutBtn = document.getElementById('navLogoutBtn');
  const duocBadge = document.getElementById('duocBadge');

  if (user) {
    if (welcomeEl) welcomeEl.textContent = `Bienvenido, ${user.name}${user.isDuoc ? ' (DUOC 20% OFF)' : ''}`;
    if (duocBadge) duocBadge.style.display = user.isDuoc ? 'inline-flex' : 'none';
    if (loginLink) loginLink.style.display = 'none';
    if (registroLink) registroLink.style.display = 'none';
    if (perfilLink) perfilLink.style.display = '';
    if (logoutBtn) logoutBtn.style.display = '';
  } else {
    if (welcomeEl) welcomeEl.textContent = '';
    if (duocBadge) duocBadge.style.display = 'none';
    if (loginLink) loginLink.style.display = '';
    if (registroLink) registroLink.style.display = '';
    if (perfilLink) perfilLink.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'none';
  }
}

function wireNavbar() {
  const logoutBtn = document.getElementById('navLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
      renderAuthUI();
      window.location.href = 'login.html';
    });
  }
}

// ---------- page bootstraps (auto-detecta por IDs) ----------
document.addEventListener('DOMContentLoaded', () => {
  wireNavbar();
  renderAuthUI();

  // login.html
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = loginForm.email.value.trim();
      const password = loginForm.password.value;
      const remember = loginForm.remember?.checked || false;
      try {
        const user = loginUser(email, password, remember);
        alert(`Sesión iniciada. ${user.isDuoc ? 'Tienes 20% OFF permanente (DUOC).' : ''}`);
        window.location.href = 'index.html';
      } catch (err) {
        alert(err.message || 'Error al iniciar sesión.');
      }
    });
  }

  // registro.html
  const regForm = document.getElementById('registroForm');
  if (regForm) {
    regForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = regForm.name.value.trim();
      const email = regForm.email.value.trim();
      const password = regForm.password.value;
      const confirm = regForm.confirm.value;
      const birthdate = regForm.birthdate.value;
      const referredBy = regForm.referredBy?.value.trim() || '';
      const address = regForm.address?.value.trim() || '';
      const preferences = regForm.preferences?.value.trim() || '';

      if (password !== confirm) {
        alert('Las contraseñas no coinciden.');
        return;
      }
      try {
        const user = registerUser({ name, email, password, birthdate, referredBy, address, preferences });
        alert(`¡Registro exitoso! ${user.isDuoc ? 'Correo DUOC detectado: descuento 20% activado de por vida.' : ''}`);
        // Auto-login y a inicio
        setCurrentUser(user, true);
        window.location.href = 'index.html';
      } catch (err) {
        alert(err.message || 'Error al registrar.');
      }
    });
  }

  // perfil.html
  const perfilForm = document.getElementById('perfilForm');
  if (perfilForm) {
    requireAuth('login.html'); // Fuerza sesión
    const user = getCurrentUser();
    // Cargar datos
    if (user) {
      perfilForm.name.value = user.name || '';
      perfilForm.email.value = user.email || '';
      perfilForm.address.value = user.address || '';
      perfilForm.preferences.value = user.preferences || '';
      const badge = document.getElementById('perfilDuocBadge');
      if (badge) {
        badge.style.display = user.isDuoc ? 'inline-flex' : 'none';
        if (user.isDuoc) badge.title = '20% OFF permanente por correo DUOC';
      }
    }

    // Guardar
    const saveBtn = document.getElementById('btnGuardarPerfil');
    if (saveBtn) {
      saveBtn.addEventListener('click', (e) => {
        e.preventDefault();
        try {
          const updated = updateCurrentUserProfile({
            name: perfilForm.name.value,
            address: perfilForm.address.value,
            preferences: perfilForm.preferences.value,
          });
          alert('¡Perfil guardado correctamente!');
          renderAuthUI();
        } catch (err) {
          alert(err.message || 'Error al guardar el perfil.');
        }
      });
    }
    // Limpiar
    const clearBtn = document.getElementById('btnLimpiarPerfil');
    if (clearBtn) {
      clearBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!user) return;
        perfilForm.name.value = user.name || '';
        perfilForm.email.value = user.email || '';
        perfilForm.address.value = user.address || '';
        perfilForm.preferences.value = user.preferences || '';
      });
    }
  }
});
