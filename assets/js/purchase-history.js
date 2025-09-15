// Manejo del historial de compras
const STORAGE_KEYS = {
  ORDERS: 'levelup_orders',
  USERS: 'levelup_users'
};

function displayPurchaseHistory() {
  const user = getCurrentUser();
  if (!user) return;

  const purchaseHistoryTable = document.getElementById('purchaseHistoryTable');
  const purchaseHistoryBody = document.getElementById('purchaseHistoryBody');
  const noPurchasesMessage = document.getElementById('noPurchasesMessage');

  if (!purchaseHistoryTable || !purchaseHistoryBody || !noPurchasesMessage) return;

  // Obtener órdenes del usuario
  const orders = getLocalStorage(STORAGE_KEYS.ORDERS, [])
    .filter(order => order.userId === user.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (orders.length === 0) {
    purchaseHistoryTable.classList.add('d-none');
    noPurchasesMessage.classList.remove('d-none');
    return;
  }

  purchaseHistoryTable.classList.remove('d-none');
  noPurchasesMessage.classList.add('d-none');
  
  // Limpiar tabla
  purchaseHistoryBody.innerHTML = '';

  // Agregar cada orden a la tabla
  orders.forEach(order => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${new Date(order.date).toLocaleDateString()}</td>
      <td>${order.id}</td>
      <td>${order.items.reduce((sum, item) => sum + item.quantity, 0)} productos</td>
      <td class="text-end">$${order.total.toLocaleString()}</td>
      <td class="text-center">
        <a href="comprobante.html?order=${order.id}" class="btn btn-sm btn-outline-neon">
          Ver detalle
        </a>
      </td>
    `;
    purchaseHistoryBody.appendChild(row);
  });
}

// Función para agregar una nueva compra al historial
function addPurchaseToHistory(orderData) {
  const orders = getLocalStorage(STORAGE_KEYS.ORDERS, []);
  orders.push(orderData);
  setLocalStorage(STORAGE_KEYS.ORDERS, orders);
  
  // Actualizar puntos del usuario
  const user = getCurrentUser();
  if (user) {
    const pointsEarned = Math.floor(orderData.total * 0.01); // 1% en puntos
    user.points = (user.points || 0) + pointsEarned;
    updateUser(user);
  }
}

// Función auxiliar para obtener usuario actual
function getCurrentUser() {
  return getLocalStorage(STORAGE_KEYS.CURRENT_USER);
}

// Función auxiliar para actualizar usuario
function updateUser(userData) {
  const users = getLocalStorage(STORAGE_KEYS.USERS, []);
  const index = users.findIndex(u => u.id === userData.id);
  if (index !== -1) {
    users[index] = { ...users[index], ...userData };
    setLocalStorage(STORAGE_KEYS.USERS, users);
    setLocalStorage(STORAGE_KEYS.CURRENT_USER, userData);
  }
}

// Funciones auxiliares de LocalStorage
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
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Error writing to localStorage:', e);
  }
}

// Inicializar el historial de compras cuando se carga la página
document.addEventListener('DOMContentLoaded', displayPurchaseHistory);
