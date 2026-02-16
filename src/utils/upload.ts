import { writeFile } from "fs/promises";
import { join } from "path";
import { v4 as uuid } from "uuid";
import cloudinary from "../config/cloudinary";

export const saveImage = async (file: File) => {
  const buffer = Buffer.from(await file.arrayBuffer());

  return new Promise<{ secure_url: string }>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "events",
          resource_type: "image",
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result as any);
        },
      )
      .end(buffer);
  });
};

export const deleteImage = async (publicId: string) => {
  await cloudinary.uploader.destroy(publicId);
};
