import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { db } from "~/server/db";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const entityType = formData.get("entityType") as string;
    const entityId = formData.get("entityId") as string;
    const uploadedBy = formData.get("uploadedBy") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: "entityType and entityId are required" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uniqueFilename = `${Date.now()}-${file.name}`;
    const filepath = join(process.cwd(), "public", "uploads", uniqueFilename);

    await writeFile(filepath, buffer);

    const fileRecord = await db.file.create({
      data: {
        name: file.name,
        url: `/uploads/${uniqueFilename}`,
        size: file.size,
        mimeType: file.type,
        entityType,
        entityId,
        uploadedBy,
      },
    });

    return NextResponse.json(fileRecord);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
