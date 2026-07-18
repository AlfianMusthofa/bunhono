import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: Number(process.env.MAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.PASS_USER,
  },
});

export const sendContactEmail = async (c) => {
  try {
    const { name, email, message } = await c.req.json();

    if (!name || !email || !message) {
      return c.json(
        {
          success: false,
          message: "Semua field wajib diisi",
        },
        400,
      );
    }

    await transporter.sendMail({
      from: `"ElevateHub Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      replyTo: email,
      subject: `Pesan Baru dari ${name}`,
      html: `
        <h2>Pesan Baru</h2>

        <p><strong>Nama:</strong> ${name}</p>

        <p><strong>Email:</strong> ${email}</p>

        <p><strong>Pesan:</strong></p>

        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    });

    return c.json({
      success: true,
      message: "Pesan berhasil dikirim",
    });
  } catch (error) {
    console.error(error);

    return c.json(
      {
        success: false,
        message: "Gagal mengirim email",
      },
      500,
    );
  }
};
