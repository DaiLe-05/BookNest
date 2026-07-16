import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      add: (book) => {
        const items = get().items;
        const existed = items.find((item) => item.id === book.id);
        if (existed) {
          set({ items: items.map((item) => (item.id === book.id ? { ...item, quantity: item.quantity + 1 } : item)) });
          return;
        }
        set({ items: [...items, { ...book, quantity: 1 }] });
      },
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) set({ items: get().items.filter((item) => item.id !== id) });
        else set({ items: get().items.map((item) => (item.id === id ? { ...item, quantity } : item)) });
      },
      remove: (id) => set({ items: get().items.filter((item) => item.id !== id) }),
      clear: () => set({ items: [] })
    }),
    { name: "booknest-cart" }
  )
);

