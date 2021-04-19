// WITH minor modifications from matrix-react-sdk
import { createClient, ICreateClientOpts } from "matrix-js-sdk";
import { IndexedDBCryptoStore } from "matrix-js-sdk/src/crypto/store/indexeddb-crypto-store";
import { WebStorageSessionStore } from "matrix-js-sdk/src/store/session/webstorage";
import { IndexedDBStore } from "matrix-js-sdk/src/store/indexeddb";

const localStorage = window.localStorage;

// just *accessing* indexedDB throws an exception in firefox with
// indexeddb disabled.
let indexedDB;
try {
  indexedDB = window.indexedDB;
} catch (e) {}

/**
 * Create a new matrix client, with the persistent stores set up appropriately
 * (using localstorage/indexeddb, etc)
 *
 * @param {Object} opts  options to pass to Matrix.createClient. This will be
 *    extended with `sessionStore` and `store` members.
 *
 * @property {string} indexedDbWorkerScript  Optional URL for a web worker script
 *    for IndexedDB store operations. By default, indexeddb ops are done on
 *    the main thread.
 *
 * @returns {MatrixClient} the newly-created MatrixClient
 */
export default function createMatrixClient({ options }) {
  const storeOpts: Partial<ICreateClientOpts> = {
    useAuthorizationHeader: true,
  };

  if (indexedDB && localStorage) {
    storeOpts.store = new IndexedDBStore({
      indexedDB: indexedDB,
      dbName: "riot-web-sync",
      localStorage: localStorage,
      workerScript: createMatrixClient.indexedDbWorkerScript,
    });
  }

  if (localStorage) {
    storeOpts.sessionStore = new WebStorageSessionStore(localStorage);
  }

  if (indexedDB) {
    storeOpts.cryptoStore = new IndexedDBCryptoStore(
      indexedDB,
      "matrix-js-sdk:crypto"
    );
  }

  const opts: ICreateClientOpts = Object.assign(storeOpts, options, {
    deviceId: "DEVICE_ID",
  });

  // TODO - get the device_id (more info in matrix-js-sdk)
  return createClient(opts);
}

createMatrixClient.indexedDbWorkerScript = null;
