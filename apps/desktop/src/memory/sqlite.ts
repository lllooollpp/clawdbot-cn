import { createRequire } from "node:module";

import { installProcessWarningFilter } from "../infra/warnings.js";

const require = createRequire(import.meta.url);

export function requireNodeSqlite(): any {
  installProcessWarningFilter();
  try {
    // Try native node:sqlite first (available in Node 22.5.0+)
    // Use string concatenation to prevent bundlers from converting to static import
    const nodeSqlite = "node" + ":sqlite";
    return require(nodeSqlite);
  } catch (_err) {
    // Fallback to better-sqlite3 for older environments or Electron
    try {
      const Database = require("better-sqlite3");

      class DatabaseSync extends Database {
        constructor(path: string, options?: any) {
          super(path, options);
        }

        enableLoadExtension(_enabled: boolean) {
          // better-sqlite3 enables extension loading by default if the library was compiled with it.
        }
      }

      return { DatabaseSync };
    } catch (innerErr) {
      throw new Error(
        `No SQLite implementation found. Please use Node >=22.5.0 or install better-sqlite3. (error: ${
          (innerErr as Error).message
        })`,
      );
    }
  }
}
