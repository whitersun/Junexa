export function reportStoreError(route: string, error: unknown) {
    const code = error && typeof error === "object" && "code" in error
        ? error.code
        : undefined;
    console.error(`${route}: Không thể đọc dữ liệu cửa hàng`, JSON.stringify({
        name: error instanceof Error ? error.name : "UnknownError",
        code: typeof code === "string" ? code : undefined,
    }));
}
