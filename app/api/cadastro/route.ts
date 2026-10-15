import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import { db } from "@/lib/db";
import { validatePassword } from "@/lib/security/password";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = body.name?.trim();

    const email =
      body.email?.trim().toLowerCase();

    const password = body.password;

    const confirmPassword =
      body.confirmPassword;

    if (!name) {
      return NextResponse.json(
        {
          error: "Informe seu nome.",
        },
        {
          status: 400,
        },
      );
    }

    if (!email) {
      return NextResponse.json(
        {
          error: "Informe seu e-mail.",
        },
        {
          status: 400,
        },
      );
    }

    if (typeof password !== "string") {
      return NextResponse.json(
        {
          error: "Informe uma senha.",
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
          error: "Confirme sua senha.",
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

    const passwordValidation =
      validatePassword(password, {
        email,
      });

    if (!passwordValidation.valid) {
      return NextResponse.json(
        {
          error:
            passwordValidation.error ||
            "A senha não atende aos requisitos de segurança.",
        },
        {
          status: 400,
        },
      );
    }

    const existingUser =
      await db.user.findUnique({
        where: {
          email,
        },
      });

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            "Já existe uma conta com este e-mail.",
        },
        {
          status: 409,
        },
      );
    }

    const passwordHash =
      await bcrypt.hash(
        password,
        12,
      );

    const user =
      await db.user.create({
        data: {
          name,
          email,
          passwordHash,
          mustChangePassword: false,
          role: "CUSTOMER",
        },

        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

    const token =
      crypto
        .randomBytes(32)
        .toString("hex");

    const expiresAt =
      new Date();

    expiresAt.setDate(
      expiresAt.getDate() + 30,
    );

    await db.session.create({
      data: {
        token,
        expiresAt,
        userId: user.id,
      },
    });

    const response =
      NextResponse.json(
        {
          message:
            "Conta criada com sucesso.",

          redirectTo:
            "/minha-conta",

          user,
        },
        {
          status: 201,
        },
      );

    response.cookies.set(
      "ma_session",
      token,
      {
        httpOnly: true,
        sameSite: "lax",

        secure:
          process.env.NODE_ENV ===
          "production",

        expires: expiresAt,

        path: "/",

        ...(process.env.NODE_ENV ===
        "production"
          ? {
              domain:
                ".maconfeccoes.com.br",
            }
          : {}),
      },
    );

    return response;
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Erro ao criar a conta.",
      },
      {
        status: 500,
      },
    );
  }
}
