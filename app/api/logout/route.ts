import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { db } from "@/lib/db";

export async function POST() {
  try {
    const cookieStore =
      await cookies();

    const token =
      cookieStore.get(
        "ma_session",
      )?.value;

    if (token) {
      await db.session.deleteMany({
        where: {
          token,
        },
      });
    }

    const response =
      NextResponse.json({
        message:
          "Logout realizado com sucesso.",
      });

    response.cookies.set(
      "ma_session",
      "",
      {
        httpOnly: true,
        sameSite: "lax",
        secure:
          process.env.NODE_ENV ===
          "production",
        expires:
          new Date(0),
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
          "Erro ao sair da conta.",
      },
      {
        status: 500,
      },
    );
  }
}