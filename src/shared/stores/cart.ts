import { createEffect, createEvent, createStore, sample } from "effector";
import { Product } from "@/shared/prisma";
import { RootGate } from "@/app/Gate";

export type WindowItemType = {
  profile_type: string;
  width: number;
  height: number;
  sqr: number;
  type: "window";
};

export type ProductItemType = Product & { type: "product" };

export type ItemType = WindowItemType | ProductItemType;

export const addToCart = createEvent<ItemType>();
export const removeFromCart = createEvent<number>();
export const resetCart = createEvent();

const loadCartFx = createEffect((): ItemType[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("cart");
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Failed to parse cart:", err);
    return [];
  }
});

const $isCartLoaded = createStore(false).on(loadCartFx.done, () => true);

export const $cart = createStore<ItemType[]>([])
  .on(addToCart, (state, payload) => {
    return [...state, payload];
  })
  .on(removeFromCart, (state, index) => {
    return state.filter((_, i) => i !== index);
  })
  .reset(resetCart)
  .on(loadCartFx.doneData, (_, cart) => cart);

sample({
  source: $cart,
  filter: $isCartLoaded,
  fn: (cart) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  },
});

sample({ clock: RootGate.open, target: loadCartFx });
