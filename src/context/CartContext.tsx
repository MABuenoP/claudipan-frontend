import React, { createContext, useState, useEffect } from 'react';
import { Product } from '../services/productService';
import { storage } from '../utils/helpers';
import { STORAGE_KEYS, DEFAULT_SHIPPING_FEE, FREE_SHIPPING_THRESHOLD } from '../utils/constants';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  toastMessage: string | null;
  dismissToast: () => void;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() =>
    storage.get<CartItem[]>(STORAGE_KEYS.CART, [])
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    storage.set(STORAGE_KEYS.CART, items);
  }, [items]);

  const addItem = (product: Product, quantity = 1) => {
    setItems((prevItems) => {
      const existing = prevItems.find((item) => item.product.id === product.id);
      if (existing) {
        return prevItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevItems, { product, quantity }];
    });

    setToastMessage(`¡${product.nombre} agregado al carrito!`);
  };

  const removeItem = (productId: number) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const dismissToast = () => {
    setToastMessage(null);
  };

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.product.precio * item.quantity, 0);
  const shippingFee = subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD ? DEFAULT_SHIPPING_FEE : 0;
  const totalAmount = subtotal + shippingFee;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        shippingFee,
        totalAmount,
        toastMessage,
        dismissToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
