export interface Product {
  id: string;
  name: string;
  category: 'panes' | 'hojaldres' | 'pasteleria' | 'bebidas' | 'combos';
  price: number;
  rating: number;
  reviewsCount: number;
  description: string;
  ingredients: string[];
  image: string;
  isFreshToday?: boolean;
  isPopular?: boolean;
  stock: number;
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Pan de Masa Madre Tradicional',
    category: 'panes',
    price: 14500,
    rating: 4.9,
    reviewsCount: 128,
    description: 'Fermentación natural de 36 horas con harina integral orgánica. Crocante por fuera y esponjoso por dentro.',
    ingredients: ['Harina Orgánica', 'Masa Madre', 'Agua Filtrada', 'Sal Marina'],
    image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=800&q=80',
    isFreshToday: true,
    isPopular: true,
    stock: 24,
  },
  {
    id: 'prod-2',
    name: 'Croissant Francés de Mantequilla',
    category: 'hojaldres',
    price: 7500,
    rating: 4.9,
    reviewsCount: 215,
    description: 'Hojaldre artesanal laminado a mano con mantequilla de vaca 100% natural importada de Normandía.',
    ingredients: ['Mantequilla Normandía', 'Harina de Trigo', 'Leche Entera', 'Azúcar Orgánica'],
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
    isFreshToday: true,
    isPopular: true,
    stock: 40,
  },
  {
    id: 'prod-3',
    name: 'Pan de Queso Colombiano Especial',
    category: 'panes',
    price: 4500,
    rating: 4.8,
    reviewsCount: 94,
    description: 'Receta tradicional con queso costeño artesanal horneado en piedra de barro.',
    ingredients: ['Almidón de Yuca', 'Queso Costeño Artesanal', 'Mantequilla', 'Huevo'],
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    isFreshToday: true,
    isPopular: false,
    stock: 50,
  },
  {
    id: 'prod-4',
    name: 'Croissant de Almendras & Chocolate',
    category: 'hojaldres',
    price: 9200,
    rating: 5.0,
    reviewsCount: 167,
    description: 'Relleno de crema frangipane de almendras y cobertura con láminas tostadas y azúcar glas.',
    ingredients: ['Almendras Tostadas', 'Chocolate 70% Cacao', 'Frangipane', 'Hojaldre Mantequilla'],
    image: 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?auto=format&fit=crop&w=800&q=80',
    isFreshToday: true,
    isPopular: true,
    stock: 18,
  },
  {
    id: 'prod-5',
    name: 'Tarta Artesanal de Frutos Rojos',
    category: 'pasteleria',
    price: 18900,
    rating: 4.7,
    reviewsCount: 89,
    description: 'Base sablée crujiente con crema pastelera de vainilla de Madagascar y selección de frambuesas y moras frescas.',
    ingredients: ['Vainilla Madagascar', 'Frambuesas Frescas', 'Moras', 'Crema Pastelera'],
    image: 'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=800&q=80',
    isFreshToday: false,
    isPopular: true,
    stock: 10,
  },
  {
    id: 'prod-6',
    name: 'Café Cappuccino Especial Origen Huila',
    category: 'bebidas',
    price: 6800,
    rating: 4.9,
    reviewsCount: 140,
    description: 'Expreso doble de grano arábica de finca colombiana con leche texturizada al vapor.',
    ingredients: ['Granos Arábica Huila 100%', 'Leche Entera o Vegetal'],
    image: 'https://images.unsplash.com/photo-1572442388796-11668ba67e53?auto=format&fit=crop&w=800&q=80',
    isFreshToday: true,
    isPopular: true,
    stock: 100,
  },
  {
    id: 'prod-7',
    name: 'Combo Desayuno Claudipan Supreme',
    category: 'combos',
    price: 24500,
    rating: 5.0,
    reviewsCount: 78,
    description: 'Incluye 1 Pan de Masa Madre, 2 Croissants de Mantequilla, 1 Café Cappuccino y Jugo de Naranja natural.',
    ingredients: ['Selección Premium de la casa'],
    image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80',
    isFreshToday: true,
    isPopular: true,
    stock: 15,
  },
  {
    id: 'prod-8',
    name: 'Baguette Rústica Francesa',
    category: 'panes',
    price: 8000,
    rating: 4.6,
    reviewsCount: 62,
    description: 'Baguette de miga abierta y alveolada con corteza dorada y crujiente al horno de leña.',
    ingredients: ['Harina T65', 'Levadura Fresca', 'Sal Marina'],
    image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=800&q=80',
    isFreshToday: true,
    isPopular: false,
    stock: 30,
  }
];

export const MOCK_USER = {
  id: 'usr-101',
  name: 'Claudia Mendoza',
  email: 'claudia@claudipan.com',
  role: 'cliente_vip',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  address: 'Calle 93 # 12-45, Chapinero Norte, Bogotá',
  phone: '+57 312 456 7890',
};

export const MOCK_ORDERS = [
  {
    id: 'ORD-9821',
    date: '2026-07-20',
    itemsCount: 3,
    total: 36500,
    status: 'Entregado',
    items: ['Pan de Masa Madre', '2x Croissant Mantequilla', 'Café Cappuccino']
  },
  {
    id: 'ORD-9844',
    date: '2026-07-21',
    itemsCount: 1,
    total: 24500,
    status: 'En Preparación',
    items: ['Combo Desayuno Claudipan Supreme']
  }
];
