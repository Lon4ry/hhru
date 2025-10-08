import prisma from "@/shared/prisma";
import { resetDatabase } from "../utils/reset-db";

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

beforeEach(async () => {
  await resetDatabase();
  jest.clearAllMocks();
});

afterAll(async () => {
  await resetDatabase();
  await prisma.$disconnect();
});
