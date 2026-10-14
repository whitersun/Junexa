import { publicApi } from "@/lib/public-api";
export const dynamic = "force-dynamic";
export function GET() { return publicApi("menu"); }
