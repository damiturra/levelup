# Level-Up Gamer - Documentación del Proyecto

## Descripción General
Level-Up Gamer es una tienda online dedicada a satisfacer las necesidades de los entusiastas de los videojuegos en Chile. La plataforma ofrece una amplia gama de productos gaming, desde consolas y accesorios hasta computadores y sillas especializadas.

## Misión
Proporcionar productos de alta calidad para gamers en todo Chile, ofreciendo una experiencia de compra única y personalizada, con un enfoque en la satisfacción del cliente y el crecimiento de la comunidad gamer.

## Visión
Ser la tienda online líder en productos para gamers en Chile, reconocida por su innovación, servicio al cliente excepcional, y un programa de fidelización basado en gamificación.

## Estructura del Proyecto

### Páginas Principales
- `index.html` - Página principal
- `catalogo.html` - Catálogo de productos
- `product.html` - Detalles de producto individual
- `carrito.html` - Carrito de compras
- `login.html` - Inicio de sesión
- `registro.html` - Registro de usuarios
- `perfil.html` - Perfil de usuario
- `blog.html` - Blog y noticias
- `comprobante.html` - Comprobante de compra

### Estructura de Archivos
```
assets/
├── css/
│   ├── catalog.css
│   └── styles.css
├── js/
│   ├── app.js
│   ├── cart.js
│   ├── catalog.js
│   ├── order-history.js
│   ├── points.js
│   ├── product.js
│   ├── profile.js
│   ├── receipt-page.js
│   └── session.js
├── images/
└── includes/
    └── footer.html
```

## Características Implementadas

### 1. Sistema de Usuarios
- Registro con validación de edad (+18)
- Descuento 20% para usuarios DUOC
- Gestión de perfil y preferencias
- Sistema de autenticación

### 2. Catálogo
- Visualización por categorías
- Filtros avanzados
- Detalles de productos
- Sistema de búsqueda

### 3. Carrito de Compras
- Gestión de productos
- Cálculo de descuentos
- Resumen de compra
- Proceso de checkout

### 4. Sistema de Fidelización
- Programa de referidos
- Puntos LevelUp
- Niveles de usuario
- Recompensas y descuentos

### 5. Reseñas y Calificaciones
- Sistema de valoración
- Comentarios de productos
- Historial de compras

## Diseño Visual

### Colores
- **Fondo Principal**: Negro (#000000)
- **Acentos**:
  - Azul Eléctrico (#1E90FF)
  - Verde Neón (#39FF14)

### Tipografía
- **Principal**: Roboto (texto general)
- **Encabezados**: Orbitron (títulos)

### Texto
- **Principal**: Blanco (#FFFFFF)
- **Secundario**: Gris Claro (#D3D3D3)

## Almacenamiento Local

### Claves de LocalStorage
- `levelup_users` - Datos de usuarios
- `levelup_current_user` - Sesión actual
- `levelup_orders` - Historial de órdenes
- `levelup_cart` - Carrito actual
- `levelup_points` - Puntos de usuario

## Categorías de Productos

1. Juegos de Mesa
2. Accesorios
3. Consolas
4. Computadores Gamers
5. Sillas Gamers
6. Mouse
7. Mousepad
8. Poleras Personalizadas
9. Polerones Gamers

## Funcionalidades Específicas

### Sistema de Puntos
- 1% del valor de compra en puntos
- Puntos por referidos
- Canje por descuentos

### Proceso de Compra
1. Selección de productos
2. Revisión del carrito
3. Confirmación de compra
4. Generación de comprobante
5. Actualización de puntos
6. Registro en historial

### Validaciones
- Edad mínima: 18 años
- Correo DUOC para descuento
- Stock disponible
- Datos de usuario completos

## Mantenimiento

### Limpieza de Código
- Eliminar archivos `.bak` y `.new`
- Mantener consistencia en la estructura
- Validar enlaces y recursos
- Actualizar dependencias

### Mejores Prácticas
1. Mantener el diseño responsivo
2. Seguir la guía de estilos
3. Documentar cambios
4. Validar funcionalidades
