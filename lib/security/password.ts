export type PasswordValidationResult = {
  valid: boolean;
  error?: string;
};

const COMMON_PASSWORDS = new Set([
  "1234567890",
  "123456789",
  "12345678",
  "password",
  "password123",
  "senha123",
  "senha1234",
  "admin123",
  "admin1234",
  "qwerty123",
  "qwerty1234",
  "abc123456",
  "ma123456",
  "masystem123",
]);

export function validatePassword(
  password: string,
  options?: {
    email?: string | null;
  },
): PasswordValidationResult {
  if (!password) {
    return {
      valid: false,
      error: "Informe uma senha.",
    };
  }

  if (password.length < 10) {
    return {
      valid: false,
      error:
        "A senha precisa ter pelo menos 10 caracteres.",
    };
  }

  if (password.length > 64) {
    return {
      valid: false,
      error:
        "A senha pode ter no máximo 64 caracteres.",
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      error:
        "A senha precisa ter pelo menos uma letra minúscula.",
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      error:
        "A senha precisa ter pelo menos uma letra maiúscula.",
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      error:
        "A senha precisa ter pelo menos um número.",
    };
  }

  if (
    !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(
      password,
    )
  ) {
    return {
      valid: false,
      error:
        "A senha precisa ter pelo menos um caractere especial.",
    };
  }

  const normalizedPassword =
    password.trim().toLowerCase();

  if (
    COMMON_PASSWORDS.has(
      normalizedPassword,
    )
  ) {
    return {
      valid: false,
      error:
        "Esta senha é muito comum. Escolha uma senha mais segura.",
    };
  }

  const email =
    options?.email
      ?.trim()
      .toLowerCase();

  if (email) {
    const emailUser =
      email.split("@")[0];

    if (
      emailUser.length >= 4 &&
      normalizedPassword.includes(
        emailUser,
      )
    ) {
      return {
        valid: false,
        error:
          "A senha não pode conter seu e-mail.",
      };
    }

    if (
      normalizedPassword === email
    ) {
      return {
        valid: false,
        error:
          "A senha não pode ser igual ao seu e-mail.",
      };
    }
  }

  return {
    valid: true,
  };
}