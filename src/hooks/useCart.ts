import { useContext } from 'react';
import { CartContext, CartContextType } from '../context/CartContext';

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};
