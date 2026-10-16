/** Decimal parsing by digits: no floating-point multiplication or rounding. */
export function reaisToCents(value: unknown): number {
  const input = typeof value === "string" ? value.trim() : "";
  const match = /^(\d{1,7})(?:[.,](\d{1,2}))?$/.exec(input);
  if (!match) throw new Error("Preço: informe um valor válido, como 25,00. Valores negativos ou mais de duas casas decimais não são permitidos.");
  const cents = Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
  if (!Number.isSafeInteger(cents) || cents > 100000000) throw new Error("Preço: máximo de R$ 1.000.000,00.");
  return cents;
}
export function centsToReais(value: unknown): string {
  if (value == null) return "";
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) throw new Error("Preço salvo inválido.");
  return `${Math.floor(value / 100)},${String(value % 100).padStart(2, "0")}`;
}
