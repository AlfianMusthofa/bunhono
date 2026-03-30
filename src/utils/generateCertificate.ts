import PDFDocument from "pdfkit";
import { createCanvas, loadImage, registerFont } from "canvas";
import path from "path";

const fontPath = path.join(
  process.cwd(),
  "src/assets/fonts/GreatVibes-Regular.ttf",
);

registerFont(fontPath, {
  family: "GreatVibes",
  weight: "normal",
  style: "normal",
});

export const generateCertificate = async ({
  templateUrl,
  participantName,
}: {
  templateUrl: string;
  participantName: string;
}) => {
  const image = await loadImage(templateUrl);

  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(image, 0, 0);

  ctx.font = "normal 100px GreatVibes";
  ctx.fillStyle = "#000";
  ctx.textAlign = "center";

  ctx.fillText(participantName, canvas.width / 2, canvas.height / 2);

  const imageBuffer = canvas.toBuffer("image/png");

  const doc = new PDFDocument({
    size: [canvas.width, canvas.height],
  });

  const buffers: Uint8Array[] = [];

  doc.on("data", buffers.push.bind(buffers));

  doc.image(imageBuffer, 0, 0, {
    width: canvas.width,
    height: canvas.height,
  });

  doc.end();

  return new Promise<Buffer>((resolve) => {
    doc.on("end", () => {
      resolve(Buffer.concat(buffers));
    });
  });
};
