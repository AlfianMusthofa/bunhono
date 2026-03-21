import nodemailer from "nodemailer";

export const SendTicketEmail = async (
  to: string,
  qrBased64: string,
  event: {
    title: string;
    date: Date;
    location: string;
  },
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.PASS_USER,
    },
  });

  const base64Data = qrBased64.replace(/^data:image\/png;base64,/, "");
  const qrBuffer = Buffer.from(base64Data, "base64");

  const formattedDate = new Date(event.date).toLocaleString("id-ID", {
    dateStyle: "full",
    timeStyle: "short",
  });

  await transporter.sendMail({
    from: `"ElevateHub" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Tiket Event Kamu 🎟️",
    html: `
      <div style="font-family: Arial; text-align:center;">
        <h2>${event.title}</h2>
        <p><strong>${event.location}</strong></p>
        <p><strong>${formattedDate}</strong></p>

        <p>Tunjukkan QR code ini saat datang ke event</p>

        <img src="cid:qrcode" style="margin:20px auto;" />

        <p style="font-size:12px;color:gray;">
          Jangan bagikan QR ini ke orang lain
        </p>
      </div>
    `,
    attachments: [
      {
        filename: "qrcode.png",
        content: qrBuffer,
        cid: "qrcode",
      },
    ],
  });
};
