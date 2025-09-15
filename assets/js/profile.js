/* ======================================================================
   Level‑Up Gamer · profile.js
   Manejo del perfil de usuario y visualización de datos
   ====================================================================== */

// Validadores
const validators = {
  name: (value) => {
    const regex = /^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]{3,50}$/;
    return {
      valid: regex.test(value.trim()),
      message: 'El nombre debe tener entre 3 y 50 caracteres y solo puede contener letras'
    };
  },
  phone: (value) => {
    const regex = /^9[0-9]{8}$/;
    return {
      valid: regex.test(value.trim()),
      message: 'Ingresa un número válido (9 dígitos comenzando con 9)'
    };
  },
  birthdate: (value) => {
    const date = new Date(value);
    const age = Math.floor((new Date() - date) / (365.25 * 24 * 60 * 60 * 1000));
    return {
      valid: age >= 18,
      message: 'Debes ser mayor de 18 años'
    };
  },
  address: (value) => {
    return {
      valid: value.trim().length >= 10,
      message: 'La dirección debe tener al menos 10 caracteres'
    };
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // Verificar sesión activa
  requireAuth('login.html');
  const user = getCurrentUser();
  if (!user) return;
  
  // Inicializar tooltips de Bootstrap
  const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  tooltips.forEach(tooltip => new bootstrap.Tooltip(tooltip));

  // Actualizar datos de la interfaz
  const elements = {
    levelBadge: document.getElementById('levelBadge'),
    duocBadge: document.getElementById('duocBadge'),
    pointsValue: document.getElementById('pointsValue'),
    purchasesValue: document.getElementById('purchasesValue'),
    savingsValue: document.getElementById('savingsValue'),
    refCode: document.getElementById('refCode'),
    form: document.getElementById('profileForm')
  };

  // Actualizar badges y estadísticas
  if (elements.levelBadge) {
    elements.levelBadge.textContent = `NIVEL ${user.level || 'BRONZE'}`;
  }
  if (elements.duocBadge) {
    elements.duocBadge.style.display = user.isDuoc ? 'inline-block' : 'none';
  }
  if (elements.pointsValue) {
    elements.pointsValue.textContent = user.points || 0;
  }
  if (elements.purchasesValue) {
    const orders = getLocalStorage(STORAGE_KEYS.ORDERS, [])
      .filter(order => order.userId === user.id);
    elements.purchasesValue.textContent = orders.length;
  }
  if (elements.savingsValue) {
    const orders = getLocalStorage(STORAGE_KEYS.ORDERS, [])
      .filter(order => order.userId === user.id);
    const savings = orders.reduce((total, order) => {
      return total + (order.discount || 0);
    }, 0);
    elements.savingsValue.textContent = `$${savings.toLocaleString()}`;
  }
  if (elements.refCode) {
    elements.refCode.textContent = user.id;
    elements.refCode.addEventListener('click', () => {
      navigator.clipboard.writeText(user.id)
        .then(() => alert('Código copiado al portapapeles'))
        .catch(err => console.error('Error al copiar:', err));
    });
  }

  // Cargar datos en el formulario
  if (elements.form) {
    elements.form.name.value = user.name || '';
    elements.form.email.value = user.email || '';
    elements.form.phone.value = user.phone || '';
    elements.form.birthdate.value = user.birthdate || '';
    elements.form.address.value = user.address || '';
    elements.form.preferences.value = user.preferences || '';
    
    // Manejar guardado del formulario
    // Validación en tiempo real
    const inputs = elements.form.querySelectorAll('input[required], textarea[required]');
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        const validator = validators[input.name];
        if (validator) {
          const result = validator(input.value);
          input.setCustomValidity(result.valid ? '' : result.message);
          input.classList.toggle('is-invalid', !result.valid);
          input.classList.toggle('is-valid', result.valid);
        }
      });
    });

    // Manejar envío del formulario
    elements.form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Validar todos los campos
      let isValid = true;
      inputs.forEach(input => {
        const validator = validators[input.name];
        if (validator) {
          const result = validator(input.value);
          input.setCustomValidity(result.valid ? '' : result.message);
          if (!result.valid) isValid = false;
        }
      });

      if (!isValid) {
        document.getElementById('profileError').textContent = 'Por favor corrige los errores en el formulario';
        document.getElementById('profileError').classList.remove('d-none');
        return;
      }

      try {
        const updates = {
          name: elements.form.name.value.trim(),
          phone: elements.form.phone.value.trim(),
          address: elements.form.address.value.trim(),
          preferences: elements.form.preferences.value.trim()
        };
        
        // Deshabilitar botón mientras se guarda
        const btnSave = document.getElementById('btnSave');
        const originalText = btnSave.innerHTML;
        btnSave.disabled = true;
        btnSave.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Guardando...';
        
        const updated = updateUser(user.email, updates);
        if (updated) {
          const successMsg = document.getElementById('profileSuccess');
          successMsg.textContent = '¡Datos actualizados correctamente!';
          successMsg.classList.remove('d-none');
          
          // Ocultar mensaje después de 3 segundos
          setTimeout(() => {
            successMsg.classList.add('d-none');
          }, 3000);

          // Actualizar datos en el storage
          setCurrentUser({ ...user, ...updates });
        }
      } catch (err) {
        const errorMsg = document.getElementById('profileError');
        errorMsg.textContent = err.message || 'Error al actualizar el perfil';
        errorMsg.classList.remove('d-none');
      } finally {
        // Restaurar botón
        btnSave.disabled = false;
        btnSave.innerHTML = originalText;
      }
    });

    // Manejar botón de reset
    const btnReset = document.getElementById('btnReset');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que quieres descartar los cambios?')) {
          elements.form.reset();
          inputs.forEach(input => {
            input.classList.remove('is-valid', 'is-invalid');
          });
          // Recargar datos originales
          elements.form.name.value = user.name || '';
          elements.form.email.value = user.email || '';
          elements.form.phone.value = user.phone || '';
          elements.form.birthdate.value = user.birthdate || '';
          elements.form.address.value = user.address || '';
          elements.form.preferences.value = user.preferences || '';
        }
      });
    };
  }

  // Cargar historial de compras
  const orderHistory = document.getElementById('orderHistory');
  if (orderHistory) {
    const orders = getLocalStorage(STORAGE_KEYS.ORDERS, [])
      .filter(order => order.userId === user.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (orders.length === 0) {
      orderHistory.innerHTML = `
        <tr>
          <td colspan="4" class="text-center text-muted">
            No hay compras registradas
          </td>
        </tr>
      `;
    } else {
      orderHistory.innerHTML = orders.map(order => `
        <tr>
          <td>${new Date(order.date).toLocaleDateString()}</td>
          <td>#${order.id}</td>
          <td>${order.items.length} productos</td>
          <td class="text-end">$${order.total.toLocaleString()}</td>
        </tr>
      `).join('');
    }
  }

  // Botón de eliminar cuenta
  const btnDelete = document.getElementById('btnConfirmDelete');
  if (btnDelete) {
    btnDelete.addEventListener('click', () => {
      if (confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción es irreversible.')) {
        const users = getAllUsers().filter(u => u.id !== user.id);
        setLocalStorage(STORAGE_KEYS.USERS, users);
        logout();
        window.location.href = 'index.html';
      }
    });
  }
});