export async function commerceRequest<T = unknown>(path: string, data?: unknown): Promise<T> {
  const response = await fetch(`/api/commerce/${path}`, data === undefined ? { cache: "no-store" } : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Não foi possível concluir a operação.");
  return result as T;
}
export async function uploadImage(file: File, purpose = "design", productId?: string, onProgress?: (percent: number | null) => void) {
  const form = new FormData(); form.set("file", file); form.set("purpose", purpose);
  if (productId) form.set("productId", productId);
  if (onProgress) {
    // Same API and storage; XHR adds transfer progress only for callers that request it.
    return new Promise<{ id: string; url: string; pixelWidth: number; pixelHeight: number; thumbnailAssetId?: string }>((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open("POST", "/api/uploads");
      request.timeout = 120000;
      request.upload.onprogress = event => onProgress(event.lengthComputable ? Math.round(event.loaded / event.total * 100) : null);
      request.onerror = () => reject(new Error("Falha de conexão durante o upload. Tente novamente."));
      request.ontimeout = () => reject(new Error("O upload demorou demais. Tente novamente."));
      request.onabort = () => reject(new Error("Upload interrompido."));
      request.onload = () => {
        let data;
        try { data = JSON.parse(request.responseText); } catch { reject(new Error("Resposta de upload inválida. Tente novamente.")); return; }
        if (request.status < 200 || request.status >= 300) { reject(new Error(typeof data?.error === "string" ? data.error : "Falha no upload.")); return; }
        if (!data || typeof data.id !== "string" || !/^[a-zA-Z0-9_-]+$/.test(data.id) || data.url !== `/api/arquivos/${data.id}`) { reject(new Error("Upload sem referência válida. Tente novamente.")); return; }
        resolve(data);
      };
      request.send(form);
    });
  }
  const response = await fetch("/api/uploads", { method: "POST", body: form });
  const data = await response.json(); if (!response.ok) throw new Error(data.error || "Falha no upload.");
  return data as { id: string; url: string; pixelWidth: number; pixelHeight: number; thumbnailAssetId?: string };
}
export function moneyLabel(cents: number) { return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
