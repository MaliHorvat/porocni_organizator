import { getStoreBackend } from "./store-types";
import { createBlobStore } from "./store-blob";
import { createJsonStore } from "./store-json";
import { createMysqlStore, initMysqlSchema } from "./store-mysql";
import type { WeddingStore } from "./store-types";

let store: WeddingStore | null = null;
let schemaReady = false;

export async function getStore(): Promise<WeddingStore> {
  if (!store) {
    const backend = getStoreBackend();
    if (backend === "mysql") {
      store = createMysqlStore();
    } else if (backend === "blob") {
      store = createBlobStore();
    } else {
      store = createJsonStore();
    }
  }

  if (getStoreBackend() === "mysql" && !schemaReady) {
    await initMysqlSchema();
    schemaReady = true;
  }

  return store;
}
