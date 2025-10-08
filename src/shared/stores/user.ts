import { createEffect, createEvent, createStore, sample } from "effector";
import { RootGate } from "@/app/Gate";
import { User } from "@/shared/prisma";
import { loadOrdersFx } from "@/shared/stores/orders";

const loadUserFx = createEffect(() => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error("Failed to parse user:", err);
    return null;
  }
});

export const updateUser = createEvent<Omit<User, "password"> | null>();

export const $isUserLoaded = createStore(false).on(loadUserFx.done, () => true);

export const $user = createStore<Omit<User, "password"> | null>(null)
  .on(updateUser, (_, user) => user)
  .on(loadUserFx.doneData, (_, user) => user);

sample({
  source: $user,
  filter: $isUserLoaded,
  fn: (user) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user));
    }
  },
});

sample({ clock: RootGate.open, target: loadUserFx });

sample({
  source: $user,
  filter: Boolean,
  fn: (user) => ({ userId: user?.id as number }),
  target: loadOrdersFx,
});
