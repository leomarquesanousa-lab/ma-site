import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";
import { validatePassword } from "@/lib/security/password";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const senhaAtual =
      typeof body.senhaAtual === "string"
        ? body.senhaAtual
        : "";

    const novaSenha =
      typeof body.novaSenha === "string"
        ? body.novaSenha
        : "";

    const confirmarSenha =
      typeof body.confirmarSenha === "string"
        ? body.confirmarSenha
        : "";

    if (
      !senhaAtual ||
      !novaSenha ||
      !confirmarSenha
    ) {
      return NextResponse.json(
        {
          error: "Preencha todos os campos.",
        },
        {
          status: 400,
        },
      );
    }

    if (novaSenha !== confirmarSenha) {
      return NextResponse.json(
        {
          error:
            "A nova senha e a confirmação não são iguais.",
        },
        {
          status: 400,
        },
      );
    }

    const cookieStore = await cookies();

    const token =
      cookieStore.get("ma_session")?.value;

    if (!token) {
      return NextResponse.json(
        {
          error: "Sessão não encontrada.",
        },
        {
          status: 401,
        },
      );
    }

    const session =
      await db.session.findUnique({
        where: {
          token,
        },
        include: {
          user: true,
        },
      });

    if (
      !session ||
      session.expiresAt < new Date()
    ) {
      return NextResponse.json(
        {
          error:
            "Sua sessão expirou. Faça login novamente.",
        },
        {
          status: 401,
        },
      );
    }

    const user = session.user;

    const senhaAtualCorreta =
      await bcrypt.compare(
        senhaAtual,
        user.passwordHash,
      );

    if (!senhaAtualCorreta) {
      return NextResponse.json(
        {
          error:
            "A senha atual está incorreta.",
        },
        {
          status: 400,
        },
      );
    }

    const mesmaSenha =
      await bcrypt.compare(
        novaSenha,
        user.passwordHash,
      );

    if (mesmaSenha) {
      return NextResponse.json(
        {
          error:
            "A nova senha deve ser diferente da senha atual.",
        },
        {
          status: 400,
        },
      );
    }

    const validacao =
      validatePassword(novaSenha);

    const resultado =
      validacao as unknown as Record<
        string,
        unknown
      >;

    const senhaInvalida =
      resultado.valid === false ||
      resultado.ok === false;

    if (senhaInvalida) {
      let mensagem =
        "A nova senha não atende aos requisitos de segurança.";

      if (
        typeof resultado.error === "string"
      ) {
        mensagem = resultado.error;
      } else if (
        typeof resultado.message === "string"
      ) {
        mensagem = resultado.message;
      } else if (
        Array.isArray(resultado.errors)
      ) {
        const erros =
          resultado.errors.filter(
            (item): item is string =>
              typeof item === "string",
          );

        if (erros.length > 0) {
          mensagem = erros.join(" ");
        }
      }

      return NextResponse.json(
        {
          error: mensagem,
        },
        {
          status: 400,
        },
      );
    }

    const passwordHash =
      await bcrypt.hash(
        novaSenha,
        12,
      );

    await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwordHash,
        mustChangePassword: false,
      },
    });

    return NextResponse.json(
      {
        ok: true,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "ERRO_ALTERAR_SENHA:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível alterar a senha.",
      },
      {
        status: 500,
      },
    );
  }
}