"use client";

import { CartItem, InventoryItem } from "@/types";
import React, { createContext, useContext, useState } from "react";
import toast from "react-hot-toast";

interface CartContextType {
  items: CartItem[];
  addToCart: (inventory: InventoryItem, quantity: number) => void;
  removeFromCart: (inventoryId: number) => void;
  updateQuantity: (inventoryId: number, quantity: number) => void;
  clearCart: () => void;
  totalAmount: number;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (inventory: InventoryItem, quantity: number) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.inventory_id === inventory.id);
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > inventory.quantity_available) {
          toast.error(`Only ${inventory.quantity_available} ${inventory.product?.unit || "units"} available`);
          return prev;
        }
        toast.success("Cart updated");
        return prev.map((i) =>
          i.inventory_id === inventory.id ? { ...i, quantity: newQty } : i
        );
      }
      toast.success("Added to cart");
      return [...prev, { inventory_id: inventory.id, quantity, inventory }];
    });
  };

  const removeFromCart = (inventoryId: number) => {
    setItems((prev) => prev.filter((i) => i.inventory_id !== inventoryId));
    toast.success("Removed from cart");
  };

  const updateQuantity = (inventoryId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(inventoryId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.inventory_id === inventoryId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => setItems([]);

  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.inventory.price_per_unit,
    0
  );

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalAmount, totalItems }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
