import { publicApi } from "@/lib/public-api";
export function POST(req: Request) { return publicApi("orders", req); }
