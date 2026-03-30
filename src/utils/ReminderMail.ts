import nodemailer from "nodemailer";

const formatDate = (date: string) => {
  return (
    new Date(date).toLocaleString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
    }) + " WIB"
  );
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.PASS_USER,
  },
});

export const SendReminderMail = async ({ to, event }: any) => {
  await transporter.sendMail({
    from: "Elevate Hub",
    to,
    subject: `Reminder event ${event.title}`,
    html: `
    <h3>Reminder Event</h3>
      <p>Event <b>${event.title}</b> akan dimulai besok</p>
      <p>Waktu: ${formatDate(event.startAt)}</p>`,
  });
};
