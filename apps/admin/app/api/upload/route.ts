import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
export async function POST(req: Request) {
    if (
        !process.env.ADMIN_TOKEN ||
        req.headers.get("authorization") !== `Bearer ${process.env.ADMIN_TOKEN}`
    )
        return Response.json(
            { error: "Cấu hình và nhập ADMIN_TOKEN để tải ảnh lên" },
            { status: 401 },
        );
    if (
        !process.env.STORAGE_ENDPOINT ||
        !process.env.STORAGE_REGION ||
        !process.env.STORAGE_BUCKET ||
        !process.env.STORAGE_PUBLIC_URL ||
        !process.env.STORAGE_ACCESS_KEY_ID ||
        !process.env.STORAGE_SECRET_ACCESS_KEY
    )
        return Response.json(
            { error: "Chưa cấu hình lưu ảnh. Bạn có thể dùng URL ảnh trước." },
            { status: 503 },
        );
    try {
        if (Number(req.headers.get("content-length")) > 6 * 1024 * 1024)
            throw Error("Ảnh tối đa 5MB");
        const f = (await req.formData()).get("file");
        if (
            !(f instanceof File) ||
            f.size > 5 * 1024 * 1024 ||
            !["image/jpeg", "image/png", "image/webp"].includes(f.type)
        )
            throw Error("Chọn ảnh JPG, PNG hoặc WebP tối đa 5MB");
        const buffer = Buffer.from(await f.arrayBuffer());
        const valid =
            f.type === "image/jpeg"
                ? buffer[0] === 255 && buffer[1] === 216
                : f.type === "image/png"
                    ? buffer
                        .subarray(0, 8)
                        .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
                    : buffer.toString("ascii", 0, 4) === "RIFF" &&
                    buffer.toString("ascii", 8, 12) === "WEBP";
        if (!valid) throw Error("Nội dung ảnh không hợp lệ");
        const key = `menu/${crypto.randomUUID()}.${f.type.split("/")[1]}`;
        const client = new S3Client({
            region: process.env.STORAGE_REGION,
            endpoint: process.env.STORAGE_ENDPOINT,
            forcePathStyle: true,
            credentials: {
                accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
                secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
            },
        });
        await client.send(
            new PutObjectCommand({
                Bucket: process.env.STORAGE_BUCKET,
                Key: key,
                Body: buffer,
                ContentType: f.type,
            }),
        );
        return Response.json({
            url: `${process.env.STORAGE_PUBLIC_URL.replace(/\/$/, "")}/${key}`,
        });
    } catch (e) {
        return Response.json({ error: (e as Error).message }, { status: 400 });
    }
}
