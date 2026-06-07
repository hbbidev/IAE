import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { promises as fs } from "fs";
import path from "path";

export async function POST(req: NextRequest) {
    // 1. Authenticate user
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
        }

        // Validate file type (allow common documents, archives, and images)
        const allowedExtensions = [
            ".pdf", ".docx", ".doc", ".xls", ".xlsx", ".ppt", ".pptx", 
            ".txt", ".zip", ".rar", ".png", ".jpg", ".jpeg"
        ];
        const lowerName = file.name.toLowerCase();
        const isValidFile = allowedExtensions.some(ext => lowerName.endsWith(ext));

        if (!isValidFile) {
            return NextResponse.json({ 
                error: "Format file tidak didukung. Harap unggah PDF, dokumen Word/Excel/PPT, file teks, berkas arsip (ZIP/RAR), atau gambar." 
            }, { status: 400 });
        }

        // Limit size to 10MB
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ error: "Ukuran file maksimal adalah 10MB" }, { status: 400 });
        }

        // 2. Prepare storage folder
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadDir = path.join(process.cwd(), "public", "uploads", "submissions");
        await fs.mkdir(uploadDir, { recursive: true });

        // Generate clean, unique name
        const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const filename = `${Date.now()}-${cleanName}`;
        const filepath = path.join(uploadDir, filename);

        // 3. Write file
        await fs.writeFile(filepath, buffer);

        // 4. Return public web url
        const fileUrl = `/uploads/submissions/${filename}`;
        return NextResponse.json({ success: true, fileUrl, filename: file.name });
    } catch (error: any) {
        console.error("Upload handler error:", error);
        return NextResponse.json({ error: error.message || "Gagal mengunggah file" }, { status: 500 });
    }
}
