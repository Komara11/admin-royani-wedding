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
    
    // Save to the public website's uploads folder
    const publicUploadsDir = "/var/www/royani-wedding/public/uploads";
    let savedToPublic = false;
    let baseDir: string;
    
    try {
      await mkdir(path.join(publicUploadsDir, folder), { recursive: true });
      baseDir = publicUploadsDir;
      savedToPublic = true;
    } catch {
      // Fallback to local admin public folder
      baseDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(path.join(baseDir, folder), { recursive: true });
    }
    
    const filePath = path.join(baseDir, folder, filename);
    await writeFile(filePath, buffer);
    
    // Always return the public site URL so images display correctly everywhere
    const url = `https://royaniwedding.com/api/media/${folder}/${filename}`;
    
    console.log(`[Upload] Saved to: ${filePath}, URL: ${url}, savedToPublic: ${savedToPublic}`);
    
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed: " + (error as Error).message }, { status: 500 });
  }
}
