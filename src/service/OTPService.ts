import nodemailer from "nodemailer";

export function generateOTP(): string {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.PASS_USER,
  },
});

export async function sendOTP(email: string, code: string) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Kode OTP Elevate Hub",
    html: `
            <h2>Elevate Hub</h2>

            <p>Kode OTP Anda :</p>

            <h1>${code}</h1>

            <p>Berlaku selama 5 menit.</p>
        `,
  });
}
