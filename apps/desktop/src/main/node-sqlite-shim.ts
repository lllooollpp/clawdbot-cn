import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

let DatabaseSync: any;
try {
  const moduleName = "node" + ":sqlite";
  const sqlite = require(moduleName);
  DatabaseSync = sqlite.DatabaseSync;
} catch {
  const BetterSqlite = require("better-sqlite3");

  class DatabaseSyncFallback extends BetterSqlite {
    constructor(path: string, options?: any) {
      super(path, options);
    }

    enableLoadExtension(_enabled: boolean) {
      // better-sqlite3 enables extension loading by default if compiled with it.
    }
  }

  DatabaseSync = DatabaseSyncFallback;
}

class StatementSync {}

export { DatabaseSync, StatementSync };
export default { DatabaseSync, StatementSync };
