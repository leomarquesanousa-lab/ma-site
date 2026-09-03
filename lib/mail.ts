import nodemailer from "nodemailer";

function getSmtpConfig() {
  const host =
    process.env.SMTP_HOST ||
    process.env.EMAIL_HOST ||
    "";

  const port =
    Number(
      process.env.SMTP_PORT ||
        process.env.EMAIL_PORT ||
        465,
    );

  const user =
    process.env.SMTP_USER ||
    process.env.EMAIL_USER ||
    "";

  const pass =
    process.env.SMTP_PASS ||
    process.env.EMAIL_PASS ||
    "";

  const from =
    process.env.SMTP_FROM ||
    process.env.EMAIL_FROM ||
    user;

  return {
    host,
    port,
    user,
    pass,
    from,
  };
}

export function smtpIsConfigured() {
  const smtp =
    getSmtpConfig();

  return Boolean(
    smtp.host &&
      smtp.user &&
      smtp.pass &&
      smtp.from,
  );
}

export async function sendMail(
  options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  },
) {
  const smtp =
    getSmtpConfig();

  if (
    !smtp.host ||
    !smtp.user ||
    !smtp.pass ||
    !smtp.from
  ) {
    throw new Error(
      "Configuração SMTP incompleta.",
    );
  }

  const transporter =
    nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.port === 465,

      auth: {
        user: smtp.user,
        pass: smtp.pass,
      },
    });

  const info =
    await transporter.sendMail({
      from: smtp.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

  console.log(
    "SMTP_RESULTADO:",
    {
      messageId:
        info.messageId,

      accepted:
        info.accepted,

      rejected:
        info.rejected,

      response:
        info.response,
    },
  );

  return info;
}