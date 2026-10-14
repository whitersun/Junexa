import { promises as fs } from "fs";
import path from "path";
import { Pool } from "pg";
import { Store, initialProducts } from "@junexa/shared/data";
const pool = process.env.DATABASE_URL
    ? new Pool({ connectionString: process.env.DATABASE_URL })
    : null;
const file = process.env.STORE_FILE || path.join(process.cwd(), ".data", "store.json");
const fresh = (): Store => ({ products: initialProducts, bills: [] });
let queue: Promise<unknown> = Promise.resolve();
async function init() {
    if (pool) {
        await pool.query(
            "CREATE TABLE IF NOT EXISTS junexa_store (id integer PRIMARY KEY, data jsonb NOT NULL)",
        );
        await pool.query(
            "INSERT INTO junexa_store VALUES (1,$1) ON CONFLICT DO NOTHING",
            [JSON.stringify(fresh())],
        );
    }
}
export async function readStore(): Promise<Store> {
    if (pool) {
        await init();
        return (await pool.query("SELECT data FROM junexa_store WHERE id=1"))
            .rows[0].data;
    }
    try {
        return JSON.parse(await fs.readFile(file, "utf8"));
    } catch (e) {
        if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
        return fresh();
    }
}
export async function mutate<T>(fn: (s: Store) => T): Promise<T> {
    const run = queue.then(async () => {
        if (pool) {
            await init();
            const c = await pool.connect();
            try {
                await c.query("BEGIN");
                const s = (
                    await c.query("SELECT data FROM junexa_store WHERE id=1 FOR UPDATE")
                ).rows[0].data;
                const result = fn(s);
                await c.query("UPDATE junexa_store SET data=$1 WHERE id=1", [
                    JSON.stringify(s),
                ]);
                await c.query("COMMIT");
                return result;
            } catch (e) {
                await c.query("ROLLBACK");
                throw e;
            } finally {
                c.release();
            }
        }
        const s = await readStore();
        const result = fn(s);
        await fs.mkdir(path.dirname(file), { recursive: true });
        await fs.writeFile(file + ".tmp", JSON.stringify(s));
        await fs.rename(file + ".tmp", file);
        return result;
    });
    queue = run.catch(() => { });
    return run;
}
