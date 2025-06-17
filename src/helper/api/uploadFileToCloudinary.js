import { writeFile } from "fs/promises";
import path from "path";
import os from "os";
import { uploadOnCloudinary } from "@/utils/cloudinary"; // adjust path if needed

export async function uploadFileToCloudinary(file) {
  try {
    console.log('hhhh')
    if (!file) {
      throw new Error("No file provided");
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const tmpUploadPath = path.join(os.tmpdir(), file.name);
    await writeFile(tmpUploadPath, buffer);

    const cloudinaryResult = await uploadOnCloudinary(tmpUploadPath);

    if (!cloudinaryResult || !cloudinaryResult.secure_url) {
      throw new Error("Failed to upload file to Cloudinary");
    }

    return cloudinaryResult.secure_url;
  } catch (error) {
    console.error("uploadFileToCloudinary error:", error);
    throw error;
  }
}
