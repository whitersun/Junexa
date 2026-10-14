import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const requireAdmin = createRequire(path.join(root, "apps/admin/package.json"));
const { loadEnvConfig } = requireAdmin("@next/env");
const commands = new Set(["init", "seed", "setup"]);
const command = process.argv[2];
class InputError extends Error {}

function databaseUrl() {
    const dev = process.env.NODE_ENV !== "production";
    // Ưu tiên env của admin, sau đó dùng env ở gốc làm dự phòng như app.
    const adminUrl = loadEnvConfig(path.join(root, "apps/admin"), dev).combinedEnv.DATABASE_URL;
    // @next/env cache lần nạp đầu tiên; nạp lại để đọc cấu hình dự phòng.
    const rootUrl = loadEnvConfig(root, dev, undefined, true).combinedEnv.DATABASE_URL;
    const connectionString = adminUrl ?? rootUrl;

    if (!connectionString?.trim()) {
        throw new InputError("Thiếu DATABASE_URL trong apps/admin/.env.local hoặc .env.local ở gốc dự án.");
    }

    let url;
    try {
        url = new URL(connectionString);
    } catch {
        throw new InputError("DATABASE_URL không hợp lệ. Dùng dạng postgresql://USER:PASSWORD@HOST:PORT/junexa.");
    }
    if (!["postgres:", "postgresql:"].includes(url.protocol) || url.pathname !== "/junexa") {
        throw new InputError("DATABASE_URL phải là kết nối PostgreSQL đến database junexa.");
    }
    return url;
}

async function connect(url) {
    const client = new pg.Client({ connectionString: url.toString(), connectionTimeoutMillis: 5000 });
    try {
        await client.connect();
        return client;
    } catch (error) {
        await client.end().catch(() => {});
        throw error;
    }
}

async function runSql(client, filename) {
    const sql = await readFile(path.join(root, "database/queries", filename), "utf8");
    try {
        await client.query(sql);
    } catch (error) {
        await client.query("ROLLBACK").catch(() => {});
        throw error;
    }
}

async function connectForInit(url) {
    try {
        return await connect(url);
    } catch (error) {
        if (error.code !== "3D000") throw error;
    }

    const maintenanceUrl = new URL(url);
    maintenanceUrl.pathname = "/postgres";
    const maintenance = await connect(maintenanceUrl);
    try {
        // CREATE DATABASE chạy riêng, ngoài transaction.
        try {
            await runSql(maintenance, "00-create-database.sql");
            console.log("Đã tạo database junexa.");
        } catch (error) {
            // Có thể database vừa được tạo bởi một tiến trình khác.
            if (error.code !== "42P04") throw error;
        }
    } finally {
        await maintenance.end();
    }
    return connect(url);
}

async function main() {
    if (command === "--help" || command === "-h") {
        console.log("bun run db:init   — tạo database nếu chưa có và khởi tạo bảng\nbun run db:seed   — thêm 8 món và 4 hóa đơn mẫu\nbun run db:setup  — chạy init rồi seed");
        return;
    }
    if (!commands.has(command) || process.argv.length !== 3) {
        throw new InputError("Dùng bun run db:init, bun run db:seed hoặc bun run db:setup.");
    }

    const url = databaseUrl();
    const client = command === "seed" ? await connect(url) : await connectForInit(url);
    try {
        if (command !== "seed") {
            await runSql(client, "01-init.sql");
            console.log("Đã khởi tạo bảng junexa_store.");
        }
        if (command !== "init") {
            await runSql(client, "02-seed.sql");
            console.log("Đã thêm dữ liệu mẫu; giữ nguyên ID đã tồn tại.");
        }
        const { rows } = await client.query(
            "SELECT jsonb_array_length(data->'products') AS products, jsonb_array_length(data->'bills') AS bills FROM public.junexa_store WHERE id = 1",
        );
        console.log(`Database junexa hiện có ${rows[0].products} món và ${rows[0].bills} hóa đơn.`);
    } finally {
        await client.end();
    }
}

main().catch((error) => {
    const messages = {
        "28P01": "Sai user hoặc mật khẩu PostgreSQL. Kiểm tra DATABASE_URL.",
        "28000": "PostgreSQL từ chối xác thực. Kiểm tra user và cấu hình kết nối.",
        "3D000": "Chưa có database junexa. Chạy bun run db:init hoặc bun run db:setup trước.",
        "42P01": "Chưa có bảng junexa_store. Chạy bun run db:init trước.",
        "42501": "User PostgreSQL chưa có quyền tạo database hoặc thao tác bảng. Dùng user có quyền phù hợp.",
        ECONNREFUSED: "Không kết nối được PostgreSQL. Kiểm tra server, host và port trong DATABASE_URL.",
        ENOTFOUND: "Không tìm thấy host PostgreSQL. Kiểm tra DATABASE_URL.",
        EACCES: "Không có quyền kết nối PostgreSQL trong môi trường hiện tại.",
    };
    // Không in connection string hay lỗi driver có thể chứa thông tin kết nối.
    const message = messages[error.code] || (error.code ? `Không chạy được SQL (mã lỗi ${error.code}).` : "Không thể hoàn tất thao tác database.");
    console.error(error instanceof InputError ? error.message : message);
    process.exitCode = 1;
});
