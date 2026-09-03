import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { sendMail } from "@/lib/mail";
import { createPasswordResetToken } from "@/lib/security/password-reset";

export async function POST(
  request: Request,
) {
  try {
    const body =
      await request.json();

    const email =
      body.email
        ?.trim()
        .toLowerCase();

    if (!email) {
      return NextResponse.json(
        {
          error:
            "Informe seu e-mail.",
        },
        {
          status: 400,
        },
      );
    }

    const user =
      await db.user.findUnique({
        where: {
          email,
        },
      });

    const successMessage =
      "Se existir uma conta com este e-mail, enviaremos as instruções para redefinição de senha.";

    if (!user) {
      return NextResponse.json({
        message:
          successMessage,
      });
    }

    const token =
      createPasswordResetToken({
        userId:
          user.id,

        email:
          user.email,

        passwordHash:
          user.passwordHash,

        expiresInMinutes:
          60,
      });

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    const resetUrl =
      `${baseUrl}/redefinir-senha?token=${encodeURIComponent(
        token,
      )}`;

    const customerName =
      user.name?.trim() ||
      "cliente";

    const html = `
      <div style="
        margin:0;
        padding:0;
        background:#f7f5f2;
        font-family:Arial,Helvetica,sans-serif;
        color:#211b1d;
      ">
        <div style="
          max-width:620px;
          margin:0 auto;
          padding:32px 18px;
        ">
          <div style="
            background:#ffffff;
            border:1px solid rgba(33,27,29,.09);
            border-radius:18px;
            padding:30px;
          ">
            <div style="
              font-size:12px;
              font-weight:800;
              letter-spacing:1.4px;
              color:#781834;
              margin-bottom:8px;
            ">
              M.A. CONFECÇÕES E BRINDES
            </div>

            <h1 style="
              margin:0 0 14px;
              font-size:25px;
              color:#211b1d;
            ">
              Redefinição de senha
            </h1>

            <p style="
              font-size:15px;
              line-height:1.65;
              margin:0 0 18px;
              color:#5f585a;
            ">
              Olá, ${customerName}.
            </p>

            <p style="
              font-size:15px;
              line-height:1.65;
              margin:0 0 22px;
              color:#5f585a;
            ">
              Recebemos uma solicitação para redefinir a senha da sua conta M.A.
            </p>

            <a
              href="${resetUrl}"
              style="
                display:inline-block;
                background:#781834;
                color:#ffffff;
                text-decoration:none;
                font-weight:700;
                padding:13px 20px;
                border-radius:10px;
              "
            >
              Criar nova senha
            </a>

            <p style="
              font-size:13px;
              line-height:1.6;
              margin:22px 0 0;
              color:#7a7274;
            ">
              Este link é válido por 1 hora.
            </p>

            <p style="
              font-size:13px;
              line-height:1.6;
              margin:8px 0 0;
              color:#7a7274;
            ">
              Se você não solicitou esta alteração, ignore este e-mail.
            </p>
          </div>
        </div>
      </div>
    `;

    const text = `
Olá, ${customerName}.

Recebemos uma solicitação para redefinir a senha da sua conta M.A.

Acesse o link abaixo:
${resetUrl}

Este link é válido por 1 hora.

Se você não solicitou esta alteração, ignore este e-mail.
    `.trim();

    try {
      await sendMail({
        to:
          user.email,

        subject:
          "Redefinição de senha - M.A. Confecções e Brindes",

        html,

        text,
      });
    } catch (emailError) {
      console.error(
        "Erro ao enviar e-mail de recuperação:",
        emailError,
      );

      return NextResponse.json(
        {
          error:
            "Não foi possível enviar o e-mail de recuperação agora.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      message:
        successMessage,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Erro ao iniciar recuperação de senha.",
      },
      {
        status: 500,
      },
    );
  }
}