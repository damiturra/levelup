// products.js • GLOBAL (no ESM). 
window.PRODUCTS = [
  { 
    code: 'JM001', 
    category: 'Juegos de Mesa',
    name: 'Catan', 
    price: 29990,
    stock: 15, 
    rating: 4.8,
    manufacturer: 'KOSMOS Games',
    distributor: 'Devir Iberia',
    description: 'Un clásico juego de estrategia donde los jugadores compiten por colonizar y expandirse en la isla de Catan. Ideal para 3-4 jugadores y perfecto para noches de juego en familia o con amigos.',
    highlights: [
      'Juego de estrategia y negociación',
      'Para 3-4 jugadores',
      'Duración: 60-120 minutos',
      'Edad recomendada: 10+'
    ]
  },
  { 
    code: 'JM002', 
    category: 'Juegos de Mesa',
    name: 'Carcassonne', 
    price: 24990,
    stock: 12, 
    rating: 4.7,
    manufacturer: 'Hans im Glück',
    distributor: 'Devir Iberia',
    description: 'Un juego de colocación de fichas donde los jugadores construyen el paisaje alrededor de la fortaleza medieval de Carcassonne. Ideal para 2-5 jugadores y fácil de aprender.',
    highlights: [
      'Juego de colocación de losetas',
      'Para 2-5 jugadores',
      'Duración: 30-45 minutos',
      'Edad recomendada: 7+'
    ]
  },
  { 
    code: 'AC001', 
    category: 'Accesorios',
    name: 'Controlador Inalámbrico Xbox Series X', 
    price: 59990,
    stock: 20, 
    rating: 4.9,
    manufacturer: 'Microsoft',
    distributor: 'Microsoft Chile',
    description: 'Ofrece una experiencia de juego cómoda con botones mapeables y una respuesta táctil mejorada. Compatible con consolas Xbox y PC.',
    highlights: [
      'Conectividad Bluetooth',
      'Hasta 40 horas de batería',
      'Botones personalizables',
      'Compatible con Xbox Series X|S y PC'
    ]
  },
  { 
    code: 'AC002', 
    category: 'Accesorios',
    name: 'Auriculares Gamer HyperX Cloud II', 
    price: 79990,
    stock: 8, 
    rating: 4.8,
    manufacturer: 'HyperX (HP)',
    distributor: 'HP Chile',
    description: 'Proporcionan un sonido envolvente de calidad con un micrófono desmontable y almohadillas de espuma viscoelástica para mayor comodidad durante largas sesiones de juego.',
    highlights: [
      'Sonido envolvente 7.1',
      'Micrófono desmontable con cancelación de ruido',
      'Almohadillas memory foam',
      'Compatible con múltiples plataformas'
    ]
  },
  { 
    code: 'CO001', 
    category: 'Consolas',
    name: 'PlayStation 5', 
    price: 549990,
    stock: 5, 
    rating: 4.9,
    manufacturer: 'Sony Interactive Entertainment',
    distributor: 'Sony Chile',
    description: 'La consola de última generación de Sony, que ofrece gráficos impresionantes y tiempos de carga ultrarrápidos para una experiencia de juego inmersiva.',
    highlights: [
      'SSD ultrarrápido',
      'Ray tracing en tiempo real',
      'Control DualSense con retroalimentación háptica',
      'Resolución 4K y hasta 120 FPS'
    ]
  },
  { 
    code: 'CG001', 
    category: 'Computadores Gamers',
    name: 'PC Gamer ASUS ROG Strix', 
    price: 1299990,
    stock: 3, 
    rating: 4.9,
    manufacturer: 'ASUS',
    distributor: 'ASUS Chile',
    description: 'Un potente equipo diseñado para los gamers más exigentes, equipado con los últimos componentes para ofrecer un rendimiento excepcional en cualquier juego.',
    highlights: [
      'NVIDIA RTX 3080 12GB',
      'AMD Ryzen 9 5900X',
      '32GB RAM DDR4',
      'SSD NVMe 1TB'
    ]
  },
  { 
    code: 'SG001', 
    category: 'Sillas Gamers',
    name: 'Silla Gamer Secretlab Titan', 
    price: 349990,
    stock: 6, 
    rating: 4.8,
    manufacturer: 'Secretlab',
    distributor: 'Tecnoglobal Chile',
    description: 'Diseñada para el máximo confort, esta silla ofrece un soporte ergonómico y personalización ajustable para sesiones de juego prolongadas.',
    highlights: [
      'Soporte lumbar integrado ajustable',
      'Apoyabrazos 4D metálicos',
      'Reclinación hasta 165°',
      'Tapizado premium'
    ]
  },
  { 
    code: 'MS001', 
    category: 'Mouse',
    name: 'Mouse Gamer Logitech G502 HERO', 
    price: 49990,
    stock: 25, 
    rating: 4.9,
    manufacturer: 'Logitech',
    distributor: 'Logitech Chile',
    description: 'Con sensor de alta precisión y botones personalizables, este mouse es ideal para gamers que buscan un control preciso y personalización.',
    highlights: [
      'Sensor HERO 25K',
      '11 botones programables',
      'Pesos ajustables',
      'RGB LIGHTSYNC personalizable'
    ]
  },
  { 
    code: 'MP001', 
    category: 'Mousepad',
    name: 'Razer Goliathus Extended Chroma', 
    price: 29990,
    stock: 15, 
    rating: 4.7,
    manufacturer: 'Razer',
    distributor: 'Razer Chile',
    description: 'Ofrece un área de juego amplia con iluminación RGB personalizable, asegurando una superficie suave y uniforme para el movimiento del mouse.',
    highlights: [
      'Superficie micro-texturizada optimizada',
      'Iluminación RGB Chroma',
      'Base antideslizante',
      'Tamaño extendido'
    ]
  },
  { 
    code: 'PP001', 
    category: 'Poleras Personalizadas',
    name: "Polera Gamer Personalizada 'Level-Up'", 
    price: 14990,
    stock: 50, 
    rating: 4.6,
    manufacturer: 'Level-Up Workshop',
    distributor: 'Level-Up Gamer',
    description: 'Una camiseta cómoda y estilizada, con la posibilidad de personalizarla con tu gamer tag o diseño favorito.',
    highlights: [
      'Algodón 100% premium',
      'Personalización completa',
      'Impresión de alta calidad',
      'Tallas XS a XXL'
    ]
  }
];

// Categorías únicas ordenadas (opcional para otros módulos)
window.CATEGORIES = [...new Set(window.PRODUCTS.map(p => p.category))].sort();

// Helper global usado por app.js
window.byCode = function byCode(code){ return window.PRODUCTS.find(p => p.code === code); };
