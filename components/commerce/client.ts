export async function commerceRequest<T = unknown>(path: string, data?: unknown): Promise<T> {
  const response = await fetch(`/api/commerce/${path}`, data === undefined ? { cache: "no-store" } : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Não foi possível concluir a operação.");
  return result as T;
}
export async function uploadImage(file: File, purpose = "design", productId?: string) {
  const form = new FormData(); form.set("file", file); form.set("purpose", purpose);
  if (productId) form.set("productId", productId);
  const response = await fetch("/api/uploads", { method: "POST", body: form });
  const data = await response.json(); if (!response.ok) throw new Error(data.error || "Falha no upload.");
  return data as { id: string; url: string };
}
export function moneyLabel(cents: number) { return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
