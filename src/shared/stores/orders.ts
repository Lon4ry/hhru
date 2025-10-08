import { createEffect, createStore } from "effector";
import {
  ItemOrder,
  Order,
  Product,
  Profile,
  Review,
  WindowOrder,
} from "@/shared/prisma";
import { getOrders } from "@/shared/actions";

export const loadOrdersFx = createEffect(
  async ({ userId }: { userId: number }) => {
    return await getOrders(userId);
  },
);

export const $orders = createStore<
  (Order & {
    items: (ItemOrder & { product: Product })[];
    windows: (WindowOrder & { profile: Profile })[];
    review?: Review;
  })[]
>([]).on(loadOrdersFx.doneData, (_, orders) => orders);
