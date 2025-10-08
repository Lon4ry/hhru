"use server";

import prisma from "@/shared/prisma";

export async function getOrders(userId?: number) {
  return JSON.parse(
    JSON.stringify(
      await prisma.order.findMany({
        where: { userId },
        include: {
          review: true,
          items: {
            include: {
              product: true,
            },
          },
          windows: {
            include: {
              profile: true,
            },
          },
        },
      }),
    ),
  );
}
