import { getStoreBackend, getDatabaseUrl, isProductionWithoutDatabase } from "./store-types";
import { createJsonStore } from "./store-json";
import { createMysqlStore, initMysqlSchema } from "./store-mysql";
import type { WeddingStore } from "./store-types";

let store: WeddingStore | null = null;
let schemaReady = false;

export async function getStore(): Promise<WeddingStore> {
  if (isProductionWithoutDatabase()) {
    throw new Error(
      "DATABASE_URL ali DATABASE_HOST/USER/PASSWORD/NAME mora biti nastavljen na Vercelu (Neoserv MySQL)."
    );
  }

  if (!store) {
    const backend = getStoreBackend();
    store = backend === "mysql" ? createMysqlStore() : createJsonStore();
  }

  if (getStoreBackend() === "mysql" && !schemaReady) {
    if (!getDatabaseUrl()) {
      throw new Error("MySQL povezava ni konfigurirana.");
    }
    await initMysqlSchema();
    schemaReady = true;
  }

  return store;
}
