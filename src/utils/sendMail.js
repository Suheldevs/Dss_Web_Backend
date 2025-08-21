import nodemailer from "nodemailer";

const sendMail = async ({ to, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT == 465,
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to,
      subject,
      html
    };
    await transporter.sendMail(mailOptions);
    return true; 
  } catch (error) {
    console.error("Email send error:", error.message);
    return false; 
  }
};

export default sendMail;
