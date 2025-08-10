import type { PrismaClient as PrismaClientType } from "@prisma/client";

const PRISMA_KEY = Symbol.for("brain-training.prisma");

type GlobalStore = Record<PropertyKey, unknown>;
const store = globalThis as unknown as GlobalStore;

export async function getPrisma(): Promise<PrismaClientType> {
  const cached = store[PRISMA_KEY] as PrismaClientType | undefined;
  if (cached) return cached;
  const mod = await import("@prisma/client");
  const client: PrismaClientType = new mod.PrismaClient();
  if (process.env.NODE_ENV !== "production") {
    store[PRISMA_KEY] = client;
  }
  return client;
}