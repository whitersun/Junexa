import type { NextConfig } from "next";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
loadEnvConfig(path.resolve(process.cwd(), "../.."), process.env.NODE_ENV !== "production");
process.env.STORE_FILE ||= path.resolve(process.cwd(), "../../.data/store.json");

const config: NextConfig = {
    turbopack: { root: path.resolve(process.cwd(), "../..") },
    outputFileTracingRoot: path.resolve(process.cwd(), "../.."),
};
export default config;
