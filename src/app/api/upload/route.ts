import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string || "misc";
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name) || ".webp";
    const filename = `${Date.now()}_${crypto.randomUUID()}${ext}`;
    
    // Choose upload directory (VPS or local fallback)
    const vpsDir = "/var/www/uploads";
    let baseDir = vpsDir;
    
    try {
      await mkdir(vpsDir, { recursive: true });
    } catch (err) {
      baseDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(baseDir, { recursive: true });
    }
    
    const targetFolder = path.join(baseDir, folder);
    await mkdir(targetFolder, { recursive: true });
    
    const filePath = path.join(targetFolder, filename);
    await writeFile(filePath, buffer);
    
    // Nginx will serve /var/www/uploads via /uploads/ alias, so return the URL
    // If local, Next.js will serve public/uploads via /uploads/
    const url = `https://royaniwedding.com/uploads/${folder}/${filename}`;
    
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
