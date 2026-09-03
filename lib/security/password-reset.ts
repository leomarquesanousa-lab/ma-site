import crypto from "crypto";

type PasswordResetPayload = {
  userId: string;
  email: string;
  expiresAt: number;
};

function base64UrlEncode(
  value: string,
) {
  return Buffer.from(
    value,
    "utf8",
  ).toString("base64url");
}

function base64UrlDecode(
  value: string,
) {
  return Buffer.from(
    value,
    "base64url",
  ).toString("utf8");
}

function createSignature(
  payloadEncoded: string,
  passwordHash: string,
) {
  return crypto
    .createHmac(
      "sha256",
      passwordHash,
    )
    .update(payloadEncoded)
    .digest("base64url");
}

export function createPasswordResetToken(
  options: {
    userId: string;
    email: string;
    passwordHash: string;
    expiresInMinutes?: number;
  },
) {
  const expiresInMinutes =
    options.expiresInMinutes ?? 60;

  const payload: PasswordResetPayload = {
    userId:
      options.userId,

    email:
      options.email
        .trim()
        .toLowerCase(),

    expiresAt:
      Date.now() +
      expiresInMinutes *
        60 *
        1000,
  };

  const payloadEncoded =
    base64UrlEncode(
      JSON.stringify(payload),
    );

  const signature =
    createSignature(
      payloadEncoded,
      options.passwordHash,
    );

  return `${payloadEncoded}.${signature}`;
}

export function readPasswordResetToken(
  token: string,
):
  | PasswordResetPayload
  | null {
  try {
    const [
      payloadEncoded,
      signature,
    ] = token.split(".");

    if (
      !payloadEncoded ||
      !signature
    ) {
      return null;
    }

    const payload =
      JSON.parse(
        base64UrlDecode(
          payloadEncoded,
        ),
      ) as PasswordResetPayload;

    if (
      !payload.userId ||
      !payload.email ||
      !payload.expiresAt
    ) {
      return null;
    }

    if (
      payload.expiresAt <
      Date.now()
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function verifyPasswordResetToken(
  options: {
    token: string;
    passwordHash: string;
  },
) {
  try {
    const [
      payloadEncoded,
      receivedSignature,
    ] =
      options.token.split(".");

    if (
      !payloadEncoded ||
      !receivedSignature
    ) {
      return null;
    }

    const payload =
      readPasswordResetToken(
        options.token,
      );

    if (!payload) {
      return null;
    }

    const expectedSignature =
      createSignature(
        payloadEncoded,
        options.passwordHash,
      );

    const receivedBuffer =
      Buffer.from(
        receivedSignature,
      );

    const expectedBuffer =
      Buffer.from(
        expectedSignature,
      );

    if (
      receivedBuffer.length !==
      expectedBuffer.length
    ) {
      return null;
    }

    const signatureIsValid =
      crypto.timingSafeEqual(
        receivedBuffer,
        expectedBuffer,
      );

    if (!signatureIsValid) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}