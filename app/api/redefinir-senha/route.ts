import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";
import { validatePassword } from "@/lib/security/password";
import { verifyPasswordResetToken } from "@/lib/security/password-reset";

export async function POST(
  request: Request,
) {
  try {
    const body =
      await request.json();

    const token =
      body.token;

    const password =
      body.password;

    const confirmPassword =
      body.confirmPassword;

    if (
      typeof token !== "string" ||
      !token.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "Token de recuperação inválido.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      typeof password !== "string"
    ) {
      return NextResponse.json(
        {
          error:
            "Informe a nova senha.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      typeof confirmPassword !==
      "string"
    ) {
      return NextResponse.json(
        {
          error:
            "Confirme a nova senha.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      password !== confirmPassword
    ) {
      return NextResponse.json(
        {
          error:
            "As senhas não conferem.",
        },
        {
          status: 400,
        },
      );
    }

    const tokenParts =
      token.split(".");

    if (
      tokenParts.length !== 2
    ) {
      return NextResponse.json(
        {
          error:
            "Token de recuperação inválido ou expirado.",
        },
        {
          status: 400,
        },
      );
    }

    let payload:
      | {
          userId: string;
          email: string;
          expiresAt: number;
        }
      | null = null;

    try {
      const payloadEncoded =
        tokenParts[0];

      const decoded =
        Buffer.from(
          payloadEncoded,
          "base64url",
        ).toString("utf8");

      payload =
        JSON.parse(decoded);
    } catch {
      payload = null;
    }

    if (
      !payload?.userId ||
      !payload?.email
    ) {
      return NextResponse.json(
        {
          error:
            "Token de recuperação inválido ou expirado.",
        },
        {
          status: 400,
        },
      );
    }

    const user =
      await db.user.findUnique({
        where: {
          id: payload.userId,
        },
      });

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Token de recuperação inválido ou expirado.",
        },
        {
          status: 400,
        },
      );
    }

    const verifiedPayload =
      verifyPasswordResetToken({
        token,
        passwordHash:
          user.passwordHash,
      });

    if (
      !verifiedPayload ||
      verifiedPayload.userId !==
        user.id ||
      verifiedPayload.email !==
        user.email
          .trim()
          .toLowerCase()
    ) {
      return NextResponse.json(
        {
          error:
            "Token de recuperação inválido ou expirado.",
        },
        {
          status: 400,
        },
      );
    }

    const passwordValidation =
      validatePassword(
        password,
        {
          email:
            user.email,
        },
      );

    if (
      !passwordValidation.valid
    ) {
      return NextResponse.json(
        {
          error:
            passwordValidation.error ||
            "A nova senha não atende aos requisitos de segurança.",
        },
        {
          status: 400,
        },
      );
    }

    const passwordHash =
      await bcrypt.hash(
        password,
        12,
      );

    await db.$transaction([
      db.user.update({
        where: {
          id: user.id,
        },

        data: {
          passwordHash,
          mustChangePassword:
            false,
        },
      }),

      db.session.deleteMany({
        where: {
          userId:
            user.id,
        },
      }),
    ]);

    return NextResponse.json({
      message:
        "Senha alterada com sucesso.",

      redirectTo:
        "/login",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Erro ao redefinir a senha.",
      },
      {
        status: 500,
      },
    );
  }
}