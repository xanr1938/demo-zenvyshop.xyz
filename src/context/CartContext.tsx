"use client";

import { createContext, useContext, useEffect, useReducer, ReactNode } from "react";
import type { CartItem, Product } from "@appwrite/types";

interface CartContextType {
  items: CartItem[];
  total: number;
  count: number;
  addItem: (item: Product) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
}

type CartAction =
  | { type: "ADD"; item: Product }
  | { type: "REMOVE"; id: string }
  | { type: "UPDATE_QTY"; id: string; qty: number }
  | { type: "CLEAR" }
  | { type: "LOAD"; items: CartItem[] };

const CartContext = createContext<CartContextType | null>(null);

function reducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case "ADD": {
      const existing = state.find((i) => i.$id === action.item.$id);
      if (existing) {
        return state.map((i) =>
          i.$id === action.item.$id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...state, { ...action.item, qty: 1 }];
    }
    case "REMOVE":
      return state.filter((i) => i.$id !== action.id);
    case "UPDATE_QTY":
      return state.map((i) =>
        i.$id === action.id ? { ...i, qty: Math.max(1, action.qty) } : i
      );
    case "CLEAR":
      return [];
    case "LOAD":
      return action.items;
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(reducer, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("zenvyshop_cart");
      if (saved) dispatch({ type: "LOAD", items: JSON.parse(saved) as CartItem[] });
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("zenvyshop_cart", JSON.stringify(items));
  }, [items]);

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        total,
        count,
        addItem: (item) => dispatch({ type: "ADD", item }),
        removeItem: (id) => dispatch({ type: "REMOVE", id }),
        updateQty: (id, qty) => dispatch({ type: "UPDATE_QTY", id, qty }),
        clearCart: () => dispatch({ type: "CLEAR" }),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
