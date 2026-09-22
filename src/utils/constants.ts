export const APP_NAME = 'Claudipan';
export const APP_TAGLINE = 'Panadería & Pastelería Artesanal';

export const CATEGORIES = [
  { id: 'all', name: 'Todos los Productos', icon: '🍞' },
  { id: 'panes', name: 'Panes de Masa Madre', icon: '🥖' },
  { id: 'hojaldres', name: 'Croissants & Hojaldres', icon: '🥐' },
  { id: 'pasteleria', name: 'Pasteles & Dulces', icon: '🍰' },
  { id: 'bebidas', name: 'Café & Bebidas', icon: '☕' },
  { id: 'combos', name: 'Combos Desayuno', icon: '🥨' },
] as const;

export const CURRENCY = 'COP';
export const TAX_RATE = 0.19; // 19% IVA
export const DEFAULT_SHIPPING_FEE = 4500; // $4.500 COP
export const FREE_SHIPPING_THRESHOLD = 50000; // Envío gratis a partir de $50.000 COP

export const STORAGE_KEYS = {
  CART: 'claudipan_cart_v1',
  AUTH: 'claudipan_auth_v1',
  THEME: 'claudipan_theme',
};
