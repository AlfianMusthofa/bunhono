import { writeFile } from "fs/promises";
import { join } from "path";
import { v4 as uuid } from "uuid";

export const saveImage = async (file: File) => {
  const ext = file.name.split(".").pop();
  const filename = `${uuid()}.${ext}`;
  const uploadPath = join(process.cwd(), "uploads", filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(uploadPath, buffer);

  return `/uploads/${filename}`;
};
