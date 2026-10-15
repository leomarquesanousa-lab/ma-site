import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db } from "@/lib/db";
import { allowed } from "@/lib/commerce/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email =
      body.email
        ?.trim()
        .toLowerCase();

    const password =
      body.password;

    if (!email || !password) {
      return NextResponse.json(
        {
          error:
            "Informe e-mail e senha.",
        },
        {
          status: 400,
        }
      );
    }

    const user =
      await db.user.findUnique({
        where: {
          email,
        },
      });

    if (!user) {
      return NextResponse.json(
        {
          error:
            "E-mail ou senha inválidos.",
        },
        {
          status: 401,
        }
      );
    }

    const passwordIsCorrect =
      await bcrypt.compare(
        password,
        user.passwordHash
      );

    if (!passwordIsCorrect) {
      return NextResponse.json(
        {
          error:
            "E-mail ou senha inválidos.",
        },
        {
          status: 401,
        }
      );
    }

    const token =
      crypto
        .randomBytes(32)
        .toString("hex");

    const expiresAt =
      new Date();

    expiresAt.setDate(
      expiresAt.getDate() + 30
    );

    await db.session.create({
      data: {
        token,
        expiresAt,
        userId:
          user.id,
      },
    });

    const mustChangePassword =
      user.mustChangePassword;

    const response =
      NextResponse.json({
        message:
          "Login realizado com sucesso.",

        mustChangePassword,

        redirectTo:
          mustChangePassword
            ? "/alterar-senha"
            : allowed(user.role, "dashboard")
              ? "/admin"
              : "/minha-conta",

        user: {
          id:
            user.id,

          name:
            user.name,

          email:
            user.email,

          role:
            user.role,
        },
      });

    response.cookies.set(
      "ma_session",
      token,
      {
        httpOnly: true,
        sameSite: "lax",
        secure:
          process.env.NODE_ENV ===
          "production",
        expires:
          expiresAt,
        path: "/",
        ...(process.env.NODE_ENV === "production"
          ? {
              domain:
                ".maconfeccoes.com.br",
            }
          : {}),
      }
    );

    return response;
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Erro ao realizar login.",
      },
      {
        status: 500,
      }
    );
  }
}
